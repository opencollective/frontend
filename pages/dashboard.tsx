import React from 'react';
import { useQuery } from '@apollo/client';
import { useRouter } from 'next/router';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import { isHostAccount, isIndividualAccount } from '../lib/collective';
import roles from '../lib/constants/roles';
import { API_V2_CONTEXT } from '../lib/graphql/helpers';
import useLoggedInUser from '../lib/hooks/useLoggedInUser';
import { require2FAForAdmins } from '../lib/policies';
import { PREVIEW_FEATURE_KEYS } from '../lib/preview-features';

import {
  ALL_SECTIONS,
  ROOT_PROFILE_ACCOUNT,
  ROOT_PROFILE_KEY,
  ROOT_SECTIONS,
  SECTIONS_ACCESSIBLE_TO_ACCOUNTANTS,
} from '../components/dashboard/constants';
import { DashboardContext } from '../components/dashboard/DashboardContext';
import DashboardSection from '../components/dashboard/DashboardSection';
import { getMenuItems } from '../components/dashboard/Menu';
import { adminPanelQuery } from '../components/dashboard/queries';
import AdminPanelSideBar from '../components/dashboard/SideBar';
import Link from '../components/Link';
import MessageBox from '../components/MessageBox';
import Footer from '../components/navigation/Footer';
import NotificationBar from '../components/NotificationBar';
import Page from '../components/Page';
import SignInOrJoinFree from '../components/SignInOrJoinFree';
import { TwoFactorAuthRequiredMessage } from '../components/TwoFactorAuthRequiredMessage';
import { useWorkspace } from '../components/WorkspaceProvider';

const messages = defineMessages({
  collectiveIsArchived: {
    id: 'collective.isArchived',
    defaultMessage: '{name} has been archived.',
  },
  collectiveIsArchivedDescription: {
    id: 'collective.isArchived.edit.description',
    defaultMessage: 'This {type} has been archived and is no longer active.',
  },
  userIsArchived: {
    id: 'user.isArchived',
    defaultMessage: 'Account has been archived.',
  },
  userIsArchivedDescription: {
    id: 'user.isArchived.edit.description',
    defaultMessage: 'This account has been archived and is no longer active.',
  },
});

const getDefaultSectionForAccount = (account, loggedInUser) => {
  if (!account) {
    return null;
  } else if (account.type === 'ROOT') {
    return ROOT_SECTIONS.ALL_COLLECTIVES;
  } else if (
    isIndividualAccount(account) ||
    (!isHostAccount(account) && loggedInUser.hasPreviewFeatureEnabled(PREVIEW_FEATURE_KEYS.COLLECTIVE_OVERVIEW))
  ) {
    return ALL_SECTIONS.OVERVIEW;
  } else if (isHostAccount(account)) {
    return ALL_SECTIONS.HOST_EXPENSES;
  } else {
    const isAdmin = loggedInUser?.isAdminOfCollective(account);
    const isAccountant = loggedInUser?.hasRole(roles.ACCOUNTANT, account);
    return !isAdmin && isAccountant ? ALL_SECTIONS.PAYMENT_RECEIPTS : ALL_SECTIONS.EXPENSES;
  }
};

const getNotification = (intl, account) => {
  if (account?.isArchived) {
    if (account.type === 'USER') {
      return {
        type: 'warning',
        title: intl.formatMessage(messages.userIsArchived),
        description: intl.formatMessage(messages.userIsArchivedDescription),
      };
    } else {
      return {
        type: 'warning',
        title: intl.formatMessage(messages.collectiveIsArchived, { name: account.name }),
        description: intl.formatMessage(messages.collectiveIsArchivedDescription, {
          type: account.type.toLowerCase(),
        }),
      };
    }
  }
};

function getBlocker(LoggedInUser, account, section) {
  if (!LoggedInUser) {
    return <FormattedMessage id="mustBeLoggedIn" defaultMessage="You must be logged in to see this page" />;
  } else if (!account) {
    return <FormattedMessage defaultMessage="This account doesn't exist" id="3ABdi3" />;
  } else if (account.isIncognito) {
    return <FormattedMessage defaultMessage="You cannot edit this collective" id="ZonfjV" />;
  } else if (account.type === 'ROOT' && LoggedInUser.isRoot) {
    return;
  }

  // Check permissions
  const isAdmin = LoggedInUser.isAdminOfCollective(account);
  if (SECTIONS_ACCESSIBLE_TO_ACCOUNTANTS.includes(section)) {
    if (!isAdmin && !LoggedInUser.hasRole(roles.ACCOUNTANT, account)) {
      return (
        <FormattedMessage
          defaultMessage="You need to be logged in as an admin or accountant to view this page"
          id="9FWGOh"
        />
      );
    }
  } else if (!isAdmin) {
    return <FormattedMessage defaultMessage="You need to be logged in as an admin" id="AQNF/n" />;
  }
}

function getSingleParam(queryParam: string | string[]): string {
  return Array.isArray(queryParam) ? queryParam[0] : queryParam;
}

