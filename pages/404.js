import React from 'react';

import Container from '../components/Container';
import NotFound from '../components/NotFound';
import Page from '../components/Page';

// next.js export
// ts-unused-exports:disable-next-line
export default function Custom404() {
  return (
    <Page data-cy="error-page">
      <Container className="py-5 md:py-6">
        <NotFound />
      </Container>
    </Page>
  );
}
