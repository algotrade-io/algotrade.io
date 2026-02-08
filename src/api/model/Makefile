.PHONY: build build-ModelFunction build-VisualizationFunction

build build-ModelFunction build-VisualizationFunction:
	uv export --package model-lambda --no-hashes --no-dev --no-emit-project | uv pip install -r - --target $(ARTIFACTS_DIR) --python-version 3.14
	cp *.py $(ARTIFACTS_DIR)
