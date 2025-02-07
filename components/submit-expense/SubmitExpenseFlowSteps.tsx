import React from 'react';
import type { Path } from 'dot-path-value';
import { useFormikContext } from 'formik';
import { get, isEmpty } from 'lodash';
import type { MessageDescriptor } from 'react-intl';
import { defineMessage, FormattedMessage } from 'react-intl';

import { cn } from '../../lib/utils';

import type { ExpenseForm, ExpenseFormValues } from './useExpenseForm';

type SubmitExpenseFlowStepsProps = {
  className?: string;
  completedSteps?: Step[];
  activeStep: Step;
};

export enum Step {
  INVITE_WELCOME = 'INVITE_WELCOME',
  WHO_IS_PAYING = 'WHO_IS_PAYING',
  WHO_IS_GETTING_PAID = 'WHO_IS_GETTING_PAID',
  PAYOUT_METHOD = 'PAYOUT_METHOD',
  TYPE_OF_EXPENSE = 'TYPE_OF_EXPENSE',
  EXPENSE_CATEGORY = 'EXPENSE_CATEGORY',
  EXPENSE_ITEMS = 'EXPENSE_ITEMS',
  EXPENSE_TITLE = 'EXPENSE_TITLE',
  SUMMARY = 'SUMMARY',
}

const StepValues: Record<Step, Path<ExpenseFormValues>[]> = {
  [Step.WHO_IS_PAYING]: ['accountSlug'],
  [Step.WHO_IS_GETTING_PAID]: ['payeeSlug', 'inviteeNewIndividual', 'inviteeNewOrganization'],
  [Step.PAYOUT_METHOD]: [
    'payoutMethodId',
    'newPayoutMethod',
    'payoutMethodNameDiscrepancyReason',
    'editingPayoutMethod',
  ],
  [Step.TYPE_OF_EXPENSE]: [
    'expenseTypeOption',
    'acknowledgedCollectiveInvoiceExpensePolicy',
    'acknowledgedCollectiveReceiptExpensePolicy',
    'acknowledgedHostInvoiceExpensePolicy',
    'acknowledgedHostReceiptExpensePolicy',
    'invoiceFile',
    'invoiceNumber',
  ],
  [Step.EXPENSE_CATEGORY]: ['accountingCategoryId'],
  [Step.EXPENSE_ITEMS]: ['expenseItems'],
  [Step.EXPENSE_TITLE]: ['title', 'acknowledgedCollectiveTitleExpensePolicy', 'acknowledgedHostTitleExpensePolicy'],
  [Step.SUMMARY]: [],
  [Step.INVITE_WELCOME]: [],
};

export const StepTitles: Record<Step, MessageDescriptor> = {
  [Step.INVITE_WELCOME]: defineMessage({
    defaultMessage: 'Invitation',
    id: 'GM/hd6',
  }),
  [Step.WHO_IS_PAYING]: defineMessage({
    defaultMessage: 'Who is paying',
    id: 'NpMPF+',
  }),
  [Step.WHO_IS_GETTING_PAID]: defineMessage({
    defaultMessage: 'Who is getting paid?',
    id: 'W5Z+Fm',
  }),
  [Step.PAYOUT_METHOD]: defineMessage({
    defaultMessage: 'Payout Method',
    id: 'SecurityScope.PayoutMethod',
  }),
  [Step.TYPE_OF_EXPENSE]: defineMessage({
    defaultMessage: 'Type of expense',
    id: 'qftRxm',
  }),
  [Step.EXPENSE_CATEGORY]: defineMessage({
    defaultMessage: 'Expense Category',
    id: '38dzz9',
  }),
  [Step.EXPENSE_ITEMS]: defineMessage({
    defaultMessage: 'Expense items',
    id: '3ldWIL',
  }),
  [Step.EXPENSE_TITLE]: defineMessage({
    defaultMessage: 'Expense Title',
    id: 'E0WDTk',
  }),
  [Step.SUMMARY]: defineMessage({
    defaultMessage: 'Summary',
    id: 'Summary',
  }),
};

export const StepSubtitles: Partial<Record<Step, MessageDescriptor>> = {
  [Step.PAYOUT_METHOD]: defineMessage({
    defaultMessage: 'Where do you want to receive the money',
    id: 'CNCPij',
  }),
  [Step.WHO_IS_GETTING_PAID]: defineMessage({
    defaultMessage: 'Select the profile of the recipient who needs to be paid',
    id: 'hVAL2P',
  }),
  [Step.WHO_IS_PAYING]: defineMessage({
    defaultMessage: 'Select the profile whom you are requesting money from',
    id: 'nt19l4',
  }),
};

function isExpenseFormStepCompleted(form: ExpenseForm, step: Step): boolean {
  if (form.initialLoading) {
    return false;
  }

  const valueKeys = StepValues[step];
  if (isEmpty(valueKeys)) {
    return true;
  }
  return valueKeys.map(valueKey => isEmpty(get(form.errors, valueKey))).every(Boolean);
}

function expenseFormStepHasError(form: ExpenseForm, step: Step): boolean {
  return !isExpenseFormStepCompleted(form, step);
}

