import React from 'react';
import { ExclamationTriangle } from '@styled-icons/fa-solid/ExclamationTriangle';
import { useRouter } from 'next/router';
import { FormattedMessage } from 'react-intl';
import { isURL } from 'validator';

import { isRelativeHref, isTrustedRedirectURL } from '../lib/url-helpers';
import { isValidRelativeUrl, parseToBoolean } from '../lib/utils';

import Container from '../components/Container';
import Link from '../components/Link';
import Loading from '../components/Loading';
import Page from '../components/Page';
import StyledButton from '../components/StyledButton';
import StyledCard from '../components/StyledCard';
import StyledHr from '../components/StyledHr';
import { H3, P, Span, Strong } from '../components/Text';

// Make sure fallback is an internal link
const getFallback = fallback => {
  if (!fallback || !isRelativeHref(fallback)) {
    return '/';
  } else {
    return fallback;
  }
};

export const isValidExternalRedirect = url => {
  // Default params: { protocols: ['http','https','ftp'], require_tld: true, require_protocol: false, require_host: true, require_port: false, require_valid_protocol: true, allow_underscores: false, host_whitelist: false, host_blacklist: false, allow_trailing_dot: false, allow_protocol_relative_urls: false, allow_fragments: true, allow_query_components: true, disallow_auth: false, validate_length: true }
  const validationParams = {};
  validationParams['protocols'] = ['http', 'https'];
  if (process.env.NODE_ENV !== 'production') {
    validationParams['require_tld'] = false;
  }

  return url && isURL(url, validationParams);
};

const shouldRedirectDirectly = urlStr => {
  try {
    const parsedUrl = new URL(urlStr);
    return isTrustedRedirectURL(parsedUrl.host);
  } catch {
    return false;
  }
};

/**
 * A page to use whenever you need to redirect to a page that may be external to Open Collective.
 * The page displays a confirmation to make sure that user is aware of being redirected, to prevent
 * phishing attacks.
 */
const ExternalRedirectPage = () => {
  const router = useRouter();
  const [isReady, setReady] = React.useState(false);
  const [pendingAction, setPendingAction] = React.useState(false);
  const query = router?.query || {};
  const fallback = getFallback(query.fallback);
  const shouldRedirectParent = parseToBoolean(query.shouldRedirectParent);

  React.useEffect(() => {
    if (router && !query.url) {
      router.push(fallback);
    } else if (isValidRelativeUrl(query.url)) {
      router.push(query.url);
    } else if (!isValidExternalRedirect(query.url)) {
      router.push(fallback);
    } else if (shouldRedirectDirectly(query.url)) {
      if (shouldRedirectParent) {
        window.parent.location.href = query.url;
      } else {
        router.push(query.url);
      }
    } else {
      setReady(true);
    }
  }, [router, query.url]);

  return (
    <Page noRobots>
      <div className="flex items-center justify-center py-4 sm:py-5 lg:py-6">
        {isReady ? (
          <StyledCard maxWidth={450}>
            <Container p={3}>
              <H3 fontSize="16px" lineHeight="15px" fontWeight="bold" my={2}>
                <ExclamationTriangle data-type="message-icon" size="1em" color="#CCCC18" />
                <Span ml={2} css={{ verticalAlign: 'middle' }}>
                  <FormattedMessage id="PleaseBeCareful" defaultMessage="Please be careful" />
                </Span>
              </H3>
              <StyledHr my={2} borderColor="black.300" />
              <P fontSize="14px" lineHeight="20px" my={3}>
                <FormattedMessage
                  id="externalRedirect.message"
                  defaultMessage="Your request is currently being redirected to {redirect}. For the safety and privacy of your Open Collective account, remember to never enter your credentials unless you're on the real Open Collective website."
                  values={{ redirect: <Strong wordBreak="break-all">{query.url}</Strong> }}
                />
              </P>
            </Container>
            <Container className="flex justify-end bg-[#F7F8FA] p-1">
              <a
                href={query.url}
                onClick={e => {
                  setPendingAction('REDIRECT');
                  if (shouldRedirectParent) {
                    e.preventDefault();
                    window.parent.location.href = query.url;
                  }
                }}
              >
                <StyledButton
                  buttonSize="small"
                  my={2}
                  minWidth={140}
                  buttonStyle="primary"
                  loading={pendingAction === 'REDIRECT'}
                  disabled={pendingAction}
                >
                  <FormattedMessage id="actions.continue" defaultMessage="Continue" />
                </StyledButton>
              </a>
              <Link href={fallback} onClick={() => setPendingAction('CANCEL')}>
                <StyledButton
                  buttonSize="small"
                  m={2}
                  minWidth={140}
                  data-cy="confirmation-modal-cancel"
                  loading={pendingAction === 'CANCEL'}
                  disabled={pendingAction}
                >
                  <FormattedMessage id="actions.cancel" defaultMessage="Cancel" />
                </StyledButton>
              </Link>
            </Container>
          </StyledCard>
        ) : (
          <Loading />
        )}
      </div>
    </Page>
  );
};

// next.js export
// ts-unused-exports:disable-next-line
export default ExternalRedirectPage;
