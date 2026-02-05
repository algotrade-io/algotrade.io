import json
import sys

sys.path.append("src/api")  # noqa
from gym.app import *  # noqa


def test_get_exercise_log():
    res = get_exercise_log()
    assert res["statusCode"] == 200
    data = json.loads(res["body"])
    assert {"Date", "Id", "Weight", "Reps", "Exercise", "Volume", "1RM"}.issubset(
        data[0].keys()
    )
    assert res["headers"]["Access-Control-Allow-Origin"] == "*"
