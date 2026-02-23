"""Tests for shared utility functions."""

import os
from datetime import datetime, timedelta

from shared.python.utils import (
    enough_time_has_passed,
    error,
    get_email,
    get_origin,
    options,
    transform_signal,
    verify_user,
)

DOMAIN = os.environ["DOMAIN"]


def test_get_origin() -> None:
    """Test get_origin returns allowed origins or falls back to production."""
    # Allowed origins should pass through
    event = {"headers": {"origin": f"https://{DOMAIN}"}}
    assert get_origin(event) == f"https://{DOMAIN}"

    event = {"headers": {"origin": f"https://dev.{DOMAIN}"}}
    assert get_origin(event) == f"https://dev.{DOMAIN}"

    event = {"headers": {"origin": "http://localhost:8000"}}
    assert get_origin(event) == "http://localhost:8000"

    # Disallowed origin should fall back to production
    event = {"headers": {"origin": "https://evil.com"}}
    assert get_origin(event) == f"https://{DOMAIN}"

    # Missing origin should fall back to production
    event = {"headers": {}}
    assert get_origin(event) == f"https://{DOMAIN}"

    # Missing headers should fall back to production
    event = {}
    assert get_origin(event) == f"https://{DOMAIN}"


def test_get_email() -> None:
    """Test get_email formats email address based on stage."""
    assert get_email("test", "dev") == f"test@dev.{os.environ['DOMAIN']}"
    assert get_email("test", "prod") == f"test@{os.environ['DOMAIN']}"


def test_transform_signal() -> None:
    """Test transform_signal converts raw signal data to standard format."""
    raw_signal = {"Time": "2020-01-01", "Sig": True}
    signal = transform_signal(raw_signal)
    assert signal["Signal"] == "BUY"
    assert signal["Day"] == "Wed"
    assert signal["Date"] == "2020-01-01"
    assert signal["Asset"] == "BTC"

    raw_signal = {"Time": ["2020-01-01"], "Sig": ["true"]}
    signal = transform_signal(raw_signal)
    assert signal["Signal"] == "BUY"
    assert signal["Day"] == "Wed"
    assert signal["Date"] == "2020-01-01"
    assert signal["Asset"] == "BTC"


def test_enough_time_has_passed() -> None:
    """Test enough_time_has_passed checks time delta correctly."""
    start = datetime(2020, 1, 1)
    end = datetime(2020, 2, 1)
    delta = timedelta(days=15)
    assert enough_time_has_passed(start, end, delta)
    delta = timedelta(days=60)
    assert not enough_time_has_passed(start, end, delta)


def test_error() -> None:
    """Test error returns properly formatted error response."""
    # Test with no origin (fallback to production domain)
    err = error(401, "Unauthorized")
    assert err["statusCode"] == 401
    assert err["body"] == '{"message": "Unauthorized"}'
    assert err["headers"]["Access-Control-Allow-Origin"] == f"https://{DOMAIN}"

    # Test with dev origin
    err = error(401, "Unauthorized", origin=f"https://dev.{DOMAIN}")
    assert err["headers"]["Access-Control-Allow-Origin"] == f"https://dev.{DOMAIN}"


def test_options() -> None:
    """Test options returns CORS headers."""
    # Test with no origin (fallback to production domain)
    opts = options()
    assert opts["statusCode"] == 200
    headers = opts["headers"]
    assert headers["Access-Control-Allow-Origin"] == f"https://{DOMAIN}"
    assert headers["Access-Control-Allow-Credentials"] == "true"
    assert headers["Access-Control-Allow-Methods"] == "GET,HEAD,OPTIONS,POST,PUT,DELETE"
    assert headers["Access-Control-Allow-Headers"] == (
        "Origin, Referer, X-Requested-With, Content-Type, Accept, Authorization, X-API-Key"
    )

    # Test with dev origin
    opts = options(origin=f"https://dev.{DOMAIN}")
    assert opts["headers"]["Access-Control-Allow-Origin"] == f"https://dev.{DOMAIN}"


def test_verify_user() -> None:
    """Test verify_user validates email verification status."""

    def _create_claims(claims: dict) -> dict:
        return {"requestContext": {"authorizer": {"claims": claims}}}

    claims = _create_claims({"email_verified": "true"})
    assert verify_user(claims)
    claims = _create_claims({"email_verified": "false"})
    assert not verify_user(claims)
    claims = _create_claims(
        {"email_verified": "false", "identities": '{"providerName": "Google"}'}
    )
    assert verify_user(claims)
    claims = _create_claims(
        {"email_verified": "false", "identities": '{"providerName": "Facebook"}'}
    )
    assert verify_user(claims)
    claims = _create_claims(
        {"email_verified": "false", "identities": '{"providerName": "LoginWithAmazon"}'}
    )
    assert verify_user(claims)
    claims = _create_claims(
        {"email_verified": "false", "identities": '{"providerName": "Apple"}'}
    )
    assert not verify_user(claims)
