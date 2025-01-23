// This file is mostly adapted from:
// https://github.com/zeit/next.js/blob/3949c82bdfe268f841178979800aa8e71bbf412c/examples/with-apollo/lib/withData.js

import React from 'react';
import PropTypes from 'prop-types';
import { getDataFromTree } from '@apollo/client/react/ssr';

import { withTwoFactorAuthentication } from './two-factor-authentication/TwoFactorAuthenticationContext';
import { APOLLO_STATE_PROP_NAME, initClient } from './apollo-client';
import { compose } from './utils';

// Gets the display name of a JSX component for dev tools
function getComponentDisplayName(Component) {
  return Component.displayName || Component.name || 'Unknown';
}

const withData = ComposedComponent => {
  return class WithData extends React.Component {
    static async getInitialProps(context) {
      const { Component } = context;

      const client =
        context.req?.apolloClient ||
        initClient({
          initialState: window?.__NEXT_DATA__?.props?.[APOLLO_STATE_PROP_NAME],
        });

      // Evaluate the composed component's getInitialProps()
      let composedInitialProps = {};
      if (ComposedComponent.getInitialProps) {
        composedInitialProps = await ComposedComponent.getInitialProps({ ...context });
      }

      try {
        // Run all GraphQL queries
        const skipDataFromTree = composedInitialProps['pageProps']?.skipDataFromTree || false;
        if (!skipDataFromTree) {
          await getDataFromTree(<ComposedComponent Component={Component} {...composedInitialProps} />, { client });
        }
      } catch (error) {
        // Prevent Apollo Client GraphQL errors from crashing SSR.
        // Handle them in components via the data.error prop:
        // http://dev.apollodata.com/react/api-queries.html#graphql-query-data-error
        // if (process.env.DEBUG) {
        // // eslint-disable-next-line no-console
        console.error('>>> apollo error: ', error);
        throw error;
        // }
      }

      return {
        [APOLLO_STATE_PROP_NAME]: client.cache.extract(),
        ...composedInitialProps,
      };
    }

    static displayName = `WithData(${getComponentDisplayName(ComposedComponent)})`;

    static propTypes = {
      options: PropTypes.object,
      twoFactorAuthContext: PropTypes.object,
    };

    constructor(props) {
      super(props);
    }

    render() {
      return <ComposedComponent {...this.props} />;
    }
  };
};

export default compose(withTwoFactorAuthentication, withData);
