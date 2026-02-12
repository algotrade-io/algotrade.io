import { domain } from "../support/e2e";

describe('Docs', () => {
    beforeEach(() => {
      cy.visit('/docs')
    })
    it('Display docs page structure', () => {
      cy.contains('h1', 'API Docs');
      cy.contains('h2', 'Auth');
      cy.contains('h2', 'API');
      cy.contains('X-API-Key');
      cy.contains('authenticate your API requests');
    })
    it('Show sign in button for unauthenticated user', () => {
      cy.contains('button', 'Sign in to receive your API key').should('be.visible');
      
      // Click should open login modal
      cy.contains('button', 'Sign in to receive your API key').click();
      cy.get('.ant-modal').should('be.visible');
    })
    it('Display API key for authenticated user', () => {
      cy.login();
      cy.intercept('GET', `https://api.${domain}/account`).as('getAccount');
      cy.wait('@getAccount');
      
      // Verify API key field is shown
      cy.get('input[type="password"]').should('exist');
      cy.get('input[type="password"]').invoke('val').should('have.length', 86);
      
      // Verify copy button exists
      cy.get('.anticon-copy').should('exist');
      
      // Verify tooltip exists
      cy.get('input[type="password"]').trigger('mouseover');
      cy.contains('Use the button on the right to copy');
    })
    it('Display Swagger UI', () => {
      // Verify Swagger UI components are present
      cy.get('.swagger-ui').should('exist');
      cy.get('.opblock').should('exist');
      
      // Verify authorize button
      cy.contains('button', 'Authorize').should('exist');
      
      // Verify operation block can be expanded
      cy.get('.opblock').click();
      cy.contains('button', 'Try it out').should('be.visible');
    })
    it('Copy API key to clipboard', () => {
      cy.login();
      cy.intercept('GET', `https://api.${domain}/account`).as('getAccount');
      cy.wait('@getAccount');
      
      // Click copy button
      cy.get('.anticon-copy').first().click();
      
      // Verify success message
      cy.get('.ant-message').contains('Copied API Key to clipboard');
    })
    it('Handle missing API key error', () => {
      cy.login();
      cy.intercept('GET', `https://api.${domain}/account`).as('getAccount');
      cy.wait('@getAccount');
      
      // Clear API key from authorize
      cy.contains('button', 'Authorize').click();
      cy.get('.modal-ux').find('input').clear();
      cy.get('.modal-ux').find('button').contains('Authorize').click();
      cy.get('.modal-ux').find('button').contains('Close').click();
      
      // Try to execute
      cy.get('.opblock').click();
      cy.contains('button', 'Try it out').click();
      cy.contains('button', 'Execute').click();
      
      // Should show missing API key notification
      cy.get('.ant-notification').contains('Missing API Key');
      cy.contains('Paste your API key');
    })
    it('Handle wrong API key error', () => {
      cy.login();
      cy.intercept('GET', `https://api.${domain}/account`).as('getAccount');
      cy.wait('@getAccount');
      
      // Set wrong API key
      cy.contains('button', 'Authorize').click();
      cy.get('.modal-ux').find('input').clear().type('wrong-api-key');
      cy.get('.modal-ux').find('button').contains('Authorize').click();
      cy.get('.modal-ux').find('button').contains('Close').click();
      
      // Try to execute
      cy.get('.opblock').click();
      cy.contains('button', 'Try it out').click();
      cy.contains('button', 'Execute').click();
      
      // Should show wrong API key notification
      cy.get('.ant-notification').contains('Wrong API Key');
      cy.contains('Copy your API key from the Auth section');
    })
    it('Handle forbidden (quota reached) error', () => {
      cy.login();
      cy.intercept('GET', `https://api.${domain}/account`).as('getAccount');
      cy.wait('@getAccount').then(({ request }) => {
        const auth = request.headers['authorization'];
        // Set user as beta user
        cy.request({method: 'POST', url: `https://api.${domain}/account`, headers: {Authorization: auth}, body: {in_beta: 1}});
      });
      cy.reload();
      
      cy.intercept('GET', `https://api.${domain}/account`).as('getAccount2');
      cy.wait('@getAccount2');
      
      // Execute multiple times to reach quota
      cy.get('.opblock').click();
      cy.contains('button', 'Try it out').click();
      
      for (let i = 0; i < 6; i++) {
        cy.contains('button', 'Execute').click();
        cy.wait(2000);
      }
      
      // Should see Forbidden error at some point
      cy.get('.ant-notification').should('exist');
      
      // Clean up
      cy.intercept('GET', `https://api.${domain}/account`).as('getAccount3');
      cy.reload();
      cy.wait('@getAccount3').then(({ request }) => {
        const auth = request.headers['authorization'];
        cy.request({method: 'POST', url: `https://api.${domain}/account`, headers: {Authorization: auth}, body: {in_beta: 0}});
      });
    })
    it('Trigger Signals API', () => {
        const notification = '.ant-notification';
        cy.login();
        cy.intercept('GET', `https://api.${domain}/account`).as('getAccount');
        cy.get('input[type="password"]').invoke('val').should('have.length', 86);
        // Try API without access
        cy.get('.opblock').click();
        cy.contains('button', 'Try it out').click();
        cy.contains('button', 'Execute').click();
        cy.contains(notification, 'Payment Required').should('be.visible');
        cy.get('.ant-notification-notice-icon-error').should('be.visible');
        // Get access
        cy.wait('@getAccount').then(({ request }) => {
          const auth = request.headers['authorization'];
          cy.request({method: 'POST', url: `https://api.${domain}/account`, headers: {Authorization: auth}, body: {in_beta: 1}});
        });
        // Try again
        cy.contains('button', 'Execute').click();
        cy.contains(notification, 'Success').should('be.visible');
        cy.get('.ant-notification-notice-icon-success').should('be.visible');
        cy.contains(notification, 'Quota').should('be.visible');
        cy.get('.ant-notification-notice-icon-warning').should('be.visible');
    })
  })