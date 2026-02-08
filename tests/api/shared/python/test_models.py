"""Tests for shared PynamoDB models."""

from datetime import datetime

from pynamodb.attributes import UTCDateTimeAttribute
from shared.python.models import (
    Alerts,
    APIKeyIndex,
    Checkout,
    CustomerIdIndex,
    InBetaIndex,
    Permissions,
    Stripe,
    SubscribedIndex,
    UserModel,
    get_api_key,
    get_default_access_queue,
    query_by_api_key,
)
from shared.python.utils import PAST_DATE


def test_query_by_api_key() -> None:
    """Test query_by_api_key finds user by API key."""
    assert query_by_api_key("test_api_key")[0].email == "test_user@example.com"


def test_get_api_key() -> None:
    """Test get_api_key generates 86-character key."""
    assert len(get_api_key()) == 86


def test_get_default_access_queue() -> None:
    """Test get_default_access_queue returns list of past dates."""
    assert get_default_access_queue() == [PAST_DATE] * 5


def _verify_alerts(alerts: Alerts) -> None:
    """Verify Alerts model has correct default values."""
    assert isinstance(alerts.email, bool)
    assert not alerts.email
    assert isinstance(alerts.sms, bool)
    assert not alerts.sms
    assert isinstance(alerts.webhook, str)
    assert not alerts.webhook
    assert isinstance(alerts.last_sent, str)
    assert alerts.last_sent == UTCDateTimeAttribute().serialize(PAST_DATE)


class TestAlerts:
    """Tests for Alerts model."""

    alerts = Alerts()
    _verify_alerts(alerts)


def _verify_permissions(perms: Permissions) -> None:
    """Verify Permissions model has correct default values."""
    assert isinstance(perms.is_admin, bool)
    assert not perms.is_admin
    assert isinstance(perms.read_disclaimer, bool)
    assert not perms.read_disclaimer


class TestPermissions:
    """Tests for Permissions model."""

    perms = Permissions()
    _verify_permissions(perms)


def _verify_checkout(checkout: Checkout) -> None:
    """Verify Checkout model has correct default values."""
    assert isinstance(checkout.url, str)
    assert not checkout.url
    assert isinstance(checkout.created, datetime)
    assert checkout.created == PAST_DATE


class TestCheckout:
    """Tests for Checkout model."""

    checkout = Checkout()
    _verify_checkout(checkout)


def _verify_stripe(stripe: Stripe) -> None:
    """Verify Stripe model has correct default values."""
    assert isinstance(stripe.checkout, Checkout)
    _verify_checkout(stripe.checkout)


class TestStripe:
    """Tests for Stripe model."""

    stripe = Stripe()
    _verify_stripe(stripe)


class TestAPIKeyIndex:
    """Tests for APIKeyIndex model."""

    api_key_index = APIKeyIndex()
    assert "api_key" in dir(api_key_index)


class TestInBetaIndex:
    """Tests for InBetaIndex model."""

    in_beta_index = InBetaIndex()
    assert "in_beta" in dir(in_beta_index)


class TestCustomerIdIndex:
    """Tests for CustomerIdIndex model."""

    customer_id_index = CustomerIdIndex()
    assert "customer_id" in dir(customer_id_index)


class TestSubscribedIndex:
    """Tests for SubscribedIndex model."""

    subscribed_index = SubscribedIndex()
    assert "subscribed" in dir(subscribed_index)


class TestUserModel:
    """Tests for UserModel."""

    user = UserModel("test_user@example.com")
    assert isinstance(user.email, str)
    assert user.email == "test_user@example.com"
    assert isinstance(user.api_key, str)
    assert len(user.api_key) == 86
    assert isinstance(user.alerts, Alerts)
    _verify_alerts(user.alerts)
    assert isinstance(user.permissions, Permissions)
    _verify_permissions(user.permissions)
    assert isinstance(user.in_beta, int)
    assert user.in_beta == 0
    assert isinstance(user.subscribed, int)
    assert user.subscribed == 0
    assert isinstance(user.stripe, Stripe)
    _verify_stripe(user.stripe)
    assert isinstance(user.access_queue, list)
    assert user.access_queue == [PAST_DATE] * 5
    assert isinstance(user.api_key_index, APIKeyIndex)
    assert isinstance(user.customer_id_index, CustomerIdIndex)
    assert isinstance(user.in_beta_index, InBetaIndex)
    assert isinstance(user.subscribed_index, SubscribedIndex)
