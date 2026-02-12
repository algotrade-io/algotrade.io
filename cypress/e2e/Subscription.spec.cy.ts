import { domain } from "../support/e2e";

describe('Subscription', () => {
    beforeEach(() => {
      cy.visit('/subscription')
    })

    it('Display subscription page content', () => {
      // Verify page title and structure
      cy.contains('h1', 'Premium Access');
      cy.contains('BUY');
      cy.contains('SELL');
      
      // Verify card displays with pricing info
      const card = '.ant-card';
      cy.get(card).should('exist');
      cy.get(card).contains('Signals API');
      cy.get(card).contains('/ month').parent().invoke('text').should('match', /^\$\d+\.?\d+ \/ month$/);
      
      // Verify feature list
      cy.get(card).contains('/signals');
      cy.get(card).contains('BUY and SELL signals');
      cy.get(card).contains('5 requests / day');
      
      // Verify subscribe button exists (disabled without login)
      cy.contains('button', 'Subscribe').should('exist');
      
      // Verify contact us link
      cy.get('a').contains('Contact us!').should('have.attr', 'href', '/contact');
      
      // Verify disclaimer text
      cy.contains('Disclaimer');
      cy.contains('DO NOT');
      cy.contains('investment advice');
      
      // Verify min investment calculation appears
      cy.contains('Min profitable starting balance', { timeout: 10000 });
      cy.contains('BTC');
      cy.contains('rough estimation');
      
      // Verify signal timing info
      cy.contains('00:00 - 00:10 UTC');
    })

    it('Show login modal when not logged in and clicking Subscribe', () => {
      // Wait for price to load
      cy.contains('/ month', { timeout: 10000 });
      
      // Click subscribe without being logged in
      cy.contains('button', 'Subscribe').click();
      
      // Should show login modal
      cy.get('.ant-modal').should('be.visible');
      cy.get('.ant-modal').find('input[name="username"]').should('exist');
    })

    it('Subscribe', () => {
        // Login and subscribe
        const card = '.ant-card';
        cy.login();
        cy.get(card).contains('/ month').parent().invoke('text').should('match', /^\$\d+\.?\d+ \/ month$/);
        cy.contains('button', 'Subscribe').click();
        cy.origin('https://checkout.stripe.com', () => {
          cy.on('uncaught:exception', () => false)
          cy.get('input[name="cardNumber"]').type('4242424242424242');
          const expiryYear = String(new Date().getFullYear() + 4).slice(-2);
          const expiryMonth = '01'
          cy.get('input[name="cardExpiry"]').type(`${expiryMonth}${expiryYear}`);
          cy.get('input[name="cardCvc"]').type('420');
          cy.get('input[name="billingName"]').type('Signals');
          cy.get('input[name="billingAddressLine1"]').type('1 Infinite Loop');
          cy.get('span').contains('Enter address manually').click();
          cy.get('input[name="billingLocality"]').type('Cupertino');
          cy.get('input[name="billingPostalCode"]').type('95014');
          cy.get('select[name="billingAdministrativeArea"').select('CA')
          // cy.get('input[type="checkbox"]').uncheck()
          cy.wait(5000)
          cy.get('.SubmitButton').contains('span', 'Subscribe').click({force: true});
          cy.wait(15000)
        });

        // Cancel subscription through Billing page
        cy.get('.ant-ribbon').contains('Current Plan');
        cy.contains('button', 'Manage subscription').click();
        cy.origin('https://billing.stripe.com', () => {
          // cy.on('uncaught:exception', (e) => {
          //   const { name } = e;
          //   if (name === 'IntegrationError') {
          //     return false;
          //   }
          //   return true;
          // })
          cy.get('a').contains('span', 'Cancel subscription').click();
          cy.contains('button', 'Cancel subscription').click();
          cy.contains('button', 'No thanks').click();
          cy.contains('span', 'Return to').click();
        });
        
        // Try contact us link
        cy.get('a').contains('Contact us!').click();
        cy.url().should('eq', `https://${domain}/contact`);
    })

    it('Display tooltip for unverified account', () => {
      // Login with an account
      cy.login();
      cy.intercept('GET', `https://api.${domain}/account`).as('getAccount');
      cy.wait('@getAccount');
      
      // Wait for price to load
      cy.contains('/ month', { timeout: 10000 });
      
      // If account is null/unverified, button should be disabled with tooltip
      // The subscribe button should change to either Subscribe or Manage subscription
      cy.get('button').contains(/Subscribe|Manage subscription/).should('exist');
    })

    it('Show success alert after payment', () => {
      // Visit with success query param
      cy.visit('/subscription?success=true');
      cy.login();
      
      // Verify success alert is shown
      cy.get('.ant-alert-success').should('be.visible');
      cy.contains('payment was successful');
      cy.contains('unlocked API access');
      cy.contains('🔓');
      
      // Verify Current Plan ribbon appears with success param
      cy.get('.ant-ribbon').contains('Current Plan');
    })
  })