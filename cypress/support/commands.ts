/// <reference types="cypress" />

import { domain } from "./e2e";

// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
Cypress.Commands.add('login', () => {
    let selector = '.ant-layout-header';
    cy.get(selector).find('button').contains('Get started').first().click();
    selector = '.ant-modal-body';
    cy.get(selector).find('input[name="username"]').last().type(`${Cypress.env('SIGNAL_EMAIL')}@${domain}`);
    cy.get(selector).find('button.amplify-field__show-password').click();
    cy.get(selector).find('input[name="password"]').last().type(Cypress.env('EMAIL_PASS'), {log: false});
    cy.get(selector).find('button[type="submit"]').contains('Sign in').click();
});
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })
//
// declare global {
//   namespace Cypress {
//     interface Chainable {
//       login(email: string, password: string): Chainable<void>
//       drag(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
//       dismiss(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
//       visit(originalFn: CommandOriginalFn, url: string, options: Partial<VisitOptions>): Chainable<Element>
//     }
//   }
// }