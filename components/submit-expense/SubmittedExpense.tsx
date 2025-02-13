import React from 'react';
import { useQuery } from '@apollo/client';
import { includes } from 'lodash';

import { API_V2_CONTEXT } from '../../lib/graphql/helpers';
import type { ExpensePageQuery, ExpensePageQueryVariables } from '../../lib/graphql/types/v2/graphql';

import ExpenseSummary from '../expenses/ExpenseSummary';
import { expensePageQuery } from '../expenses/graphql/queries';
import TaxFormMessage from '../expenses/TaxFormMessage';
import CreateExpenseFAQ from '../faqs/CreateExpenseFAQ';
import Loading from '../Loading';
import MessageBoxGraphqlError from '../MessageBoxGraphqlError';

type SubmittedExpenseProps = {
  expenseId: number;
};

export function SubmittedExpense(props: SubmittedExpenseProps) {
  const query = useQuery<ExpensePageQuery, ExpensePageQueryVariables>(expensePageQuery, {
    context: API_V2_CONTEXT,
    skip: !props.expenseId,
    variables: {
      legacyExpenseId: props.expenseId,
    },
  });

  if (query.loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Loading />
      </div>
    );
  }

  if (query.error) {
    return <MessageBoxGraphqlError error={query.error} />;
  }

  const expense = query.data?.expense;
  const showTaxFormMsg = includes(expense?.requiredLegalDocuments, 'US_TAX_FORM');

  return (
    <div>
      {showTaxFormMsg && <TaxFormMessage expense={expense} refetch={query.refetch} />}
      <div className="flex grow flex-col gap-8 px-4 sm:p-0 sm:pb-12 lg:flex-row">
        <div className="flex-1 flex-grow-2">
          <ExpenseSummary
            onDelete={() => {}}
            onEdit={() => {}}
            openFileViewer={() => {}}
            enableKeyboardShortcuts={false}
            drawerActionsContainer={null}
            canEditTags={false}
            isEditing={false}
            isLoadingLoggedInUser={false}
            showProcessButtons={false}
            expense={expense}
            host={expense?.host}
            isLoading={!expense}
            collective={expense?.account}
          />
        </div>
        <div className="flex-1 pb-12 md:max-w-96">
          <CreateExpenseFAQ defaultOpen />
        </div>
      </div>
    </div>
  );
}
