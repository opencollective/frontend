import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { isEmail } from 'validator';

import { getI18nLink } from '../components/I18nFormatters';
import Image from '../components/Image';
import OpenEmailProviderButton from '../components/OpenEmailProviderButton';
import Page from '../components/Page';
import { P } from '../components/Text';

class ResetPasswordSent extends Component {
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
      <Page noRobots showFooter={false}>
        <div className="flex flex-col items-center px-4 pt-8 pb-32 text-center sm:pt-16">
          <Image src="/static/images/sign-in-illustration.png" width={624} height={372} />
          <P fontSize="32px" lineHeight="40px" color="black.900" fontWeight={700}>
            <FormattedMessage defaultMessage="Your reset password email is on its way." id="tSQ2Fc" />
          </P>
          {isValidEmail && (
            <P fontSize="20px" lineHeight="28px" color="black.800" fontWeight={500} mt={4}>
              <FormattedMessage
                defaultMessage="We've sent it to {email}"
                id="Yh1nOL"
                values={{ email: <strong>{email}</strong> }}
              />
            </P>
          )}
          <OpenEmailProviderButton email={email}>
            {button => <div className="mt-3">{button}</div>}
          </OpenEmailProviderButton>
          <P fontSize="16px" lineHeight="24px" color="black.800" fontWeight={500} my={4}>
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
          </P>
        </div>
      </Page>
    );
  }
}

ResetPasswordSent.propTypes = {
  email: PropTypes.string.isRequired,
};

// next.js export
// ts-unused-exports:disable-next-line
export default ResetPasswordSent;
