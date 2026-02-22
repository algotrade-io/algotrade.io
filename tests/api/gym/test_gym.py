"""Tests for gym Lambda handler."""

import json

from gym.app import get_exercise_log


def test_get_exercise_log() -> None:
    """Test get_exercise_log returns exercise data with expected fields."""
    res = get_exercise_log()
    assert res["statusCode"] == 200
    data = json.loads(res["body"])
    assert {"Date", "Id", "Weight", "Reps", "Exercise", "Volume", "1RM"}.issubset(
        data[0].keys()
    )
    assert res["headers"]["Access-Control-Allow-Origin"] == "https://algotrade.io"
