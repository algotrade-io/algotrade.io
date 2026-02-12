describe('Gym', () => {
    beforeEach(() => {
      cy.visit('/gym')
    })
    it('Display exercise log page', () => {
      cy.contains('Exercise Log');
      cy.contains('results');
      cy.get('input').should('exist');
      cy.get('button').contains('Search');
    })
    it('List exercises with correct columns', () => {
      cy.get('.ant-table-thead').within(() => {
        cy.contains('Date');
        cy.contains('Id');
        cy.contains('Weight');
        cy.contains('Reps');
        cy.contains('Exercise');
        cy.contains('Volume');
        cy.contains('1RM');
      });
      cy.get('.ant-table-cell').contains('Bench');
    })
    it('Display pagination', () => {
      cy.get('.ant-pagination').should('have.length.greaterThan', 0);
    })
    it('Load exercise data from API', () => {
      // Wait for loading spinner to disappear and data to load
      cy.get('.ant-spin-spinning').should('not.exist', { timeout: 10000 });
      
      // Verify table has rows with data
      cy.get('.ant-table-tbody .ant-table-row').should('have.length.greaterThan', 0);
      
      // Verify results count is displayed
      cy.contains('results').invoke('text').should('match', /\d+ results/);
      
      // Verify at least one exercise is shown
      cy.get('.ant-table-tbody').within(() => {
        // Check for exercise names
        cy.get('.ant-table-cell').should('have.length.greaterThan', 6);
      });
    })
    it('Display search input functionality', () => {
      // Verify search input is usable
      cy.get('.ant-input-search').should('exist');
      cy.get('input.ant-input').should('not.be.disabled');
      
      // Verify search button exists
      cy.get('.ant-input-search-button').should('exist');
      cy.get('.ant-input-search-button').contains('Search');
      
      // Verify allow clear is enabled
      cy.get('.ant-input-search').find('input').type('test');
      cy.get('.ant-input-clear-icon').should('be.visible');
    })
    it('Display pagination controls', () => {
      // Wait for data to load
      cy.get('.ant-spin-spinning').should('not.exist', { timeout: 10000 });
      
      // Verify both top and bottom pagination
      cy.get('.ant-pagination').should('have.length', 2);
      
      // Verify page controls are present
      cy.get('.ant-pagination-item').should('exist');
      cy.get('.ant-pagination-next').should('exist');
      cy.get('.ant-pagination-prev').should('exist');
    })
  })