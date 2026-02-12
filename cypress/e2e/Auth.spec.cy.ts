import { domain } from "../support/e2e";

describe('Auth', () => {
    beforeEach(() => {
      cy.visit('/')
    })
    it('Sign in', () => {
        // Sign in
        cy.login();

        // Verify account API call works
        cy.intercept('GET', `https://api.${domain}/account`).as('getAccount');
        cy.wait('@getAccount').then(({ response }) => {
            // Account should be retrieved successfully
            cy.wrap(response?.statusCode).should('eq', 200);
        });
    })
  })