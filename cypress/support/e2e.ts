// ***********************************************************
// This example support/e2e.ts is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands'

// Alternatively you can use CommonJS syntax:
// require('./commands')

import '@cypress/code-coverage/support'

// const domain = `dev.${__dirname}`;
// console.log('domain', domain);

// Get the project root directory from Cypress's own configuration.
export const rootDir: string = Cypress.config('projectRoot');
export const repoRoot: string | null = Cypress.config('repoRoot');

// You can now use the rootDir variable.
// For example, to log it to the Cypress command log (for debugging):
// cy.log(`Project root directory is: ${rootDir}`);
console.log('rootDir', rootDir)
console.log('repoRoot', repoRoot)

Cypress.on('uncaught:exception', (err, runnable) => {
    const { name } = err;
    if (name === 'IntegrationError') {
        return false;
    }
    return true;
})

