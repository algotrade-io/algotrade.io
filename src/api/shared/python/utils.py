"""Utility functions for API Lambda handlers."""

import json
import os
from datetime import UTC, datetime, timedelta
from typing import Any

DOMAIN = os.environ["DOMAIN"]
ALLOWED_ORIGINS: set[str] = {
    f"https://{DOMAIN}",
    f"https://dev.{DOMAIN}",
    "http://localhost:8000",
}

PAST_DATE = datetime(2020, 1, 1, tzinfo=UTC)
DATE_FMT = "%Y-%m-%d"


def get_origin(event: dict[str, Any]) -> str:
    """Extract the Origin header from an API Gateway event.

    Args:
        event: API Gateway event dict.

    Returns:
        The validated origin if allowed, or the production domain as fallback.
    """
    headers = event.get("headers") or {}
    origin = headers.get("origin", headers.get("host", ""))
    return origin if origin in ALLOWED_ORIGINS else f"https://{DOMAIN}"


def get_headers(origin: str = "") -> dict[str, str]:
    """Build response headers with validated CORS origin.

    Args:
        origin: Validated origin from get_origin.

    Returns:
        Dict with Access-Control-Allow-Origin and Content-Type headers.
    """
    return {
        "Access-Control-Allow-Origin": origin or f"https://{DOMAIN}",
        "Content-Type": "application/json",
    }


def str_to_bool(s: str) -> bool:
    """Convert string to boolean.

    Args:
        s: String to convert (case-insensitive).

    Returns:
        True if string is 'true', False otherwise.
    """
    return s.lower() == "true"


TEST = str_to_bool(str(os.environ.get("TEST")))


def get_email(user: str, env: str) -> str:
    """Construct email address for environment.

    Args:
        user: Email username.
        env: Environment ('dev' or 'prod').

    Returns:
        Full email address.
    """
    return f"{user}@{'dev.' if env == 'dev' else ''}{os.environ['DOMAIN']}"


def transform_signal(raw_signal: dict[str, Any]) -> dict[str, Any]:
    """Transform raw signal data to API format.

    Args:
        raw_signal: Raw signal dict with Time and Sig fields.

    Returns:
        Formatted signal dict with Date, Signal, Day, Asset.
    """
    signal: dict[str, Any] = {}
    date = raw_signal["Time"]
    if isinstance(date, list):
        date = date[0]

    sig = raw_signal["Sig"]
    if isinstance(sig, list):
        sig = sig[0]
    if isinstance(sig, str):
        sig = str_to_bool(sig)
    sig = "BUY" if sig else "SELL"

    signal["Date"] = date
    signal["Signal"] = sig
    signal["Day"] = datetime.strptime(date, DATE_FMT).strftime("%A")[:3]
    signal["Asset"] = "BTC"
    return signal


def enough_time_has_passed(start: datetime, end: datetime, delta: timedelta) -> bool:
    """Check if enough time has elapsed between two datetimes.

    Args:
        start: Start datetime.
        end: End datetime.
        delta: Required time difference.

    Returns:
        True if end - start >= delta.
    """
    return end - start >= delta


def error(status: int, message: str, origin: str = "") -> dict[str, Any]:
    """Construct an error API response.

    Args:
        status: HTTP status code.
        message: Error message.
        origin: Validated CORS origin.

    Returns:
        Lambda response dict with statusCode, body, and headers.
    """
    return {
        "statusCode": status,
        "body": json.dumps({"message": message}),
        "headers": get_headers(origin),
    }


def success(body: Any, status: int = 200, origin: str = "") -> dict[str, Any]:
    """Construct a successful API response.

    Args:
        body: Response body - will be JSON serialized if not already a string.
        status: HTTP status code (default 200).
        origin: Validated CORS origin.

    Returns:
        Lambda response dict with statusCode, body, and headers.
    """
    # Serialize to JSON if body isn't already a valid JSON string.
    # Example: dict {"a": 1} -> '{"a": 1}', JSON string '{"a": 1}' -> unchanged,
    # plain string "OK" -> '"OK"' (plain strings aren't valid JSON).
    dump = not isinstance(body, str)
    if not dump:
        try:
            json.loads(body)
        except json.decoder.JSONDecodeError:
            dump = True

    return {
        "statusCode": status,
        "body": json.dumps(body) if dump else body,
        "headers": get_headers(origin),
    }


def options(origin: str = "") -> dict[str, Any]:
    """Construct CORS preflight response.

    Args:
        origin: Validated CORS origin.

    Returns:
        Lambda response dict with CORS headers.
    """
    return {
        "statusCode": 200,
        "headers": {
            "Access-Control-Allow-Origin": origin or f"https://{DOMAIN}",
            "Access-Control-Allow-Credentials": "true",
            "Access-Control-Allow-Methods": "GET,HEAD,OPTIONS,POST,PUT,DELETE",
            "Access-Control-Allow-Headers": "Origin, X-Requested-With, Content-Type, Accept, Authorization, X-API-Key",
        },
    }


def verify_user(event: dict[str, Any]) -> dict[str, Any] | None:
    """Verify user from API Gateway authorizer claims.

    Args:
        event: API Gateway event with requestContext.

    Returns:
        User claims dict if verified, None otherwise.
    """
    claims = (
        event["requestContext"]["authorizer"]["claims"]
        if "requestContext" in event
        else event
    )
    verified = str_to_bool(str(claims["email_verified"]))
    providers = ["Google", "Facebook", "LoginWithAmazon"]
    if not verified:
        if "identities" in claims:
            identities = json.loads(claims["identities"])
            if "providerName" in identities:
                if identities["providerName"] in providers:
                    verified = True
    return claims if verified else None
