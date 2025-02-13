/* eslint-disable prefer-arrow-callback */
import * as cheerio from 'cheerio';

import { randomSlug } from '../support/faker';

describe('New expense flow', () => {
  beforeEach(() => {
    cy.mailpitDeleteAllEmails();
  });

  describe('Invoices', () => {
    commonScenarios('invoice');

    describe('Taxes', function () {
      it(`User can submit invoice expense with taxes`, function () {
        const colSlug = randomSlug();
        cy.createCollectiveV2({
          skipApproval: true,
          host: { slug: 'e2e-host' },
          collective: {
            slug: colSlug,
            name: `${colSlug} - e2eHostedCollectiveWithVAT`,
            location: { country: 'BE' },
            settings: { VAT: { type: 'OWN', number: 'FRXX999999999' } },
          },
        });

        cy.contains('New expense').click();
        submitExpense({
          expenseType: 'invoice',
          accountSlug: colSlug,
          payeeSlug: this.userSlug,
          taxes: {
            hasTax: true,
          },
        });
      });
    });
  });

  describe('Reimbursements', () => {
    commonScenarios('reimbursement');
  });
});

function commonScenarios(expenseType: 'invoice' | 'reimbursement') {
  beforeEach(() => {
    let slug = randomSlug();
    cy.createCollectiveV2({
      skipApproval: true,
      host: { slug: 'e2e-host' },
      collective: {
        slug,
        name: `${slug} - e2eHostedCollective`,
      },
    }).as('e2eHostedCollective');

    slug = randomSlug();
    cy.createCollectiveV2({
      skipApproval: true,
      host: { slug: 'e2e-host' },
      collective: {
        slug,
        name: `${slug} - e2eHostedCollective2`,
      },
    }).as('e2eHostedCollective2');

    const userSlug = randomSlug();
    cy.wrap(userSlug).as('userSlug');
    cy.signup({
      user: { name: userSlug, email: `oc-test-${userSlug}@opencollective.com` },
      redirect: `/dashboard/${userSlug}/submitted-expenses?newExpenseFlowEnabled=true`,
    });

    cy.get<string>('@userSlug').then(userSlug =>
      cy.location('pathname').should('eq', `/dashboard/${userSlug}/submitted-expenses`),
    );

    cy.contains('Submitted Expenses').should('exist');

    slug = randomSlug();
    cy.createCollective({
      email: `oc-test-${userSlug}@opencollective.com`,
      slug,
      name: `${slug} - user organization`,
      type: 'ORGANIZATION',
    }).as('collectiveWhereUserIsAdmin');

    slug = randomSlug();
    cy.createCollectiveV2({
      email: `oc-test-${userSlug}@opencollective.com`,
      skipApproval: true,
      host: { slug: 'e2e-host' },
      collective: { slug, name: `${slug} - user collective with e2e-host` },
    }).as('e2eHostedCollectiveWhereUserIsAdmin');
  });

  it(`New user can submit ${expenseType} expense to collective hosted by e2e-host`, function () {
    cy.contains('New expense').click();
    submitExpense({
      expenseType,
      accountSlug: this.e2eHostedCollective.slug,
      payeeSlug: this.userSlug,
    });
  });

  it(`User can submit ${expenseType} expense to previously submitted collective`, function () {
    const e2eHostedCollective = this.e2eHostedCollective as { slug: string };
    const e2eHostedCollective2 = this.e2eHostedCollective2 as { slug: string };
    const collectiveWhereUserIsAdmin = this.collectiveWhereUserIsAdmin as { slug: string };
    const userSlug = this.userSlug as string;

    const payoutMethodSlug1 = randomSlug();
    cy.createExpense({
      userEmail: `oc-test-${userSlug}@opencollective.com`,
      account: { slug: e2eHostedCollective.slug },
      payee: { slug: userSlug },
      payoutMethod: {
        type: 'OTHER',
        name: payoutMethodSlug1,
        data: {
          content: `My payout method ${payoutMethodSlug1}`,
          currency: 'USD',
        },
      },
    });

    cy.contains('New expense').click();

    const payoutMethodSlug2 = randomSlug();
    submitExpense({
      expenseType,
      accountSlug: e2eHostedCollective2.slug,
      payeeSlug: collectiveWhereUserIsAdmin.slug,
      payoutMethod: {
        type: 'OTHER',
        slug: payoutMethodSlug2,
        data: {
          content: payoutMethodSlug2,
          currency: 'USD',
        },
      },
    });

    cy.contains('New expense').click();
    submitExpense({
      expenseType,
      accountSlug: e2eHostedCollective2.slug,
      invitee: {
        slug: 'piamancini',
      },
    });
  });

  describe('Invite', function () {
    it(`User can submit ${expenseType} expense invite to existing organization`, function () {
      const existingOrganizationSlug = randomSlug();
      cy.createCollective({
        email: `oc-test-${existingOrganizationSlug}@opencollective.com`,
        slug: existingOrganizationSlug,
        name: `${existingOrganizationSlug} - organization`,
        type: 'ORGANIZATION',
      });

      cy.contains('New expense').click();
      submitExpense({
        expenseType,
        accountSlug: this.e2eHostedCollective2.slug,
        invitee: {
          slug: existingOrganizationSlug,
        },
      });

      getExpenseInviteEmailLink(`oc-test-${existingOrganizationSlug}@opencollective.com`).then(inviteLink => {
        cy.login({
          email: `oc-test-${existingOrganizationSlug}@opencollective.com`,
          redirect: encodeURIComponent(inviteLink),
        });
      });

      cy.contains('You have been invited to submit an expense').should('exist');
      cy.contains('Decline invitation').should('exist');
      cy.contains('Continue submission').click();
      fillNewPayoutMethod({
        type: 'OTHER',
        slug: randomSlug(),
        save: true,
        data: {
          currency: 'USD',
          content: 'New payout method',
        },
      });
      fillTypeOfExpense({
        expenseType: expenseType,
        hasInvoice: true,
      });
      cy.get('form').contains('Submit Expense').scrollIntoView().click();
      cy.contains('has been submitted successfully!').should('exist');
    });

    it(`User can submit ${expenseType} expense invite to existing organization initially logged out`, function () {
      const existingOrganizationSlug = randomSlug();
      cy.createCollective({
        email: `oc-test-${existingOrganizationSlug}@opencollective.com`,
        slug: existingOrganizationSlug,
        name: `${existingOrganizationSlug} - organization`,
        type: 'ORGANIZATION',
      });

      cy.contains('New expense').click();
      submitExpense({
        expenseType,
        accountSlug: this.e2eHostedCollective2.slug,
        invitee: {
          slug: existingOrganizationSlug,
        },
      });

      cy.logout();

      getExpenseInviteEmailLink(`oc-test-${existingOrganizationSlug}@opencollective.com`).then(inviteLink => {
        cy.visit(inviteLink);
        cy.contains('You have been invited to submit an expense').should('exist');
        cy.contains('Decline invitation').should('exist');
        cy.contains('Continue submission').click();
        cy.contains('Sign In').click({ force: true });
        cy.location().its('pathname').should('eql', `/signin`);
        cy.location()
          .its('search')
          .should('eq', `?next=${encodeURIComponent(inviteLink)}`);
      });
    });

    it(`User can submit ${expenseType} expense invite to new user`, function () {
      const newUser = randomSlug();

      cy.contains('New expense').click();
      submitExpense({
        expenseType,
        accountSlug: this.e2eHostedCollective2.slug,
        invitee: {
          name: newUser,
          email: `oc-test-${newUser}@opencollective.com`,
        },
      });

      cy.logout();

      getExpenseInviteEmailLink(`oc-test-${newUser}@opencollective.com`).then(inviteLink => {
        cy.visit(inviteLink);
      });

      cy.contains('You have been invited to submit an expense').should('exist');
      cy.contains('Decline invitation').should('exist');
      cy.contains('Continue submission').click();
      cy.contains(newUser).should('exist');
      cy.contains(`oc-test-${newUser}@opencollective.com`).should('exist');
      cy.contains('Sign In').should('exist');
      fillNewPayoutMethod({
        type: 'OTHER',
        slug: randomSlug(),
        data: {
          currency: 'USD',
          content: 'New payout method',
        },
      });
      fillTypeOfExpense({
        expenseType: expenseType,
        hasInvoice: false,
      });
      cy.get('form').contains('Submit Expense').scrollIntoView().click();
      cy.contains('has been submitted successfully!').should('exist');
    });
  });

  describe('Recurring', function () {
    it(`User can setup recurring ${expenseType} expense`, function () {
      cy.contains('New expense').click();
      submitExpense({
        expenseType,
        accountSlug: this.e2eHostedCollective.slug,
        payeeSlug: this.userSlug,
        isRecurring: true,
      });
    });
  });

  describe('Duplicate', function () {
    it(`Duplicates an ${expenseType} expense`, function () {
      const payoutMethodSlug = randomSlug();
      cy.createExpense({
        userEmail: `oc-test-${this.userSlug}@opencollective.com`,
        account: { slug: this.e2eHostedCollective.slug },
        payee: { slug: this.userSlug },
        payoutMethod: {
          type: 'OTHER',
          name: payoutMethodSlug,
          data: {
            content: `My payout method ${payoutMethodSlug}`,
            currency: 'USD',
          },
        },
      }).then(expense => {
        cy.reload();
        cy.get(`#expense-${expense.legacyId}`).within(() => {
          cy.get('button[aria-haspopup="menu"]').click();
        });
      });

      cy.contains('Duplicate Expense').click();

      fillTypeOfExpense({ expenseType, hasInvoice: true });

      cy.get('#EXPENSE_ITEMS').within(() => {
        cy.root().scrollIntoView();

        cy.get('[role="listitem"]')
          .first()
          .within(() => {
            cy.contains('Date').click().type('2025-09-29');
            if (expenseType === 'reimbursement') {
              cy.contains('Drag & drop').selectFile(getReceiptFixture({ fileName: 'receipt0.jpg' }), {
                action: 'drag-drop',
              });
              cy.contains('Clear').should('exist');
            }
          });
      });

      cy.get('form').contains('button', 'Submit Expense').scrollIntoView().click();
      cy.contains('has been submitted successfully!').should('exist');
    });
  });
}

