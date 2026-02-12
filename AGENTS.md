# AGENTS.md

## Overview

This repo contains a full-stack application: a Python serverless API (`src/api/`) and a React + Vite frontend (`src/ui/`).

## CI Checks

All changes must pass these checks before merging.

### API (Python) — triggered by changes under `src/api/`

```bash
make lint      # ruff check . && ruff format --check .
make type      # ty check src/api tests/api
make test-db   # pytest with coverage against local DynamoDB
```

### UI (TypeScript/React) — triggered by all other changes

```bash
pnpm run typescript   # tsc --noEmit
pnpm run build        # vite build (must succeed)
# Cypress e2e tests run post-deploy against the dev site
# nyc check-coverage enforces UI code coverage thresholds
```

## Running Checks Locally

### API

```bash
make ci DEV=1          # install deps (frozen lockfile)
make lint              # lint + format check
make type              # type check
make test-db           # full test suite with local DynamoDB (requires Docker)
```

### UI

```bash
pnpm install
pnpm run typescript    # type check
pnpm run build         # build
pnpm test              # Cypress headless (requires config.env with credentials)
```

## Project Structure

- `src/api/` — Python Lambda functions (trade, account, contact, gym, model, notify, preview, signals, subscribe)
- `src/api/shared/python/` — shared utilities and PynamoDB models
- `src/ui/` — React frontend (pages, layouts, utils, assets)
- `tests/api/` — pytest unit tests
- `cypress/e2e/` — Cypress end-to-end specs
- `pyproject.toml` — Python dependencies (PEP 735 dependency groups)
- `package.json` — Node.js dependencies
- `Makefile` — API build/test/deploy commands
