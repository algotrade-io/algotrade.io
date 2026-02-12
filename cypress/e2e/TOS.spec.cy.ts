describe('Terms of Service', () => {
    beforeEach(() => {
      cy.visit('/tos')
    })
    it('Display title and key sections', () => {
      cy.contains('Terms of Service & Financial Disclaimer');
      cy.contains('Terms and Conditions');
      cy.contains('Terms of Use');
      cy.contains('Limitation of Liability');
      cy.contains('Trading Signals');
      cy.contains('Registered Users');
      cy.contains('Rules of Conduct');
      cy.contains('Disclaimer Regarding Investment Decisions and Trading');
      cy.contains('FORCEPU.SH Subscription/Billing, Cancellation, and Refund');
    })
    it('Navigate to contact page', () => {
      cy.contains('a', 'contact').click();
      cy.url().should('include', '/contact');
    })
  })
