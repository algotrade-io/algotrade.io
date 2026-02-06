# DEV=1 includes dev dependencies
UV_SYNC := uv sync $(if $(DEV),--dev,--no-dev)
UV_SYNC_FROZEN := uv sync --frozen $(if $(DEV),--dev,--no-dev)

.PHONY: install ci lint format test cov clean help all

help:
	@echo "Available targets:"
	@echo "  install - Install deps (DEV=1 for dev deps)"
	@echo "  ci      - Install with frozen lockfile (DEV=1 for dev deps)"
	@echo "  lint    - Run ruff linter + format check"
	@echo "  format  - Auto-fix and format with ruff"
	@echo "  test    - Run pytest with parallelism"
	@echo "  cov     - Run pytest with coverage"
	@echo "  clean   - Remove build artifacts"
	@echo "  all     - Run lint, test"

install:
	$(UV_SYNC)

ci:
	$(UV_SYNC_FROZEN)

lint:
	uv run ruff check .
	uv run ruff format --check .

format:
	uv run ruff check . --fix
	uv run ruff format .

test:
	uv run python -m pytest

cov:
	uv run python -m pytest --cov

clean:
	rm -rf .coverage coverage.xml .pytest_cache .ruff_cache
	find . -type d -name __pycache__ -exec rm -rf {} + 2>/dev/null || true

all: lint test