function getExpenseInviteEmailLink(to: string) {
  return cy
    .openEmail(
      email => email.Tags.some(tag => tag === to.replace('@', '-at-')) && email.Subject.includes('wants to pay you'),
    )
    .then(email => {
      const $html = cheerio.load(email.HTML);
      const expenseLink = $html(`a:contains("OK, let's go!")`);
      const href = expenseLink.attr('href');
      const parsedUrl = new URL(href);
      parsedUrl.searchParams.set('newExpenseFlowEnabled', 'true');
      return `${parsedUrl.pathname}${parsedUrl.search.toString()}`;
    });
}

const getReceiptFixture = ({ fileName = 'receipt.jpg' } = {}) => ({
  contents: 'test/cypress/fixtures/images/small-15x15.jpg',
  mimeType: 'image/jpeg',
  fileName,
});

function submitExpense(options: {
  expenseType: 'invoice' | 'reimbursement';
  titleSlug?: string;
  accountSlug: string;
  payeeSlug?: string;
  payoutMethod?: {
    type?: string;
    exists?: boolean;
    slug?: string;
    save?: boolean;
    data?: Record<string, unknown> & { currency: string };
  };
  invitee?: {
    name?: string;
    email?: string;
    slug?: string;
  };
  isRecurring?: boolean;
  taxes?: {
    hasTax: boolean;
  };
}) {
  const opts = {
    titleSlug: randomSlug(),
    ...options,
    payoutMethod: {
      type: 'OTHER',
      slug: randomSlug(),
      data: {
        content: 'A new payout method',
        currency: 'USD',
      },
      save: true,
      ...options?.payoutMethod,
    },
  };

  cy.get('#WHO_IS_PAYING').within(() => {
    cy.contains('Find account').click().parent().get('[role="combobox"]').click().type(`${opts.accountSlug}{enter}`);
    cy.root().closest('html').contains('[role="option"]', opts.accountSlug).click();
  });

  cy.get('#WHO_IS_GETTING_PAID').within(() => {
    if (opts.payeeSlug) {
      cy.root().then($section => {
        const $option = $section.find(`button[role="radio"][value="${opts.payeeSlug}"]`);
        if ($option.length) {
          cy.wrap($option.first()).click().siblings('input[type="radio"]').first().should('be.checked');
        } else {
          cy.contains('An account I administer')
            .click()
            .parent()
            .get('[role="combobox"]')
            .click()
            .type(`${opts.payeeSlug}{enter}`);
        }
      });
    } else if (opts.invitee.slug) {
      cy.contains('Invite someone').click().parent().get('[role="combobox"]').click().type(opts.invitee.slug);
      cy.root().closest('html').contains('[role="option"]', opts.invitee.slug).click();
    } else {
      cy.contains('Invite someone')
        .click()
        .parent()
        .within(() => {
          cy.get('[role="combobox"]').click();
          cy.root().closest('html').contains('Invite someone to submit an expense').click();
          cy.contains('Contact name').click().type(opts.invitee.name);
          cy.contains('Email address').click().type(opts.invitee.email);
        });
    }
  });

  if (!opts.payoutMethod.exists && opts.payeeSlug) {
    fillNewPayoutMethod(opts.payoutMethod);
  } else {
    cy.get('#PAYOUT_METHOD').within(() => {
      cy.root().scrollIntoView();

      if (!opts.payeeSlug) {
        cy.contains(
          'The person you are inviting to submit this expense will be asked to provide payout method details.',
        ).should('exist');
        return;
      }

      cy.contains('[role="radio"]', opts.payoutMethod.slug)
        .click()
        .siblings('input[type="radio"]')
        .first()
        .should('be.checked');
    });
  }

  fillTypeOfExpense({
    expenseType: opts.expenseType,
    hasInvoice: !!opts.payeeSlug,
  });

  cy.get('#EXPENSE_ITEMS').within(() => {
    cy.root().scrollIntoView();

    cy.get('[role="listitem"]')
      .first()
      .within(() => {
        cy.contains('Item Description').click().type('First item description');
        cy.contains('Date').click().type('2025-09-29');
        cy.contains('Amount').click().type('{selectall}125');
        if (opts.expenseType === 'reimbursement') {
          cy.contains('Drag & drop').selectFile(getReceiptFixture({ fileName: 'receipt0.jpg' }), {
            action: 'drag-drop',
          });
        }
      });

    cy.contains('Add item').click();

    cy.get('[role="listitem"]')
      .eq(1)
      .within(() => {
        cy.contains('Item Description').click().type('Second item description');
        cy.contains('Date').click().type('2024-09-29');
        cy.contains('Amount').click().type('{selectall}500');
        cy.contains('USD').click();
        cy.focused().should('have.attr', 'placeholder', 'Search...').type('BRL{enter}');
        if (opts.expenseType === 'reimbursement') {
          cy.contains('Drag & drop').selectFile(getReceiptFixture({ fileName: 'receipt1.jpg' }), {
            action: 'drag-drop',
          });
        }
      });

    cy.contains('Additional Attachments').selectFile([
      getReceiptFixture({ fileName: 'attachment0.jpg' }),
      getReceiptFixture({ fileName: 'attachment1.jpg' }),
    ]);

    if (opts.taxes?.hasTax) {
      cy.contains('Apply Value-added tax').click();
      cy.contains('VAT identifier').click().type('EU000011111');
      cy.contains('VAT rate').click().type('20');
      cy.contains('$135.00 USD').should('exist');
      cy.contains('$810.00 USD').should('exist');
    }
  });

  cy.get('#EXPENSE_TITLE').within(() => {
    cy.root().scrollIntoView();
    cy.get('input[value="First item description"]').click().type(`{selectall}The expense title ${opts.titleSlug}`),
      cy.contains('Add tag').click();
    cy.focused().should('have.attr', 'placeholder', 'Add tag').type('A tag');
    cy.wait(100);
    cy.focused().type('{enter}');
  });

  cy.get('#SUMMARY').within(() => {
    cy.contains('The expense title').should('exist');
    cy.contains('a tag').should('exist');

    cy.contains('label', 'Items')
      .parent()
      .within(() => {
        cy.contains('First item description')
          .should('exist')
          .closest('[role="listitem"]')
          .within(() => {
            cy.contains('$125.00 USD').should('exist');
            if (opts.expenseType === 'reimbursement') {
              cy.get('a').should('exist');
            }
          });
        cy.contains('Second item description')
          .should('exist')
          .closest('[role="listitem"]')
          .within(() => {
            cy.contains('$550.00 USD').should('exist');
            cy.contains('R$500.00 BRL').should('exist');

            if (opts.expenseType === 'reimbursement') {
              cy.get('a').should('exist');
            }
          });
        cy.contains('$675.00 USD').should('exist');

        if (opts.taxes?.hasTax) {
          cy.contains('$135.00 USD').should('exist');
          cy.contains('$810.00 USD').should('exist');
        }
      });

    if (opts.expenseType === 'invoice') {
      cy.contains('label', 'Invoice')
        .parent()
        .within(() => {
          if (opts.payeeSlug) {
            cy.contains('INV0001');
            cy.get('a').should('have.length', 1);
          } else {
            cy.contains('Invoice will be generated once you submit the expense').should('exist');
          }
        });
    }

    cy.contains('Who is paying?').parent().contains(opts.accountSlug).should('exist');
    cy.contains('Who is getting paid?')
      .parent()
      .within(() => {
        if (opts.payeeSlug) {
          cy.contains(opts.payeeSlug).should('exist');
        }
      });

    cy.contains('Payout Method')
      .parent()
      .contains(
        opts.payeeSlug
          ? opts.payoutMethod.slug
          : 'The person you are inviting to submit this expense will be asked to provide payout method details.',
      )
      .should('exist');

    if (opts.isRecurring) {
      cy.contains('Expense Recurrence')
        .parent()
        .within(() => {
          cy.contains('Edit recurrence frequency').click();
          cy.getByDataCy('expense-frequency').click();
          cy.root().closest('html').contains('[data-cy="expense-frequency-option"]', 'Monthly').click();
          cy.get('#expenseRecurrenceEndAt').click().type('2125-09-29');
          cy.contains('Save changes').click();
          cy.contains(
            'Once submitted, you will also be prompted to review and submit a copy of this expense every month. The prompts will stop on Sep 29, 2125',
          ).should('exist');
        });
    }
  });
  cy.get('form').contains('button', 'Submit Expense').scrollIntoView().click();
  cy.contains('has been submitted successfully!').should('exist');
  cy.contains('button', 'View all expenses').click();
}

