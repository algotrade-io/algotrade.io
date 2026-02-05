.PHONY: build

build:
	cd ../.. && uv export --package contact-lambda --no-hashes --no-dev > src/api/contact/requirements.txt
	pip install -r requirements.txt -t $(ARTIFACTS_DIR)
	cp *.py $(ARTIFACTS_DIR)
