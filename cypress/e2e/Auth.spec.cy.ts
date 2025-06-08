describe('Auth', () => {
    beforeEach(() => {
      cy.visit('/')
    })
    it('Sign in', () => {

        // Sign in
        cy.login();

        // Reset account
        cy.intercept('GET', `https://api.dev.${domain}/account`).as('getAccount');
        cy.wait('@getAccount').then(({ request }) => {
            const auth = request.headers['authorization'];
            cy.request({method: 'DELETE', url: `https://api.dev.${domain}/account`, headers: {Authorization: auth}});
        });
        cy.reload()

        // Read disclaimer
        let selector = '.ant-modal-footer';
        cy.get(selector).find('input[type="checkbox"]').click()
        cy.get(selector).find('button').contains('OK').click();
        cy.get(selector).should('not.be.visible');
    })
  })