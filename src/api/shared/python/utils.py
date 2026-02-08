"""Utility functions for API Lambda handlers."""

import json
import os
from datetime import UTC, datetime, timedelta
from typing import Any

RES_HEADERS = {"Access-Control-Allow-Origin": "*", "Content-Type": "application/json"}

PAST_DATE = datetime(2020, 1, 1, tzinfo=UTC)
DATE_FMT = "%Y-%m-%d"


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


def error(status: int, message: str) -> dict[str, Any]:
    """Construct an error API response.

    Args:
        status: HTTP status code.
        message: Error message.

    Returns:
        Lambda response dict with statusCode, body, and headers.
    """
    return {
        "statusCode": status,
        "body": json.dumps({"message": message}),
        "headers": RES_HEADERS,
    }


def success(body: Any, status: int = 200) -> dict[str, Any]:
    """Construct a successful API response.

    Args:
        body: Response body - will be JSON serialized if not already a string.
        status: HTTP status code (default 200).

    Returns:
        Lambda response dict with statusCode, body, and headers.
    """
    # we need to deal with non json strings and json strings and json objects
    # case 1: body is a string
    # case 1a: body is a json string, then don't dumps it
    # case 1b: body is a non json string, then dumps it
    # case 2: body is a json object, then dumps it
    dump = not isinstance(body, str)
    if not dump:
        try:
            json.loads(body)
        except ValueError:
            dump = True

    return {"statusCode": status, "body": json.dumps(body) if dump else body, "headers": RES_HEADERS}


def options() -> dict[str, Any]:
    """Construct CORS preflight response.

    Returns:
        Lambda response dict with CORS headers.
    """
    return {
        "statusCode": 200,
        "headers": {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Credentials": "true",
            "Access-Control-Allow-Methods": "GET,HEAD,OPTIONS,POST,PUT,DELETE",
            "Access-Control-Allow-Headers": "Origin, X-Requested-With, Content-Type, Accept, Authorization, X-API-Key",
        },
    }


def verify_user(event: dict[str, Any]) -> dict[str, Any] | bool:
    """Verify user from API Gateway authorizer claims.

    Args:
        event: API Gateway event with requestContext.

    Returns:
        User claims dict if verified, False otherwise.
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
    return verified and claims
