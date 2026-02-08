.PHONY: build build-ExerciseLogFunction

build build-ExerciseLogFunction:
	uv export --package gym-lambda --no-hashes --no-dev --no-emit-project | uv pip install -r - --target $(ARTIFACTS_DIR) --python-version 3.14
	cp *.py $(ARTIFACTS_DIR)