function isExpenseFormStepTouched(form: ExpenseForm, step: Step): boolean {
  if (form.initialLoading) {
    return false;
  }

  const valueKeys = StepValues[step];
  if (isEmpty(valueKeys)) {
    return true;
  }
  return valueKeys.map(valueKey => get(form.touched, valueKey)).some(Boolean);
}

export function SubmitExpenseFlowSteps(props: SubmitExpenseFlowStepsProps) {
  const form = useFormikContext() as ExpenseForm;
  const hasErrors = Object.values(Step).some(step => expenseFormStepHasError(form, step));

  const stepOrder = [
    Step.WHO_IS_PAYING,
    Step.WHO_IS_GETTING_PAID,
    Step.PAYOUT_METHOD,
    Step.TYPE_OF_EXPENSE,
    Step.EXPENSE_CATEGORY,
    Step.EXPENSE_ITEMS,
    Step.EXPENSE_TITLE,
  ].filter(step => {
    if (step === Step.EXPENSE_CATEGORY) {
      return form.options.accountingCategories?.length;
    }

    return true;
  });

  const firstIncompleteIdx = stepOrder.findIndex(s => !isExpenseFormStepCompleted(form, s));

  // Scroll to first step with error
  const firstIncompleteSection = stepOrder.find(s => !isExpenseFormStepCompleted(form, s));
  const submitCount = form.submitCount;
  React.useEffect(() => {
    if (firstIncompleteSection && submitCount > 0) {
      document.querySelector(`#${firstIncompleteSection}`)?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [hasErrors, firstIncompleteSection, submitCount]);

  return (
    <div className={cn(props.className)}>
      <ol className="pl-[12px] text-sm">
        <StepHeader
          isActive={props.activeStep !== Step.SUMMARY}
          isComplete={!hasErrors}
          hasError={hasErrors && form.submitCount > 0}
          stepNumber={1}
          isCompletedPath
        >
          <FormattedMessage defaultMessage="Expense Details" id="+5Kafe" />
        </StepHeader>
        {(props.activeStep !== Step.SUMMARY || hasErrors) &&
          stepOrder.map((step, i) => (
            <StepItem
              key={step}
              isActive={props.activeStep === step}
              hasError={
                expenseFormStepHasError(form, step) && isExpenseFormStepTouched(form, step) && form.submitCount > 0
              }
              isComplete={isExpenseFormStepCompleted(form, step)}
              isCompletedPath={i < firstIncompleteIdx - 1 || firstIncompleteIdx < 0}
            >
              <FormattedMessage {...StepTitles[step]} />
            </StepItem>
          ))}
        <StepHeader isActive={props.activeStep === Step.SUMMARY} stepNumber={2}>
          <FormattedMessage defaultMessage="Summary" id="Summary" />
        </StepHeader>
      </ol>
    </div>
  );
}

type StepProps = {
  isActive?: boolean;
  hasError?: boolean;
  isComplete?: boolean;
  isCompletedPath?: boolean;
  children?: React.ReactNode;
};

function StepHeader(props: StepProps & { stepNumber: number }) {
  return (
    <li
      className={cn(
        'relative flex items-center gap-2 pb-8 pl-7 font-bold before:absolute before:left-0 before:inline-block before:h-6 before:w-6 before:-translate-x-3 before:rounded-full before:border-2 before:border-[#94A3B8] before:bg-white before:text-center after:absolute after:top-2 after:left-0 after:-z-10 after:h-full after:-translate-x-[1px] after:border-l-2 after:border-solid last:after:hidden',
        {
          'before:border-blue-900': props.isActive,
          "before:border-blue-900 before:bg-blue-900 before:text-white before:content-['✓']": props.isComplete,
          'after:border-blue-900': props.isCompletedPath,
        },
      )}
    >
      {props.children}
      {!props.isComplete && (
        <div
          className={cn('absolute left-0 flex h-6 w-6 -translate-x-3 items-center justify-center text-[#94A3B8]', {
            'text-blue-900': props.isActive,
          })}
        >
          {props.stepNumber}
        </div>
      )}
    </li>
  );
}

function StepItem(props: StepProps) {
  return (
    <li
      className={cn(
        'relative flex items-center gap-2 pb-8 pl-7 before:absolute before:left-0 before:inline-block before:h-2 before:w-2 before:-translate-x-1 before:rounded-full before:border-[#CBD5E1] before:bg-[#CBD5E1] before:text-center after:absolute after:top-2 after:left-0 after:-z-10 after:h-full after:-translate-x-[1px] after:border-l-2 after:border-solid after:border-[#E1E7EF]',
        {
          'font-bold text-blue-900 before:border-blue-900 before:bg-blue-900 before:[box-shadow:0_0_0_4px_hsla(216,_100%,_58%,_0.3)]':
            props.isActive,
          'before:border-blue-900 before:bg-blue-900': props.isComplete && !props.isActive,
          'after:border-blue-900': props.isCompletedPath && props.isComplete,
          'after:border-red-500': props.isCompletedPath && props.hasError && !props.isActive,
          'text-red-500 before:border-red-500 before:bg-red-500': props.hasError && !props.isActive,
        },
      )}
    >
      {props.children}
    </li>
  );
}
