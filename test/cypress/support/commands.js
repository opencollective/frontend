import 'cypress-mailpit';

import { API_V2_CONTEXT, fakeTag as gql, fakeTag as gqlV1 } from '../../../lib/graphql/helpers';
import { loggedInUserQuery } from '../../../lib/graphql/v1/queries';

import { CreditCards } from '../../stripe-helpers';

import { defaultTestUserEmail } from './data';
import { randomEmail, randomSlug } from './faker';
import generateToken from './token';

/**
 * Login with an existing account. If not provided in `params`, the email used for
 * authentication will be `defaultTestUserEmail`.
 *
 * @param {object} params:
 *    - redirect: The redirect URL
 *    - email: User email
 */
Cypress.Commands.add('login', (params = {}) => {
  const { email = defaultTestUserEmail, redirect = null, visitParams, sendLink } = params;
  const user = { email, newsletterOptIn: false };

  return signinRequest(user, redirect, sendLink).then(({ body: { redirect } }) => {
    // Test users are allowed to signin directly with E2E, thus a signin URL
    // is directly returned by the API. See signin function in
    // opencollective-api/server/controllers/users.js for more info
    return cy.visit(redirect, visitParams).then(() => user);
  });
});

Cypress.Commands.add('logout', () => {
  cy.getByDataCy('user-menu-trigger').click();
  cy.getByDataCy('logout').click();
});

/**
 * Create a new account an SignIn. If no email is provided in `params`, the account
 * will be generated using a random email.
 */
Cypress.Commands.add('signup', ({ user = {}, redirect = '/', visitParams } = {}) => {
  if (!user.email) {
    user.email = randomEmail();
  }

  return signinRequest(user, redirect).then(({ body: { redirect } }) => {
    // Test users are allowed to signin directly with E2E, thus a signin URL
    // is directly returned by the API. See signin function in
    // opencollective-api/server/controllers/users.js for more info
    const token = getTokenFromRedirectUrl(redirect);
    if (token) {
      return getLoggedInUserFromToken(token).then(user => {
        return cy.visit(redirect, visitParams).then(() => user);
      });
    } else {
      return cy.visit(redirect, visitParams).then(() => user);
    }
  });
});

/**
 * Returns all the email sent by the API
 */
Cypress.Commands.add('getInbox', () => {
  return cy
    .request({
      url: `${Cypress.env('MAILDEV_URL')}/email`,
      method: 'GET',
    })
    .then(({ body }) => {
      return body;
    });
});

/**
 * Open an email on Mailpit. Resolves the email message.
 *
 * API must be configured to use maildev
 * - configured by default in development, e2e and ci environments
 * - otherwise MAILDEV_CLIENT=true and MAILDEV_SERVER=true
 *
 * @param emailMatcher {func} - used to find the email. Gets passed an email. To see the
 *  list of all fields, check https://github.com/djfarrelly/MailDev/blob/master/docs/rest.md
 */
Cypress.Commands.add('openEmail', (emailMatcher, timeout = 8000) => {
  return getEmail(emailMatcher, timeout);
});

/**
 * Create a collective. Admin will be the user designated by `email`. If not
 * provided, the email used will default to `defaultTestUserEmail`.
 */
Cypress.Commands.add('createCollective', ({ type = 'ORGANIZATION', email = defaultTestUserEmail, ...params }) => {
  const user = { email, newsletterOptIn: false };
  return signinRequest(user, null).then(response => {
    const token = getTokenFromRedirectUrl(response.body.redirect);
    return graphqlQuery(token, {
      operationName: 'CreateCollective',
      query: gqlV1/* GraphQL */ `
        mutation CreateCollective($collective: CollectiveInputType!) {
          createCollective(collective: $collective) {
            id
            slug
            name
            description
            longDescription
            website
            imageUrl
            settings
          }
        }
      `,
      variables: { collective: { location: {}, name: 'TestOrg', slug: '', type, ...params } },
    }).then(({ body }) => {
      return body.data.createCollective;
    });
  });
});

