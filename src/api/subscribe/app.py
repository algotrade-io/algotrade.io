"""Subscribe Lambda handler for Stripe subscription management."""

import json
import logging
import os
from datetime import UTC, datetime, timedelta
from typing import Any

import stripe
from models import UserModel
from pynamodb.attributes import UTCDateTimeAttribute
from utils import (
    PAST_DATE,
    TEST,
    enough_time_has_passed,
    error,
    get_origin,
    normalize_headers,
    options,
    success,
    verify_user,
)

stripe.api_key = os.environ["STRIPE_SECRET_KEY"]


def get_price(price_id: str, origin: str = "") -> dict[str, Any]:
    """Retrieve price details from Stripe.

    Args:
        price_id: Stripe price ID.
        origin: Validated CORS origin.

    Returns:
        Success response with price data.
    """
    price = stripe.Price.retrieve(price_id)
    return success(price, origin=origin)


def get_plans(event: dict[str, Any], _: Any) -> dict[str, Any]:
    """Get subscription plans.

    Args:
        event: API Gateway event.
        _: Lambda context (unused).

    Returns:
        Success response with price data.
    """
    origin = get_origin(event)
    price_id = os.environ["STRIPE_PRICE_ID"]
    return get_price(price_id, origin=origin)


def get_product(event: dict[str, Any], _: Any) -> dict[str, Any]:
    """Get product details from Stripe.

    Args:
        event: API Gateway event with product ID in query params.
        _: Lambda context (unused).

    Returns:
        API response with product data.
    """
    origin = get_origin(event)
    params = event["queryStringParameters"]
    product_id = params["id"]
    product = stripe.Product.retrieve(product_id)
    return success(product, origin=origin)


def handle_checkout(event: dict[str, Any], _: Any) -> dict[str, Any]:
    """Route checkout requests to appropriate handler.

    Args:
        event: API Gateway event containing request details.
        _: Lambda context (unused).

    Returns:
        API response dictionary with statusCode and body.
    """
    if event["httpMethod"].upper() == "OPTIONS":
        return options(get_origin(event))
    return post_checkout(event)


def post_checkout(event: dict[str, Any]) -> dict[str, Any]:
    """Create Stripe checkout session for subscription.

    Args:
        event: API Gateway event with authorization.

    Returns:
        Success response with checkout URL or error.
    """
    origin = get_origin(event)
    verified = verify_user(event)

    if not verified:
        return error(401, "This account is not verified.", origin)

    price_id = os.environ["STRIPE_PRICE_ID"]
    email = verified["email"]

    user = UserModel.get(email)
    stripe_lookup = user.stripe
    customer_id = user.customer_id

    if customer_id and customer_id != "_":
        if user.subscribed:
            return error(400, "User is already subscribed.", origin)
    else:
        name = verified["name"]
        customer = stripe.Customer.create(email=email, name=name)
        customer_id = customer["id"]
        user.update(actions=[UserModel.customer_id.set(customer_id)])

    checkout = stripe_lookup.checkout
    duration_days = 1
    reset_duration = timedelta(days=duration_days)
    start = checkout["created"]
    if isinstance(start, str):
        start = UTCDateTimeAttribute().deserialize(start)
    now = datetime.now(UTC)

    if enough_time_has_passed(start, now, reset_duration):
        session = stripe.checkout.Session.create(
            customer=customer_id,
            customer_update={"address": "auto", "name": "auto"},
            success_url=f"{origin}/subscription?success=true&session_id={{CHECKOUT_SESSION_ID}}",
            cancel_url=f"{origin}/subscription?canceled=true",
            mode="subscription",
            line_items=[
                {
                    "price": price_id,
                    "quantity": 1,
                }
            ],
            automatic_tax={"enabled": True},
        )
        checkout["created"] = UTCDateTimeAttribute().serialize(now)
        checkout["url"] = session.url
        stripe_lookup.checkout = checkout
        user.update(actions=[UserModel.stripe.set(stripe_lookup)])

    url = checkout["url"]
    return success(url, origin=origin)


def handle_billing(event: dict[str, Any], _: Any) -> dict[str, Any]:
    """Route billing requests to appropriate handler.

    Args:
        event: API Gateway event containing request details.
        _: Lambda context (unused).

    Returns:
        API response dictionary with statusCode and body.
    """
    if event["httpMethod"].upper() == "OPTIONS":
        return options(get_origin(event))
    return post_billing(event)


def post_billing(event: dict[str, Any]) -> dict[str, Any]:
    """Create Stripe billing portal session.

    Args:
        event: API Gateway event with authorization.

    Returns:
        Success response with billing portal URL or error.
    """
    origin = get_origin(event)
    verified = verify_user(event)

    if not verified:
        return error(401, "This account is not verified.", origin)

    email = verified["email"]

    user = UserModel.get(email)
    customer_id = user.customer_id
    session = stripe.billing_portal.Session.create(
        customer=customer_id,
        return_url=f"{origin}/subscription",
    )

    url = session.url
    return success(url, origin=origin)


def post_subscribe(event: dict[str, Any], _: Any) -> dict[str, Any]:
    """Handle Stripe webhook events for subscription updates.

    Args:
        event: API Gateway event with Stripe webhook payload.
        _: Lambda context (unused).

    Returns:
        Success response acknowledging webhook receipt.
    """
    if TEST:
        event = json.loads(event["body"])
    else:
        webhook_secret = os.environ["STRIPE_WEBHOOK_SECRET"]
        req_body = event["body"]
        req_headers = normalize_headers(event)
        signature = req_headers["stripe-signature"]
        try:
            event = stripe.Webhook.construct_event(req_body, signature, webhook_secret)
        except ValueError as e:
            logging.exception(e)
            raise
        except stripe.error.SignatureVerificationError as e:
            logging.exception(e)
            raise

    response = success("OK")
    event_type = event["type"]
    subscription_events = {
        "customer.subscription.created",
        "customer.subscription.updated",
        "customer.subscription.deleted",
        "customer.subscription.paused",
        "customer.subscription.resumed",
    }

    if event_type in subscription_events:
        sub = event["data"]["object"]
        customer_id = sub["customer"]
        user = list(UserModel.customer_id_index.query(customer_id))[0]
        if (
            event_type == "customer.subscription.created"
            and sub["status"] == "incomplete"
        ):
            return response
        sub_is_active = sub["status"] == "active"
        stripe_lookup = user.stripe
        sub_was_active = bool(user.subscribed)

        if sub_was_active != sub_is_active:
            actions = [UserModel.subscribed.set(int(sub_is_active))]
            if not sub_is_active:
                stripe_lookup.checkout["created"] = UTCDateTimeAttribute().serialize(
                    PAST_DATE
                )
                actions.append(UserModel.stripe.set(stripe_lookup))
            user.update(actions=actions)

    return response
