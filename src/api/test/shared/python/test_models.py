import sys
from datetime import datetime

sys.path.append("src/api")  # noqa
from shared.python.models import *  # noqa
from shared.python.utils import PAST_DATE  # noqa


def test_query_by_api_key():
    assert query_by_api_key("test_api_key")[0].email == "test_user@example.com"


def test_get_api_key():
    assert len(get_api_key()) == 86


def test_get_default_access_queue():
    assert get_default_access_queue() == [PAST_DATE] * 5


def verify_alerts(alerts):
    assert type(alerts.email) == bool
    assert not alerts.email
    assert type(alerts.sms) == bool
    assert not alerts.sms
    assert type(alerts.webhook) == str
    assert not alerts.webhook
    assert type(alerts.last_sent) == str
    assert alerts.last_sent == UTCDateTimeAttribute().serialize(PAST_DATE)


class TestAlerts:
    alerts = Alerts()
    verify_alerts(alerts)


def verify_permissions(perms):
    assert type(perms.is_admin) == bool
    assert not perms.is_admin
    assert type(perms.read_disclaimer) == bool
    assert not perms.read_disclaimer


class TestPermissions:
    perms = Permissions()
    verify_permissions(perms)


def verify_checkout(checkout):
    assert type(checkout.url) == str
    assert not checkout.url
    assert type(checkout.created) == datetime
    assert checkout.created == PAST_DATE


class TestCheckout:
    checkout = Checkout()
    verify_checkout(checkout)


def verify_stripe(stripe):
    assert type(stripe.checkout) == Checkout
    verify_checkout(stripe.checkout)


class TestStripe:
    stripe = Stripe()
    verify_stripe(stripe)


class TestAPIKeyIndex:
    api_key_index = APIKeyIndex()
    assert "api_key" in dir(api_key_index)


class TestInBetaIndex:
    in_beta_index = InBetaIndex()
    assert "in_beta" in dir(in_beta_index)


class TestCustomerIdIndex:
    customer_id_index = CustomerIdIndex()
    assert "customer_id" in dir(customer_id_index)


class TestSubscribedIndex:
    subscribed_index = SubscribedIndex()
    assert "subscribed" in dir(subscribed_index)


class TestUserModel:
    user = UserModel("test_user@example.com")
    assert type(user.email) == str
    assert user.email == "test_user@example.com"
    assert type(user.api_key) == str
    assert len(user.api_key) == 86
    assert type(user.alerts) == Alerts
    verify_alerts(user.alerts)
    assert type(user.permissions) == Permissions
    verify_permissions(user.permissions)
    assert type(user.in_beta) == int
    assert user.in_beta == 0
    assert type(user.subscribed) == int
    assert user.subscribed == 0
    assert type(user.stripe) == Stripe
    verify_stripe(user.stripe)
    assert type(user.access_queue) == list
    assert user.access_queue == [PAST_DATE] * 5
    assert type(user.api_key_index) == APIKeyIndex
    assert type(user.customer_id_index) == CustomerIdIndex
    assert type(user.in_beta_index) == InBetaIndex
    assert type(user.subscribed_index) == SubscribedIndex
