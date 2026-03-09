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
    setupNodeEvents(on, config) {
      // implement node event listeners here
      on('before:browser:launch', (browser = {}, launchOptions) => {
        if (browser.family === 'chromium' && browser.name !== 'electron') {
          // Force 1x DPI for Chrome
          launchOptions.args.push('--force-device-scale-factor=1');
        }
        
        if (browser.name === 'electron') {
          // For Electron, you can set the scale factor via preferences
          launchOptions.preferences.deviceScaleFactor = 1;
        }

        return launchOptions;
      });
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
