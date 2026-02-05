.PHONY: build

build:
	cd ../.. && uv export --package signals-lambda --no-hashes --no-dev > src/api/signals/requirements.txt
	pip install -r requirements.txt -t $(ARTIFACTS_DIR)
	cp *.py $(ARTIFACTS_DIR)
