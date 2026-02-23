# UV Monorepo Workspace Migration (Option A)

Migrate to UV workspace with shared dependencies and per-Lambda `pyproject.toml`.

**Chosen Options:**
- **Decision 1:** Option 1B — SAM `BuildMethod: makefile`
- **Decision 2:** Option 2B — Multiple shared packages (shared-core, shared-db)

## Current State

| Lambda | Dependencies |
|--------|-------------|
| account | stripe, pynamodb |
| contact | pynamodb |
| gym | pandas, pynamodb |
| model | boto3, numpy |
| notify | pynamodb, cryptography, jinja2, requests, boto3 |
| preview | boto3, pynamodb |
| signals | boto3, pynamodb |
| subscribe | stripe, pynamodb |
| trade | boto3, robin-stocks, python-jose, requests |

---

## Proposed Structure

```
algotrade.io/
├── pyproject.toml           # Root workspace config
├── uv.lock                   # Single lockfile for all Lambdas
└── src/api/
    ├── shared-core/          # boto3 only
    │   └── pyproject.toml
    ├── shared-db/            # shared-core + pynamodb
    │   └── pyproject.toml
    ├── account/
    │   └── pyproject.toml    # shared-db + stripe
    │   └── Makefile          # SAM build target
    ├── trade/
    │   └── pyproject.toml    # shared-core + robin-stocks
    │   └── Makefile
    └── ...
```

---

## Proposed Changes

### [MODIFY] pyproject.toml

```toml
[project]
name = "algotrade-api"
version = "0.1.0"
requires-python = ">=3.14"
dependencies = []

[dependency-groups]
dev = ["flake8", "pytest", "coverage"]

[tool.uv.workspace]
members = [
    "src/api/shared-core",
    "src/api/shared-db",
    "src/api/account",
    "src/api/contact",
    "src/api/gym",
    "src/api/model",
    "src/api/notify",
    "src/api/preview",
    "src/api/signals",
    "src/api/subscribe",
    "src/api/trade",
]
```

---

### [NEW] src/api/shared-core/pyproject.toml

```toml
[project]
name = "shared-core"
version = "0.1.0"
requires-python = ">=3.14"
dependencies = ["boto3>=1.34.16"]
```

### [NEW] src/api/shared-db/pyproject.toml

```toml
[project]
name = "shared-db"
version = "0.1.0"
requires-python = ">=3.14"
dependencies = ["shared-core", "pynamodb>=5.5.1"]

[tool.uv.sources]
shared-core = { workspace = true }
```

---

### [NEW] src/api/trade/pyproject.toml (example)

```toml
[project]
name = "trade-lambda"
version = "0.1.0"
requires-python = ">=3.14"
dependencies = [
    "shared-core",
    "robin-stocks>=3.4.0",
    "python-jose>=3.3.0",
    "requests>=2.28.1",
]

[tool.uv.sources]
shared-core = { workspace = true }
```

### [NEW] src/api/trade/Makefile

```makefile
.PHONY: build

build:
	uv export --package trade-lambda --no-hashes > requirements.txt
	pip install -r requirements.txt -t $(ARTIFACTS_DIR)
	cp -r *.py $(ARTIFACTS_DIR)
```

---

### [DELETE] requirements.txt files
- `src/api/*/requirements.txt` - Replaced by `pyproject.toml`

---

## Key Decisions

### Decision 1: SAM Integration

#### Option 1A: Generate requirements.txt via `uv export` before deploy

| Pros | Cons |
|------|------|
| ✅ No SAM template changes | ❌ Extra CI step |
| ✅ Works with existing SAM build | ❌ requirements.txt files in git |
| ✅ Familiar to team | ❌ Must remember to regenerate |

#### ✅ Option 1B: SAM `BuildMethod: makefile` (CHOSEN)

| Pros | Cons |
|------|------|
| ✅ Full control over build | ❌ More complex Makefile |
| ✅ No generated files | ❌ SAM template changes |
| ✅ Can optimize package size | ❌ Steeper learning curve |

---

### Decision 2: Shared Package Structure

#### Option 2A: Single shared package (boto3 + pynamodb)

| Pros | Cons |
|------|------|
| ✅ Simple, one package | ❌ Unused deps in some Lambdas |
| ✅ Easy to maintain | ❌ Slightly larger packages |

#### ✅ Option 2B: Multiple shared packages (CHOSEN)

| Pros | Cons |
|------|------|
| ✅ Minimal deps per Lambda | ❌ More packages to manage |
| ✅ Smaller package sizes | ❌ Complex dependency graph |

#### Option 2C: No shared package

| Pros | Cons |
|------|------|
| ✅ Maximum flexibility | ❌ Duplicate dep declarations |
| ✅ No workspace complexity | ❌ Version drift risk |

---

## Verification Plan

```bash
# Lock all workspace deps
uv lock

# Sync workspace
uv sync

# Run tests
uv run pytest

# Test SAM build
cd src/api && sam build
```
