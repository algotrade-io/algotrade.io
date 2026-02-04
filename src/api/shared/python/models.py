import os
import secrets
from pynamodb.models import Model
from pynamodb.indexes import GlobalSecondaryIndex, AllProjection
from pynamodb.attributes import (
    UnicodeAttribute, MapAttribute, BooleanAttribute, ListAttribute, UTCDateTimeAttribute, NumberAttribute)
from utils import PAST_DATE, TEST


def query_by_api_key(api_key):
    return list(UserModel.api_key_index.query(api_key)) if api_key else []


def get_api_key():
    key_already_exists = True
    while key_already_exists:
        api_key = secrets.token_urlsafe(64)
        query_results = query_by_api_key(api_key)
        key_already_exists = len(query_results)
    return api_key


def get_default_access_queue():
    return [PAST_DATE] * 5

class Alerts(MapAttribute):
    email = BooleanAttribute(default=False)
    sms = BooleanAttribute(default=False)
    webhook = UnicodeAttribute(default="")
    last_sent = UTCDateTimeAttribute(...)
# Derive lookup from class attributes - no duplication!
ALERTS_LOOKUP = {
    name: {
        'attr': type(getattr(Alerts, name)),
        'default': getattr(Alerts, name).default
    }
    for name in ['email', 'sms', 'webhook']
}

ATTRS_LOOKUP = {UnicodeAttribute: str, BooleanAttribute: bool}
ALERTS_LOOKUP = {
    'email': {'attr': BooleanAttribute, 'default': False},
    'sms': {'attr': BooleanAttribute, 'default': False},
    'webhook': {'attr': UnicodeAttribute, 'default': ""}
}


class Alerts(MapAttribute):
    for key, val in ALERTS_LOOKUP.items():
        vars()[key] = val['attr'](default=val['default'])
    last_sent = UTCDateTimeAttribute(
        default=UTCDateTimeAttribute().serialize(PAST_DATE))


class Permissions(MapAttribute):
    is_admin = BooleanAttribute(default=False)
    read_disclaimer = BooleanAttribute(default=False)


class Checkout(MapAttribute):
    url = UnicodeAttribute(default="")
    created = UTCDateTimeAttribute(
        default=PAST_DATE)


class Stripe(MapAttribute):
    checkout = MapAttribute(default=Checkout)


class APIKeyIndex(GlobalSecondaryIndex):
    """
    This class represents a global secondary index
    """
    class Meta:
        # index_name is optional, but can be provided to override the default name
        index_name = 'api_key_index'
        # All attributes are projected
        projection = AllProjection()

    # This attribute is the hash key for the index
    # Note that this attribute must also exist in the model
    api_key = UnicodeAttribute(hash_key=True)


class InBetaIndex(GlobalSecondaryIndex):
    """
    This class represents a global secondary index
    """
    class Meta:
        # index_name is optional, but can be provided to override the default name
        index_name = 'in_beta_index'
        # All attributes are projected
        projection = AllProjection()

    # This attribute is the hash key for the index
    # Note that this attribute must also exist in the model
    in_beta = NumberAttribute(hash_key=True)


class CustomerIdIndex(GlobalSecondaryIndex):
    """
    This class represents a global secondary index
    """
    class Meta:
        # index_name is optional, but can be provided to override the default name
        index_name = 'customer_id_index'
        # All attributes are projected
        projection = AllProjection()

    # This attribute is the hash key for the index
    # Note that this attribute must also exist in the model
    customer_id = UnicodeAttribute(hash_key=True)


class SubscribedIndex(GlobalSecondaryIndex):
    """
    This class represents a global secondary index
    """
    class Meta:
        # index_name is optional, but can be provided to override the default name
        index_name = 'subscribed_index'
        # All attributes are projected
        projection = AllProjection()

    # This attribute is the hash key for the index
    # Note that this attribute must also exist in the model
    subscribed = NumberAttribute(hash_key=True)


class UserModel(Model):
    """
    A DynamoDB User
    """
    class Meta:
        table_name = os.environ['TABLE_NAME']
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
        of=UTCDateTimeAttribute,
        default=get_default_access_queue
    )
    customer_id = UnicodeAttribute(default="_")
    api_key_index = APIKeyIndex()
    customer_id_index = CustomerIdIndex()
    in_beta_index = InBetaIndex()
    subscribed_index = SubscribedIndex()
