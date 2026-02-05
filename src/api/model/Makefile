.PHONY: build

build:
	cd ../.. && uv export --package model-lambda --no-hashes --no-dev > src/api/model/requirements.txt
	pip install -r requirements.txt -t $(ARTIFACTS_DIR)
	cp *.py $(ARTIFACTS_DIR)
