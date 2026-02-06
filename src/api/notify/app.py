"""Notify Lambda handler for sending signal alerts via email, SMS, and webhook."""

import json
import logging
import os
from datetime import UTC, datetime, timedelta
from multiprocessing import Pipe, Process
from multiprocessing.connection import Connection
from time import sleep
from typing import Any

import boto3
import requests
from botocore.exceptions import ClientError
from jinja2 import Template
from models import UserModel
from pynamodb.attributes import UTCDateTimeAttribute

from utils import (
    TEST,
    enough_time_has_passed,
    error,
    get_email,
    success,
    transform_signal,
)


class Processor:
    """Parallel processor for running jobs across multiple processes."""

    def __init__(self, fx: Any, data: dict[str, Any]) -> None:
        """Initialize processor with function and shared data.

        Args:
            fx: Function to execute for each item.
            data: Shared data passed to all function calls.
        """
        self.fx = fx
        self.data = data
        self.total = 0
        self.results: list[Any] = []

    def run_process(self, conn: Connection) -> None:
        """Worker process loop that receives items and sends results.

        Args:
            conn: Pipe connection for inter-process communication.
        """
        while (val := conn.recv()) or val is not None:
            res = self.fx(val, self.data)
            conn.send(res)

    def await_process(self, process: dict[str, Any]) -> None:
        """Wait for a process to complete its current task.

        Args:
            process: Process dictionary with conn and awaiting status.
        """
        if process["awaiting"]:
            result = process["conn"].recv()
            self.results.append(result)
            process["awaiting"] = False

    def end_process(self, process: dict[str, Any]) -> None:
        """Signal process to terminate and wait for completion.

        Args:
            process: Process dictionary to terminate.
        """
        self.await_process(process)
        process["conn"].send(None)
        process["process"].join()

    def process_item(self, process: dict[str, Any], item: Any) -> None:
        """Send an item to a process for execution.

        Args:
            process: Process dictionary to use.
            item: Item to process.
        """
        self.total += 1
        self.await_process(process)
        process["conn"].send(item)
        process["awaiting"] = True

    def create_process(self) -> dict[str, Any]:
        """Create a new worker process with pipe connection.

        Returns:
            Process dictionary with process, connection, and status.
        """
        parent_conn, child_conn = Pipe(duplex=True)
        process = Process(target=self.run_process, args=(child_conn,))
        enhanced = {"process": process, "conn": parent_conn, "awaiting": False}
        process.start()
        return enhanced

    def run(self, items: Any) -> list[Any]:
        """Execute function on all items using parallel processes.

        Args:
            items: Iterable of items to process.

        Returns:
            List of results from processing.
        """
        self.results = []
        cpus = os.cpu_count() or 1
        processes = [self.create_process() for _ in range(cpus)]
        for idx, item in enumerate(items):
            self.process_item(processes[idx % cpus], item)
        for process in processes:
            self.end_process(process)
        return self.results


def notify_user(user: UserModel, signal: dict[str, Any]) -> str | None:
    """Send signal notifications to a user via configured channels.

    Args:
        user: User model with alert preferences.
        signal: Signal data to send.

    Returns:
        User email if successful, None otherwise.
    """
    alerts = [
        {"fx": notify_email, "type": "Email"},
        {"fx": notify_webhook, "type": "Webhook"},
        {"fx": notify_sms, "type": "SMS"},
    ]
    now = datetime.now(UTC)
    reset_duration = timedelta(hours=12)
    notify_success = True
    last_sent = user.alerts["last_sent"] if "last_sent" in user.alerts else None
    if isinstance(last_sent, str):
        last_sent = UTCDateTimeAttribute().deserialize(last_sent)
    if not last_sent or enough_time_has_passed(last_sent, now, reset_duration):
        for alert in alerts:
            if user.alerts[alert["type"].lower()]:
                try:
                    alert["fx"](user, signal)
                except Exception as e:
                    print(f"{alert['type']} alert failed to send for {user.email}")
                    logging.exception(e)
                    notify_success = False
        user_alerts = user.alerts
        now = datetime.now(UTC)
        user_alerts["last_sent"] = UTCDateTimeAttribute().serialize(now)
        user.update(actions=[UserModel.alerts.set(user_alerts)])
        if notify_success:
            return user.email
    return None


def skip_users(users: Any, to_skip: set[str | None]) -> Any:
    """Filter out users that have already been notified.

    Args:
        users: Iterable of user models.
        to_skip: Set of emails to skip.

    Yields:
        Users not in the skip set.
    """
    for user in users:
        if user.email not in to_skip:
            yield user


