import { domain } from "../support/e2e";

describe('Contact', () => {
    beforeEach(() => {
      cy.visit('/contact')
    })
    it('Display contact page structure', () => {
      cy.contains('h1', 'Send us a message');
      cy.get('input[type="search"]').should('exist');
      cy.get('textarea').should('exist');
      cy.contains('button', 'Submit').should('exist');
    })
    it('Show popover for unauthenticated user', () => {
      const subject = 'input[type="search"]';
      // Verify that all inputs and buttons are disabled
      cy.get(subject).should('be.disabled');
      cy.get('textarea').should('be.disabled');
      cy.contains('button', 'Submit').should('be.disabled');
      
      // Click on form area to show popover
      cy.get(subject).click({ force: true });
      
      // Verify popover shows login prompt
      cy.get('.ant-popover').should('be.visible');
      cy.contains('Action Needed');
      cy.contains('Sign in to send a message');
      
      // Click sign in button in popover
      cy.get('.ant-popover').contains('button', 'Sign in').click();
      
      // Should show login modal
      cy.get('.ant-modal').should('be.visible');
    })
    it('Show validation errors for empty fields', () => {
      cy.login();
      cy.intercept('GET', `https://api.${domain}/account`).as('getAccount');
      cy.wait('@getAccount');
      
      // Click submit without filling anything - should show error states
      // First select a subject to enable some validation
      const subject = 'input[type="search"]';
      cy.get(subject).should('not.be.disabled').click();
      cy.get('.ant-select-item').first().click();
      
      // Submit should still be disabled without message
      cy.contains('button', 'Submit').should('be.disabled');
      
      // Add message
      cy.get('textarea').type('a');
      cy.contains('button', 'Submit').should('not.be.disabled');
      
      // Clear message
      cy.get('textarea').clear();
      cy.contains('button', 'Submit').should('be.disabled');
    })
    it('Display subject dropdown options', () => {
      cy.login();
      cy.intercept('GET', `https://api.${domain}/account`).as('getAccount');
      cy.wait('@getAccount');
      
      const subject = 'input[type="search"]';
      cy.get(subject).should('not.be.disabled').click();
      
      // Verify all subject options are present
      cy.get('.ant-select-dropdown').within(() => {
        cy.contains('Account');
        cy.contains('API');
        cy.contains('AI Model');
        cy.contains('Subscription');
        cy.contains('General');
        cy.contains('Other');
      });
    })
    it('Send message', () => {
        const subject = 'input[type="search"]';
        // Verify that all inputs and buttons are disabled
        cy.get(subject).should('be.disabled');
        cy.get('textarea').should('be.disabled');
        cy.contains('button', 'Submit').should('be.disabled');

        // Login and send message
        cy.login();
        cy.get(subject).should('not.be.disabled');
        cy.get('textarea').should('not.be.disabled');
        cy.get('textarea').invoke('html').should('eq', '')
        cy.contains('button', 'Submit').should('be.disabled');
        cy.get(subject).click();
        cy.get('.ant-select-item').first().click();
        cy.contains('button', 'Submit').should('be.disabled');
        cy.get('textarea').type('test');
        cy.contains('button', 'Submit').should('not.be.disabled');
        cy.contains('button', 'Submit').click()

        // Verify success screen
        const success = '.ant-result-success';
        cy.get(success).find('.anticon-check-circle').should('be.visible');
        cy.get(success).find('.ant-result-title').contains('Success!')

        // Return to contact form and assert 
        cy.contains('button', 'Return to contact form').click();
        cy.get('textarea').invoke('html').should('eq', '')
        cy.contains('button', 'Submit').should('be.disabled');
    })
    it('Send duplicate message without API call', () => {
      cy.login();
      cy.intercept('GET', `https://api.${domain}/account`).as('getAccount');
      cy.wait('@getAccount');
      
      const subject = 'input[type="search"]';
      const testMessage = `duplicate-test-${Date.now()}`;
      
      // Send first message
      cy.get(subject).should('not.be.disabled').click();
      cy.get('.ant-select-item').first().click();
      cy.get('textarea').should('not.be.disabled').type(testMessage);
      cy.intercept('POST', `https://api.${domain}/contact`).as('postContact');
      cy.contains('button', 'Submit').click();
      cy.wait('@postContact');
      
      // Return to form
      cy.contains('button', 'Return to contact form').click();
      
      // Send same message again (should be cached)
      cy.get(subject).should('not.be.disabled').click();
      cy.get('.ant-select-item').first().click();
      cy.get('textarea').should('not.be.disabled').type(testMessage);
      cy.contains('button', 'Submit').click();
      
      // Should show success without making API call (message is cached)
      cy.get('.ant-result-success').should('be.visible');
    })
    it('Display character count', () => {
      cy.login();
      cy.intercept('GET', `https://api.${domain}/account`).as('getAccount');
      cy.wait('@getAccount');
      
      // Type in textarea
      cy.get('textarea').should('not.be.disabled').type('hello world');
      
      // Verify character count is shown
      cy.contains('11 / 2500');
    })
    it('Handle API error gracefully', () => {
      cy.login();
      cy.intercept('GET', `https://api.${domain}/account`).as('getAccount');
      cy.wait('@getAccount');
      
      // Intercept contact API to force error
      cy.intercept('POST', `https://api.${domain}/contact`, {
        statusCode: 500,
        body: { message: 'Server error' }
      }).as('postContactError');
      
      const subject = 'input[type="search"]';
      cy.get(subject).should('not.be.disabled').click();
      cy.get('.ant-select-item').first().click();
      cy.get('textarea').should('not.be.disabled').type('test error handling');
      cy.contains('button', 'Submit').click();
      
      cy.wait('@postContactError');
      
      // Should show error result
      cy.get('.ant-result-error').should('be.visible');
      cy.contains('Failure');
      cy.contains('message was not sent');
      
      // Return button should work
      cy.contains('button', 'Return to contact form').click();
      cy.get('textarea').should('exist');
    })
  })