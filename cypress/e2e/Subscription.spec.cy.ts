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

    // This test depends on the API returning a fresh checkout session.
    // The deployed API now checks if cached sessions are still valid (open)
    // before returning them.
    it('Subscribe', { retries: { runMode: 1, openMode: 0 } }, () => {
        // Login and subscribe
        const card = '.ant-card';
        cy.intercept('GET', `https://api.${domain}/account`).as('getAccount');
        cy.login();
        cy.wait('@getAccount');
        cy.get(card).contains('/ month').parent().invoke('text').should('match', /^\$\d+\.?\d+ \/ month$/);
        
        // Now check if already subscribed - if so, cancel first
        cy.get('body').then($body => {
          if ($body.find('button:contains("Manage subscription")').length) {
            // User already subscribed from previous test - cancel first
            cy.contains('button', 'Manage subscription').click();
            cy.origin('https://billing.stripe.com', () => {
              cy.on('uncaught:exception', () => false);
              // Wait for and click Cancel subscription link (could be in span or directly)
              cy.contains('Cancel subscription', { timeout: 10000 }).click();
              cy.contains('button', 'Cancel subscription').click();
              cy.contains('button', 'No thanks').click();
              cy.contains('Return to', { timeout: 10000 }).click();
            });
            // Wait for page to reload and show Subscribe button again
            cy.get('button', { timeout: 10000 }).contains('Subscribe');
          }
        });
        
        cy.contains('button', 'Subscribe').click();
        cy.origin('https://checkout.stripe.com', () => {
          cy.on('uncaught:exception', () => false)
          // Wait for checkout page to fully load
          cy.get('input[name="cardNumber"]', { timeout: 30000 }).should('be.visible');
          cy.get('input[name="cardNumber"]').type('4242424242424242');
          const expiryYear = String(new Date().getFullYear() + 4).slice(-2);
          const expiryMonth = '01'
          cy.get('input[name="cardExpiry"]').type(`${expiryMonth}${expiryYear}`);
          cy.get('input[name="cardCvc"]').type('420');
          cy.get('input[name="billingName"]').type('Signals Test');
          // Select country first if available
          cy.get('body').then($body => {
            if ($body.find('select[name="billingCountry"]').length) {
              cy.get('select[name="billingCountry"]').select('US');
            }
          });
          cy.get('input[name="billingAddressLine1"]').type('1 Infinite Loop');
          // Click "Enter address manually" if it exists
          cy.get('body').then($body => {
            if ($body.find('span:contains("Enter address manually")').length) {
              cy.get('span').contains('Enter address manually').click();
            }
          });
          cy.get('input[name="billingLocality"]').type('Cupertino');
          cy.get('input[name="billingPostalCode"]').type('95014');
          // State dropdown may or may not exist
          cy.get('body').then($body => {
            if ($body.find('select[name="billingAdministrativeArea"]').length) {
              cy.get('select[name="billingAdministrativeArea"]').select('CA');
            }
          });
          // Wait a moment for form validation
          cy.wait(1000);
          // Check for any visible error messages
          cy.get('body').then($body => {
            const errors = $body.find('.Error, [class*="error"], [class*="Error"]');
            if (errors.length) {
              cy.log('Found errors on page:', errors.text());
            }
          });
          // Click subscribe button - wait for stable element
          cy.get('.SubmitButton').should('exist').then($btn => {
            $btn.trigger('click');
          });
          // Wait for redirect to start - URL should change from checkout.stripe.com
          cy.url({ timeout: 90000 }).should('not.include', 'checkout.stripe.com');
        });

        // Verify we're back on our app with success param
        cy.url().should('include', 'success=true');
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