import React from 'react';
import { ApolloProvider } from '@apollo/client';
import { IntlProvider } from 'react-intl';
import { ThemeProvider } from 'styled-components';

import { initClient } from '../lib/apollo-client';
import theme from '../lib/theme';
import { RouterContext } from 'next/dist/shared/lib/router-context.shared-runtime';

import { Toaster } from '../components/ui/Toaster';
import { TooltipProvider } from '../components/ui/Tooltip';
import UserProvider from '../components/UserProvider';

import 'react-pdf/dist/esm/Page/TextLayer.css';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'nprogress/nprogress.css';
import 'trix/dist/trix.css';
import '../public/static/styles/app.css';

// config file
// ts-unused-exports:disable-next-line
export const parameters = {
  actions: { argTypesRegex: '^on[A-Z].*' },
  nextRouter: {
    Provider: RouterContext.Provider,
  },
};

// config file
// ts-unused-exports:disable-next-line
export const decorators = [
  Story => (
    <ApolloProvider client={initClient()}>
      <ThemeProvider theme={theme}>
        <IntlProvider locale="en">
          <UserProvider>
            <TooltipProvider>
              <Story />
              <Toaster />
            </TooltipProvider>
          </UserProvider>
        </IntlProvider>
      </ThemeProvider>
    </ApolloProvider>
  ),
];
