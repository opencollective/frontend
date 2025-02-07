import React from 'react';
import PropTypes from 'prop-types';
import { Email } from '@styled-icons/material/Email';
import { FormattedMessage } from 'react-intl';

import Container from '../components/Container';
import MessageBox from '../components/MessageBox';
import Page from '../components/Page';
import { withUser } from '../components/UserProvider';

/**
 * Email Unsubscription page.
 */
class UnsubscribeEmail extends React.Component {
  static getInitialProps({ query }) {
    return { email: query.email, slug: query.slug, type: query.type, token: query.token };
  }

  static propTypes = {
    /** Unsubscription email, given in URL */
    email: PropTypes.string.isRequired,
    /** Collective slug, given in URL */
    slug: PropTypes.string.isRequired,
    /** Emails type to unsubscribe ex:collective.monthlyReport, given in URL */
    type: PropTypes.string.isRequired,
    /** Unsubscription token, given in URL */
    token: PropTypes.string.isRequired,
  };

  constructor(props) {
    super(props);
    this.state = {
      state: 'unsubscribing',
    };
  }

  async componentDidMount() {
    let state, errorMessage, response;
    await fetch(
      `/api/services/email/unsubscribe/${this.props.email}/${this.props.slug}/${this.props.type}/${this.props.token}`,
    ).then(res => {
      response = res.json();
    });
    response.then(res => {
      if (res.error) {
        state = 'error';
        errorMessage = res.error.message;
      } else {
        state = 'success';
      }
      this.setState({ state: state, errorMessage: errorMessage });
    });
  }

  getIconColor(state) {
    if (state === 'success') {
      return '#00A34C';
    } else if (state === 'error') {
      return '#CC1836';
    }
  }

  render() {
    return (
      <Page title="Unsubscribe Email">
        <Container
          display="flex"
          py={[5, 6]}
          px={2}
          flexDirection="column"
          alignItems="center"
          background="linear-gradient(180deg, #EBF4FF, #FFFFFF)"
        >
          <div className="my-3">
            <Email size={42} color={this.getIconColor(this.state.state)} />
          </div>
          {this.state.state === 'success' && (
            <MessageBox mb={3} type="success" withIcon>
              <FormattedMessage id="unsubscribe.success" defaultMessage="You've unsubscribed successfully!" />
            </MessageBox>
          )}
          {this.state.state === 'unsubscribing' && (
            <MessageBox mb={3} type="white" withIcon>
              <FormattedMessage id="unsubscribe.unsubscribing" defaultMessage="Unsubscribing your email..." />
            </MessageBox>
          )}
          {this.state.state === 'error' && (
            <MessageBox mb={3} type="error" withIcon>
              <span>{this.state.errorMessage}</span>
            </MessageBox>
          )}
        </Container>
      </Page>
    );
  }
}

// next.js export
// ts-unused-exports:disable-next-line
export default withUser(UnsubscribeEmail);
