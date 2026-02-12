describe('Privacy Policy', () => {
    beforeEach(() => {
      cy.visit('/privacy')
    })
    it('Display title and key sections', () => {
      cy.contains('h1', 'Privacy Policy');
      cy.contains('Last updated');
      cy.contains('Interpretation and Definitions');
      cy.contains('Collecting and Using Your Personal Data');
      cy.contains('Tracking Technologies and Cookies');
      cy.contains("Children's Privacy");
      cy.contains('Changes to this Privacy Policy');
      cy.contains('Contact Us');
    })
    it('Navigate to contact page', () => {
      cy.contains('a', 'contact').click();
      cy.url().should('include', '/contact');
    })
  })
