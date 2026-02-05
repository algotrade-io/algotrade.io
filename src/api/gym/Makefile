.PHONY: build

build:
	cd ../.. && uv export --package gym-lambda --no-hashes --no-dev > src/api/gym/requirements.txt
	pip install -r requirements.txt -t $(ARTIFACTS_DIR)
	cp *.py $(ARTIFACTS_DIR)
