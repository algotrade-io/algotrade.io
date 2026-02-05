.PHONY: build

build:
	cd ../.. && uv export --package preview-lambda --no-hashes --no-dev > src/api/preview/requirements.txt
	pip install -r requirements.txt -t $(ARTIFACTS_DIR)
	cp *.py $(ARTIFACTS_DIR)
