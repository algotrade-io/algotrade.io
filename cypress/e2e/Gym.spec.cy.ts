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
  })