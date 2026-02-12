import { domain } from "../support/e2e";

describe('Home', () => {
    beforeEach(() => {
      cy.visit('/')
    })
    it('Display landing page content', () => {
      cy.contains('h1', 'Leveraging AutoML to beat BTC');
      cy.contains('h5', 'hyperdrive');
      cy.get('a[href="https://github.com/suchak1/hyperdrive"]').should('exist');
    })
    it('Toggle BTC / USD', () => {
      // Default is BTC - wait for table to load
      cy.get('.ant-table', { timeout: 10000 }).should('be.visible');
      cy.get('.ant-table-thead').within(() => {
        cy.contains('Metric');
        cy.contains('HODL');
        cy.contains('hyperdrive');
      });
      cy.get('.ant-table-tbody .ant-table-row', { timeout: 10000 }).should('have.length.greaterThan', 0);
      // Toggle to USD
      cy.contains('$').click();
      cy.get('.ant-table-tbody .ant-table-row', { timeout: 10000 }).should('have.length.greaterThan', 0);
      // Toggle back to BTC
      cy.contains('₿').click();
      cy.get('.ant-table-tbody .ant-table-row', { timeout: 10000 }).should('have.length.greaterThan', 0);
    })
    it('Display stats table with metrics', () => {
      // Wait for data to load
      cy.get('.ant-table-tbody .ant-table-row', { timeout: 10000 }).should('have.length.greaterThan', 0);
      
      // Verify table structure
      cy.get('.ant-table-thead').contains('Metric');
      cy.get('.ant-table-thead').contains('HODL');
      cy.get('.ant-table-thead').contains('hyperdrive');
    })
    it('Show alert for logged in user not in beta', () => {
      cy.login();
      cy.intercept('GET', `https://api.${domain}/account`).as('getAccount');
      cy.wait('@getAccount').then(({ request, response }) => {
        const auth = request.headers['authorization'];
        // Ensure user is NOT in beta
        if (response?.body.in_beta) {
          cy.request({method: 'POST', url: `https://api.${domain}/account`, headers: {Authorization: auth}, body: {in_beta: 0}});
          cy.reload();
        }
      });
      
      // Verify warning alert for non-beta user
      cy.get('.ant-alert-warning').should('be.visible');
      cy.contains('not in the closed beta');
      cy.contains('📧');
    })
  })
