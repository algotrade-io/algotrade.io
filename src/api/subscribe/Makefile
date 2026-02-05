.PHONY: build

build:
	cd ../.. && uv export --package subscribe-lambda --no-hashes --no-dev > src/api/subscribe/requirements.txt
	pip install -r requirements.txt -t $(ARTIFACTS_DIR)
	cp *.py $(ARTIFACTS_DIR)
