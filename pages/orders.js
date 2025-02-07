import React from 'react';
import PropTypes from 'prop-types';

import { addCollectiveNavbarData } from '../lib/graphql/queries';

import CollectiveNavbar from '../components/collective-navbar';
import OrdersWithData from '../components/orders/OrdersWithData';
import Page from '../components/Page';
import { withUser } from '../components/UserProvider';

class OrdersPage extends React.Component {
  static getInitialProps({ query: { collectiveSlug, filter, value } }) {
    return { slug: collectiveSlug, filter, value };
  }

  static propTypes = {
    slug: PropTypes.string, // for addCollectiveNavbarData
    data: PropTypes.shape({
      account: PropTypes.object,
      loading: PropTypes.bool,
    }).isRequired, // from withData
    LoggedInUser: PropTypes.object,
  };

  render() {
    const { slug, data, LoggedInUser } = this.props;
    const collective = data?.account;
    return (
      <Page>
        {(data?.loading || data?.account) && (
          <div className="mb-4">
            <CollectiveNavbar
              isLoading={data.loading}
              collective={data.account}
              isAdmin={LoggedInUser?.isAdminOfCollective(collective)}
            />
          </div>
        )}
        <div className="py-4">
          <OrdersWithData accountSlug={slug} />
        </div>
      </Page>
    );
  }
}

// next.js export
// ts-unused-exports:disable-next-line
export default withUser(addCollectiveNavbarData(OrdersPage));
