import { domain } from "../support/e2e";

describe('Alerts', () => {
    beforeEach(() => {
      cy.visit('/alerts')
    })
    it('Display alerts page structure', () => {
      cy.contains('h1', 'Notifications');
      cy.contains('h2', 'Email');
      cy.contains('h2', 'Webhook');
      cy.contains('h2', 'SMS');
      cy.contains('Coming soon');
    })
    it('Show error alert for unauthenticated user', () => {
      // Should show error alert for not logged in
      cy.get('.ant-alert-error').should('be.visible');
      cy.contains('must be');
      cy.contains('signed in');
      cy.contains('🔔');
      
      // Toggles should be disabled
      cy.get('.ant-switch').should('be.disabled');
    })
    it('Show sign in link and login on click', () => {
      // Click sign in link
      cy.get('.ant-alert').contains('signed in').click();
      
      // Should open login modal
      cy.get('.ant-modal').should('be.visible');
    })
    it('Display email section', () => {
      cy.contains('Email');
      cy.contains('Receive an email when a new signal is detected');
      cy.contains('manual trading');
      
      // Verify bull/bear images exist
      cy.get('img[src*="bull"]').should('exist');
      cy.get('img[src*="bear"]').should('exist');
    })
    it('Display webhook section', () => {
      cy.contains('Webhook');
      cy.contains('webhook event');
      cy.contains('00:00 — 00:10 UTC');
      cy.contains('automated trading');
      cy.contains('Listen for events');
      cy.contains('Sample Code');
      
      // Verify code block is present
      cy.get('pre').contains('lambda_handler');
      cy.get('pre').contains('X-API-Key');
      
      // Verify input placeholder
      cy.get('input[placeholder*="https://api"]').should('exist');
      
      // Verify copy button for code
      cy.get('.anticon-copy').should('exist');
    })
    it('Copy sample code to clipboard', () => {
      // Click copy button for code
      cy.get('.anticon-copy').click();
      
      // Verify success message
      cy.get('.ant-message').contains('Copied code to clipboard');
    })
    it('Show warning alert for non-beta user', () => {
      cy.login();
      cy.intercept('GET', `https://api.${domain}/account`).as('getAccount');
      cy.wait('@getAccount').then(({ request, response }) => {
        const auth = request.headers['authorization'];
        // Ensure user is NOT in beta
        if (response?.body.in_beta || response?.body.subscribed) {
          cy.request({method: 'POST', url: `https://api.${domain}/account`, headers: {Authorization: auth}, body: {in_beta: 0}});
          cy.reload();
        }
      });
      
      // Should show warning alert
      cy.get('.ant-alert-warning').should('be.visible');
      cy.contains('will not receive notifications');
      cy.contains('activate your subscription');
      
      // Link should go to subscription page
      cy.get('.ant-alert-warning').contains('activate your subscription').should('have.attr', 'href', '/subscription');
    })
    it('Handle API error notification', () => {
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
      
      // Mock error response for POST
      cy.intercept('POST', `https://api.${domain}/account`, {
        statusCode: 500,
        body: { message: 'Server error' }
      }).as('postAccountError');
      
      // Toggle email
      cy.get('.ant-switch').first().click();
      cy.wait('@postAccountError');
      
      // Should show error notification
      cy.get('.ant-notification').contains('Settings not saved');
      cy.contains('Try refreshing the page');
      
      // Clean up
      cy.intercept('POST', `https://api.${domain}/account`).as('postAccountCleanup');
      cy.intercept('GET', `https://api.${domain}/account`).as('getAccount3');
      cy.reload();
      cy.wait('@getAccount3').then(({ request }) => {
        const auth = request.headers['authorization'];
        cy.request({method: 'POST', url: `https://api.${domain}/account`, headers: {Authorization: auth}, body: {in_beta: 0}});
      });
    })
    it('Update preferences', () => {
      const toggle = '.ant-switch';
      cy.get(toggle).first().should('be.disabled');
      cy.login();
      cy.intercept('GET', `https://api.${domain}/account`).as('getAccount');
      cy.wait('@getAccount').then(({ request, response }) => {
        const auth = request.headers['authorization'];
        if (!response?.body.in_beta) {
          cy.request({method: 'POST', url: `https://api.${domain}/account`, headers: {Authorization: auth}, body: {in_beta: 1}});
        }
        cy.request({method: 'POST', url: `https://api.${domain}/account`, headers: {Authorization: auth}, body: {alerts: {email: false}}});
      });
      cy.reload();
      cy.intercept('POST', `https://api.${domain}/account`).as('postAccount');
      cy.get(toggle).first().should('not.be.disabled').click();
      cy.wait('@postAccount').then(({ request, response }) => {
        cy.wrap(response?.body.in_beta).should('eq', 1);
        cy.wrap(response?.body.alerts.email).should('eq', true);
        const auth = request.headers['authorization'];
        cy.request({method: 'POST', url: `https://api.${domain}/account`, headers: {Authorization: auth}, body: {in_beta: 0}});
      });
      cy.get(toggle).first().click();
    })
  })