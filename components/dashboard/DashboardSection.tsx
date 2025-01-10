import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { values } from 'lodash';
import { useIntl } from 'react-intl';

import useLoggedInUser from '../../lib/hooks/useLoggedInUser';
import { PREVIEW_FEATURE_KEYS } from '../../lib/preview-features';

import Container from '../Container';
import LoadingPlaceholder from '../LoadingPlaceholder';
import NotFound from '../NotFound';
import { OCFBannerWithData } from '../OCFBanner';
import AccountSettingsForm from '../root-actions/AccountSettings';
import AccountType from '../root-actions/AccountType';
import { AnonymizeAccount } from '../root-actions/AnonymizeAccount';
import BanAccount from '../root-actions/BanAccounts';
import BanAccountsWithSearch from '../root-actions/BanAccountsWithSearch';
import ClearCacheForAccountForm from '../root-actions/ClearCacheForAccountForm';
import ConnectAccountsForm from '../root-actions/ConnectAccountsForm';
import MergeAccountsForm from '../root-actions/MergeAccountsForm';
import MoveAuthoredContributions from '../root-actions/MoveAuthoredContributions';
import MoveExpenses from '../root-actions/MoveExpenses';
import MoveReceivedContributions from '../root-actions/MoveReceivedContributions';
import RecurringContributions from '../root-actions/RecurringContributions';
import RootActivityLog from '../root-actions/RootActivityLog';
import UnhostAccountForm from '../root-actions/UnhostAccountForm';

import { HostAdminAccountingSection } from './sections/accounting';
import Accounts from './sections/accounts';
import AccountSettings from './sections/AccountSettings';
import AllCollectives from './sections/collectives/AllCollectives';
import HostApplications from './sections/collectives/HostApplications';
import HostedCollectives from './sections/collectives/HostedCollectives';
import HostCommunity from './sections/community/HostCommunity';
import HostExpectedFunds from './sections/contributions/HostExpectedFunds';
import HostFinancialContributions from './sections/contributions/HostFinancialContributions';
import IncomingContributions from './sections/contributions/IncomingContributions';
import OutgoingContributions from './sections/contributions/OutgoingContributions';
import Contributors from './sections/Contributors';
import HostExpenses from './sections/expenses/HostDashboardExpenses';
import ReceivedExpenses from './sections/expenses/ReceivedExpenses';
import SubmittedExpenses from './sections/expenses/SubmittedExpenses';
import HostDashboardAgreements from './sections/HostDashboardAgreements';
import HostVirtualCardRequests from './sections/HostVirtualCardRequests';
import HostVirtualCards from './sections/HostVirtualCards';
import InvoicesReceipts from './sections/invoices-receipts/InvoicesReceipts';
import HostDashboardTaxForms from './sections/legal-documents/HostDashboardTaxForms';
import NotificationsSettings from './sections/NotificationsSettings';
import Overview from './sections/overview/Overview';
import HostDashboardReports from './sections/reports/HostDashboardReports';
import PreviewReports from './sections/reports/preview/Reports';
import { TaxInformationSettingsSection } from './sections/tax-information';
import Team from './sections/Team';
import AccountTransactions from './sections/transactions/AccountTransactions';
import AllTransactions from './sections/transactions/AllTransactions';
import HostTransactions from './sections/transactions/HostTransactions';
import Updates from './sections/updates';
import Vendors from './sections/Vendors';
import VirtualCards from './sections/virtual-cards/VirtualCards';
import {
  ALL_SECTIONS,
  LEGACY_SECTIONS,
  LEGACY_SETTINGS_SECTIONS,
  ROOT_PROFILE_KEY,
  ROOT_SECTIONS,
  SECTION_LABELS,
  SECTIONS,
  SETTINGS_SECTIONS,
} from './constants';
import { DashboardContext } from './DashboardContext';
import DashboardHeader from './DashboardHeader';

const DASHBOARD_COMPONENTS = {
  [SECTIONS.HOSTED_COLLECTIVES]: HostedCollectives,
  [SECTIONS.CHART_OF_ACCOUNTS]: HostAdminAccountingSection,
  [SECTIONS.HOST_FINANCIAL_CONTRIBUTIONS]: HostFinancialContributions,
  [SECTIONS.HOST_EXPENSES]: HostExpenses,
  [SECTIONS.HOST_AGREEMENTS]: HostDashboardAgreements,
  [SECTIONS.HOST_TAX_FORMS]: HostDashboardTaxForms,
  [SECTIONS.HOST_APPLICATIONS]: HostApplications,
  [SECTIONS.REPORTS]: HostDashboardReports,
  [SECTIONS.HOST_VIRTUAL_CARDS]: HostVirtualCards,
  [SECTIONS.HOST_VIRTUAL_CARD_REQUESTS]: HostVirtualCardRequests,
  [SECTIONS.OVERVIEW]: Overview,
  [SECTIONS.EXPENSES]: ReceivedExpenses,
  [SECTIONS.SUBMITTED_EXPENSES]: SubmittedExpenses,
  [SECTIONS.CONTRIBUTORS]: Contributors,
  [SECTIONS.HOST_COMMUNITY]: HostCommunity,
  [SECTIONS.INCOMING_CONTRIBUTIONS]: IncomingContributions,
  [SECTIONS.OUTGOING_CONTRIBUTIONS]: OutgoingContributions,
  [SECTIONS.HOST_EXPECTED_FUNDS]: HostExpectedFunds,
  [SECTIONS.TRANSACTIONS]: AccountTransactions,
  [SECTIONS.HOST_TRANSACTIONS]: HostTransactions,
  [SECTIONS.UPDATES]: Updates,
  [SECTIONS.VIRTUAL_CARDS]: VirtualCards,
  [SECTIONS.TEAM]: Team,
  [SECTIONS.VENDORS]: Vendors,
  [SECTIONS.ACCOUNTS]: Accounts,
};

