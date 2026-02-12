describe('Template', () => {
    it('Display template page with HTML content', () => {
      cy.visit('/template')
      // Verify the template container has white background
      cy.get('div[style*="background: white"]', { timeout: 10000 }).should('exist');
      // Verify inner HTML is rendered
      cy.get('div[style*="background: white"]').children().should('exist');
    })
  })
