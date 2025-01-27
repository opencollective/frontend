describe('Chart of Accounts', () => {
  let user;
  let host;

  before(() => {
    cy.signup().then(u => {
      user = u;
      cy.createHostOrganization(user.email).then(returnedAccount => {
        host = returnedAccount;
        cy.visit(`/dashboard/${host.slug}/chart-of-accounts`);
      });
    });
  });

  it('should support all chart of accounts operations', () => {
    // Create category
    cy.contains('button', 'Create category').click();

    // Fill form (the form is currently missing validations, see https://github.com/opencollective/opencollective/issues/7809)
    // TODO

    // Verify category was added
    // TODO

    // Test filtering by kind
    // TODO

    // Test filtering by visibility
    // TODO

    // Test search by code
    // TODO

    // Test search by name
    // TODO

    // Test search by friendly name
    // TODO

    // Test sorting by code
    // TODO

    // Test sorting by name
    // TODO

    // Test category deletion
    // TODO

    // Open and verify drawer
    // TODO
  });
});
