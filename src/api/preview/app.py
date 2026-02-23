"""Preview Lambda handler for fetching preview data from S3."""

import os
from typing import Any

import boto3
from utils import get_origin, success

s3 = boto3.client("s3")


def get_preview(event: dict[str, Any], _: Any) -> dict[str, Any]:
    """Get preview data from S3.

    Args:
        event: API Gateway event.
        _: Lambda context (unused).

    Returns:
        API response with preview JSON data.
    """
    origin = get_origin(event)
    obj = s3.get_object(Bucket=os.environ["S3_BUCKET"], Key="data/api/preview.json")
    return success(obj["Body"].read().decode(), origin=origin)
