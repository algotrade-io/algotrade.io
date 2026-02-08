"""Authentication utilities for JWT token verification."""

import json
import os
from time import time
from typing import Any

import requests
from jose import jwk, jwt
from jose.utils import base64url_decode

if os.environ.get("TEST") != "true":
    region = os.environ["REGION"]
    user_pool_id = os.environ["USER_POOL_ID"]
    web_client_id = os.environ["WEB_CLIENT_ID"]
    keys_url = f"https://cognito-idp.{region}.amazonaws.com/{user_pool_id}/.well-known/jwks.json"
    keys = requests.get(keys_url).json()["keys"]


def verify_token(event: dict[str, Any]) -> dict[str, Any] | None:
    """Verify JWT token from Cognito.

    Args:
        event: API Gateway event with token in body.

    Returns:
        Token claims dict if valid, None otherwise.
    """
    token = json.loads(event["body"])["token"]
    headers = jwt.get_unverified_headers(token)
    kid = headers["kid"]
    key_index = -1
    for i in range(len(keys)):
        if kid == keys[i]["kid"]:
            key_index = i
            break
    if key_index == -1:
        print("Public key not found in jwks.json")
        return None
    public_key = jwk.construct(keys[key_index])
    message, encoded_signature = str(token).rsplit(".", 1)
    decoded_signature = base64url_decode(encoded_signature.encode("utf-8"))
    if not public_key.verify(message.encode("utf8"), decoded_signature):
        print("Signature verification failed")
        return None
    print("Signature successfully verified")
    claims = jwt.get_unverified_claims(token)
    if time() > claims["exp"]:
        print("Token is expired")
        return None
    if claims["aud"] != web_client_id:
        print("Token was not issued for this audience")
        return None
    return claims
