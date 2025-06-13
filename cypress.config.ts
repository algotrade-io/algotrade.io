import path from 'path';
import { fileURLToPath } from 'url';
import vitePreprocessor from 'cypress-vite';
import codeCoverage from '@cypress/code-coverage/task'

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const domain = path.basename(__dirname);

export default {
  experimentalModifyObstructiveThirdPartyCode: true,
  chromeWebSecurity: false,
  env: {
    SIGNAL_EMAIL: process.env['SIGNAL_EMAIL'],
    EMAIL_PASS: process.env['EMAIL_PASS'],
  },
  video: Boolean(process.env.CI),
  e2e: {
    // This must be DEV only (NOT prod) since we're using with stripe test credit cards.
    baseUrl: `https://dev.${domain}`,
    experimentalMemoryManagement: Boolean(process.env.CI),
    setupNodeEvents(on, config) {
      // implement node event listeners here
      on(
        'file:preprocessor',
        vitePreprocessor({
          configFile: path.resolve(__dirname, './vite.config.ts'),
          mode: 'development',
        }),
      )
      codeCoverage(on, config)
      return config;
    },
  },
};
