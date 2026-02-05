import json
import sys

sys.path.append("src/api")  # noqa
from contact.app import *  # noqa
from shared.python.utils import options  # noqa


def test_handle_contact():
    event = {"httpMethod": "OPTIONS"}
    res = handle_contact(event, None)
    assert res == options()

    event = {
        "httpMethod": "POST",
        "requestContext": {"authorizer": {"claims": {"email_verified": "false"}}},
    }
    res = handle_contact(event, None)
    assert res != options()
    assert res["statusCode"] == 401


def test_post_contact():
    event = {
        "httpMethod": "POST",
        "requestContext": {
            "authorizer": {
                "claims": {"email_verified": "true", "email": "test_user@example.com"}
            }
        },
        "body": "{}",
    }
    res = post_contact(event)
    assert res["statusCode"] == 400
    data = json.loads(res["body"])
    assert "subject" in data["message"]

    event["body"] = '{"subject": "hi"}'
    res = post_contact(event)
    assert res["statusCode"] == 400
    data = json.loads(res["body"])
    assert "message" in data["message"]

    event["body"] = '{"subject": "hi", "message": "bye"}'
    res = post_contact(event)
    assert res["statusCode"] == 200
    data = json.loads(res["body"])
    assert "success" in data["message"]