/**
 * Calls the mutation to edit the settings of an account
 */
Cypress.Commands.add('editCollective', (collective, userEmail = defaultTestUserEmail) => {
  return signinRequestAndReturnToken({ email: userEmail }).then(token => {
    return graphqlQuery(token, {
      operationName: 'EditCollective',
      query: gqlV1/* GraphQL */ `
        mutation EditCollective($collective: CollectiveInputType!) {
          editCollective(collective: $collective) {
            id
            slug
            name
            settings
            location {
              id
              country
            }
          }
        }
      `,
      variables: { collective },
    }).then(({ body }) => {
      return body.data.createCollective;
    });
  });
});

/**
 * Create a collective. Admin will be the user designated by `email`. If not
 * provided, the email used will default to `defaultTestUserEmail`.
 */
Cypress.Commands.add(
  'createHostedCollectiveV2',
  ({ email = defaultTestUserEmail, hostSlug = 'opensource', testPayload, ...attributes } = {}) => {
    return cy.createCollectiveV2({
      ...attributes,
      email,
      testPayload,
      host: { slug: hostSlug },
      collective: {
        repositoryUrl: 'https://github.com/opencollective',
      },
      applicationData: {
        useGithubValidation: true,
      },
    });
  },
);

/**
 * Create a expense.
 */
Cypress.Commands.add('createExpense', ({ userEmail = defaultTestUserEmail, account, ...params } = {}) => {
  const expense = {
    tags: ['Engineering'],
    type: 'INVOICE',
    payoutMethod: { type: 'PAYPAL', data: { email: userEmail || randomEmail() } },
    description: 'Expense 1',
    items: [{ description: 'Some stuff', amount: 1000 }],
    ...params,
  };

  return signinRequestAndReturnToken({ email: userEmail }, null).then(token => {
    return graphqlQueryV2(token, {
      operationName: 'CreateExpense',
      query: gql`
        mutation CreateExpense($expense: ExpenseCreateInput!, $account: AccountReferenceInput!) {
          createExpense(expense: $expense, account: $account) {
            id
            legacyId
            createdAt
            account {
              id
              slug
            }
          }
        }
      `,
      variables: { expense, account },
      failOnStatusCode: false,
    }).then(({ body }) => {
      return body.data.createExpense;
    });
  });
});

/**
 * Create a collective hosted by the open source collective.
 * TODO: Migrate this to GQLV2 -> `createCollective` with `__skipApprovalTestOnly` set to true
 */
Cypress.Commands.add('createHostedCollective', ({ userEmail = defaultTestUserEmail, ...collectiveParams } = {}) => {
  const collective = {
    slug: randomSlug(),
    name: 'Test Collective',
    type: 'COLLECTIVE',
    ...collectiveParams,
  };

  return signinRequest({ email: userEmail }, null).then(response => {
    const token = getTokenFromRedirectUrl(response.body.redirect);
    return graphqlQuery(token, {
      operationName: 'CreateCollectiveWithHost',
      query: gqlV1/* GraphQL */ `
        mutation CreateCollectiveWithHost($collective: CollectiveInputType!) {
          createCollectiveFromGithub(collective: $collective) {
            id
            slug
            isActive
            host {
              id
            }
          }
        }
      `,
      variables: { collective },
    }).then(({ body }) => {
      return body.data.createCollectiveFromGithub;
    });
  });
});

Cypress.Commands.add('createProject', ({ userEmail = defaultTestUserEmail, collective } = {}) => {
  const project = {
    name: 'test-project',
    slug: randomSlug(),
    description: 'make the world a better place',
  };

  return signinRequest({ email: userEmail }, null).then(response => {
    const token = getTokenFromRedirectUrl(response.body.redirect);
    return graphqlQueryV2(token, {
      operationName: 'CreateProject',
      query: gql`
        mutation CreateProject($project: ProjectCreateInput!, $parent: AccountReferenceInput) {
          createProject(project: $project, parent: $parent) {
            id
            name
            slug
            description
            __typename
          }
        }
      `,
      variables: { project, parent: { slug: collective.slug } },
    }).then(({ body }) => {
      return body.data.createProject;
    });
  });
});

