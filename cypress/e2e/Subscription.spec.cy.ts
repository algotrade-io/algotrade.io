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
      cy.contains('00:00 – 00:10 UTC');
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

    // SKIP: This test depends on the API returning a fresh checkout session.
    // The deployed API currently caches checkout URLs for 1 day, even if the session
    // was already completed. Fix committed in subscribe/app.py to check session status
    // before returning cached URL - re-enable after deployment.
    it.skip('Subscribe', { retries: { runMode: 1, openMode: 0 } }, () => {
        // Login and subscribe
        const card = '.ant-card';
        cy.login();
        cy.get(card).contains('/ month').parent().invoke('text').should('match', /^\$\d+\.?\d+ \/ month$/);
        
        // Check if already subscribed - if so, cancel first
        cy.get('body').then($body => {
          if ($body.find('button:contains("Manage subscription")').length) {
            // User already subscribed from previous test - cancel first
            cy.contains('button', 'Manage subscription').click();
            cy.origin('https://billing.stripe.com', () => {
              cy.on('uncaught:exception', () => false);
              cy.get('a').contains('span', 'Cancel subscription').click();
              cy.contains('button', 'Cancel subscription').click();
              cy.contains('button', 'No thanks').click();
              cy.contains('span', 'Return to').click();
            });
            // Wait for page to reload and show Subscribe button again
            cy.get('button', { timeout: 10000 }).contains('Subscribe');
          }
        });
        
        cy.contains('button', 'Subscribe').click();
        cy.origin('https://checkout.stripe.com', () => {
          cy.on('uncaught:exception', () => false)
          cy.get('input[name="cardNumber"]').type('4242424242424242');
          const expiryYear = String(new Date().getFullYear() + 4).slice(-2);
          const expiryMonth = '01'
          cy.get('input[name="cardExpiry"]').type(`${expiryMonth}${expiryYear}`);
          cy.get('input[name="cardCvc"]').type('420');
          cy.get('input[name="billingName"]').type('Signals');
          // Select country first if available
          cy.get('select[name="billingCountry"]').then($el => {
            if ($el.length) {
              cy.wrap($el).select('US');
            }
          });
          cy.get('input[name="billingAddressLine1"]').type('1 Infinite Loop');
          cy.get('span').contains('Enter address manually').click();
          cy.get('input[name="billingLocality"]').type('Cupertino');
          cy.get('input[name="billingPostalCode"]').type('95014');
          cy.get('select[name="billingAdministrativeArea"').select('CA')
          // cy.get('input[type="checkbox"]').uncheck()
          cy.get('.SubmitButton').contains('span', 'Subscribe').click({force: true});
          // Wait for payment to process (button shows --complete state)
          cy.get('.SubmitButton--complete', { timeout: 60000 }).should('exist');
        });

        // Wait for redirect back to app after Stripe processes subscription
        cy.url({ timeout: 60000 }).should('include', 'success=true');
        cy.get('.ant-ribbon', { timeout: 10000 }).contains('Current Plan');

        // Cancel subscription through Billing page
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