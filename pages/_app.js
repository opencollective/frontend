import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { ApolloProvider } from '@apollo/client';
import { polyfill as PolyfillInterweaveSSR } from 'interweave-ssr';
import App from 'next/app';
import Router from 'next/router';
import NProgress from 'nprogress';
import { ThemeProvider } from 'styled-components';

import '../lib/dayjs'; // Import first to make sure plugins are initialized
import '../lib/analytics/plausible';
import { getIntlProps } from '../lib/i18n/request';
import theme from '../lib/theme';
import defaultColors from '../lib/theme/colors';

import DefaultPaletteStyle from '../components/DefaultPaletteStyle';
import StripeProviderSSR from '../components/StripeProvider';
import TwoFactorAuthenticationModal from '../components/two-factor-authentication/TwoFactorAuthenticationModal';
import { Toaster } from '../components/ui/Toaster';
import UserProvider from '../components/UserProvider';
import { WorkspaceProvider } from '../components/WorkspaceProvider';

import 'react-pdf/dist/esm/Page/TextLayer.css';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'nprogress/nprogress.css';
import 'trix/dist/trix.css';
import '../public/static/styles/app.css';
import 'react-lite-youtube-embed/dist/LiteYouTubeEmbed.css';

Router.onRouteChangeStart = (url, { shallow }) => {
  if (!shallow) {
    NProgress.start();
  }
};

Router.onRouteChangeComplete = () => NProgress.done();

Router.onRouteChangeError = () => NProgress.done();

import { getDataFromTree } from '@apollo/client/react/ssr';
import { mergeDeep } from '@apollo/client/utilities';
import memoizeOne from 'memoize-one';

import { APOLLO_STATE_PROP_NAME, initClient } from '../lib/apollo-client';
import { getTokenFromCookie } from '../lib/auth';
import { getGoogleMapsScriptUrl, loadGoogleMaps } from '../lib/google-maps';
import { loggedInUserQuery } from '../lib/graphql/v1/queries';
import LoggedInUser from '../lib/LoggedInUser';
import { withTwoFactorAuthentication } from '../lib/two-factor-authentication/TwoFactorAuthenticationContext';
import sentryLib, { Sentry } from '../server/sentry';

import GlobalNewsAndUpdates from '../components/GlobalNewsAndUpdates';
import IntlProvider from '../components/intl/IntlProvider';
import { ModalProvider } from '../components/ModalContext';
import NewsAndUpdatesProvider from '../components/NewsAndUpdatesProvider';
import { TooltipProvider } from '../components/ui/Tooltip';

if (typeof window === 'undefined') {
  PolyfillInterweaveSSR();
}

class OpenCollectiveFrontendApp extends App {
  static propTypes = {
    twoFactorAuthContext: PropTypes.object,
    pageProps: PropTypes.object.isRequired,
    scripts: PropTypes.object.isRequired,
    locale: PropTypes.string,
    messages: PropTypes.object,
  };

  constructor() {
    super(...arguments);
    this.state = { hasError: false, errorEventId: undefined };
  }

  static async getInitialProps({ AppTree, Component, ctx }) {
    const apolloClient = initClient({
      accessToken: getTokenFromCookie(ctx.req),
    });

    if (ctx.req) {
      ctx.req.apolloClient = apolloClient;
    }

    const props = { pageProps: { skipDataFromTree: true }, scripts: {}, ...getIntlProps(ctx) };

    try {
      if (Component.getInitialProps) {
        props.pageProps = await Component.getInitialProps({ ...ctx });
      }

      if (props.pageProps.scripts) {
        if (props.pageProps.scripts.googleMaps) {
          if (ctx.req) {
            props.scripts['google-maps'] = getGoogleMapsScriptUrl();
          } else {
            try {
              await loadGoogleMaps();
            } catch (e) {
              // eslint-disable-next-line no-console
              console.error(e);
            }
          }
        }
      }
    } catch (error) {
      return { ...props, hasError: true, errorEventId: sentryLib.captureException(error, ctx) };
    }

    if (typeof window === 'undefined' && ctx.req.cookies.enableAuthSsr) {
      if (getTokenFromCookie(ctx.req)) {
        try {
          const result = await apolloClient.query({ query: loggedInUserQuery, fetchPolicy: 'network-only' });
          props.LoggedInUserData = result.data.LoggedInUser;
        } catch (err) {
          Sentry.captureException(err);
        }
      }

      try {
        await getDataFromTree(<AppTree {...props} apolloClient={apolloClient} />);
      } catch (err) {
        Sentry.captureException(err);
      }
    }

    return props;
  }

