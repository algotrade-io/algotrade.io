"""Tests for gym Lambda handler."""

import json
import os

from gym.app import get_exercise_log

DOMAIN = os.environ["DOMAIN"]


def test_get_exercise_log() -> None:
    """Test get_exercise_log returns exercise data with expected fields."""
    event = {"headers": {"origin": f"https://dev.{DOMAIN}"}}
    res = get_exercise_log(event, None)
    assert res["statusCode"] == 200
    data = json.loads(res["body"])
    assert {"Date", "Id", "Weight", "Reps", "Exercise", "Volume", "1RM"}.issubset(
        data[0].keys()
    )
    assert res["headers"]["Access-Control-Allow-Origin"] == f"https://dev.{DOMAIN}"
