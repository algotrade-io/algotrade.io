import os
import json
import boto3
import base64
import logging
import requests
from time import sleep
from jinja2 import Template
from cryptography.fernet import Fernet
from multiprocessing import Process, Pipe
from botocore.exceptions import ClientError
from datetime import datetime, timedelta, timezone
from pynamodb.attributes import UTCDateTimeAttribute
from cryptography.hazmat.primitives.kdf.scrypt import Scrypt
from models import UserModel
from utils import \
    transform_signal, \
    error, enough_time_has_passed, \
    RES_HEADERS, get_email, TEST, success


class Cryptographer:
    def __init__(self, password, salt):
        kdf = Scrypt(
            salt=salt,
            length=32,
            n=2**14,
            r=8,
            p=1,
        )
        key = base64.urlsafe_b64encode(kdf.derive(password))
        self.f = Fernet(key)

    def encrypt(self, plaintext):
        return self.f.encrypt(plaintext)

    def decrypt(self, ciphertext):
        return self.f.decrypt(ciphertext)


class Processor:
    def __init__(self, fx, data):
        self.fx = fx
        self.data = data
        self.total = 0

    def run_process(self, conn):
        # this condition prevents exit if val equals zero
        while ((val := conn.recv()) or val is not None):
            res = self.fx(val, self.data)
            conn.send(res)

    def await_process(self, process):
        if process['awaiting']:
            result = process['conn'].recv()
            self.results.append(result)
            process['awaiting'] = False

    def end_process(self, process):
        self.await_process(process)
        process['conn'].send(None)
        process['process'].join()

    def process_item(self, process, item):
        self.total += 1
        self.await_process(process)
        process['conn'].send(item)
        process['awaiting'] = True

    def create_process(self):
        # create a pipe for communication
        parent_conn, child_conn = Pipe(duplex=True)
        # create the process, pass instance and connection
        process = Process(target=self.run_process, args=(child_conn,))
        enhanced = {'process': process, 'conn': parent_conn, 'awaiting': False}
        process.start()
        return enhanced

    def run(self, items):
        self.results = []
        cpus = os.cpu_count()
        processes = [self.create_process() for _ in range(cpus)]
        [self.process_item(processes[idx % cpus], item)
         for idx, item in enumerate(items)]
        [self.end_process(process) for process in processes]
        return self.results


def notify_user(user, signal):
    alerts = [
        {'fx': notify_email, 'type': 'Email'},
        {'fx': notify_webhook, 'type': 'Webhook'},
        {'fx': notify_sms, 'type': 'SMS'},
    ]
    now = datetime.now(timezone.utc)
    reset_duration = timedelta(hours=12)
    success = True
    last_sent = user.alerts['last_sent'] if 'last_sent' in user.alerts else None
    if isinstance(last_sent, str):
        last_sent = UTCDateTimeAttribute().deserialize(last_sent)
    if not last_sent or enough_time_has_passed(last_sent, now, reset_duration):
        for alert in alerts:
            if user.alerts[alert['type'].lower()]:
                try:
                    alert['fx'](user, signal)
                except Exception as e:
                    print(
                        f"{alert['type']} alert failed to send for {user.email}")
                    logging.exception(e)
                    success = False
        alerts = user.alerts
        now = datetime.now(timezone.utc)
        alerts['last_sent'] = UTCDateTimeAttribute().serialize(now)
        user.update(actions=[UserModel.alerts.set(alerts)])
        if success:
            return user.email


def skip_users(users, to_skip):
    for user in users:
        if user.email not in to_skip:
            yield user


