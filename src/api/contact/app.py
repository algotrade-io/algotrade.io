"""Contact Lambda handler for sending user messages."""

import json
import logging
import os
import ssl
from typing import Any

import boto3
from botocore.exceptions import ClientError
from utils import TEST, error, get_email, options, success, verify_user

context = ssl.create_default_context()


def handle_contact(event: dict[str, Any], _: Any) -> dict[str, Any]:
    """Route contact requests to appropriate handler.

    Args:
        event: API Gateway event containing request details.
        _: Lambda context (unused).

    Returns:
        API response dictionary with statusCode and body.
    """
    if event["httpMethod"].upper() == "OPTIONS":
        response = options()
    else:
        response = post_contact(event)

    return response


def post_contact(event: dict[str, Any]) -> dict[str, Any]:
    """Handle contact form submission.

    Args:
        event: API Gateway event with request body containing message.

    Returns:
        Success response or error if validation fails.
    """
    verified = verify_user(event)

    if not verified:
        return error(401, "This account is not verified.")

    req_body = json.loads(event["body"])
    subject = req_body.get("subject")
    message = req_body.get("message")
    max_subject_len = 64
    max_message_len = 2500
    if not subject or len(subject) > max_subject_len:
        return error(400, "Select a valid subject.")
    if not message or len(message) > max_message_len:
        return error(400, "Write a valid message.")

    email = verified["email"]
    email_sent = send_email(email, subject, message)

    if not email_sent:
        return error(500, "Server could not deliver message.")

    return success({"message": "Message sent successfully."})


def send_email(user: str, subject: str, message: str) -> bool:
    """Send email via SMTP server.

    Args:
        user: Sender's email address.
        subject: Email subject line.
        message: Email body content.

    Returns:
        True if email sent successfully, False otherwise.
    """
    sender = get_email(os.environ["EMAIL_USER"], os.environ["STAGE"])
    recipient = "success@simulator.amazonses.com" if TEST else sender
    region = "us-east-1"
    charset = "UTF-8"
    client = boto3.client("sesv2", region_name=region)

    try:
        response = client.send_email(
            FromEmailAddress=sender,
            Destination={"ToAddresses": [recipient]},
            Content={
                "Simple": {
                    "Subject": {"Data": subject, "Charset": charset},
                    "Body": {"Text": {"Data": message, "Charset": charset}},
                }
            },
            ReplyToAddresses=[user],
        )
        logging.info(f"Email sent: {response['MessageId']}")
        return True
    except ClientError as e:
        logging.exception(e)
        print(e.response["Error"]["Message"])
        return False
