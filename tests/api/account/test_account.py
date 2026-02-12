"""Tests for account Lambda handler."""

import json

import pytest
from account.app import get_account, handle_account, options, post_account
from shared.python.models import UserModel


def test_handle_account() -> None:
    """Test handle_account routes to correct handler based on HTTP method."""
    event = {"httpMethod": "OPTIONS"}
    res = handle_account(event, None)
    assert res == options()

    event = {
        "httpMethod": "POST",
        "requestContext": {"authorizer": {"claims": {"email_verified": "false"}}},
    }
    res = handle_account(event, None)
    assert res != options()
    assert res["statusCode"] == 401

    event["httpMethod"] = "GET"
    res = handle_account(event, None)
    assert res != options()
    assert res["statusCode"] == 401


def test_get_account() -> None:
    """Test get_account retrieves or creates user account data."""
    user = UserModel.get("test_user@example.com")
    user_data = user.to_simple_dict()
    event = {
        "httpMethod": "GET",
        "requestContext": {
            "authorizer": {
                "claims": {"email_verified": "true", "email": "test_user@example.com"}
            }
        },
    }
    res = get_account(event)
    assert res["statusCode"] == 200
    body = json.loads(res["body"])
    assert body == user_data
    assert user.api_key == "test_api_key"
    with pytest.raises(UserModel.DoesNotExist):
        UserModel.get("new_user")
    event["requestContext"]["authorizer"]["claims"]["email"] = "new_user"
    res = get_account(event)
    user = UserModel.get("new_user")
    user_data = user.to_simple_dict()
    assert res["statusCode"] == 200
    body = json.loads(res["body"])
    assert body == user_data


def test_post_account() -> None:
    """Test post_account updates user account settings."""
    user = UserModel.get("new_user")
    assert not user.permissions.read_disclaimer
    assert not user.alerts.email
    assert not user.alerts.sms
    assert not user.alerts.webhook
    body = {
        "permissions": {"read_disclaimer": True},
        "alerts": {"email": True, "sms": True, "webhook": "api.domain.com"},
    }
    event = {
        "httpMethod": "GET",
        "requestContext": {
            "authorizer": {"claims": {"email_verified": "true", "email": "new_user"}}
        },
        "body": json.dumps(body),
    }
    res = post_account(event)
    assert res["statusCode"] == 200
    user = UserModel.get("new_user")
    user_data = user.to_simple_dict()
    assert res["statusCode"] == 200
    body = json.loads(res["body"])
    assert body == user_data
    assert user.permissions.read_disclaimer
    assert user.alerts.email
    assert user.alerts.sms
    assert user.alerts.webhook
