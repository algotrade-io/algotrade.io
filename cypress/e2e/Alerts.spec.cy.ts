import { domain } from "../support/e2e";

describe('Alerts', () => {
    beforeEach(() => {
      cy.visit('/alerts')
    })
    it('Update preferences', () => {
      const toggle = '.ant-switch';
      cy.get(toggle).first().should('be.disabled');
      cy.login();
      cy.intercept('GET', `https://api.${domain}/account`).as('getAccount');
      cy.wait('@getAccount').then(({ request, response }) => {
        const auth = request.headers['authorization'];
        if (!response?.body.in_beta) {
          cy.request({method: 'POST', url: `https://api.${domain}/account`, headers: {Authorization: auth}, body: {in_beta: 1}});
        }
        cy.request({method: 'POST', url: `https://api.${domain}/account`, headers: {Authorization: auth}, body: {alerts: {email: false}}});
      });
      cy.reload();
      cy.intercept('POST', `https://api.${domain}/account`).as('postAccount');
      cy.get(toggle).first().should('not.be.disabled').click();
      cy.wait('@postAccount').then(({ request, response }) => {
        cy.wrap(response?.body.in_beta).should('eq', 1);
        cy.wrap(response?.body.alerts.email).should('eq', true);
        const auth = request.headers['authorization'];
        cy.request({method: 'POST', url: `https://api.${domain}/account`, headers: {Authorization: auth}, body: {in_beta: 0}});
      });
      cy.get(toggle).first().click();
    })
  })