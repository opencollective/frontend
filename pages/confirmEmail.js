import React from 'react';
import PropTypes from 'prop-types';
import { graphql } from '@apollo/client/react/hoc';
import { Email } from '@styled-icons/material/Email';
import { get } from 'lodash';
import { FormattedMessage } from 'react-intl';

import { gqlV1 } from '../lib/graphql/helpers';

import Container from '../components/Container';
import { Box } from '../components/Grid';
import MessageBox from '../components/MessageBox';
import Page from '../components/Page';
import { withUser } from '../components/UserProvider';

class ConfirmEmailPage extends React.Component {
  static getInitialProps({ query }) {
    return { token: query.token };
  }

  static propTypes = {
    /** Token to validate, given in URL */
    token: PropTypes.string.isRequired,
    // from graphql
    confirmUserEmail: PropTypes.func.isRequired,
    // from withUser
    loadingLoggedInUser: PropTypes.bool.isRequired,
    // from withUser
    refetchLoggedInUser: PropTypes.func.isRequired,
  };

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
      await this.props.confirmUserEmail({ variables: { token: this.props.token } });
      setTimeout(this.props.refetchLoggedInUser, 3000);
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
          <Box my={3}>
            <Email size={42} color={this.getIconColor(status)} />
          </Box>
          {status === 'submitting' && (
            <MessageBox type="info" isLoading>
              <FormattedMessage id="confirmEmail.validating" defaultMessage="Validating your email address..." />
            </MessageBox>
          )}
          {status === 'success' && (
            <MessageBox mb={3} type="success" withIcon>
              <FormattedMessage id="confirmEmail.sucess" defaultMessage="Your email has been changed" />
            </MessageBox>
          )}
          {status === 'error' && (
            <MessageBox type="error" withIcon>
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

const confirmUserEmailMutation = gqlV1/* GraphQL */ `
  mutation ConfirmUserEmail($token: String!) {
    confirmUserEmail(token: $token) {
      id
      email
      emailWaitingForValidation
    }
  }
`;

const addConfirmUserEmailMutation = graphql(confirmUserEmailMutation, {
  name: 'confirmUserEmail',
});

// next.js export
// ts-unused-exports:disable-next-line
export default withUser(addConfirmUserEmailMutation(ConfirmEmailPage));
