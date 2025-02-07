import React from 'react';
import { useFormikContext } from 'formik';
import { FormattedMessage } from 'react-intl';

import { cn } from '../../../lib/utils';
import { ExpenseStatus } from '@/lib/graphql/types/v2/schema';

import ExpenseInviteWelcome from '@/components/expenses/ExpenseInviteWelcome';

import { Button } from '../../ui/Button';
import { Step } from '../SubmitExpenseFlowSteps';
import type { ExpenseForm } from '../useExpenseForm';

import { AdditionalDetailsSection } from './AdditionalDetailsSection';
import { ExpenseCategorySection } from './ExpenseCategorySection';
import { ExpenseItemsSection } from './ExpenseItemsSection';
import { FormSectionContainer } from './FormSectionContainer';
import { PayoutMethodSection } from './PayoutMethodSection';
import { SummarySection } from './SummarySection';
import { TypeOfExpenseSection } from './TypeOfExpenseSection';
import { WhoIsGettingPaidSection } from './WhoIsGettingPaidSection';
import { WhoIsPayingSection } from './WhoIsPayingSection';

type SubmitExpenseFlowFormProps = {
  className?: string;
  onVisibleSectionChange: (sectionId: string) => void;
  onNextClick: () => void;
  onExpenseInviteDeclined: () => void;
};

export function SubmitExpenseFlowForm(props: SubmitExpenseFlowFormProps) {
  const form = useFormikContext() as ExpenseForm;

  const { onVisibleSectionChange } = props;
  const onInViewChange = React.useCallback(
    (visible, entry) => {
      if (visible) {
        onVisibleSectionChange(entry.target.id);
      }
    },
    [onVisibleSectionChange],
  );

  return (
    <div className={cn('flex flex-col gap-8 pb-28', props.className)}>
      {form.options.expense?.status === ExpenseStatus.DRAFT && (
        <ExpenseInviteWelcomeSection
          inViewChange={onInViewChange}
          form={form}
          onExpenseInviteDeclined={props.onExpenseInviteDeclined}
        />
      )}
      <WhoIsPayingSection inViewChange={onInViewChange} {...WhoIsPayingSection.getFormProps(form)} />
      <WhoIsGettingPaidSection inViewChange={onInViewChange} {...WhoIsGettingPaidSection.getFormProps(form)} />
      <PayoutMethodSection inViewChange={onInViewChange} {...PayoutMethodSection.getFormProps(form)} />
      <TypeOfExpenseSection inViewChange={onInViewChange} {...TypeOfExpenseSection.getFormProps(form)} />
      {form.options.accountingCategories?.length > 0 && (
        <ExpenseCategorySection inViewChange={onInViewChange} {...ExpenseCategorySection.getFormProps(form)} />
      )}
      <ExpenseItemsSection inViewChange={onInViewChange} form={form} />
      <AdditionalDetailsSection inViewChange={onInViewChange} {...AdditionalDetailsSection.getFormProps(form)} />
      <SummarySection inViewChange={onInViewChange} form={form} />
      <div className="flex justify-end">
        <Button
          disabled={form.initialLoading || form.isSubmitting}
          loading={form.isSubmitting || form.isValidating}
          onClick={() => form.handleSubmit()}
        >
          <FormattedMessage defaultMessage="Submit Expense" id="menu.submitExpense" />
        </Button>
      </div>
    </div>
  );
}

type ExpenseInviteWelcomeSectionProps = {
  form: ExpenseForm;
  inViewChange: (inView: boolean, entry: IntersectionObserverEntry) => void;
  onExpenseInviteDeclined: () => void;
};

function ExpenseInviteWelcomeSection(props: ExpenseInviteWelcomeSectionProps) {
  return (
    <FormSectionContainer step={Step.INVITE_WELCOME} inViewChange={props.inViewChange} hideTitle hideSubtitle>
      <ExpenseInviteWelcome
        expense={props.form.options.expense}
        draftKey={props.form.startOptions.draftKey}
        onExpenseInviteDeclined={props.onExpenseInviteDeclined}
      />
    </FormSectionContainer>
  );
}
