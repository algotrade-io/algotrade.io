import os
import re
import json
import stripe
from models import UserModel, ATTRS_LOOKUP, ALERTS_LOOKUP
from utils import options, verify_user, success, error

stripe.api_key = os.environ['STRIPE_SECRET_KEY']
domain = os.environ['DOMAIN']


def handle_account(event, _):
    if event['httpMethod'].upper() == 'OPTIONS':
        response = options()
    elif event['httpMethod'].upper() == 'POST':
        response = post_account(event)
    elif event['httpMethod'].upper() == 'DELETE':
        response = delete_account(event)
    else:
        response = get_account(event)

    return response


def get_account(event):
    verified = verify_user(event)

    if not verified:
        return error(401, 'This account is not verified.')

    email = verified['email']
    try:
        user = UserModel.get(email)
    except UserModel.DoesNotExist:
        user = UserModel(email)
        user.save()

    return success(user.to_json())


def post_account(event):
    verified = verify_user(event)

    if not verified:
        return error(401, 'This account is not verified.')

    email = verified['email']
    user = UserModel.get(email)
    req_body = json.loads(event['body'])
    actions = []
    if (
        'permissions' in req_body
        and 'read_disclaimer' in req_body['permissions']
            and req_body['permissions']['read_disclaimer']):
        user.permissions.read_disclaimer = True
        actions.append(UserModel.permissions.set(user.permissions))

    if 'alerts' in req_body:
        alerts = json.loads(user.to_json())['alerts']
        updated_alerts = req_body['alerts']
        for key, val in updated_alerts.items():
            if key in ALERTS_LOOKUP:
                # type(getattr(Alerts, 'sms')) == BooleanAttribute
                expected_attr = ALERTS_LOOKUP[key]['attr']
                expected_type = ATTRS_LOOKUP[expected_attr]
                if type(val) == expected_type:
                    alerts[key] = val
        user.alerts = alerts
        actions.append(UserModel.alerts.set(user.alerts))

    if 'in_beta' in req_body:
        in_beta = int(req_body['in_beta'])
        pattern = fr'^.*@(dev\.)?{re.escape(domain)}$'
        print('re match: ', re.match(pattern, email))
        if re.match(pattern, email):
            print('updating beta status', email, in_beta)
            actions.append(UserModel.in_beta.set(in_beta))

    if actions:
        user.update(actions=actions)

    return success(user.to_json())


def delete_account(event):
    claims = event['requestContext']['authorizer']['claims']
    email = claims['email']
    user = UserModel.get(email)
    customer_id = user.customer_id
    if customer_id and customer_id != '_':
        # deleting a customer automatically cancels subscriptions
        stripe.Customer.delete(customer_id)
    user.delete()

    return success('OK')
