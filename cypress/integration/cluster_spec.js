describe('Cluster functionality test', () => {
  it('adds cluster with valid data', () => {
    cy.visit('/');
    cy.get('#add-cluster-btn').then(() => {
      cy.get('#add-cluster-btn')
        .first()
        .click()
        .then(() => {
          cy.get('#cluster-name-input').type('test cluster');
          cy.get('#url-input').type('example.com');
          cy.get('#token-input').type('123456');
          cy.get('#check-connection-btn').click();
          cy.get('#submit-cluster-btn').click();
        });
    });
    cy.contains('test cluster');
  });
  // TODO: add tests for update and delete cluster, after
  // https://github.com/fusor/mig-ui/pull/211#issuecomment-498383188 will be fixed
  it('has buttons disabled when input data is missing', () => {
    cy.visit('/');
    cy.get('#add-cluster-btn').then(() => {
      cy.get('#add-cluster-btn')
        .first()
        .click()
        .then(() => {
          cy.get('#url-input').type('example.com');
          cy.get('#token-input').type('123456');
          cy.get('#check-connection-btn').should('be.disabled');
          cy.get('#submit-cluster-btn').should('be.disabled');
        });
    });
  });
});
