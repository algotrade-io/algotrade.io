"""Gym Lambda handler for retrieving exercise log data."""

from io import BytesIO
from typing import Any

import pandas as pd
import requests
from utils import get_origin, success


def get_exercise_log(event: dict[str, Any], _: Any) -> dict[str, Any]:
    """Fetch exercise log from Google Sheets.

    Args:
        event: API Gateway event.
        _: Lambda context (unused).

    Returns:
        API response with exercise log records as JSON.
    """
    origin = get_origin(event)
    res = requests.get(
        "https://docs.google.com/spreadsheets/d/"
        "1Pu6T67VpIl049GGIyoe_OARejxuXSl-aWK5x2ORaCcY/"
        "gviz/tq?tqx=out:csv&sheet=Workouts"
    )
    df = pd.read_csv(BytesIO(res.content))
    df = df[df["Exercise"] != "Exercise"]
    df = df[["Date", "Id", "Weight", "Reps", "Exercise", "Volume", "1RM"]]
    records = df.to_json(orient="records")
    return success(records, origin=origin)
