.PHONY: build build-PlansFunction build-SubscribeFunction build-CheckoutFunction build-BillingFunction

build build-PlansFunction build-SubscribeFunction build-CheckoutFunction build-BillingFunction:
	uv export --package subscribe-lambda --no-hashes --no-dev --no-emit-project | uv pip install -r - --target $(ARTIFACTS_DIR) --python-version 3.14
	cp *.py $(ARTIFACTS_DIR)
