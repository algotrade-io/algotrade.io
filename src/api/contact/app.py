import os
import json
from smtplib import SMTP_SSL as SMTP
from email.mime.text import MIMEText
from utils import \
    verify_user, options, \
    error, res_headers


def handle_contact(event, _):
    if event['httpMethod'].upper() == 'OPTIONS':
        response = options()
    else:
        response = post_contact(event)

    return response


def post_contact(event):
    claims = event['requestContext']['authorizer']['claims']
    verified = verify_user(claims)

    if not verified:
        return error(401, 'This account is not verified.')

    req_body = json.loads(event['body'])
    subject = req_body.get('subject')
    message = req_body.get('message')
    max_subject_len = 64
    max_message_len = 2500
    if not subject or len(subject) > max_subject_len:
        return error(400, 'Select a valid subject.')
    if not message or len(message) > max_message_len:
        return error(400, 'Write a valid message.')

    email = claims['email']
    email_sent = send_email(email, subject, message)

    status_code = 200
    message = 'Message sent successfully.'
    if not email_sent:
        return error(500, 'Server could not deliver message.')

    body = json.dumps({'message': message})

    return {
        "statusCode": status_code,
        "body": body,
        "headers": res_headers
    }


def send_email(user, subject, message):
    sender = os.environ['EMAIL_USER']
    msg = MIMEText(message, 'plain')
    msg['To'] = sender
    # From header doesn't seem to do anything
    msg['From'] = user
    msg['Reply-To'] = user
    msg['Subject'] = subject

    try:
        server = SMTP('smtp.mail.us-east-1.awsapps.com', 465)
        server.ehlo()
        server.login(sender, os.environ['EMAIL_PASS'])
        # sender email must be same as login email - error otherwise
        server.sendmail(sender, sender, msg.as_string())
        return True
    except Exception as e:
        print(e)
        print("SMTP server connection error")
        return False
    finally:
        server.quit()