Cypress.Commands.add('createHostOrganization', (userEmail, variables) => {
  return signinRequest({ email: userEmail }, null).then(response => {
    const token = getTokenFromRedirectUrl(response.body.redirect);
    return graphqlQueryV2(token, {
      operationName: 'CreateOrganization',
      query: gql`
        mutation CreateOrganization($organization: OrganizationCreateInput!, $inviteMembers: [InviteMemberInput!]) {
          createOrganization(organization: $organization, inviteMembers: $inviteMembers) {
            id
            legacyId
            slug
          }
        }
      `,
      variables: {
        ...variables,
        organization: {
          slug: randomSlug(),
          description: 'Test Host',
          name: 'Test Host',
          ...variables?.organization,
        },
      },
    }).then(({ body }) => {
      const host = body.data.createOrganization;
      return graphqlQuery(token, {
        operationName: 'ActivateCollectiveAsHost',
        query: gqlV1`
          mutation ActivateCollectiveAsHost($id: Int!) {
            activateCollectiveAsHost(id: $id) {
              id
            }
          }
        `,
        variables: { id: host.legacyId },
      }).then(() => host);
    });
  });
});

Cypress.Commands.add('graphqlQueryV2', (query, { variables = {}, token = null } = {}) => {
  return graphqlQueryV2(token, { query, variables }).then(({ body }) => {
    return body.data;
  });
});

/**
 * Add a stripe credit card on the collective designated by `collectiveSlug`.
 */
Cypress.Commands.add('addCreditCardToCollective', ({ collectiveSlug }) => {
  cy.login({ redirect: `/dashboard/${collectiveSlug}/payment-methods` });
  cy.contains('button', 'Add a credit card').click();
  cy.wait(2000);
  fillStripeInput();
  cy.wait(1000);
  cy.contains('button[type="submit"]', 'Save').click();
  cy.get('[data-cy="save-credit-card-button"][data-loading="true"]').should('exist');
  cy.get('[data-cy="save-credit-card-button"][data-loading="true"]').should('not.exist', { timeout: 30_000 });
});

/**
 * Fill a stripe creditcard input.
 *
 * @param container {DOM|null} pass it if you have multiple stripe inputs on the page
 * @param {object} cardParams the credit card info. Defaults to a valid card
 *    - creditCardNumber
 *    - expirationDate
 *    - cvcCode
 *    - postalCode
 */
Cypress.Commands.add('fillStripeInput', fillStripeInput);

/**
 * Completes a 3DSecure Stripe modal
 *
 * @param {boolean} approve: Set to false to reject
 */
Cypress.Commands.add('complete3dSecure', (approve = true, { version = 1 } = {}) => {
  const iframeSelector = 'iframe[name^="__privateStripeFrame"]';
  const targetBtn = approve ? '#test-source-authorize-3ds' : '#test-source-fail-3ds';

  cy.get(iframeSelector)
    .should($stripeFrame => {
      const frameContent = $stripeFrame.contents();

      let buttonsFrame = frameContent.find('body iframe#challengeFrame');
      expect(buttonsFrame).to.exist;

      // With 3DSecure v2, the buttons are stored directly in the iframe. With v1, there is an extra iframe.
      if (version === 1) {
        const acsFrame = buttonsFrame.contents().find('iframe[name="acsFrame"]');
        expect(acsFrame).to.exist;
        buttonsFrame = acsFrame;
      }

      const challengeFrameBody = buttonsFrame.contents().find('body');
      expect(challengeFrameBody).to.exist;
      expect(challengeFrameBody.find(targetBtn)).to.exist;
    })
    .then($iframe => {
      const $challengeFrameContent = $iframe.contents().find('body iframe#challengeFrame').contents();
      let $btnContainer = $challengeFrameContent;
      if (version === 1) {
        $btnContainer = $btnContainer.find('iframe[name="acsFrame"]').contents();
      }

      const btn = cy.wrap($btnContainer.find('body').find(targetBtn));
      btn.click();
    });
});

