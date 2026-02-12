describe('Algorithm', () => {
  beforeEach(() => {
    cy.visit('/algorithm')
  })
  it('Plot & Stats', () => {
    const plot = '.plotly';
    const toggle = '.ant-segmented';
    // Test that toggle switches charts
    cy.get(plot, {timeout: 10000}).find('text').contains('[3D]');
    cy.get(plot).should('not.contain', '[2D]');
    cy.get(toggle).contains('2D').first().click();
    cy.get(plot).find('text').contains('[2D]');
    // Since 3D plot is still in DOM (display: none) for performance reasons,
    // we can't test that [3D] is absent in 2D mode

    // Test that stat cards have relevant values
    const card = '.ant-card';
    const stat = '.ant-statistic'
    cy.get(card).contains('Last Updated').parent(stat).contains('month');
    cy.get(card).contains('Training Data Range').parent(stat).contains('year');
    cy.get(card).contains('Number of Features').parent(stat).find('.ant-statistic-content').invoke('text').should('match', /^\d+$/);
    cy.get(card).contains('Test Accuracy').parent(stat).contains('%').invoke('text').should('match', /^\d{2,3}\.\d%$/);
  })
})