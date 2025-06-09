import { domain } from "../support/e2e";

describe('Docs', () => {
    beforeEach(() => {
      cy.visit('/docs')
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