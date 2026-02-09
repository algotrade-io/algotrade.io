"""PynamoDB models for DynamoDB tables."""

import os
import secrets
from datetime import datetime
from typing import Any

from pynamodb.attributes import (
    BooleanAttribute,
    ListAttribute,
    MapAttribute,
    NumberAttribute,
    UnicodeAttribute,
    UTCDateTimeAttribute,
)
from pynamodb.indexes import AllProjection, GlobalSecondaryIndex
from pynamodb.models import Model
from utils import PAST_DATE, TEST


def query_by_api_key(api_key: str) -> list[Any]:
    """Query users by API key.

    Args:
        api_key: API key to search for.

    Returns:
        List of matching user models.
    """
    return list(UserModel.api_key_index.query(api_key)) if api_key else []


def get_api_key() -> str:
    """Generate a unique API key.

    Returns:
        URL-safe token string.
    """
    key_already_exists = True
    while key_already_exists:
        api_key = secrets.token_urlsafe(64)
        query_results = query_by_api_key(api_key)
        key_already_exists = len(query_results)
    return api_key


def get_default_access_queue() -> list[datetime]:
    """Get default access queue for rate limiting.

    Returns:
        List of 5 past dates.
    """
    return [PAST_DATE] * 5


ATTRS_LOOKUP = {UnicodeAttribute: str, BooleanAttribute: bool}


class Alerts(MapAttribute):
    """User alert preferences map."""

    email = BooleanAttribute(default=False)
    sms = BooleanAttribute(default=False)
    webhook = UnicodeAttribute(default="")
    last_sent = UTCDateTimeAttribute(
        default=UTCDateTimeAttribute().serialize(PAST_DATE)
    )


# Derive ALERTS_LOOKUP from class introspection - single source of truth
ALERTS_LOOKUP = {
    name: {"attr": type(attr), "default": attr.default}
    for name, attr in Alerts.get_attributes().items()
    if name not in {"last_sent"}
}


class Permissions(MapAttribute):
    """User permissions map."""

    is_admin = BooleanAttribute(default=False)
    read_disclaimer = BooleanAttribute(default=False)


class Checkout(MapAttribute):
    """Stripe checkout session map."""

    url = UnicodeAttribute(default="")
    created = UTCDateTimeAttribute(default=PAST_DATE)


class Stripe(MapAttribute):
    """Stripe integration data map."""

    checkout = MapAttribute(default=Checkout)


class APIKeyIndex(GlobalSecondaryIndex):
    """Global secondary index for API key lookup."""

    class Meta:
        """Index metadata."""

        index_name = "api_key_index"
        projection = AllProjection()

    api_key = UnicodeAttribute(hash_key=True)


class InBetaIndex(GlobalSecondaryIndex):
    """Global secondary index for beta users."""

    class Meta:
        """Index metadata."""

        index_name = "in_beta_index"
        projection = AllProjection()

    in_beta = NumberAttribute(hash_key=True)


class CustomerIdIndex(GlobalSecondaryIndex):
    """Global secondary index for Stripe customer ID."""

    class Meta:
        """Index metadata."""

        index_name = "customer_id_index"
        projection = AllProjection()

    customer_id = UnicodeAttribute(hash_key=True)


class SubscribedIndex(GlobalSecondaryIndex):
    """Global secondary index for subscribed users."""

    class Meta:
        """Index metadata."""

        index_name = "subscribed_index"
        projection = AllProjection()

    subscribed = NumberAttribute(hash_key=True)


class UserModel(Model):
    """DynamoDB model for user accounts."""

    class Meta:
        """Model metadata."""

        table_name = os.environ["TABLE_NAME"]
        if TEST:
            host = "http://localhost:8000"

    email = UnicodeAttribute(hash_key=True)
    api_key = UnicodeAttribute(default=get_api_key)
    alerts = MapAttribute(default=Alerts)
    permissions = MapAttribute(default=Permissions)
    in_beta = NumberAttribute(default=0)
    subscribed = NumberAttribute(default=0)
    stripe = MapAttribute(default=Stripe)
    access_queue = ListAttribute(
        of=UTCDateTimeAttribute, default=get_default_access_queue
    )
    customer_id = UnicodeAttribute(default="_")
    api_key_index = APIKeyIndex()
    customer_id_index = CustomerIdIndex()
    in_beta_index = InBetaIndex()
    subscribed_index = SubscribedIndex()
