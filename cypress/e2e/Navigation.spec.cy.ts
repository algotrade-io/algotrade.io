describe('Navigation', () => {
  beforeEach(() => {
    cy.visit('/')
  })
  it('Header', () => {
    const selector = '.ant-layout-header';
    const pages = ['Docs', 'Algorithm', 'Subscription', 'Alerts', 'Contact'];
    // Test that links exist
    cy.get(selector).should(el => {
      const element = el[0];
      expect(element.innerText).to.include('Algotrade.io');
      pages.forEach(page => expect(element.innerText).to.include(page));
    })
    // Navigate to each page
    pages.forEach(page => {
      cy.get(selector).find('a').contains(page).first().click({force: true});
      cy.location().should(location => expect(location.pathname).to.eq(`/${page.toLowerCase()}`))
    })

    // Test that sign in modal renders
    cy.get(selector).find('button').contains('Get started').first().click()
    cy.get('.ant-modal-body').contains('Sign In')
  })
  it('Footer', () => {
    const selector = '.ant-layout-footer';
    cy.get(selector).should(el => {
      const element = el[0];
      expect(element.innerText).to.include('Terms of Service');
      expect(element.innerText).to.include('Financial Disclaimer');
      expect(element.innerText).to.include('Privacy');
    })

    cy.get(selector).find('a').contains('Terms of Service').first().click();
    cy.location().should(location => expect(location.pathname).to.eq('/tos'))

    cy.get(selector).find('a').contains('Privacy').first().click();
    cy.location().should(location => expect(location.pathname).to.eq('/privacy'))
  })
})