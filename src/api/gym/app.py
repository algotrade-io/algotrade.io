"""Gym Lambda handler for retrieving exercise log data."""

from io import BytesIO
from typing import Any

import pandas as pd
import requests


def get_exercise_log(*_: Any) -> dict[str, Any]:
    """Fetch exercise log from Google Sheets.

    Args:
        *_: Unused arguments (event, context).

    Returns:
        API response with exercise log records as JSON.
    """
    res = requests.get(
        "https://docs.google.com/spreadsheets/d/"
        "1Pu6T67VpIl049GGIyoe_OARejxuXSl-aWK5x2ORaCcY/"
        "gviz/tq?tqx=out:csv&sheet=Workouts"
    )
    df = pd.read_csv(BytesIO(res.content))
    df = df[df["Exercise"] != "Exercise"]
    df = df[["Date", "Id", "Weight", "Reps", "Exercise", "Volume", "1RM"]]
    records = df.to_json(orient="records")
    return {
        "statusCode": 200,
        "body": records,
        "headers": {"Access-Control-Allow-Origin": "*"},
    }
