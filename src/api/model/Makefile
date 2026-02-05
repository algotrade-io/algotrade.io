.PHONY: build

build:
	uv export --package model-lambda --no-hashes --no-dev | uv pip install --system -r - -t $(ARTIFACTS_DIR)
	cp *.py $(ARTIFACTS_DIR)