function getAsArray(queryParam: string | string[]): string[] {
  return Array.isArray(queryParam) ? queryParam : [queryParam];
}

const parseQuery = query => {
  return {
    slug: getSingleParam(query.slug),
    section: getSingleParam(query.section),
    subpath: getAsArray(query.subpath)?.filter(Boolean),
  };
};

const DashboardPage = () => {
  const intl = useIntl();
  const router = useRouter();
  const { slug, section, subpath } = parseQuery(router.query);
  const { LoggedInUser, loadingLoggedInUser } = useLoggedInUser();
  const { workspace, setWorkspace } = useWorkspace();
  const isRootUser = LoggedInUser?.isRoot;
  const defaultSlug = workspace.slug || LoggedInUser?.collective.slug;
  const activeSlug = slug || defaultSlug;
  const isRootProfile = activeSlug === ROOT_PROFILE_KEY;

  const { data, loading } = useQuery(adminPanelQuery, {
    context: API_V2_CONTEXT,
    variables: { slug: activeSlug },
    skip: !activeSlug || !LoggedInUser || isRootProfile,
  });
  const account = isRootProfile && isRootUser ? ROOT_PROFILE_ACCOUNT : data?.account;
  const selectedSection = section || getDefaultSectionForAccount(account, LoggedInUser);

  // Keep track of last visited workspace account and sections
  React.useEffect(() => {
    if (activeSlug && activeSlug !== workspace.slug) {
      if (LoggedInUser) {
        setWorkspace({ slug: activeSlug });
      }
    }
    // If there is no slug set (that means /dashboard)
    // And if there is an activeSlug (this means workspace OR LoggedInUser)
    // And a LoggedInUser
    // And if activeSlug is different than LoggedInUser slug
    if (!slug && activeSlug && LoggedInUser && activeSlug !== LoggedInUser.collective.slug) {
      router.replace(`/dashboard/${activeSlug}`);
    }
  }, [activeSlug, LoggedInUser]);

  // Clear last visited workspace account if not admin
  React.useEffect(() => {
    if (account && !LoggedInUser.isAdminOfCollective(account) && !(isRootProfile && isRootUser)) {
      setWorkspace({ slug: undefined });
    }
  }, [account]);

  const notification = getNotification(intl, account);
  const [expandedSection, setExpandedSection] = React.useState(null);
  const isLoading = loading || loadingLoggedInUser;
  const blocker = !isLoading && getBlocker(LoggedInUser, account, selectedSection);
  const titleBase = intl.formatMessage({ id: 'Dashboard', defaultMessage: 'Dashboard' });
  const menuItems = account ? getMenuItems({ intl, account, LoggedInUser }) : [];
  const accountIdentifier = account && (account.name || `@${account.slug}`);

  return (
    <DashboardContext.Provider
      value={{
        selectedSection,
        subpath: subpath || [],
        expandedSection,
        setExpandedSection,
        account,
        activeSlug,
        defaultSlug,
        setDefaultSlug: slug => setWorkspace({ slug }),
      }}
    >
      <div className="flex min-h-screen flex-col justify-between">
        <Page
          noRobots
          collective={account}
          title={[accountIdentifier, titleBase].filter(Boolean).join(' - ')}
          pageTitle={titleBase}
          showFooter={false}
        >
          {Boolean(notification) && <NotificationBar {...notification} />}
          {blocker ? (
            <div className="my-32 flex flex-col items-center">
              <MessageBox type="warning" mb={4} maxWidth={400} withIcon>
                <p>{blocker}</p>
                {LoggedInUser && (
                  <Link className="mt-2 block" href={`/dashboard/${LoggedInUser.collective.slug}`}>
                    <FormattedMessage defaultMessage="Go to your Dashboard" id="cLaG6g" />
                  </Link>
                )}
              </MessageBox>
              {!LoggedInUser && <SignInOrJoinFree defaultForm="signin" disableSignup />}
            </div>
          ) : (
            <div
              className="flex min-h-[600px] flex-col justify-center gap-6 px-4 py-6 md:flex-row lg:gap-12 lg:py-8 xl:px-6"
              data-cy="admin-panel-container"
            >
              <AdminPanelSideBar isLoading={isLoading} activeSlug={activeSlug} menuItems={menuItems} />
              {LoggedInUser &&
              require2FAForAdmins(account) &&
              !LoggedInUser.hasTwoFactorAuth &&
              selectedSection !== 'user-security' ? (
                <TwoFactorAuthRequiredMessage className="lg:mt-16" />
              ) : (
                <div className="max-w-(--breakpoint-xl) min-w-0 flex-1">
                  <DashboardSection
                    section={selectedSection}
                    isLoading={isLoading}
                    account={account}
                    subpath={subpath}
                  />
                </div>
              )}
            </div>
          )}
        </Page>
        <Footer />
      </div>
    </DashboardContext.Provider>
  );
};

DashboardPage.getInitialProps = () => {
  return {
    scripts: { googleMaps: true }, // TODO: This should be enabled only for events
  };
};

// next.js export
// ts-unused-exports:disable-next-line
export default DashboardPage;