Cypress.Commands.add('iframeLoaded', { prevSubject: 'element' }, $iframe => {
  const contentWindow = $iframe.prop('contentWindow');
  return new Promise(resolve => {
    if (contentWindow && contentWindow.document.readyState === 'complete') {
      resolve(contentWindow);
    } else {
      $iframe.on('load', () => {
        resolve(contentWindow);
      });
    }
  });
});

/**
 * To use on the "Payment" step in the contribution flow.
 * Use the first payment method if available or fill the
 * stripe form otherwise.
 */
Cypress.Commands.add('useAnyPaymentMethod', () => {
  return cy.get('#PaymentMethod').then($paymentMethod => {
    // Checks if the organization already has a payment method configured
    if (!$paymentMethod.text().includes('VISA **** 4242')) {
      cy.wait(1000); // Wait for stripe to be loaded
      cy.fillStripeInput();
    }
  });
});

/**
 * A helper for the `StepsProgress` component to check that the steps in params
 * are enabled or disabled. `enabled` and `disabled` can both be passed an array
 * of strings or a single string.
 */
Cypress.Commands.add('checkStepsProgress', ({ enabled = [], disabled = [] }) => {
  const isEnabled = step => cy.get(`[data-cy="progress-step-${step}"][data-disabled=false]`);
  const isDisabled = step => cy.get(`[data-cy="progress-step-${step}"][data-disabled=true]`);

  Array.isArray(enabled) ? enabled.forEach(isEnabled) : isEnabled(enabled);
  Array.isArray(disabled) ? disabled.forEach(isDisabled) : isDisabled(disabled);
});

Cypress.Commands.add('checkToast', ({ variant, message }) => {
  const $toast = cy.contains('[data-cy="toast-notification"]', message);
  if (variant) {
    $toast.should('have.attr', 'data-variant', variant);
  }
});

/**
 * Check if user is logged in by searching for its username in navbar
 */
Cypress.Commands.add('assertLoggedIn', user => {
  cy.log('Ensure user is logged in');
  cy.getByDataCy('user-menu-trigger').should('be.visible');
  if (user) {
    cy.getByDataCy('user-menu-trigger').click();
    cy.contains('[data-cy="user-menu"]', user.email);
    cy.getByDataCy('user-menu-trigger').click(); // To close the menu
  }
});

Cypress.Commands.add('generateToken', async expiresIn => {
  return await generateToken(expiresIn);
});

/**
 * A helper to fill input fields generated by the `InputField` component.
 */
Cypress.Commands.add('fillInputField', (fieldname, value, cypressOptions) => {
  return cy.get(`.inputField.${fieldname} input`, cypressOptions).type(value);
});

/**
 * Wrapper around `get` specialized to retrieve data from `data-cy`. You can pass an array
 * for deeper queries.
 */
Cypress.Commands.add('getByDataCy', (query, params) => {
  if (Array.isArray(query)) {
    return cy.get(
      query.map(elem => `[data-cy="${elem}"]`),
      params,
    );
  } else {
    return cy.get(`[data-cy="${query}"]`, params);
  }
});

/**
 * Wrapper around `contains` specialized to retrieve data from `data-cy`. You can pass an array
 * for deeper queries.
 */
Cypress.Commands.add('containsInDataCy', (query, content, params) => {
  if (Array.isArray(query)) {
    return cy.contains(
      query.map(elem => `[data-cy="${elem}"]`),
      content,
      params,
    );
  } else {
    return cy.contains(`[data-cy="${query}"]`, content, params);
  }
});

/**
 * Waits for user to be logged in (or timeout)
 * @param {object} params: passed to `cy.get`
 */
