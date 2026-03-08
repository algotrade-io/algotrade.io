/**
 * Visual Regression Testing (VRT) Spec
 *
 * Captures baseline screenshots of key pages to detect visual regressions
 * during dependency upgrades.
 *
 * Run `pnpm run test:vrt:update` to generate/update baseline screenshots.
 * Run `pnpm run test:vrt` to compare against baseline.
 */

import { getUrl } from '../support/e2e';

describe('Visual Regression Tests', () => {
  // Viewport sizes to test
  const viewports: Cypress.ViewportPreset[] = ['macbook-15', 'iphone-x'];

  viewports.forEach((viewport) => {
    describe(`Viewport: ${viewport}`, () => {
      beforeEach(() => {
        cy.viewport(viewport);
      });

      it('Landing page - Hero section', () => {
        cy.visit('/');
        cy.get('.ant-layout-content').should('be.visible');
        // Wait for chart canvas to render
        cy.get('canvas').should('be.visible');
        cy.wait(2000);
        // Higher threshold due to dynamic animations on hero
        cy.compareSnapshot({ name: `landing-hero-${viewport}`, testThreshold: 0.05 });
      });



      it('Login modal', () => {
        cy.visit('/');
        cy.get('.ant-layout-header').find('button').contains('Get started').first().click();
        cy.get('.ant-modal-body').should('be.visible');
        cy.wait(1000);
        cy.compareSnapshot({ name: `login-modal-${viewport}`, testThreshold: 0.05 });
      });

      it('Privacy Policy page', () => {
        cy.visit('/privacy');
        cy.get('.ant-layout-content').should('be.visible');
        cy.wait(500);
        cy.compareSnapshot(`privacy-${viewport}`);
      });

      it('Terms of Service page', () => {
        cy.visit('/tos');
        cy.get('.ant-layout-content').should('be.visible');
        cy.wait(500);
        cy.compareSnapshot(`tos-${viewport}`);
      });

      it('API Documentation page', () => {
        cy.visit('/docs');
        cy.get('.swagger-ui').should('be.visible');
        cy.wait(500);
        cy.compareSnapshot(`docs-collapsed-${viewport}`);
        // Scroll to the operations section and expand all
        cy.get('.opblock-summary').first().scrollIntoView();
        cy.get('.opblock-summary').each(($el) => cy.wrap($el).click());
        cy.get('.opblock-summary').first().scrollIntoView();
        cy.wait(500);
        cy.compareSnapshot(`docs-expanded-${viewport}`);
      });

      describe('Authenticated pages', () => {
        beforeEach(() => {
          cy.visit('/');
          cy.login();
          // Wait for login to complete
          cy.get('button').contains('Sign out').should('be.visible');
        });

        it('Dashboard', () => {
          cy.visit('/dashboard');
          cy.get('.ant-layout-content').should('be.visible');
          cy.wait(2000);
          cy.compareSnapshot(`dashboard-${viewport}`);
        });

        it('Subscription page', () => {
          cy.visit('/subscription');
          cy.get('.ant-layout-content').should('be.visible');
          // Wait for subscription card to load
          cy.get('.ant-card').should('be.visible');
          cy.wait(500);
          cy.compareSnapshot({ name: `subscription-${viewport}`, testThreshold: 0.05 });
        });

        it('Algorithm page', () => {
          cy.visit('/algorithm');
          cy.get('.ant-layout-content').should('be.visible');
          // Wait for Plotly charts to render
          cy.get('.js-plotly-plot').should('be.visible');
          // Switch to 2D view for deterministic screenshot
          cy.contains('.ant-segmented-item', '2D').click();
          cy.wait(2000);
          cy.compareSnapshot(`algorithm-${viewport}`);
        });

        it('Alerts page', () => {
          cy.visit('/alerts');
          cy.get('.ant-layout-content').should('be.visible');
          cy.wait(2000);
          cy.compareSnapshot(`alerts-${viewport}`);
        });

        it('Contact page', () => {
          cy.visit('/contact');
          cy.get('.ant-layout-content').should('be.visible');
          cy.wait(500);
          cy.compareSnapshot(`contact-${viewport}`);
        });
      });
    });
  });
});