def post_notify(event, _):
    salt = os.environ['SALT'].encode('UTF-8')
    password = os.environ['CRYPT_PASS'].encode('UTF-8')
    emit_secret = os.environ['EMIT_SECRET']

    req_headers = event['headers']
    header = 'emit_secret'
    encrypted = req_headers[header] if header in req_headers else ''
    cryptographer = Cryptographer(password, salt)
    decrypted = cryptographer.decrypt(encrypted).decode('UTF-8')
    if not decrypted == emit_secret:
        sleep(0 if TEST else 10)
        print('Incorrect emit secret provided.')
        return error(401, 'Provide a valid emit secret.')
    req_body = json.loads(event['body'])
    signal = transform_signal(req_body)
    # NOTE: PynamoDB requires explicit `== True` comparisons for BooleanAttribute
    # filter conditions. Using just `UserModel.alerts['email']` doesn't work because
    # PynamoDB needs to construct a DynamoDB ConditionExpression, which requires
    # an explicit comparison operator. The `# noqa: E712` suppresses the flake8
    # warning about comparing to True using == (normally should use `is True` or
    # just the truthiness check in Python, but that's not supported here).
    # See: https://pynamodb.readthedocs.io/en/stable/conditional.html
    cond = (
        UserModel.alerts['email'] == True  # noqa: E712
    ) | (
        UserModel.alerts['sms'] == True  # noqa: E712
    ) | (
        (UserModel.alerts['webhook'].exists()) &
        (UserModel.alerts['webhook'] != '')
    )
    users_in_beta = UserModel.in_beta_index.query(1, filter_condition=cond)
    s3 = boto3.client('s3')
    obj = s3.get_object(
        Bucket=os.environ['S3_BUCKET'], Key='data/api/preview.json')
    preview = json.loads(obj['Body'].read())
    hyperdrive = [data for data in preview['BTC']
                  ['data'][-2:] if data['Name'] == 'hyperdrive'][0]
    signal['Perf'] = hyperdrive['Bal'] - 1
    processor = Processor(notify_user, signal)
    notified = set(processor.run(users_in_beta))
    users_subscribed = UserModel.subscribed_index.query(
        1, filter_condition=cond)
    # skip beta users who were already notified
    users_to_notify = skip_users(users_subscribed, notified)
    notified = notified.union(set(processor.run(users_to_notify)))
    num_notified = len(notified)
    total_users = processor.total
    success_ratio = num_notified / total_users if total_users else 1
    if success_ratio < 0.95:
        # threshold is dependent on successful email AND webhook notifications
        # it's possible that users misconfigure webhook / don't send 2xx response
        # change user alerts schema so user.alerts.webhook.url and user.alerts.webhook.queue
        # disable webhook after 5-10 misconfigured requests
        # but also make test route and btn, so users can try out
        # in POST /account, test if url is being set to "", if so, then also reset queue
        return error(500, 'Notifications failed to send.')

    # check that memory and timeout are being respected - print os.cpu_count()
    # query in beta and/or sub index - time is 10s for 100k users (1s/10k users)
    # can decrease query time by using 4-6 indices instead of 2
    # 1. in_beta partition, notify_email range
    # 2. in_beta partition, notify_webhook range
    # 3. subscribed partition, notify_email range
    # 4. subscribed partition, notify_webhook range
    # etc for notify_sms

    status_code = 200
    response = {'message': 'Notifications delivered.'}
    return success(response)


def notify_email(user, signal):
    STAGE = os.environ['STAGE']
    sender = get_email(os.environ['SIGNAL_EMAIL'], STAGE)
    recipient = 'success@simulator.amazonses.com' if TEST else user.email
    region = 'us-east-1'
    charset = 'UTF-8'
    client = boto3.client('sesv2', region_name=region)
    subject = f"FORCEPU.SH: {signal['Asset']} (₿) Signal Alert"
    body_text = ("Visit FORCEPU.SH to view the new signal.")
    with open(os.path.join(os.path.dirname(__file__), 'template.html.jinja'), 'r') as file:
        content = file.read()
    template = Template(content)
    signal['Prefix'] = 'dev.' if STAGE == 'dev' else ''
    # this is necessary because template expects boolean value
    signal['Signal'] = signal['Signal'] == 'BUY'
    html = template.render(signal)
    try:
        client.send_email(
            Destination={
                'ToAddresses': [
                    recipient,
                ],
            },
            Content={
                'Simple': {
                    'Body': {
                        'Html': {
                            'Charset': charset,
                            'Data': html,
                        },
                        'Text': {
                            'Charset': charset,
                            'Data': body_text,
                        },
                    },
                    'Subject': {
                        'Charset': charset,
                        'Data': subject,
                    },
                }
            },
            FromEmailAddress=sender,
        )
    # verify signals email [dev] and [prod] on SES and use SES! - free for first 64k emails per month
    # disable receiving emails at signals address
    # https://repost.aws/knowledge-center/lambda-send-email-ses
    # https://iamkanikamodi.medium.com/write-a-sample-lambda-to-send-emails-using-ses-in-aws-a2e903d9129e

    # Must submit request to move out of sandbox
    # https://docs.aws.amazon.com/ses/latest/dg/request-production-access.html

    except ClientError as e:
        print(e.response['Error']['Message'])
        raise e


def notify_webhook(user, signal):

    url = user.alerts['webhook']
    if not url:
        return
    # Use user's API Key in header to authenticate
    headers = {"X-API-Key": user.api_key}
    # RETURN LIST to account for future assets
    # will only be one-item list for now (just BTC)
    data = [signal]
    response = requests.post(url, json=data, headers=headers)
    if not response.ok:
        # send error log for webhook res
        raise Exception(
            f'Webhook did not return 2xx response. User: {user.email}')
    # else:
    # send log for webhook res success


def notify_sms(user, signal):
    pass
