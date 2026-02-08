"""Pytest configuration and fixtures for API tests."""

import os
import sys

# Set required environment variables BEFORE any imports
# These are needed during model class definition
os.environ.setdefault("TABLE_NAME", "users-local")
os.environ.setdefault("TEST", "true")
os.environ.setdefault("STAGE", "dev")
os.environ.setdefault("DOMAIN", "algotrade.io")
os.environ.setdefault("STRIPE_SECRET_KEY", os.environ.get("STRIPE_SECRET_KEY", "sk_test_fake"))
os.environ.setdefault("STRIPE_PRICE_ID", os.environ.get("STRIPE_PRICE_ID", "price_fake"))
os.environ.setdefault("EMIT_SECRET", "secret")
os.environ.setdefault("S3_BUCKET", "test-bucket")
os.environ.setdefault("EMAIL_USER", "test")
os.environ.setdefault("EMAIL_PASS", "test")
os.environ.setdefault("SIGNAL_EMAIL", "signal@test.com")
