"""Signals Lambda handler for trading signal access with rate limiting."""

import os
from datetime import UTC, datetime, timedelta
from typing import Any

import boto3
from models import UserModel, query_by_api_key

from utils import (
    enough_time_has_passed,
    error,
    options,
    success,
    transform_signal,
)

s3 = boto3.client("s3")

# Rate limiting configuration for signal access
# MAX_ACCESSES: Number of signal requests allowed per rate limit window
# RATE_LIMIT_DAYS: Duration of the rate limit window in days
MAX_ACCESSES = int(os.environ.get("SIGNAL_MAX_ACCESSES", 5))
RATE_LIMIT_DAYS = int(os.environ.get("SIGNAL_RATE_LIMIT_DAYS", 1))


def handle_signals(event: dict[str, Any], _: Any) -> dict[str, Any]:
    """Route signals requests to appropriate handler.

    Args:
        event: API Gateway event containing request details.
        _: Lambda context (unused).

    Returns:
        API response dictionary with statusCode and body.
    """
    if event["httpMethod"].upper() == "OPTIONS":
        response = options()
    else:
        response = get_signals(event)

    return response


def update_access_queue(user: UserModel) -> int | None:
    """Update user's access queue and check rate limits.

    Args:
        user: User model instance.

    Returns:
        Number of remaining requests, or None if quota reached.
    """
    access_queue = user.access_queue

    reset_duration = timedelta(days=RATE_LIMIT_DAYS)
    now = datetime.now(UTC)
    quota_reached = False

    # Update access queue
    if len(user.access_queue) >= MAX_ACCESSES:
        start = access_queue[-MAX_ACCESSES]
        if enough_time_has_passed(start, now, reset_duration):
            access_queue = access_queue[-MAX_ACCESSES + 1 :] + [now]
        else:
            access_queue = access_queue[-MAX_ACCESSES:]
            quota_reached = True
    else:
        access_queue += [now]

    # Update user model in db with new access_queue
    user.update(actions=[UserModel.access_queue.set(access_queue)])
    if quota_reached:
        return None

    # Find out how many requests are left
    remaining = 0
    for access in access_queue:
        if enough_time_has_passed(access, now, reset_duration):
            remaining += 1
        else:
            break
    # This is to cover the case that len(access_queue) < max_accesses
    remaining += MAX_ACCESSES - len(access_queue)
    return remaining


def get_signals(event: dict[str, Any]) -> dict[str, Any]:
    """Get trading signals for authenticated user with rate limiting.

    Args:
        event: API Gateway event with x-api-key header.

    Returns:
        Success response with signals data or error response.
    """
    # first get user by api key
    req_headers = event["headers"]
    if "x-api-key" not in req_headers:
        return error(401, "Provide a valid API key.")
    api_key = req_headers["x-api-key"]
    query_results = query_by_api_key(api_key)
    if not query_results:
        return error(401, "Provide a valid API key.")
    user = query_results[0]

    if not (user.in_beta or user.subscribed):
        return error(402, "This endpoint is for subscribers only.")

    remaining = update_access_queue(user)
    if not remaining:
        return error(
            403,
            f"You have reached your quota of {MAX_ACCESSES} requests / {RATE_LIMIT_DAYS} day(s).",
        )

    obj = s3.get_object(Bucket=os.environ["S3_BUCKET"], Key="models/latest/signals.csv")

    days_in_a_week = 7
    lines = [line.decode() for line in list(obj["Body"].iter_lines())]
    header = lines[0]
    rows = lines[-days_in_a_week:]
    keys = header.split(",")

    response: dict[str, Any] = {"message": None, "data": []}
    for row in rows:
        cols = row.split(",")
        item = {}
        for idx, col in enumerate(cols):
            key = keys[idx]
            item[key] = col
        signal = transform_signal(item)
        response["data"].append(signal)

    response["message"] = (
        f"You have {remaining} requests left / {RATE_LIMIT_DAYS} day(s)."
    )
    return success(response)
