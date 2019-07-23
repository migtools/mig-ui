describe('Storage functionality test', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  context('Add storage', () => {
    const repoName = 'testRepo';
    const bucketName = 'aWsbucket123';
    const bucketRegion = 'us-east-1';
    const accessKey = 'accessKey';
    const secret = 'secret';

    it('adds storage with valid data', () => {
      cy.get('#add-repo-btn').then(() => {
        cy.get('#add-repo-btn')
          .first()
          .click()
          .then(() => {
            cy.get('#repoName').type(repoName);
            cy.get('#bucketName').type(bucketName);
            cy.get('#bucketRegion').type(bucketRegion);
            cy.get('#accessKey').type(accessKey);
            cy.get('#secret').type(secret);
            cy.get('#check-connection-btn').click();
            cy.get('#submit-cluster-btn').click();
          });
      });
      cy.contains(repoName);
    });

    it('has buttons disabled when input data is missing', () => {
      cy.get('#add-repo-btn').then(() => {
        cy.get('#add-repo-btn')
          .first()
          .click()
          .then(() => {
            cy.get('#bucketName').type(bucketName);
            cy.get('#bucketRegion').type(bucketRegion);
            cy.get('#accessKey').type(accessKey);
            cy.get('#secret').type(secret);
            cy.get('#check-connection-btn').should('be.disabled');
            cy.get('#submit-cluster-btn').should('be.disabled');
          });
      });
    });
  });
});
