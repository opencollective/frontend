import React from 'react';
import PropTypes from 'prop-types';
import { mapValues } from 'lodash';
import { withRouter } from 'next/router';
import { FormattedMessage } from 'react-intl';
import { isEmail } from 'validator';

import { isSuspiciousUserAgent, RobotsDetector } from '../lib/robots-detector';
import { isValidRelativeUrl } from '../lib/utils';

import Body from '../components/Body';
import Header from '../components/Header';
import Loading from '../components/Loading';
import LoadingGrid from '../components/LoadingGrid';
import MessageBox from '../components/MessageBox';
import SignInOrJoinFree from '../components/SignInOrJoinFree';
import { P } from '../components/Text';
import { withUser } from '../components/UserProvider';

class SigninPage extends React.Component {
  static getInitialProps({ query: { token, next, form, email }, req }) {
    // Decode next URL if URI encoded
    if (next && next.startsWith('%2F')) {
      next = decodeURIComponent(next);
    }

    next = next && isValidRelativeUrl(next) ? next : null;
    email = email && decodeURIComponent(email);
    return {
      token,
      next,
      form: form || 'signin',
      isSuspiciousUserAgent: isSuspiciousUserAgent(req?.get('User-Agent')),
      email: email && isEmail(email) ? email : null,
    };
  }

  static propTypes = {
    form: PropTypes.oneOf(['signin', 'create-account']).isRequired,
    token: PropTypes.string,
    email: PropTypes.string,
    next: PropTypes.string,
    login: PropTypes.func,
    errorLoggedInUser: PropTypes.string,
    LoggedInUser: PropTypes.object,
    loadingLoggedInUser: PropTypes.bool,
    isSuspiciousUserAgent: PropTypes.bool,
    router: PropTypes.object,
  };

  constructor(props) {
    super(props);
    this.robotsDetector = new RobotsDetector();
    this.state = { error: null, success: null, isRobot: props.isSuspiciousUserAgent, redirecting: false };
  }

  componentDidMount() {
    if (this.state.isRobot) {
      this.robotsDetector.startListening(() => this.setState({ isRobot: false }));
    } else {
      this.initialize();
    }
  }

  async componentDidUpdate(oldProps, oldState) {
    if (oldState.isRobot && !this.state.isRobot) {
      this.initialize();
    } else if (!this.state.redirecting && this.props.token && oldProps.token !== this.props.token) {
      // --- There's a new token in town 🤠 ---
      const user = await this.props.login(this.props.token);
      if (!user) {
        this.setState({ error: 'Token rejected' });
      }
    } else if (
      !this.state.redirecting &&
      this.props.LoggedInUser &&
      !this.props.errorLoggedInUser &&
      this.props.form !== 'create-account'
    ) {
      // --- User logged in ---
      this.setState({ success: true, redirecting: true });
      // Avoid redirect loop: replace '/signin' redirects by '/'
      const { next } = this.props;
      const redirect = next && (next.match(/^\/?signin[?/]?/) || next.match(/^\/?reset-password[?/]?/)) ? null : next;
      const defaultRedirect = '/dashboard';
      await this.props.router.replace(redirect && redirect !== '/' ? redirect : defaultRedirect);
      window.scroll(0, 0);
    }
  }

  componentWillUnmount() {
    this.robotsDetector.stopListening();
  }

  async initialize() {
    if (this.props.token) {
      let user;
      try {
        user = await this.props.login(this.props.token);

        // If given token is invalid, try to login with the old one
        if (!user) {
          user = await this.props.login();
        }

        // If there's no user at this point, there's no chance we can login
        if (!user) {
          this.setState({ error: 'Token rejected' });
        }
      } catch (err) {
        this.setState({ error: err.message || err });
      }
    } else {
      this.props.login();
    }
  }

  getRoutes() {
    const { next } = this.props;
    const routes = { signin: '/signin', join: '/create-account' };
    if (!next) {
      return routes;
    } else {
      const urlParams = `?next=${encodeURIComponent(next)}`;
      return mapValues(routes, route => `${route}${urlParams}`);
    }
  }

  renderContent() {
    const { loadingLoggedInUser, errorLoggedInUser, token, next, form, LoggedInUser } = this.props;

    if (this.state.isRobot && token) {
      return (
        <div className="flex flex-col items-center px-3 pb-3">
          <P fontSize="30px" mb={3}>
            <span role="img" aria-label="Robot Emoji">
              🤖
            </span>
          </P>
          <P mb={5} textAlign="center">
            <FormattedMessage
              id="checkingBrowser"
              defaultMessage="Your browser is being verified. If this message doesn't disappear, try to move your mouse or to touch your screen for mobile."
            />
          </P>
          <Loading />
        </div>
      );
    } else if ((loadingLoggedInUser || this.state.success) && token) {
      return <Loading />;
    } else if (!loadingLoggedInUser && LoggedInUser && form === 'create-account') {
      return (
        <MessageBox type="warning" withIcon>
          <FormattedMessage
            id="createAccount.alreadyLoggedIn"
            defaultMessage={`It seems like you're already signed in as "{email}". If you want to create a new account, please log out first.`}
            values={{ email: LoggedInUser.email }}
          />
        </MessageBox>
      );
    }

    const error = errorLoggedInUser || this.state.error;

    if (loadingLoggedInUser || this.state.redirecting || (token && !error)) {
      return <LoadingGrid />;
    }

    return (
      <React.Fragment>
        {error && !error.includes('Two-factor authentication is enabled') && (
          <MessageBox type="error" withIcon mb={4} data-cy="signin-message-box">
            <strong>
              <FormattedMessage
                id="login.failed"
                defaultMessage="Sign In failed: {message}."
                values={{ message: error }}
              />
            </strong>
            <br />
            {!error?.includes('Two-factor authentication') && (
              <FormattedMessage
                id="login.askAnother"
                defaultMessage="You can ask for a new sign in link using the form below."
              />
            )}
          </MessageBox>
        )}
        <SignInOrJoinFree email={this.props.email} redirect={next || '/'} form={form} routes={this.getRoutes()} />
      </React.Fragment>
    );
  }

  render() {
    return (
      <div className="LoginPage">
        <Header
          title={this.props.form === 'signin' ? 'Sign In' : 'Create Account'}
          description="Create your profile on Open Collective and show the world the open collectives that you are contributing to."
          menuItems={{ solutions: false, product: false, company: false, docs: false }}
          showSearch={false}
          showProfileAndChangelogMenu={false}
        />
        <Body>
          <div className="my-4 flex flex-col items-center p-2 md:my-6">{this.renderContent()}</div>
        </Body>
      </div>
    );
  }
}

// next.js export
// ts-unused-exports:disable-next-line
export default withUser(withRouter(SigninPage));
