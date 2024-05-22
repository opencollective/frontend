import React from 'react';
import PropTypes from 'prop-types';
import { graphql } from '@apollo/client/react/hoc';
import { ArrowBack } from '@styled-icons/boxicons-regular/ArrowBack';
import { withRouter } from 'next/router';
import { defineMessages, FormattedMessage, injectIntl } from 'react-intl';
import styled from 'styled-components';

import { API_V2_CONTEXT, gql } from '../lib/graphql/helpers';
import { addCollectiveNavbarData } from '../lib/graphql/queries';
import { addParentToURLIfMissing, getCollectivePageCanonicalURL, getCollectivePageRoute } from '../lib/url-helpers';
import { compose } from '../lib/utils';

import Body from '../components/Body';
import CollectiveNavbar from '../components/collective-navbar';
import { getUpdatesSectionQueryVariables, updatesSectionQuery } from '../components/collective-page/sections/Updates';
import Container from '../components/Container';
import EditUpdateForm from '../components/EditUpdateForm';
import ErrorPage from '../components/ErrorPage';
import { Box, Flex } from '../components/Grid';
import Header from '../components/Header';
import Link from '../components/Link';
import Loading from '../components/Loading';
import MessageBox from '../components/MessageBox';
import Footer from '../components/navigation/Footer';
import StyledButton from '../components/StyledButton';
import StyledButtonSet from '../components/StyledButtonSet';
import { H1 } from '../components/Text';
import { withUser } from '../components/UserProvider';

import { getUpdatesVariables, updatesPageQuery } from './updates';

const BackButtonWrapper = styled(Container)`
  position: relative;
  color: #71757a;
`;

const CreateUpdateWrapper = styled(Flex)`
  max-width: 1400px;
  margin: 32px auto;
  grid-gap: 64px;
  padding: 0 16px;
  align-items: baseline;
  @media (max-width: 830px) {
    flex-direction: column;
    grid-gap: 32px;
    padding: 0 8px;
  }
`;

const UPDATE_TYPE_MSGS = defineMessages({
  changelog: { id: 'update.type.changelog', defaultMessage: 'Changelog Entry' },
  normal: {
    id: 'update.type.normal',
    defaultMessage: 'Normal Update',
  },
});

class CreateUpdatePage extends React.Component {
  static getInitialProps({ query: { collectiveSlug } }) {
    return { slug: collectiveSlug };
  }

  static propTypes = {
    slug: PropTypes.string, // for addCollectiveNavbarData
    createUpdate: PropTypes.func, // from addMutation/createUpdateQuery
    data: PropTypes.shape({
      account: PropTypes.object,
    }).isRequired, // from withData
    LoggedInUser: PropTypes.object,
    loadingLoggedInUser: PropTypes.bool,
    router: PropTypes.object,
    intl: PropTypes.object.isRequired,
  };

  constructor(props) {
    super(props);
    this.state = {
      update: {},
      status: '',
      error: '',
      updateType: props.data?.account?.slug === 'opencollective' ? 'changelog' : 'normal',
    };
  }

  componentDidMount() {
    const { router, data } = this.props;
    const account = data?.account;
    addParentToURLIfMissing(router, account, '/updates/new');
  }

  componentDidUpdate(prevProps) {
    if (prevProps.data?.account !== this.props.data?.account) {
      const account = this.props.data?.account;
      if (account?.slug === 'opencollective' && this.state.updateType === 'normal') {
        this.setState({ updateType: 'changelog' });
      }
    }
  }

  createUpdate = async update => {
    const { data } = this.props;
    const { account } = data;

    this.setState({ error: '', status: 'submitting' });

    try {
      update.account = { id: account.id };
      update.isChangelog = this.isChangelog();
      if (update.isChangelog) {
        update.isPrivate = false;
      }
      const res = await this.props.createUpdate({
        variables: { update },
        refetchQueries: [
          {
            query: updatesPageQuery,
            context: API_V2_CONTEXT,
            variables: getUpdatesVariables(this.props.slug),
          },
          {
            query: updatesSectionQuery,
            context: API_V2_CONTEXT,
            variables: getUpdatesSectionQueryVariables(this.props.slug, true),
          },
        ],
      });
      this.setState({ isModified: false });
      return this.props.router.push(`${getCollectivePageRoute(account)}/updates/${res.data.createUpdate.slug}`);
    } catch (e) {
      this.setState({ status: 'error', error: e.message });
    }
  };

