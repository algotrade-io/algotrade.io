"""Tests for subscribe Lambda handler."""

import json
import os

import stripe

from subscribe.app import (
    get_plans,
    get_product,
    handle_billing,
    handle_checkout,
    options,
    post_billing,
    post_checkout,
    post_subscribe,
)
from shared.python.models import UserModel

stripe.api_key = os.environ["STRIPE_SECRET_KEY"]
price_id = os.environ["STRIPE_PRICE_ID"]


def test_get_plans_and_product():
    res = get_plans()
    assert res["statusCode"] == 200
    body = json.loads(res["body"])
    product_id = body["product"]
    assert body["id"] == price_id
    assert body["object"] == "price"

    event = {"queryStringParameters": {"id": product_id}}
    res = get_product(event, None)
    assert res["statusCode"] == 200
    body = json.loads(res["body"])
    assert body["id"] == product_id
    assert body["object"] == "product"


def test_handle_checkout():
    event = {"httpMethod": "OPTIONS"}
    res = handle_checkout(event, None)
    assert res == options()

    event = {
        "httpMethod": "GET",
        "requestContext": {"authorizer": {"claims": {"email_verified": "false"}}},
        "headers": {},
    }
    res = handle_checkout(event, None)
    assert res != options()
    assert res["statusCode"] == 401


def test_post_checkout():
    user = UserModel.get("test_user@example.com")
    assert not user.stripe.checkout.url
    event = {
        "httpMethod": "GET",
        "requestContext": {
            "authorizer": {
                "claims": {
                    "email_verified": "true",
                    "email": "test_user@example.com",
                    "name": "test_user",
                }
            }
        },
        "headers": {"origin": "http://localhost:8000"},
    }
    res = post_checkout(event)
    assert res["statusCode"] == 200
    body = json.loads(res["body"])
    user = UserModel.get("test_user@example.com")
    checkout_url = user.stripe.checkout["url"]
    assert body
    assert body == checkout_url
    assert body.index("https://checkout.stripe.com") == 0


def test_handle_billing():
    event = {"httpMethod": "OPTIONS"}
    res = handle_billing(event, None)
    assert res == options()

    event = {
        "httpMethod": "GET",
        "requestContext": {"authorizer": {"claims": {"email_verified": "false"}}},
        "headers": {},
    }
    res = handle_billing(event, None)
    assert res != options()
    assert res["statusCode"] == 401


def test_post_billing():
    event = {
        "httpMethod": "GET",
        "requestContext": {
            "authorizer": {
                "claims": {
                    "email_verified": "true",
                    "email": "test_user@example.com",
                    "name": "test_user",
                }
            }
        },
        "headers": {"origin": "http://localhost:8000"},
    }
    res = post_billing(event)
    assert res["statusCode"] == 200
    body = json.loads(res["body"])
    assert body
    assert body.index("https://billing.stripe.com") == 0


def test_post_subscribe():
    # test webhook
    user = UserModel.get("test_user@example.com")
    customer_id = user.customer_id
    body = {
        "type": "customer.subscription.updated",
        "data": {"object": {"customer": customer_id, "status": "active"}},
    }
    event = {"httpMethod": "POST", "body": json.dumps(body)}

    assert not user.subscribed
    res = post_subscribe(event, None)
    assert res["statusCode"] == 200
    user = UserModel.get("test_user@example.com")
    assert user.subscribed


def test_cleanup():
    customers = stripe.Customer.search(
        query="email:'test_user@example.com'", limit=100
    )["data"]
    customer_ids = [customer["id"] for customer in customers]
    for customer_id in customer_ids:
        try:
            stripe.Customer.delete(customer_id)
        except stripe.error.InvalidRequestError:
            pass
