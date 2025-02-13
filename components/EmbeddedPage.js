import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import styled, { createGlobalStyle } from 'styled-components';
import { color } from 'styled-system';

import Header from '../components/Header';

import { withUser } from './UserProvider';

const GlobalStyles = createGlobalStyle`
  body {
    overflow-y: auto;
  }
  body > div:first-child {
    height: 100%;
  }
`;

const Main = styled.main`
  margin: 0;
  padding: 0;
  height: 100%;
  ${color}
`;

/**
 * A special component to render embedded pages, that makes sure we add the "no-robot" meta
 * and that the footer/topbar will not be displayed, while preserving the normal DOM structure
 * and meta.
 */
const EmbeddedPage = ({ children, description, title, canonicalURL, collective, backgroundColor }) => {
  return (
    <Fragment>
      <GlobalStyles />
      <Header
        title={title}
        description={description}
        canonicalURL={canonicalURL}
        collective={collective}
        withTopBar={false}
        noRobots
      />
      <Main backgroundColor={backgroundColor}>{children}</Main>
    </Fragment>
  );
};

EmbeddedPage.propTypes = {
  children: PropTypes.node,
  description: PropTypes.string,
  backgroundColor: PropTypes.string,
  canonicalURL: PropTypes.string,
  loadingLoggedInUser: PropTypes.bool,
  title: PropTypes.string,
  collective: PropTypes.object,
};

export default withUser(EmbeddedPage);
