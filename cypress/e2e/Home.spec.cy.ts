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
      // Default is BTC
      cy.get('.ant-table').should('be.visible');
      cy.get('.ant-table-thead').within(() => {
        cy.contains('Metric');
        cy.contains('HODL');
        cy.contains('hyperdrive');
      });
      cy.get('.ant-table-tbody .ant-table-row').should('have.length.greaterThan', 0);
      // Toggle to USD
      cy.contains('$').click();
      cy.get('.ant-table-tbody .ant-table-row').should('have.length.greaterThan', 0);
      // Toggle back to BTC
      cy.contains('₿').click();
      cy.get('.ant-table-tbody .ant-table-row').should('have.length.greaterThan', 0);
    })
  })
