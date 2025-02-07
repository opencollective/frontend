import React, { Fragment } from 'react';
import { useMutation } from '@apollo/client';
import { Email } from '@styled-icons/material/Email';
import { useRouter } from 'next/router';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';
import { useTheme } from 'styled-components';

import { API_V2_CONTEXT, gql } from '../lib/graphql/helpers';
import { removeGuestTokens } from '../lib/guest-accounts';
import useLoggedInUser from '../lib/hooks/useLoggedInUser';

import Container from '../components/Container';
import { getI18nLink } from '../components/I18nFormatters';
import Link from '../components/Link';
import MessageBox from '../components/MessageBox';
import MessageBoxGraphqlError from '../components/MessageBoxGraphqlError';
import Page from '../components/Page';
import StyledSpinner from '../components/StyledSpinner';
import { P } from '../components/Text';

const STATUS = {
  SUBMITTING: 'SUBMITTING',
  SUCCESS: 'SUCCESS',
  ERROR: 'ERROR',
};

const confirmGuestAccountMutation = gql`
  mutation ConfirmGuestAccount($email: EmailAddress!, $token: String!) {
    confirmGuestAccount(email: $email, emailConfirmationToken: $token) {
      accessToken
      account {
        id
        slug
        name
      }
    }
  }
`;

const MESSAGES = defineMessages({
  pageTitle: {
    id: 'confirmGuest.title',
    defaultMessage: 'Account verification',
  },
});

const MUTATION_OPTS = { context: API_V2_CONTEXT };

const ConfirmGuestPage = () => {
  const intl = useIntl();
  const theme = useTheme();
  const router = useRouter();
  const { login } = useLoggedInUser();
  const [status, setStatus] = React.useState(STATUS.SUBMITTING);
  const [callConfirmGuestAccount, { error, data }] = useMutation(confirmGuestAccountMutation, MUTATION_OPTS);
  const { token, email } = router.query;

  const confirmGuestAccount = async () => {
    try {
      const response = await callConfirmGuestAccount({ variables: { email, token } });
      const { accessToken, account } = response.data.confirmGuestAccount;
      removeGuestTokens([email]);
      setStatus(STATUS.SUCCESS);
      await login(accessToken);
      router.push(`/${account.slug}`);
    } catch {
      setStatus(STATUS.ERROR);
    }
  };

  // Auto-submit on mount, or switch to "Pick profile"
  React.useEffect(() => {
    if (!email) {
      setStatus(STATUS.ERROR);
    } else {
      // Directly submit the confirmation
      setStatus(STATUS.SUBMITTING);
      confirmGuestAccount();
    }
  }, []);

  return (
    <Page title={intl.formatMessage(MESSAGES.pageTitle)}>
      <Container
        display="flex"
        py={[5, 6, 150]}
        px={2}
        flexDirection="column"
        alignItems="center"
        background="linear-gradient(180deg, #EBF4FF, #FFFFFF)"
      >
        {status === STATUS.SUBMITTING && (
          <Fragment>
            <div className="my-3">
              <Email size={42} color={theme.colors.primary[500]} />
            </div>
            <MessageBox type="info" isLoading>
              <FormattedMessage id="confirmEmail.validating" defaultMessage="Validating your email address..." />
            </MessageBox>
          </Fragment>
        )}
        {status === STATUS.SUCCESS && (
          <Fragment>
            <Container mb={3} pb={3} px={4} textAlign="center" boxShadow="0px 8px 8px -10px rgb(146 146 146 / 40%)">
              <div className="my-3">
                <Email size={42} color={theme.colors.green[500]} />
              </div>
              <strong>
                <FormattedMessage id="confirmEmail.success" defaultMessage="Your email has been confirmed" />
              </strong>
            </Container>
            <Container textAlign="center" p={2}>
              <div className="my-2">
                <StyledSpinner size={32} />
              </div>
              {data?.confirmGuestAccount?.account && (
                <P fontSize="13px" lineHeight="18px" textAlign="center">
                  <FormattedMessage id="confirmGuest.redirecting" defaultMessage="Redirecting to your profile..." />
                  <br />
                  <FormattedMessage
                    id="confirmGuest.dontWait"
                    defaultMessage="If you don't wish to wait, click <Link>here</Link>."
                    values={{
                      Link: getI18nLink({
                        as: Link,
                        href: `/${data.confirmGuestAccount?.account.slug}`,
                      }),
                    }}
                  />
                </P>
              )}
            </Container>
          </Fragment>
        )}
        {status === STATUS.ERROR && (
          <Fragment>
            <div className="my-3">
              <Email size={42} color={theme.colors.red[500]} />
            </div>
            <MessageBoxGraphqlError error={error} />
          </Fragment>
        )}
      </Container>
    </Page>
  );
};

ConfirmGuestPage.getInitialProps = ({ req: { query } }) => {
  return { token: query.token, email: query.email };
};

// next.js export
// ts-unused-exports:disable-next-line
export default ConfirmGuestPage;
