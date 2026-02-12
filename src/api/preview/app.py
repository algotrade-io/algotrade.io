"""Preview Lambda handler for fetching preview data from S3."""

import os
from typing import Any

import boto3
from utils import success

s3 = boto3.client("s3")


def get_preview(*_: Any) -> dict[str, Any]:
    """Get preview data from S3.

    Args:
        *_: Unused arguments (event, context).

    Returns:
        API response with preview JSON data.
    """
    obj = s3.get_object(Bucket=os.environ["S3_BUCKET"], Key="data/api/preview.json")
    return success(obj["Body"].read().decode())
