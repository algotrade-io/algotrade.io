import json
import sys
from math import pow

sys.path.append("src/api")  # noqa
from notify.app import *  # noqa
from shared.python.models import UserModel  # noqa
from shared.python.utils import transform_signal  # noqa


class TestProcessor:
    def test_run(self):
        processor = Processor(pow, 2)
        results = {int(result) for result in processor.run(list(range(0, 5)))}
        assert results == {0, 1, 4, 9, 16}


def test_post_notify():
    body = {"Time": "2020-01-01", "Sig": True}
    event = {
        "headers": {"emit_secret": "wrong"},
        "body": json.dumps(body),
    }
    res = post_notify(event, None)
    assert res["statusCode"] == 401
    event["headers"]["emit_secret"] = "secret"
    user = UserModel.get("test_user@example.com")
    alerts = user.alerts
    alerts["email"] = True
    alerts["sms"] = True
    alerts["webhook"] = ""
    alerts["last_sent"] = UTCDateTimeAttribute().deserialize(alerts["last_sent"])
    user.update(actions=[UserModel.alerts.set(alerts), UserModel.in_beta.set(1)])
    res = post_notify(event, None)
    assert res["statusCode"] == 200


def test_notify_email():
    signal = transform_signal({"Time": "2020-01-01", "Sig": True})
    signal["Perf"] = 0.5
    user = UserModel.get("test_user@example.com")
    notify_email(user, signal)
