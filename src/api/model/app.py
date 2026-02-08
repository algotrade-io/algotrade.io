"""Model Lambda handler for ML model metadata and visualizations."""

import json
import os
import pickle
from typing import Any

import boto3
import numpy as np

from utils import success

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
    return success(metadata)


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
    return success(json.dumps(data, cls=NumpyEncoder))


class NumpyEncoder(json.JSONEncoder):
    """Custom JSON encoder for numpy data types.

    Converts numpy types to native Python types for JSON serialization.
    Handles integers, floats, complex numbers, arrays, booleans, and void types.
    """

    def default(self, o: Any) -> Any:
        """Convert numpy types to JSON-serializable Python types.

        Args:
            o: Object to encode. If a numpy type, converts to Python equivalent.

        Returns:
            JSON-serializable Python object.
        """
        if isinstance(o, np.integer):
            return int(o)

        elif isinstance(o, np.floating):
            return float(o)

        elif isinstance(o, np.complexfloating):
            return {"real": float(o.real), "imag": float(o.imag)}

        elif isinstance(o, (np.ndarray,)):
            return o.tolist()

        elif isinstance(o, (np.bool_)):
            return bool(o)

        elif isinstance(o, (np.void)):
            return None

        return json.JSONEncoder.default(self, o)
