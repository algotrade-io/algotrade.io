import json
import sys

sys.path.append("src/api")  # noqa
from preview.app import *  # noqa


def test_get_preview():
    res = get_preview()
    assert res["statusCode"] == 200
    data = json.loads(res["body"])

    assert {"Bal", "Name", "Time"}.issubset(data["BTC"]["data"][0].keys())
    assert {"Bal", "Name", "Time"}.issubset(data["USD"]["data"][0].keys())

    assert {
            "Total Return [%]",
            "Max Drawdown [%]",
            "Win Rate [%]",
            "Profit Factor",
            "Total Fees Paid",
            "Profitable Time [%]",
        }.issubset({datum["metric"] for datum in data["BTC"]["stats"]})
    assert {
            "Total Return [%]",
            "Max Drawdown [%]",
            "Win Rate [%]",
            "Profit Factor",
            "Sharpe Ratio",
            "Sortino Ratio",
        }.issubset({datum["metric"] for datum in data["USD"]["stats"]})

    assert res["headers"]["Access-Control-Allow-Origin"] == "*"
