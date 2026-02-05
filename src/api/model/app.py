"""Model Lambda handler for ML model metadata and visualizations."""

import json
import os
import pickle
from typing import Any

import boto3
import numpy as np

s3 = boto3.client("s3")


def get_model(*_: Any) -> dict[str, Any]:
    """Get ML model metadata.

    Args:
        *_: Unused arguments (event, context).

    Returns:
        API response with model metadata (created, start, end, features, accuracy).
    """
    obj = s3.get_object(
        Bucket=os.environ["S3_BUCKET"], Key="models/latest/metadata.json"
    )
    metadata = json.loads(obj["Body"].read())
    metadata["num_features"] = len(metadata["features"])
    allowed_fields = ["created", "start", "end", "num_features", "accuracy"]
    metadata = {key: metadata[key] for key in allowed_fields}
    return {
        "statusCode": 200,
        "body": json.dumps(metadata),
        "headers": {"Access-Control-Allow-Origin": "*"},
    }


def get_visualization(event: dict[str, Any], _: Any) -> dict[str, Any]:
    """Get ML model visualization data (2D or 3D).

    Args:
        event: API Gateway event with optional dims query parameter.
        _: Lambda context (unused).

    Returns:
        API response with visualization data (actual, centroid, radius, grid, preds).
    """
    params = event["queryStringParameters"]
    dims = "2D"
    supported_dims = {"2D", "3D"}
    if params and "dims" in params and params["dims"] in supported_dims:
        dims = params["dims"]

    data_labels = ["actual", "centroid", "radius", "grid", "preds"]

    data = {
        label: pickle.loads(
            s3.get_object(
                Bucket=os.environ["S3_BUCKET"], Key=f"models/latest/{dims}/{label}.pkl"
            )["Body"].read()
        )
        for label in data_labels
    }
    return {
        "statusCode": 200,
        "body": json.dumps(data, cls=NumpyEncoder),
        "headers": {"Access-Control-Allow-Origin": "*"},
    }


class NumpyEncoder(json.JSONEncoder):
    """Custom JSON encoder for numpy data types."""

    def default(self, obj: Any) -> Any:
        """Convert numpy types to JSON-serializable Python types.

        Args:
            obj: Object to encode.

        Returns:
            JSON-serializable representation of the object.
        """
        if isinstance(
            obj,
            (
                np.int_,
                np.intc,
                np.intp,
                np.int8,
                np.int16,
                np.int32,
                np.int64,
                np.uint8,
                np.uint16,
                np.uint32,
                np.uint64,
            ),
        ):
            return int(obj)

        elif isinstance(obj, (np.float_, np.float16, np.float32, np.float64)):
            return float(obj)

        elif isinstance(obj, (np.complex_, np.complex64, np.complex128)):
            return {"real": float(obj.real), "imag": float(obj.imag)}

        elif isinstance(obj, (np.ndarray,)):
            return obj.tolist()

        elif isinstance(obj, (np.bool_)):
            return bool(obj)

        elif isinstance(obj, (np.void)):
            return None

        return json.JSONEncoder.default(self, obj)
