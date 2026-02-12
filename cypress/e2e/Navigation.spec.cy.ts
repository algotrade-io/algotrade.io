import { domain } from "../support/e2e";

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
  it('Display logo', () => {
    cy.get('.ant-layout-header').find('img.logo').should('exist');
    cy.get('.ant-layout-header').find('img.logo').should('have.attr', 'src').and('include', 'logo');
  })
  it('Display footer tagline', () => {
    cy.get('.ant-layout-footer').contains('_move fast; break everything');
  })
  it('Navigate home by clicking logo', () => {
    // Navigate to another page first
    cy.visit('/docs');
    cy.location().should(location => expect(location.pathname).to.eq('/docs'));
    
    // Click home link (Algotrade.io text)
    cy.get('.ant-layout-header').find('a').first().click();
    cy.location().should(location => expect(location.pathname).to.eq('/'));
  })
  it('Sign in and sign out', () => {
    cy.login();
    cy.intercept('GET', `https://api.${domain}/account`).as('getAccount');
    cy.wait('@getAccount');
    
    // Should show account text
    cy.contains('signed in as', { timeout: 10000 });
    
    // Sign out button should be visible
    cy.get('.ant-layout-header').contains('button', 'Sign out').should('be.visible');
    
    // Click sign out
    cy.get('.ant-layout-header').contains('button', 'Sign out').click();
    
    // Should show Get started button again
    cy.get('.ant-layout-header').contains('button', 'Get started').should('be.visible');
  })
  it('Show TOS modal for new user', () => {
    cy.login();
    cy.intercept('GET', `https://api.${domain}/account`).as('getAccount');
    cy.wait('@getAccount').then(({ request, response }) => {
      const auth = request.headers['authorization'];
      // Reset read_disclaimer to false to trigger modal
      if (response?.body.permissions?.read_disclaimer) {
        cy.request({
          method: 'POST', 
          url: `https://api.${domain}/account`, 
          headers: {Authorization: auth}, 
          body: {permissions: {read_disclaimer: false}}
        });
        cy.reload();
      }
    });
    
    // Check if modal appears (only for new users who haven't acknowledged)
    cy.intercept('GET', `https://api.${domain}/account`).as('getAccount2');
    cy.wait('@getAccount2').then(({ response }) => {
      if (!response?.body.permissions?.read_disclaimer) {
        // TOS modal should be visible
        cy.get('.ant-modal').should('be.visible');
        cy.get('.ant-modal').contains('Terms of');
        cy.get('.ant-modal').contains('Financial Disclaimer');
        
        // Checkbox should be present
        cy.get('.ant-checkbox').should('exist');
        
        // OK button should be disabled initially
        cy.get('.ant-modal').contains('button', 'OK').should('be.disabled');
        
        // Check the checkbox
        cy.get('.ant-checkbox').click();
        
        // OK button should be enabled
        cy.get('.ant-modal').contains('button', 'OK').should('not.be.disabled');
        
        // Click OK
        cy.intercept('POST', `https://api.${domain}/account`).as('postAccount');
        cy.get('.ant-modal').contains('button', 'OK').click();
        cy.wait('@postAccount');
        
        // Modal should close
        cy.get('.ant-modal').should('not.exist');
      }
    });
  })
  it('Menu selection state changes on navigation', () => {
    // Navigate to docs
    cy.visit('/docs');
    cy.get('.ant-menu-item-selected').should('contain', 'Docs');
    
    // Navigate to subscription
    cy.visit('/subscription');
    cy.get('.ant-menu-item-selected').should('contain', 'Subscription');
    
    // Navigate to contact
    cy.visit('/contact');
    cy.get('.ant-menu-item-selected').should('contain', 'Contact');
  })
  it('404 redirect to home', () => {
    // Visit an unknown route
    cy.visit('/unknown-page-that-does-not-exist');
    
    // Should redirect to home
    cy.location().should(location => expect(location.pathname).to.eq('/'));
    cy.contains('h1', 'Leveraging AutoML to beat BTC');
  })
  it('Close sign in modal', () => {
    // Open modal
    cy.get('.ant-layout-header').find('button').contains('Get started').first().click();
    cy.get('.ant-modal').should('be.visible');
    
    // Click outside modal to close - need to click on the overlay area
    cy.get('body').click(0, 0);
    cy.get('.ant-modal').should('not.exist', { timeout: 5000 });
  })
})