function fillNewPayoutMethod(payoutMethod: {
  type: string;
  save?: boolean;
  slug?: string;
  data?: Record<string, unknown> & { currency: string };
}) {
  cy.get('#PAYOUT_METHOD').within(() => {
    cy.root().scrollIntoView();

    cy.contains('New payout method').click();
    cy.contains('Choose a payout method').click();
    cy.root()
      .closest('html')
      .contains('[role="option"]', payoutMethod.type === 'OTHER' ? 'Other' : 'PayPal')
      .click();
    cy.contains('Currency').click();
    cy.focused().should('have.attr', 'placeholder', 'Search...').type(`${payoutMethod.data.currency}{enter}`);
    cy.contains('label', 'Info')
      .should('be.visible')
      .click()
      .type(payoutMethod.data.content as string);
    cy.wait(400);
    cy.contains('label', 'Label').click();
    cy.get('input#input-newPayoutMethod\\.name').type(payoutMethod.slug);
    cy.get('input#input-newPayoutMethod\\.name').should('have.value', payoutMethod.slug);

    if (payoutMethod.save) {
      cy.contains('button', 'Save').click();
      cy.root().closest('html').contains('Payout method created').should('exist');
      cy.contains('[role="radio"]', payoutMethod.slug).siblings('input[type="radio"]').first().should('be.checked');
    }
  });
}

function fillTypeOfExpense(opts: { expenseType: 'invoice' | 'reimbursement'; hasInvoice?: boolean }) {
  cy.get('#TYPE_OF_EXPENSE').within(() => {
    cy.root().scrollIntoView();
    cy.contains(opts.expenseType === 'invoice' ? 'Invoice' : 'Reimbursement').click();
    cy.contains(opts.expenseType === 'invoice' ? 'Invoice' : 'Reimbursement')
      .siblings('input[type="radio"]')
      .first()
      .should('be.checked');
    if (opts.expenseType === 'invoice') {
      if (opts.hasInvoice) {
        cy.contains('Attach your invoice file').selectFile(getReceiptFixture({ fileName: 'invoice0.jpg' }));
        cy.contains('Clear').should('exist');
        cy.contains('Invoice number').click().type('INV0001');
      } else {
        cy.contains('No, generate an invoice for me').click();
      }
    }
  });
}
