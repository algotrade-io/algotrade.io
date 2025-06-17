# Algotrade.io

## Development

```
# Install Deps
npm install

# Run dev server
npm start
```

### Generate Page

To generate a page

```
npm run umi g page <path> --typescript
```

<!--
Amplify auth thoughts
install amplify cli
make sure aws creds are set as env vars
put appIds in gh secrets
write script for `amplify pull --appId "${APP_ID}" --envName "${ENV}"`
add this to npm scripts and ci steps
-->
