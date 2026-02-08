.PHONY: build build-ContactFunction

build build-ContactFunction:
	uv export --package contact-lambda --no-hashes --no-dev --no-emit-project | uv pip install -r - --target $(ARTIFACTS_DIR) --python-version 3.14
	cp *.py $(ARTIFACTS_DIR)
