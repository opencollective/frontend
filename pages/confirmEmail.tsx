import React from 'react';
import type { MutationFunction } from '@apollo/client';
import { graphql } from '@apollo/client/react/hoc';
import { Email } from '@styled-icons/material/Email';
import { get } from 'lodash';
import { ArrowLeft } from 'lucide-react';
import { FormattedMessage } from 'react-intl';

import { API_V2_CONTEXT, gql } from '../lib/graphql/helpers';
import type { Mutation, MutationConfirmEmailArgs } from '../lib/graphql/types/v2/schema';
import type { UserContextProps } from '../lib/hooks/useLoggedInUser';

import Container from '../components/Container';
import Link from '../components/Link';
import MessageBox from '../components/MessageBox';
import Page from '../components/Page';
import { Button } from '../components/ui/Button';
import { withUser } from '../components/UserProvider';

class ConfirmEmailPage extends React.Component<{
  token: string;
  loadingLoggedInUser: boolean;
  confirmEmail: MutationFunction<{ confirmEmail: Mutation['confirmEmail'] }, MutationConfirmEmailArgs>;
  refetchLoggedInUser: UserContextProps['refetchLoggedInUser'];
  login: UserContextProps['login'];
}> {
  static getInitialProps({ query }) {
    return { token: query.token };
  }

  state = { status: 'submitting', error: null, validationTriggered: false };

  componentDidMount() {
    if (!this.props.loadingLoggedInUser) {
      this.triggerEmailValidation();
    }
  }

  componentDidUpdate() {
    if (!this.state.validationTriggered && !this.props.loadingLoggedInUser) {
      this.triggerEmailValidation();
    }
  }

  /**
   * The reason for the logic around the trigger of this function is that `refetchLoggedInUser`
   * will not be effective if user is already loading (Apollo discards duplicate queries).
   */
  async triggerEmailValidation() {
    try {
      this.setState({ validationTriggered: true });
      const result = await this.props.confirmEmail({ variables: { token: this.props.token } });
      if (result.data.confirmEmail.sessionToken) {
        await this.props.login(result.data.confirmEmail.sessionToken);
      } else {
        await this.props.refetchLoggedInUser();
      }

      this.setState({ status: 'success' });
    } catch (e) {
      const error = get(e, 'graphQLErrors.0') || e;
      this.setState({ status: 'error', error: error });
    }
  }

  getIconColor(status) {
    if (status === 'submitting') {
      return '#3385FF';
    } else if (status === 'error') {
      return '#CC1836';
    } else {
      return '#00A34C';
    }
  }

  render() {
    const { status, error } = this.state;

    return (
      <Page title="Email confirmation">
        <Container
          display="flex"
          py={[5, 6]}
          px={2}
          flexDirection="column"
          alignItems="center"
          background="linear-gradient(180deg, #EBF4FF, #FFFFFF)"
        >
          <div className="my-3">
            <Email size={42} color={this.getIconColor(status)} />
          </div>
          {status === 'submitting' && (
            <MessageBox fontSize="16px" type="info" isLoading>
              <FormattedMessage id="confirmEmail.validating" defaultMessage="Validating your email address..." />
            </MessageBox>
          )}
          {status === 'success' && (
            <React.Fragment>
              <MessageBox fontSize="16px" mb={4} type="success" withIcon>
                <FormattedMessage id="confirmEmail.sucess" defaultMessage="Your email has been changed" />
              </MessageBox>
              <Link href="/dashboard">
                <Button variant="outline">
                  <ArrowLeft size={16} />
                  <FormattedMessage defaultMessage="Go back to your Dashboard" id="ReeYyf" />
                </Button>
              </Link>
            </React.Fragment>
          )}
          {status === 'error' && (
            <MessageBox fontSize="16px" type="error" withIcon>
              {error.extensions?.code === 'INVALID_TOKEN' ? (
                <FormattedMessage
                  id="confirmEmail.error.InvalidToken"
                  defaultMessage="The confirmation link is invalid or has expired"
                />
              ) : (
                error.message
              )}
            </MessageBox>
          )}
        </Container>
      </Page>
    );
  }
}

const confirmUserEmailMutation = gql`
  mutation ConfirmEmail($token: NonEmptyString!) {
    confirmEmail(token: $token) {
      sessionToken
      individual {
        id
        email
      }
    }
  }
`;

const addConfirmUserEmailMutation = graphql(confirmUserEmailMutation, {
  name: 'confirmEmail',
  options: {
    context: API_V2_CONTEXT,
  },
});

// next.js export
// ts-unused-exports:disable-next-line
export default addConfirmUserEmailMutation(withUser(ConfirmEmailPage));