def post_notify(event: dict[str, Any], _: Any) -> dict[str, Any]:
    """Handle notify POST request to send signal alerts.

    Args:
        event: API Gateway event with signal data.
        _: Lambda context (unused).

    Returns:
        Success response or error if authentication fails.
    """
    emit_secret = os.environ["EMIT_SECRET"]
    req_headers = event["headers"]
    header = "emit_secret"
    if not req_headers.get(header) == emit_secret:
        sleep(0 if TEST else 10)
        print("Incorrect emit secret provided.")
        return error(401, "Provide a valid emit secret.")
    req_body = json.loads(event["body"])
    signal = transform_signal(req_body)
    # NOTE: PynamoDB requires explicit `== True` comparisons for BooleanAttribute
    # filter conditions.
    cond = (
        (UserModel.alerts["email"] == True)  # noqa: E712
        | (UserModel.alerts["sms"] == True)  # noqa: E712
        | ((UserModel.alerts["webhook"].exists()) & (UserModel.alerts["webhook"] != ""))
    )
    users_in_beta = UserModel.in_beta_index.query(1, filter_condition=cond)
    s3 = boto3.client("s3")
    obj = s3.get_object(Bucket=os.environ["S3_BUCKET"], Key="data/api/preview.json")
    preview = json.loads(obj["Body"].read())
    hyperdrive = [
        data for data in preview["BTC"]["data"][-2:] if data["Name"] == "hyperdrive"
    ][0]
    signal["Perf"] = hyperdrive["Bal"] - 1
    processor = Processor(notify_user, signal)
    notified = set(processor.run(users_in_beta))
    users_subscribed = UserModel.subscribed_index.query(1, filter_condition=cond)
    users_to_notify = skip_users(users_subscribed, notified)
    notified = notified.union(set(processor.run(users_to_notify)))
    num_notified = len(notified)
    total_users = processor.total
    success_ratio = num_notified / total_users if total_users else 1
    if success_ratio < 0.95:
        return error(500, "Notifications failed to send.")

    response = {"message": "Notifications delivered."}
    return success(response)


def notify_email(user: UserModel, signal: dict[str, Any]) -> None:
    """Send signal alert via SES email.

    Args:
        user: User model with email address.
        signal: Signal data to include in email.

    Raises:
        ClientError: If email fails to send.
    """
    stage = os.environ["STAGE"]
    sender = get_email(os.environ["SIGNAL_EMAIL"], stage)
    recipient = "success@simulator.amazonses.com" if TEST else user.email
    region = "us-east-1"
    charset = "UTF-8"
    client = boto3.client("sesv2", region_name=region)
    subject = f"FORCEPU.SH: {signal['Asset']} (₿) Signal Alert"
    body_text = "Visit FORCEPU.SH to view the new signal."
    with open(os.path.join(os.path.dirname(__file__), "template.html.jinja")) as file:
        content = file.read()
    template = Template(content)
    signal["Prefix"] = "dev." if stage == "dev" else ""
    signal["Signal"] = signal["Signal"] == "BUY"
    html = template.render(signal)
    try:
        client.send_email(
            Destination={
                "ToAddresses": [
                    recipient,
                ],
            },
            Content={
                "Simple": {
                    "Body": {
                        "Html": {
                            "Charset": charset,
                            "Data": html,
                        },
                        "Text": {
                            "Charset": charset,
                            "Data": body_text,
                        },
                    },
                    "Subject": {
                        "Charset": charset,
                        "Data": subject,
                    },
                }
            },
            FromEmailAddress=sender,
        )
    except ClientError as e:
        print(e.response["Error"]["Message"])
        raise


def notify_webhook(user: UserModel, signal: dict[str, Any]) -> None:
    """Send signal alert via user's webhook URL.

    Args:
        user: User model with webhook URL and API key.
        signal: Signal data to send.

    Raises:
        Exception: If webhook does not return 2xx response.
    """
    url = user.alerts["webhook"]
    if not url:
        return
    headers = {"X-API-Key": user.api_key}
    data = [signal]
    response = requests.post(url, json=data, headers=headers)
    if not response.ok:
        raise Exception(f"Webhook did not return 2xx response. User: {user.email}")


def notify_sms(user: UserModel, signal: dict[str, Any]) -> None:
    """Send signal alert via SMS (not yet implemented).

    Args:
        user: User model with phone number.
        signal: Signal data to send.
    """
    pass
