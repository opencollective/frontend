import { Readable } from 'stream';

import fetch from 'node-fetch';
import { Page } from 'playwright/test';

import { loggedInUserQuery } from '../../../lib/graphql/v1/queries';

import { randomEmail } from '../../cypress/support/faker';

const baseURL = 'http://localhost:3000'; // TODO: Get this to config

const graphqlQueryV1 = (body: any, token: string) => {
  return fetch(`${baseURL}/api/graphql/v1`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      authorization: !token ? undefined : `Bearer ${token}`,
    },
    body: Readable.from([JSON.stringify(body)]),
  });
};

const signinRequest = (user, redirect: string, sendLink: boolean = false) => {
  return fetch(`${baseURL}/api/users/signin`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: Readable.from([JSON.stringify({ user, redirect, createProfile: true, sendLink })]),
  });
};

const getLoggedInUserFromToken = async (token: string): Promise<any> => {
  const response = await graphqlQueryV1(
    { operationName: 'LoggedInUser', query: loggedInUserQuery.loc.source.body, variables: {} },
    token,
  );
  const result = await response.json();
  return result.data.LoggedInUser;
};

function getTokenFromRedirectUrl(url) {
  const regex = /\/signin\/([^?]+)/;
  return regex.exec(url)[1];
}

/**
 * Signup with the given params and redirect to the provided URL
 */
export const signup = async (
  page: Page,
  {
    user,
    redirect = '/',
  }: {
    user?: { email?: string; name?: string };
    redirect?: string;
  } = {},
) => {
  const email = user?.email || randomEmail();
  const relativeRedirect = redirect.startsWith(baseURL) ? redirect.replace(baseURL, '') : redirect;
  const response = await signinRequest({ ...user, email }, relativeRedirect);
  const result = await response.json();
  const signInRedirectUrl = result.redirect;
  const token = getTokenFromRedirectUrl(signInRedirectUrl);
  await page.goto(signInRedirectUrl); // TODO: Rather than redirecting, we could exchange the token directly
  return getLoggedInUserFromToken(token);
};
