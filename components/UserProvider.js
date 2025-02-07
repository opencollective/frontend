import React from 'react';
import PropTypes from 'prop-types';
import { withApollo } from '@apollo/client/react/hoc';
import { decodeJwt } from 'jose';
import { get, isEqual } from 'lodash';
import Router, { withRouter } from 'next/router';
import { injectIntl } from 'react-intl';

import * as auth from '../lib/auth';
import { createError, ERROR, formatErrorMessage } from '../lib/errors';
import { loggedInUserQuery } from '../lib/graphql/v1/queries';
import withLoggedInUser from '../lib/hooks/withLoggedInUser';
import { getFromLocalStorage, LOCAL_STORAGE_KEYS, removeFromLocalStorage } from '../lib/local-storage';
import UserClass from '../lib/LoggedInUser';
import { withTwoFactorAuthenticationPrompt } from '../lib/two-factor-authentication/TwoFactorAuthenticationContext';

import { toast } from './ui/useToast';

export const UserContext = React.createContext({
  loadingLoggedInUser: true,
  errorLoggedInUser: null,
  LoggedInUser: null,
  logout: async () => null,
  login: async () => null,
  async refetchLoggedInUser() {},
});

class UserProvider extends React.Component {
  static propTypes = {
    getLoggedInUser: PropTypes.func.isRequired,
    twoFactorAuthPrompt: PropTypes.object,
    router: PropTypes.object,
    client: PropTypes.object,
    children: PropTypes.node,
    intl: PropTypes.object,
    initialLoggedInUser: PropTypes.object,
  };

  state = {
    loadingLoggedInUser: this.props.initialLoggedInUser ? false : true,
    LoggedInUser: this.props.initialLoggedInUser,
    errorLoggedInUser: null,
  };

  async componentDidMount() {
    window.addEventListener('storage', this.checkLogin);

    // Disable auto-login on SignIn page
    if (Router.pathname !== '/signin') {
      await this.login();
    }
  }

  componentWillUnmount() {
    window.removeEventListener('storage', this.checkLogin);
  }

  checkLogin = event => {
    if (event.key === 'LoggedInUser') {
      if (event.oldValue && !event.newValue) {
        return this.setState({ LoggedInUser: null });
      }
      if (!event.oldValue && event.newValue) {
        const { value } = JSON.parse(event.newValue);
        return this.setState({ LoggedInUser: new UserClass(value) });
      }

      const { value: oldValue } = JSON.parse(event.oldValue);
      const { value } = JSON.parse(event.newValue);

      if (!isEqual(oldValue, value)) {
        this.setState({ LoggedInUser: new UserClass(value) });
      }
    }
  };

  logout = async ({ redirect, skipQueryRefetch } = {}) => {
    auth.logout();

    this.setState({ LoggedInUser: null, errorLoggedInUser: null });
    // Clear the Apollo store without automatically refetching queries
    await this.props.client.clearStore();

    // By default, we refetch all queries to make sure we don't display stale data
    if (!skipQueryRefetch) {
      await this.props.client.reFetchObservableQueries();
    } else {
      // Send any request to API to clear rootRedirectDashboard cookie
      await this.props.client.query({ query: loggedInUserQuery, fetchPolicy: 'network-only' });
    }

    if (redirect) {
      this.props.router.push({
        pathname: redirect,
      });
    }
  };

