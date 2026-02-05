.PHONY: build

build:
	cd ../.. && uv export --package notify-lambda --no-hashes --no-dev > src/api/notify/requirements.txt
	pip install -r requirements.txt -t $(ARTIFACTS_DIR)
	cp *.py $(ARTIFACTS_DIR)
