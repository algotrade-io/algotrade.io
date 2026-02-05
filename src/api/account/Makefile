.PHONY: build

build:
	cd ../.. && uv export --package account-lambda --no-hashes --no-dev > src/api/account/requirements.txt
	pip install -r requirements.txt -t $(ARTIFACTS_DIR)
	cp *.py $(ARTIFACTS_DIR)