Cypress.Commands.add('waitForLoggedIn', params => {
  return cy.getByDataCy('user-menu-trigger', params);
});

/**
 * Add 2FA to a test account
 */
Cypress.Commands.add('enableTwoFactorAuth', ({ userEmail = defaultTestUserEmail, userSlug, secret } = {}) => {
  let authToken;
  return signinRequestAndReturnToken({ email: userEmail, slug: userSlug }, null).then(token => {
    authToken = token;
    return graphqlQueryV2(authToken, {
      operationName: 'AccountHasTwoFactorAuth',
      query: gql`
        query AccountHasTwoFactorAuth($slug: String) {
          individual(slug: $slug) {
            id
            slug
            name
            type
            ... on Individual {
              hasTwoFactorAuth
            }
          }
        }
      `,
      variables: { slug: userSlug },
      options: { context: API_V2_CONTEXT },
    })
      .then(({ body }) => {
        const account = {
          id: body.data.individual.id,
        };
        const token = secret;

        return graphqlQueryV2(authToken, {
          operationName: 'AddTwoFactorAuthToIndividual',
          query: gql`
            mutation AddTwoFactorAuthToIndividual($account: AccountReferenceInput!, $token: String!) {
              addTwoFactorAuthTokenToIndividual(account: $account, token: $token) {
                account {
                  id
                  ... on Individual {
                    hasTwoFactorAuth
                  }
                }
                recoveryCodes
              }
            }
          `,
          variables: { account, token },
          options: { context: API_V2_CONTEXT },
        });
      })
      .then(({ body }) => {
        return body.data;
      });
  });
});

Cypress.Commands.add('complete2FAPrompt', code => {
  cy.get('#2fa-code-input').type(code);
  cy.contains('button', 'Verify').click();
});

let localStorageSnapshot = {};

Cypress.Commands.add('resetLocalStorage', () => {
  localStorageSnapshot = {};
  localStorage.clear();
});

Cypress.Commands.add('saveLocalStorage', () => {
  localStorageSnapshot = {};
  Object.keys(localStorage).forEach(key => {
    localStorageSnapshot[key] = localStorage[key];
  });
});

Cypress.Commands.add('restoreLocalStorage', () => {
  Object.keys(localStorageSnapshot).forEach(key => {
    localStorage.setItem(key, localStorageSnapshot[key]);
  });
});

Cypress.Commands.add('getStripePaymentElement', getStripePaymentElement);

Cypress.Commands.add(
  'createCollectiveV2',
  ({ email = defaultTestUserEmail, testPayload, host, collective, applicationData, skipApproval = false } = {}) => {
    const user = { email, newsletterOptIn: false };
    return signinRequest(user, null).then(response => {
      const token = getTokenFromRedirectUrl(response.body.redirect);
      return graphqlQueryV2(token, {
        operationName: 'CreateCollective',
        query: gql`
          mutation CreateCollective(
            $collective: CollectiveCreateInput!
            $host: AccountReferenceInput!
            $testPayload: JSON
            $applicationData: JSON
            $skipApproval: Boolean
          ) {
            createCollective(
              collective: $collective
              host: $host
              testPayload: $testPayload
              applicationData: $applicationData
              skipApprovalTestOnly: $skipApproval
            ) {
              id
              slug
              name
              description
              settings
            }
          }
        `,
        variables: {
          host,
          testPayload: testPayload || null,
          collective: {
            name: 'TestCollective',
            slug: randomSlug(),
            description: 'A test collective',
            ...collective,
          },
          applicationData,
          skipApproval,
        },
      }).then(({ body }) => {
        return body.data.createCollective;
      });
    });
  },
);

/**
 * Wait for a file to be downloaded
 */
Cypress.Commands.add('getDownloadedPDFContent', (filename, options) => {
  const downloadFolder = Cypress.config('downloadsFolder');
  cy.readFile(`${downloadFolder}/${filename}`, null, options).then(pdfFileContent => {
    cy.task('getTextFromPdfContent', pdfFileContent);
  });
});