  login = async token => {
    const { getLoggedInUser, twoFactorAuthPrompt, intl } = this.props;

    try {
      const LoggedInUser = token ? await getLoggedInUser({ token }) : await getLoggedInUser();
      this.setState({
        loadingLoggedInUser: false,
        errorLoggedInUser: null,
        LoggedInUser,
      });
      return LoggedInUser;
    } catch (error) {
      // Malformed tokens are detected and removed by the frontend in `lib/hooks/withLoggedInUser.js` (search for "malformed")
      // Invalid tokens are ignored in the API, the user is treated as unauthenticated (see `parseJwt` in `server/middleware/authentication.js`)
      // There can therefore only be two types of errors here:
      // - Network/server errors: we'll display a message
      // - Expired tokens: we'll logout the user with a "Your session has expired. Please sign-in again." message
      const errorType = get(error, 'networkError.result.error.type');

      // For expired tokens, we directly logout & show a toast as we want to make sure it gets
      // displayed not matter what page the user is on.
      if (!token && errorType === 'jwt_expired') {
        this.logout();
        this.setState({ loadingLoggedInUser: false });
        const message = formatErrorMessage(intl, createError(ERROR.JWT_EXPIRED));
        toast({ variant: 'error', message });
        return null;
      }

      if (error.message.includes('Two-factor authentication is enabled')) {
        // eslint-disable-next-line no-constant-condition
        while (true) {
          try {
            const token = getFromLocalStorage(LOCAL_STORAGE_KEYS.TWO_FACTOR_AUTH_TOKEN);
            const decodedToken = decodeJwt(token);

            const result = await twoFactorAuthPrompt.open({
              supportedMethods: decodedToken.supported2FAMethods,
              authenticationOptions: decodedToken.authenticationOptions,
              allowRecovery: true,
            });

            // An empty result means the prompt is already open elsewhere. This could either be due to
            // React strict mode calling lifecycle methods twice or a developer mistake. The safest option is to early
            // return and let the other prompt handle the result.
            if (!result) {
              return;
            }

            const LoggedInUser = await getLoggedInUser({
              token: getFromLocalStorage(LOCAL_STORAGE_KEYS.TWO_FACTOR_AUTH_TOKEN),
              twoFactorAuthenticatorCode: result.code,
              twoFactorAuthenticationType: result.type,
            });
            if (result.type === 'recovery_code') {
              this.props.router.replace({
                pathname: '/dashboard/[slug]/user-security',
                query: { slug: LoggedInUser.collective.slug },
              });
            } else {
              this.setState({
                loadingLoggedInUser: false,
                errorLoggedInUser: null,
                LoggedInUser,
              });
            }
            removeFromLocalStorage(LOCAL_STORAGE_KEYS.TWO_FACTOR_AUTH_TOKEN);

            return LoggedInUser;
          } catch (e) {
            this.setState({ loadingLoggedInUser: false, errorLoggedInUser: e.message });

            // Stop loop if user cancelled the prompt
            if (e.type === 'TWO_FACTOR_AUTH_CANCELED') {
              throw new Error(formatErrorMessage(intl, e));
            }

            // Stop loop if too many requests or token is invalid
            if (
              e.type === 'too_many_requests' ||
              (e.type === 'unauthorized' && e.message.includes('Cannot use this token'))
            ) {
              throw new Error(e.message);
            }

            // Otherwise, retry 2fa prompt and show error
            toast({ variant: 'error', message: e.message });
          }
        }
      } else {
        // Store the error
        this.setState({ loadingLoggedInUser: false, errorLoggedInUser: error.message });
      }
    }
  };

  /**
   * Same as `login` but skip loading the user from localStorage cache. Note
   * that Apollo keeps a local cache too, so you should first use
   * [refetchQueries](https://www.apollographql.com/docs/react/api/react-apollo.html#graphql-mutation-options-refetchQueries)
   * if you really need to be up-to-date with server.
   */
  refetchLoggedInUser = async () => {
    const { getLoggedInUser } = this.props;
    try {
      const LoggedInUser = await getLoggedInUser();
      this.setState({
        errorLoggedInUser: null,
        loadingLoggedInUser: false,
        LoggedInUser,
      });
    } catch (error) {
      this.setState({ loadingLoggedInUser: false, errorLoggedInUser: error });
    }
    return true;
  };

  render() {
    return (
      <UserContext.Provider
        value={{ ...this.state, logout: this.logout, login: this.login, refetchLoggedInUser: this.refetchLoggedInUser }}
      >
        {this.props.children}
      </UserContext.Provider>
    );
  }
}

const { Consumer: UserConsumer } = UserContext;

const withUser = WrappedComponent => {
  const WithUser = props => <UserConsumer>{context => <WrappedComponent {...context} {...props} />}</UserConsumer>;

  WithUser.getInitialProps = async context => {
    return WrappedComponent.getInitialProps ? await WrappedComponent.getInitialProps(context) : {};
  };

  return WithUser;
};

export default injectIntl(
  withApollo(withLoggedInUser(withTwoFactorAuthenticationPrompt(withRouter(injectIntl(UserProvider))))),
);

export { withUser };
