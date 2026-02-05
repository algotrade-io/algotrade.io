.PHONY: build

build:
	cd ../.. && uv export --package trade-lambda --no-hashes --no-dev > src/api/trade/requirements.txt
	pip install -r requirements.txt -t $(ARTIFACTS_DIR)
	cp *.py $(ARTIFACTS_DIR)
