// Force 1x DPI for consistent screenshots across Retina Macs and CI Linux
process.env.ELECTRON_FORCE_DEVICE_SCALE_FACTOR = '1';

import path from 'path';
import { fileURLToPath } from 'url';
import vitePreprocessor from 'cypress-vite';
import codeCoverage from '@cypress/code-coverage/task';
import getCompareSnapshotsPlugin from 'cypress-image-diff-js/plugin';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '../../..');
const domain = path.basename(ROOT_DIR);

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
    // VRT is local-only (font rendering differs between macOS and CI Linux)
    excludeSpecPattern: process.env.CI ? ['**/VRT.spec.cy.ts'] : [],
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
      getCompareSnapshotsPlugin(on, config)
      return config;
    },
  },
};
