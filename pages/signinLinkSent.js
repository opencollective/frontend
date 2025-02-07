import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { isEmail } from 'validator';

import { getI18nLink } from '../components/I18nFormatters';
import Image from '../components/Image';
import OpenEmailProviderButton from '../components/OpenEmailProviderButton';
import Page from '../components/Page';

class SignInLinkSent extends Component {
  static async getInitialProps({ res, query = {}, router }) {
    if (query.email) {
      return { email: query.email };
    }

    if (res) {
      res.statusCode = 302;
      res.setHeader('Location', '/signin');
      res.end();
    } else {
      router.push('/signin');
    }
    return {};
  }

  render() {
    const { email } = this.props;
    const isValidEmail = email && isEmail(email);
    return (
      <Page title="Login Link Sent" noRobots showFooter={false}>
        <div className="flex flex-col items-center px-4 pt-8 pb-32 text-center sm:pt-16">
          <Image src="/static/images/sign-in-illustration.png" width={624} height={372} />
          <div className="text-3xl font-bold leading-[40px] text-foreground">
            <FormattedMessage id="SignIn.LinkSent" defaultMessage="Your magic link is on its way!" />
          </div>
          {isValidEmail && (
            <div className="mt-4 text-xl font-medium leading-[28px] text-neutral-700">
              <FormattedMessage
                defaultMessage="We've sent it to {email}"
                id="Yh1nOL"
                values={{ email: <strong>{email}</strong> }}
              />
            </div>
          )}
          <OpenEmailProviderButton email={email}>
            {button => <div className="mt-3">{button}</div>}
          </OpenEmailProviderButton>
          <div className="my-4 text-base font-medium leading-6 text-neutral-700">
            <FormattedMessage
              id="SignIn.SuccessDetails"
              defaultMessage="You’ll be redirected from the link in the email, you can safely close this tab."
            />
            <br />
            <FormattedMessage
              id="signinLinkSent."
              defaultMessage="<Link>Learn more</Link> about our login system."
              values={{
                Link: getI18nLink({
                  href: 'https://docs.opencollective.com/help/product/log-in-system',
                  openInNewTab: true,
                }),
              }}
            />
          </div>
        </div>
      </Page>
    );
  }
}

SignInLinkSent.propTypes = {
  email: PropTypes.string.isRequired,
};

// next.js export
// ts-unused-exports:disable-next-line
export default SignInLinkSent;