  static getDerivedStateFromProps(props, state) {
    // If there was an error generated within getInitialProps, and we haven't
    // yet seen an error, we add it to this.state here
    return {
      hasError: props.hasError || state.hasError || false,
      errorEventId: props.errorEventId || state.errorEventId || undefined,
    };
  }

  componentDidCatch(error, errorInfo) {
    const errorEventId = sentryLib.captureException(error, { extra: { errorInfo } });
    this.setState({ hasError: true, errorEventId });
  }

  componentDidMount() {
    Router.events.on('routeChangeComplete', url => {
      if (window && window._paq) {
        if (url.match(/\/signin\/sent/)) {
          window._paq.push(['setCustomUrl', '/signin/sent']);
        } else {
          window._paq.push(['setCustomUrl', url]);
        }
        window._paq.push(['trackPageView']);
      }
    });

    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.log('ssr apollo cache', window?.__NEXT_DATA__?.props?.[APOLLO_STATE_PROP_NAME]);
    }
  }

  getApolloClient = memoizeOne((ssrCache, pageServerSidePropsCache) => {
    return initClient({
      initialState: mergeDeep(ssrCache || {}, pageServerSidePropsCache || {}),
      twoFactorAuthContext: this.props.twoFactorAuthContext,
    });
  });

  render() {
    const { Component, pageProps, scripts, locale, LoggedInUserData } = this.props;

    if (
      typeof window !== 'undefined' &&
      process.env.NODE_ENV === 'development' &&
      pageProps?.[APOLLO_STATE_PROP_NAME]
    ) {
      // eslint-disable-next-line no-console
      console.log('pageProps apollo cache', pageProps?.[APOLLO_STATE_PROP_NAME]);
    }

    return (
      <Fragment>
        <ApolloProvider
          client={
            this.props.apolloClient ||
            this.getApolloClient(
              typeof window !== 'undefined' ? window?.__NEXT_DATA__?.props?.[APOLLO_STATE_PROP_NAME] : {},
              pageProps?.[APOLLO_STATE_PROP_NAME],
            )
          }
        >
          <ThemeProvider theme={theme}>
            <StripeProviderSSR>
              <IntlProvider locale={locale}>
                <TooltipProvider delayDuration={500} skipDelayDuration={100}>
                  <UserProvider initialLoggedInUser={LoggedInUserData ? new LoggedInUser(LoggedInUserData) : null}>
                    <WorkspaceProvider>
                      <ModalProvider>
                        <NewsAndUpdatesProvider>
                          <Component {...pageProps} />
                          <Toaster />
                          <GlobalNewsAndUpdates />
                          <TwoFactorAuthenticationModal />
                        </NewsAndUpdatesProvider>
                      </ModalProvider>
                    </WorkspaceProvider>
                  </UserProvider>
                </TooltipProvider>
              </IntlProvider>
            </StripeProviderSSR>
          </ThemeProvider>
        </ApolloProvider>
        <DefaultPaletteStyle palette={defaultColors.primary} />
        {Object.keys(scripts).map(key => (
          <script key={key} type="text/javascript" src={scripts[key]} />
        ))}
      </Fragment>
    );
  }
}

// next.js export
// ts-unused-exports:disable-next-line
// ts-unused-exports:disable-next-line
export default withTwoFactorAuthentication(OpenCollectiveFrontendApp);
