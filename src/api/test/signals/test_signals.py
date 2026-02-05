import json
import sys
from datetime import datetime

sys.path.append("src/api")  # noqa
from signals.app import *  # noqa
from shared.python.models import UserModel  # noqa
from shared.python.utils import DATE_FMT  # noqa


def test_handle_signals():
    event = {"httpMethod": "OPTIONS"}
    res = handle_signals(event, None)
    assert res == options()

    event = {
        "httpMethod": "GET",
        "requestContext": {"authorizer": {"claims": {"email_verified": "false"}}},
        "headers": {},
    }
    res = handle_signals(event, None)
    assert res != options()
    assert res["statusCode"] == 401


def test_get_signals():
    event = {
        "httpMethod": "GET",
        "requestContext": {"authorizer": {"claims": {"email_verified": "true"}}},
        "headers": {"x-api-key": "not_real"},
    }
    res = get_signals(event)
    assert res["statusCode"] == 401
    event["headers"]["x-api-key"] = "test_api_key"
    user = UserModel.get("test_user@example.com")
    user.update(actions=[UserModel.in_beta.set(0)])
    res = get_signals(event)
    assert res["statusCode"] == 402
    user.update(actions=[UserModel.in_beta.set(1)])
    res = get_signals(event)
    assert res["statusCode"] == 200
    data = json.loads(res["body"])["data"]
    for datum in data:
        assert isinstance(datetime.strptime(datum["Date"], DATE_FMT), datetime)
        assert datum["Signal"] == "BUY" or datum["Signal"] == "SELL"
        assert datum["Day"] in {"Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"}
        assert datum["Asset"] == "BTC"
    for _ in range(max_accesses):
        remaining = update_access_queue(user)

    assert not remaining
    res = get_signals(event)
    assert res["statusCode"] == 403
