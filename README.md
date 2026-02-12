# Algotrade.io

## Development

```bash
# Install UI deps
pnpm install

# Install API deps
make install DEV=1

# Run UI dev server
pnpm start

# Build and start local API
make build START=1
```

### API Commands

```bash
# Build API
make build

# Deploy API (dev by default)
make deploy

# Deploy to production
make deploy PROD=1

# Run tests with local DynamoDB
make test-db
```