Cypress.Commands.add('waitOrderStatus', (orderId, status) => {
  return cy.retryChain(
    () =>
      cy
        .graphqlQueryV2(
          gql`
            query OrderStatus($orderId: Int!) {
              order(order: { legacyId: $orderId }) {
                status
              }
            }
          `,
          { variables: { orderId } },
        )
        .then(data => data.order.status),
    apiStatus => {
      if (!apiStatus.match(status)) {
        throw new Error(`Order did not transition to ${status} before timeout, current value: ${apiStatus}.`);
      }
    },
    {
      maxAttempts: 50,
      wait: 1000,
    },
  );
});

Cypress.Commands.add('getOrderIdFromContributionSuccessPage', () => {
  return cy
    .get('[data-cy^="contribution-id-"]')
    .invoke('attr', 'data-cy')
    .then(contributionIdStr => {
      const contributionId = parseInt(contributionIdStr.replace('contribution-id-', ''));
      return contributionId;
    });
});

// ---- Private ----

/**
 * @param {object} user - should have `email` and `id` set
 */
function signinRequest(user, redirect, sendLink) {
  return cy.request({
    url: '/api/users/signin',
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ user, redirect, createProfile: true, sendLink }),
  });
}

function getTokenFromRedirectUrl(url) {
  const regex = /\/signin\/([^?]+)/;
  return regex.exec(url)[1];
}

/**
 * @param {object} user - should have `email` and `id` set
 */
function signinRequestAndReturnToken(user, redirect) {
  return signinRequest(user, redirect, true).then(({ body }) => getTokenFromRedirectUrl(body.redirect));
}

function graphqlQuery(token, body) {
  return cy.request({
    url: '/api/graphql/v1',
    method: 'POST',
    headers: {
      Accept: 'application/json',
      authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
}

function graphqlQueryV2(token, body) {
  return cy.request({
    url: '/api/graphql/v2',
    method: 'POST',
    headers: {
      Accept: 'application/json',
      authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
}

function getLoggedInUserFromToken(token) {
  return graphqlQuery(token, {
    operationName: 'LoggedInUser',
    query: loggedInUserQuery.loc.source.body,
  }).then(({ body }) => {
    return body.data.LoggedInUser;
  });
}

/**
 * @param {object} params
 *   - container
 *   - card
 */
function fillStripeInput(params) {
  const { container, card } = params || {};
  const stripeIframeSelector = '.__PrivateStripeElement iframe';
  const iframePromise = container ? container.find(stripeIframeSelector) : cy.get(stripeIframeSelector);
  const cardParams = card || CreditCards.CARD_DEFAULT;

  return iframePromise.then(iframe => {
    const { creditCardNumber, expirationDate, cvcCode, postalCode } = cardParams;
    const body = iframe.contents().find('body');
    const fillInput = (index, value) => {
      if (value === undefined) {
        return;
      }

      return cy.wrap(body).find(`input:eq(${index})`).type(`{selectall}${value}`, { force: true });
    };

    fillInput(1, creditCardNumber);
    fillInput(2, expirationDate);
    fillInput(3, cvcCode);
    fillInput(4, postalCode);
  });
}

function getEmail(emailMatcher, timeout = 8000) {
  if (timeout < 0) {
    return assert.fail('Could not find email: getEmail timed out');
  }

  return cy.mailpitGetAllMails().then(result => {
    const email = result.messages.find(emailMatcher);
    if (email) {
      return cy.mailpitGetMail(email.ID);
    }
    cy.wait(100);
    return getEmail(emailMatcher, timeout - 100);
  });
}

function getStripePaymentElement() {
  const stripeIframeSelector = '.__PrivateStripeElement iframe';
  const iframePromise = cy.get(stripeIframeSelector).first();

  return iframePromise.then(iframe => {
    return iframe.contents().find('body');
  });
}
