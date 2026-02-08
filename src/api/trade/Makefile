.PHONY: build-TradeFunction build-WebSocketFunction

# Both TradeFunction and WebSocketFunction use this directory
build-TradeFunction build-WebSocketFunction:
	uv export --package trade-lambda --no-hashes --no-dev --no-emit-project | uv pip install -r - --target $(ARTIFACTS_DIR) --python-version 3.14
	cp *.py $(ARTIFACTS_DIR)
