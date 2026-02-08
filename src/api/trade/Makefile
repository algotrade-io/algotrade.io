.PHONY: build-TradeFunction build-WebSocketFunction

# Both TradeFunction and WebSocketFunction use this directory
build-TradeFunction build-WebSocketFunction:
	uv export --package trade-lambda --no-hashes --no-dev | uv pip install --system -r - -t $(ARTIFACTS_DIR)
	cp *.py $(ARTIFACTS_DIR)
