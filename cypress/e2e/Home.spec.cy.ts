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
    it('Display chart with preview data', () => {
      // Wait for loading to complete
      cy.get('.ant-spin-nested-loading', { timeout: 10000 }).should('not.have.class', 'ant-spin-spinning');
      
      // Verify chart legend items
      cy.contains('HODL');
      cy.contains('hyperdrive');
      cy.contains('BUY', { timeout: 10000 });
      cy.contains('SELL');
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
    it('Show beta UI for beta user', () => {
      cy.login();
      cy.intercept('GET', `https://api.${domain}/account`).as('getAccount');
      cy.wait('@getAccount').then(({ request }) => {
        const auth = request.headers['authorization'];
        // Set user as beta user
        cy.request({method: 'POST', url: `https://api.${domain}/account`, headers: {Authorization: auth}, body: {in_beta: 1}});
      });
      cy.reload();
      
      // Wait for page to load
      cy.intercept('GET', `https://api.${domain}/account`).as('getAccount2');
      cy.wait('@getAccount2');
      
      // Verify success alert for beta user
      cy.get('.ant-alert-success', { timeout: 10000 }).should('be.visible');
      cy.contains('closed beta');
      cy.contains('🎊');
      
      // Verify beta title with signal cycling text
      cy.contains('New Signal:');
      
      // Verify fetch signals button
      cy.contains('button', 'Fetch the latest signals').should('exist');
      
      // Verify signal cards for each day of the week
      cy.get('.ant-badge-ribbon').should('have.length', 7);
      cy.get('.ant-card').should('have.length.greaterThan', 0);
      
      // Click fetch signals
      cy.contains('button', 'Fetch the latest signals').click();
      
      // Wait for loading to finish
      cy.get('.ant-skeleton', { timeout: 15000 }).should('not.exist');
      
      // Verify signals are displayed (either BUY or SELL icons)
      cy.get('.anticon-caret-up-filled, .anticon-caret-down-filled', { timeout: 10000 }).should('have.length.greaterThan', 0);
      
      // Click on a signal card to open modal
      cy.get('.ant-card').first().click();
      cy.get('.ant-modal', { timeout: 5000 }).should('be.visible');
      cy.get('.ant-modal').contains('Signal:');
      cy.get('.ant-modal').contains('Date:');
      cy.get('.ant-modal').contains('Asset:');
      cy.get('.ant-modal').contains('BTC');
      
      // Close modal by clicking outside
      cy.get('body').click(0, 0);
      
      // Clean up - remove beta status
      cy.intercept('GET', `https://api.${domain}/account`).as('getAccount3');
      cy.reload();
      cy.wait('@getAccount3').then(({ request }) => {
        const auth = request.headers['authorization'];
        cy.request({method: 'POST', url: `https://api.${domain}/account`, headers: {Authorization: auth}, body: {in_beta: 0}});
      });
    })
  })