const SETTINGS_COMPONENTS = {
  [SETTINGS_SECTIONS.INVOICES_RECEIPTS]: InvoicesReceipts,
  [SETTINGS_SECTIONS.NOTIFICATIONS]: NotificationsSettings,
  [SETTINGS_SECTIONS.TAX_INFORMATION]: TaxInformationSettingsSection,
};

const ROOT_COMPONENTS = {
  [SECTIONS.HOST_TRANSACTIONS]: AllTransactions,
  [ALL_SECTIONS.ACTIVITY_LOG]: RootActivityLog,
  [ROOT_SECTIONS.ALL_COLLECTIVES]: AllCollectives,
  [ROOT_SECTIONS.BAN_ACCOUNTS]: BanAccount,
  [ROOT_SECTIONS.ANONYMIZE_ACCOUNT]: AnonymizeAccount,
  [ROOT_SECTIONS.SEARCH_AND_BAN]: BanAccountsWithSearch,
  [ROOT_SECTIONS.MOVE_AUTHORED_CONTRIBUTIONS]: MoveAuthoredContributions,
  [ROOT_SECTIONS.MOVE_RECEIVED_CONTRIBUTIONS]: MoveReceivedContributions,
  [ROOT_SECTIONS.MOVE_EXPENSES]: MoveExpenses,
  [ROOT_SECTIONS.CLEAR_CACHE]: ClearCacheForAccountForm,
  [ROOT_SECTIONS.CONNECT_ACCOUNTS]: ConnectAccountsForm,
  [ROOT_SECTIONS.MERGE_ACCOUNTS]: MergeAccountsForm,
  [ROOT_SECTIONS.UNHOST_ACCOUNTS]: UnhostAccountForm,
  [ROOT_SECTIONS.ACCOUNT_SETTINGS]: AccountSettingsForm,
  [ROOT_SECTIONS.ACCOUNT_TYPE]: AccountType,
  [ROOT_SECTIONS.RECURRING_CONTRIBUTIONS]: RecurringContributions,
};

const DashboardSection = ({ account, isLoading, section, subpath }) => {
  const { LoggedInUser } = useLoggedInUser();
  const { activeSlug } = useContext(DashboardContext);

  const { formatMessage } = useIntl();

  if (isLoading) {
    return (
      <div className="w-full pb-6">
        <OCFBannerWithData isDashboard collective={account} hideNextSteps={section === 'host'} />
        <LoadingPlaceholder height={26} mb={4} maxWidth={500} />
        <LoadingPlaceholder height={300} />
      </div>
    );
  }

  const RootComponent = ROOT_COMPONENTS[section];
  if (RootComponent && LoggedInUser.isRoot && activeSlug === ROOT_PROFILE_KEY) {
    return (
      <div className="w-full pb-6">
        <RootComponent subpath={subpath} isDashboard />
      </div>
    );
  }

  let DashboardComponent = DASHBOARD_COMPONENTS[section];
  if (DashboardComponent) {
    if (section === SECTIONS.REPORTS) {
      if (LoggedInUser.hasPreviewFeatureEnabled(PREVIEW_FEATURE_KEYS.HOST_REPORTS)) {
        DashboardComponent = PreviewReports;
      }
    }
    return (
      <div className="w-full pb-6">
        <OCFBannerWithData isDashboard collective={account} hideNextSteps={section === 'host'} />
        <DashboardComponent accountSlug={account.slug} subpath={subpath} isDashboard />
      </div>
    );
  }

  if (values(LEGACY_SECTIONS).includes(section)) {
    return (
      <div className="w-full max-w-screen-lg pb-6">
        <OCFBannerWithData isDashboard collective={account} hideNextSteps={section === 'host'} />
        {SECTION_LABELS[section] && <DashboardHeader className="mb-2" title={formatMessage(SECTION_LABELS[section])} />}

        <AccountSettings account={account} section={section} />
      </div>
    );
  }

  // Settings component
  const SettingsComponent = SETTINGS_COMPONENTS[section];
  if (SettingsComponent) {
    return (
      // <div className="flex max-w-screen-lg justify-center">
      <div className="max-w-screen-md flex-1 pb-6">
        <OCFBannerWithData isDashboard collective={account} hideNextSteps={section === 'host'} />
        <SettingsComponent account={account} accountSlug={account.slug} subpath={subpath} />
      </div>
    );
  }

  if (values(LEGACY_SETTINGS_SECTIONS).includes(section)) {
    return (
      // <div className="flex max-w-screen-lg justify-center">
      <div className="max-w-screen-md flex-1 pb-6">
        <OCFBannerWithData isDashboard collective={account} hideNextSteps={section === 'host'} />
        {SECTION_LABELS[section] && <DashboardHeader className="mb-2" title={formatMessage(SECTION_LABELS[section])} />}

        <AccountSettings account={account} section={section} />
      </div>
      // </div>
    );
  }

  return (
    <Container display="flex" justifyContent="center" alignItems="center">
      <NotFound />
    </Container>
  );
};

DashboardSection.propTypes = {
  isLoading: PropTypes.bool,
  section: PropTypes.string,
  subpath: PropTypes.arrayOf(PropTypes.string),
  /** The account. Can be null if isLoading is true */
  account: PropTypes.shape({
    slug: PropTypes.string.isRequired,
    name: PropTypes.string,
    isHost: PropTypes.bool,
  }),
};

export default DashboardSection;
