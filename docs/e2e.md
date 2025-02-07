# E2E (end-to-end) tests

We use [Cypress](https://www.cypress.io/) for E2E (end-to-end) tests.

## Writing E2E tests

See the following guide in our documentation:
https://docs.opencollective.com/help/contributing/development/testing-with-cypress

## Running the E2E tests in development environment

In dev environment, to execute the E2E tests, you will need to open 3 different terminals in 2 different projects.

### 1. API: Server

To make sure tests are properly reproducible, you will need to setup the Open Collective API locally.

We recommend to run a build and not the development environment.

First:

- clone and install [opencollective-api](https://github.com/opencollective/opencollective-api)

Then, simply start it for E2E with:

- `npm run start:e2e`

Behind the scenes it will do the following (so you don't have to do it):

- set environment variables: `TZ=UTC NODE_ENV=e2e E2E_TEST=1`
- reset a dedicated database (opencollective_e2e): `npm run db:restore:e2e`
- migrate the database: `npm run db:migrate`
- build the API server: `npm run build`
- start the API server: `npm run start`

### 2. Frontend: Server

If it's not already setup, look at the "Install" instructions in the [README.md](../README.md).

Make sure the Frontend is talking to the local API:

In your `.env`, paste the following content:

```
API_URL=http://localhost:3060
API_KEY=dvl-1510egmf4a23d80342403fb599qd
```

You can simply start a local server by running `npm run dev`. This is useful to quickly iterate
when developing, but if you're looking for stable and reproducible results we recommend to run a build of the Frontend. It will be faster and more reliable. To do so:

- `npm run build:e2e`

Start from the build:

- `npm run start:e2e`

When investigating a specific test, feel free to switch to the development environment:

- `TZ=UTC npm run dev`

### 3. Frontend: Cypress

You can run all the Cypress tests in CLI mode with the following command:

- `npm run test:e2e`

Cypress tests are split in 4 different groups. You can run these groups individually in CLI mode with:

- `npm run test:e2e:0`
- `npm run test:e2e:1`
- `npm run test:e2e:2`
- `npm run test:e2e:3`

To inspect tests, you can open the Cypress application with the following command:

- `npm run cypress:open`

#### Troubleshooting

- To launch with Chrome, use `npm run cypress:open -- --browser chrome` (double check Chrome is selected in the UI before running)
- On Mac OS, to force Chrome to use the English language: `defaults write com.google.Chrome AppleLanguages '(en, en-US)'`

## Testing Stripe payment elements

To run `test/cypress/integration/13-contributeFlow-stripePaymentElement.test.js`, you'll need to run some additional setup steps:

1. Login to https://dashboard.stripe.com/test/apikeys and create a new restricted key with "Debugging tools
   " permission set to "Write". Copy the key to your `STRIPE_WEBHOOK_KEY` env variable.
2. Run the local Stripe cli to redirect webhook events to your local server:

```
docker run --network host --rm -it stripe/stripe-cli:latest --api-key $STRIPE_WEBHOOK_KEY listen --forward-connect-to localhost:3060/webhooks/stripe
```

3. When the command starts, it says something like "Your webhook signing secret is whsec\_...". Copy this value to your `STRIPE_WEBHOOK_SIGNING_SECRET` env variable in the API and restart it.
4. You're good to go!
