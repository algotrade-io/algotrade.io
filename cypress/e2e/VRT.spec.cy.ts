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
        // Wait for animations and images to load
        cy.wait(2000);
        // Higher threshold due to dynamic animations on hero
        cy.compareSnapshot({ name: `landing-hero-${viewport}`, testThreshold: 0.1 });
      });

      it('Landing page - Navigation', () => {
        cy.visit('/');
        cy.get('.ant-layout-header').should('be.visible');
        cy.compareSnapshot(`landing-nav-${viewport}`);
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
        cy.wait(1000);
        cy.compareSnapshot(`docs-${viewport}`);
      });
    });
  });

  // Authenticated page tests are skipped for now as they require
  // stable login flow. Run these manually after verifying login works.
  describe.skip('Authenticated pages', () => {
    beforeEach(() => {
      cy.viewport('macbook-15');
      cy.visit('/');
      cy.login();
      // Wait for login to complete and modal to close
      cy.get('.ant-modal-body').should('not.exist');
    });

    it('Dashboard', () => {
      cy.visit('/dashboard');
      cy.get('.ant-layout-content').should('be.visible');
      cy.wait(2000);
      cy.compareSnapshot('dashboard-authenticated');
    });

    it('Subscription page', () => {
      cy.visit('/subscription');
      cy.get('.ant-layout-content').should('be.visible');
      cy.wait(2000);
      cy.compareSnapshot('subscription-authenticated');
    });

    it('Algorithm page', () => {
      cy.visit('/algorithm');
      cy.get('.ant-layout-content').should('be.visible');
      cy.wait(2000);
      cy.compareSnapshot('algorithm-authenticated');
    });

    it('Alerts page', () => {
      cy.visit('/alerts');
      cy.get('.ant-layout-content').should('be.visible');
      cy.wait(2000);
      cy.compareSnapshot('alerts-authenticated');
    });
  });
});
