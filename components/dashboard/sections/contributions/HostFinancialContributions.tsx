import React from 'react';

import type { DashboardSectionProps } from '../../types';

import Contributions from './Contributions';

export default function HostFinancialContributions(props: DashboardSectionProps) {
  return <Contributions {...props} includeHostedAccounts direction="INCOMING" />;
}
