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
    it('Trigger Signals API', () => {
        const notification = '.ant-notification';
        cy.login();
        cy.intercept('GET', `https://api.${domain}/account`).as('getAccount');
        cy.get('input[type="password"]', { timeout: 10000 }).invoke('val').should('have.length', 86);
        // Try API without access
        cy.get('.opblock').click();
        cy.contains('button', 'Try it out').click();
        cy.contains('button', 'Execute').click();
        cy.contains(notification, 'Payment Required', { timeout: 10000 }).should('be.visible');
        cy.get('.ant-notification-notice-icon-error').should('be.visible');
        // Get access
        cy.wait('@getAccount').then(({ request }) => {
          const auth = request.headers['authorization'];
          cy.request({method: 'POST', url: `https://api.${domain}/account`, headers: {Authorization: auth}, body: {in_beta: 1}});
        });
        // Try again
        cy.contains('button', 'Execute').click();
        cy.contains(notification, 'Success', { timeout: 10000 }).should('be.visible');
        cy.get('.ant-notification-notice-icon-success').should('be.visible');
        cy.contains(notification, 'Quota').should('be.visible');
        cy.get('.ant-notification-notice-icon-warning').should('be.visible');
    })
  })