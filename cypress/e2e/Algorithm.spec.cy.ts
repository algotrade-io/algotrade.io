describe('Algorithm', () => {
  beforeEach(() => {
    cy.visit('/algorithm')
  })
  it('Plot & Stats', () => {
    const plot = '.plotly';
    const toggle = '.ant-segmented';
    // Test that toggle switches charts
    cy.get(plot, {timeout: 10000}).should('exist');
    cy.get(toggle).contains('2D').first().click();
    cy.get(plot).find('text').contains('[2D]');
    // Since 3D plot is still in DOM (display: none) for performance reasons,
    // we can't test that [3D] is absent in 2D mode

    // Test that stat cards have relevant values
    const card = '.ant-card';
    const stat = '.ant-statistic'
    cy.get(card).contains('Last Updated').should('exist');
    cy.get(card).contains('Training Data Range').should('exist');
    cy.get(card).contains('Number of Features').should('exist');
    cy.get(card).contains('Test Accuracy').parent(stat).contains('%').should('exist');
  })
})