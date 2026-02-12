"""Tests for signals Lambda handler."""

import json
from datetime import datetime

from shared.python.models import UserModel
from shared.python.utils import DATE_FMT
from signals.app import (
    MAX_ACCESSES,
    get_signals,
    handle_signals,
    options,
    update_access_queue,
)


def test_handle_signals() -> None:
    """Test handle_signals routes to correct handler based on HTTP method."""
    event = {"httpMethod": "OPTIONS"}
    res = handle_signals(event, None)
    assert res == options()

    event = {
        "httpMethod": "GET",
        "requestContext": {"authorizer": {"claims": {"email_verified": "false"}}},
        "headers": {},
    }
    res = handle_signals(event, None)
    assert res != options()
    assert res["statusCode"] == 401


def test_get_signals() -> None:
    """Test get_signals validates API key and returns signal data."""
    event = {
        "httpMethod": "GET",
        "requestContext": {"authorizer": {"claims": {"email_verified": "true"}}},
        "headers": {"x-api-key": "not_real"},
    }
    res = get_signals(event)
    assert res["statusCode"] == 401
    event["headers"]["x-api-key"] = "test_api_key"
    user = UserModel.get("test_user@example.com")
    user.update(actions=[UserModel.in_beta.set(0)])
    res = get_signals(event)
    assert res["statusCode"] == 402
    user.update(actions=[UserModel.in_beta.set(1)])
    res = get_signals(event)
    assert res["statusCode"] == 200
    data = json.loads(res["body"])["data"]
    for datum in data:
        assert isinstance(datetime.strptime(datum["Date"], DATE_FMT), datetime)
        assert datum["Signal"] == "BUY" or datum["Signal"] == "SELL"
        assert datum["Day"] in {"Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"}
        assert datum["Asset"] == "BTC"
    for _ in range(MAX_ACCESSES):
        remaining = update_access_queue(user)

    assert not remaining
    res = get_signals(event)
    assert res["statusCode"] == 403