  handleChange = (attr, value) => {
    const update = this.state.update;
    update[attr] = value;
    this.setState({ update, isModified: true });
  };

  isChangelog = () => {
    return this.state.updateType === 'changelog';
  };

  render() {
    const { data, LoggedInUser, loadingLoggedInUser, intl } = this.props;

    if (!data.account) {
      return <ErrorPage data={data} />;
    }

    const collective = data.account;
    const isAdmin = LoggedInUser && LoggedInUser.isAdminOfCollective(collective);

    return (
      <div>
        <Header
          collective={collective}
          LoggedInUser={LoggedInUser}
          canonicalURL={`${getCollectivePageCanonicalURL(collective)}/updates/new`}
        />

        <Body>
          <CollectiveNavbar collective={collective} isAdmin={isAdmin} />
          {loadingLoggedInUser ? (
            <Loading />
          ) : (
            <CreateUpdateWrapper>
              <BackButtonWrapper>
                <Link href={`/${collective.slug}/updates`}>
                  <Container display="flex" color="#71757A" fontSize="14px" alignItems="center">
                    <ArrowBack size={18} />
                    <Box as="span" mx={2}>
                      <FormattedMessage id="Back" defaultMessage="Back" />
                    </Box>
                  </Container>
                </Link>
              </BackButtonWrapper>
              <Container width={1} maxWidth={680}>
                {!isAdmin && (
                  <div className="login">
                    <p>
                      <FormattedMessage
                        id="updates.create.login"
                        defaultMessage="You need to be logged in as an admin of this collective to be able to create an update."
                      />
                    </p>
                    <p>
                      <StyledButton buttonStyle="primary" href={`/signin?next=/${collective.slug}/updates/new`}>
                        <FormattedMessage id="signIn" defaultMessage="Sign In" />
                      </StyledButton>
                    </p>
                  </div>
                )}
                {isAdmin && (
                  <Container my={3}>
                    <H1 textAlign="left" fontSize="34px">
                      <FormattedMessage id="updates.new.title" defaultMessage="New update" />
                    </H1>
                  </Container>
                )}
                {collective.slug === 'opencollective' && isAdmin && (
                  <StyledButtonSet
                    size="medium"
                    items={Object.keys(UPDATE_TYPE_MSGS)}
                    selected={this.state.updateType}
                    onChange={value => this.setState({ updateType: value })}
                  >
                    {({ item }) => intl.formatMessage(UPDATE_TYPE_MSGS[item])}
                  </StyledButtonSet>
                )}
                {isAdmin && (
                  <EditUpdateForm
                    collective={collective}
                    onSubmit={this.createUpdate}
                    isChangelog={this.isChangelog()}
                  />
                )}
                {this.state.status === 'error' && (
                  <MessageBox type="error" withIcon>
                    <FormattedMessage
                      id="updates.new.error"
                      defaultMessage="Update failed: {err}"
                      values={{ err: this.state.error }}
                    />
                  </MessageBox>
                )}
              </Container>
            </CreateUpdateWrapper>
          )}
        </Body>
        <Footer />
      </div>
    );
  }
}

const createUpdateMutation = gql`
  mutation CreateUpdate($update: UpdateCreateInput!) {
    createUpdate(update: $update) {
      id
      slug
      title
      summary
      html
      createdAt
      publishedAt
      updatedAt
      tags
      isPrivate
      isChangelog
      makePublicOn
      account {
        id
        slug
      }
      fromAccount {
        id
        type
        name
        slug
      }
    }
  }
`;

const addCreateUpdateMutation = graphql(createUpdateMutation, {
  name: 'createUpdate',
  options: {
    context: API_V2_CONTEXT,
  },
});

const addGraphql = compose(addCollectiveNavbarData, addCreateUpdateMutation);

// next.js export
// ts-unused-exports:disable-next-line
export default withUser(addGraphql(withRouter(injectIntl(CreateUpdatePage))));
