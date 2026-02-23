# DEV=1 includes dev dependencies
UV_SYNC := uv sync $(if $(DEV),--dev,--no-dev)
UV_SYNC_FROZEN := uv sync --frozen $(if $(DEV),--dev,--no-dev)

# All Lambda dependency groups (used by default for install/ci/test)
ALL_LAMBDA_GROUPS := --group trade --group account --group contact --group gym --group model --group notify --group preview --group signals --group subscribe

# API directories
API_DIR := src/api
LAMBDAS := trade account contact gym model notify preview signals subscribe

# Deploy defaults: DEV=1 by default
STAGE := $(if $(PROD),prod,dev)
PARAMS_FILE := $(if $(PROD),parameters.env,dev-parameters.env)
DOMAIN := $(shell basename $(CURDIR))
API_BUCKET := api.$(if $(PROD),,dev.)$(DOMAIN)

.PHONY: install ci lint format type test cov clean help all \
	reqs build start deploy \
	start-db stop-db seed-db test-db

help:
	@echo "Available targets:"
	@echo "  install   - Install deps (DEV=1 for dev deps)"
	@echo "  ci        - Install with frozen lockfile (DEV=1 for dev deps)"
	@echo "  lint      - Run ruff linter + format check"
	@echo "  format    - Auto-fix and format with ruff"
	@echo "  type      - Run type checking (ty for Python, tsc for TypeScript)"
	@echo "  test      - Run pytest with parallelism"
	@echo "  cov       - Run pytest with coverage"
	@echo "  clean     - Remove build artifacts"
	@echo "  all       - Run lint, type, test"
	@echo ""
	@echo "API targets:"
	@echo "  reqs      - Generate requirements.txt for all lambdas"
	@echo "  build     - Build API with SAM (START=1 to also start local API)"
	@echo "  start     - Start local API with SAM"
	@echo "  deploy    - Deploy API (PROD=1 for production, default is dev)"
	@echo ""
	@echo "Database targets:"
	@echo "  start-db  - Start local DynamoDB"
	@echo "  stop-db   - Stop local DynamoDB"
	@echo "  seed-db   - Seed local DynamoDB"
	@echo "  test-db   - Run tests with local DynamoDB"

install:
	$(UV_SYNC) $(ALL_LAMBDA_GROUPS)

ci:
	$(UV_SYNC_FROZEN) $(ALL_LAMBDA_GROUPS)

lint:
	uv run ruff check .
	uv run ruff format --check .

format:
	uv run ruff check . --fix
	uv run ruff format .

type:
	uv run ty check src/api tests/api

# test:
# 	uv run python -m pytest

# cov:
# 	uv run python -m pytest --cov

clean:
	rm -rf .coverage coverage.xml .pytest_cache .ruff_cache $(API_DIR)/.aws-sam
	find . -type d -name __pycache__ -exec rm -rf {} + 2>/dev/null || true

all: lint type test

# Generate requirements.txt for each lambda from dependency groups
reqs:
	@for lambda in $(LAMBDAS); do \
		echo "Generating requirements for $$lambda..."; \
		uv export --group $$lambda --no-hashes --no-dev --no-emit-project > $(API_DIR)/$$lambda/requirements.txt; \
	done
	@echo "All requirements.txt files generated"

# Build API with SAM (optionally start with START=1)
build: reqs
	cd $(API_DIR) && sam build --use-container --cached --parallel
ifdef START
	$(MAKE) start
endif
ifdef DEPLOY
	$(MAKE) deploy
endif

# Start local API
start:
	cd $(API_DIR) && sam local start-api --parameter-overrides $$(cat local-parameters.env)

# Deploy API (PROD=1 for production, default is dev)
STACK_NAME := api$(if $(PROD),,-dev)
deploy:
	cd $(API_DIR) && sam deploy --no-confirm-changeset --no-fail-on-empty-changeset \
		--parameter-overrides $$(cat $(PARAMS_FILE)) --config-env $(STAGE) --s3-bucket $(API_BUCKET)
	@# Force API Gateway deployment to ensure stage uses latest changes
	@API_ID=$$(aws cloudformation describe-stack-resource --stack-name $(STACK_NAME) \
		--logical-resource-id ApiGatewayApi --query 'StackResourceDetail.PhysicalResourceId' --output text) && \
	aws apigateway create-deployment --rest-api-id $$API_ID --stage-name $(STAGE) \
		--description "Post-deploy $(STACK_NAME) $$(date -u +%Y-%m-%dT%H:%M:%SZ)" > /dev/null && \
	echo "API Gateway deployment created for $$API_ID"

# Database targets
start-db:
	docker run -d --rm -p 8000:8000 --name db amazon/dynamodb-local

stop-db:
	-docker kill --signal=SIGTERM db && sleep 5

seed-db:
	util/seed.sh

test cov:
	-$(MAKE) stop-db
	$(MAKE) start-db
	$(MAKE) seed-db
	bash -ic 'source util/env.sh && uv run python -m pytest --cov'
	$(MAKE) stop-db
