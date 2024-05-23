import React from 'react';
import type { FetchResult } from '@apollo/client';
import { gql, useMutation } from '@apollo/client';
import clsx from 'clsx';
import { isEmpty, pick } from 'lodash';
import { ArrowLeft, ArrowRight, ChevronDown, ChevronUp, X } from 'lucide-react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import { AnalyticsEvent } from '../../lib/analytics/events';
import { track } from '../../lib/analytics/plausible';
import { i18nGraphqlException } from '../../lib/errors';
import { API_V2_CONTEXT } from '../../lib/graphql/helpers';
import type {
  CreateExpenseFromDashboardMutation,
  CreateExpenseFromDashboardMutationVariables,
  Currency,
  CurrencyExchangeRateInput,
  EditExpenseFromDashboardMutation,
  EditExpenseFromDashboardMutationVariables,
  InviteExpenseFromDashboardMutation,
  InviteExpenseFromDashboardMutationVariables,
} from '../../lib/graphql/types/v2/graphql';
import { ExpenseStatus } from '../../lib/graphql/types/v2/graphql';
import useLoggedInUser from '../../lib/hooks/useLoggedInUser';

import LoadingPlaceholder from '../LoadingPlaceholder';
import { Survey, SURVEY_KEY } from '../Survey';
import { Button } from '../ui/Button';
import { Dialog, DialogContent, DialogFooter } from '../ui/Dialog';
import { StepList, StepListItem, StepListItemIcon } from '../ui/StepList';
import { useToast } from '../ui/useToast';

import { ExpenseWarnings } from './ExpenseWarnings';
import { useNavigationWarning, useSteps } from './hooks';
import type { ExpenseFlowStep } from './Steps';
import { ExpenseStepOrder, Steps } from './Steps';
import { SubmittedExpense } from './SubmittedExpense';
import type { ExpenseForm } from './useExpenseForm';
import { useExpenseForm } from './useExpenseForm';

type SubmitExpenseFlowProps = {
  onClose: (submittedExpense: boolean) => void;
  expenseId?: number;
  draftKey?: string;
  duplicateExpense?: boolean;
};

const I18nMessages = defineMessages({
  ConfirmExit: {
    defaultMessage: 'Are you sure you want to discard this expense?',
    id: 't0Uyqt',
  },
});

export function SubmitExpenseFlow(props: SubmitExpenseFlowProps) {
  const { toast } = useToast();
  const intl = useIntl();

  const startOptions = React.useRef({
    draftKey: props.draftKey,
    duplicateExpense: props.duplicateExpense,
    expenseId: props.expenseId,
  });

  const formRef = React.useRef<HTMLFormElement>();
  const [submittedExpenseId, setSubmittedExpenseId] = React.useState(null);
  const { LoggedInUser } = useLoggedInUser();
  const [createExpense] = useMutation<CreateExpenseFromDashboardMutation, CreateExpenseFromDashboardMutationVariables>(
    gql`
      mutation CreateExpenseFromDashboard($expenseCreateInput: ExpenseCreateInput!, $account: AccountReferenceInput!) {
        expense: createExpense(expense: $expenseCreateInput, account: $account) {
          id
          legacyId
        }
      }
    `,
    {
      context: API_V2_CONTEXT,
    },
  );

  const [draftExpenseAndInviteUser] = useMutation<
    InviteExpenseFromDashboardMutation,
    InviteExpenseFromDashboardMutationVariables
  >(
    gql`
      mutation InviteExpenseFromDashboard(
        $expenseInviteInput: ExpenseInviteDraftInput!
        $account: AccountReferenceInput!
      ) {
        expense: draftExpenseAndInviteUser(expense: $expenseInviteInput, account: $account) {
          id
          legacyId
        }
      }
    `,
    {
      context: API_V2_CONTEXT,
    },
  );

  const [editExpense] = useMutation<EditExpenseFromDashboardMutation, EditExpenseFromDashboardMutationVariables>(
    gql`
      mutation EditExpenseFromDashboard($expenseEditInput: ExpenseUpdateInput!, $draftKey: String) {
        expense: editExpense(expense: $expenseEditInput, draftKey: $draftKey) {
          id
          legacyId
        }
      }
    `,
    {
      context: API_V2_CONTEXT,
    },
  );

  const expenseForm = useExpenseForm({
    formRef,
    initialValues: {
      title: '',
      expenseCurrency: null,
    },
    startOptions: startOptions.current,
    async onSubmit(values, h, formOptions, startOptions) {
      let result:
        | FetchResult<CreateExpenseFromDashboardMutation>
        | FetchResult<InviteExpenseFromDashboardMutation>
        | FetchResult<EditExpenseFromDashboardMutation>;
      try {
        track(AnalyticsEvent.EXPENSE_SUBMISSION_SUBMITTED);

        const expenseInput: CreateExpenseFromDashboardMutationVariables['expenseCreateInput'] = {
          description: values.title,
          payee: {
            slug: values.payeeSlug,
          },
          payeeLocation: values.payeeLocation,
          payoutMethod: {
            id: values.payoutMethodId,
          },
          type: values.expenseTypeOption,
          accountingCategory: values.accountingCategoryId
            ? {
                id: values.accountingCategoryId,
              }
            : null,
          attachedFiles: values.expenseAttachedFiles,
          currency: values.expenseCurrency as Currency,
          customData: null,
          invoiceInfo: null,
          items: values.expenseItems.map(ei => ({
            description: ei.description,
            amountV2: {
              valueInCents: ei.amount.valueInCents,
              currency: ei.amount.currency as Currency,
              exchangeRate: ei.amount.exchangeRate
                ? ({
                    ...pick(ei.amount.exchangeRate, ['source', 'rate', 'value', 'fromCurrency', 'toCurrency']),
                    date: ei.amount.exchangeRate.date || ei.incurredAt,
                  } as CurrencyExchangeRateInput)
                : null,
            },
            incurredAt: ei.incurredAt,
            url: ei.url,
          })),
          longDescription: null,
          privateMessage: null,
          tags: values.tags,
          tax: values.hasTax
            ? [
                {
                  rate: values.tax.rate,
                  type: formOptions.taxType,
                  idNumber: values.tax.idNumber,
                },
              ]
            : null,
        };

        if (formOptions.expense?.id && !startOptions.duplicateExpense) {
          const editInput: EditExpenseFromDashboardMutationVariables['expenseEditInput'] = {
            ...expenseInput,
            id: formOptions.expense.id,
            payee:
              formOptions.expense?.status === ExpenseStatus.DRAFT && !values.payeeSlug
                ? null
                : {
                    slug: values.payeeSlug,
                  },
          };
          result = await editExpense({
            variables: {
              expenseEditInput: editInput,
            },
          });
          toast({
            variant: 'success',
            title: <FormattedMessage defaultMessage="Expense edited" id="yTblGN" />,
            message: LoggedInUser ? <Survey hasParentTitle surveyKey={SURVEY_KEY.EXPENSE_SUBMITTED_NEW_FLOW} /> : null,
            duration: 20000,
          });
        } else if (values.payeeSlug) {
          result = await createExpense({
            variables: {
              account: {
                slug: values.collectiveSlug,
              },
              expenseCreateInput: expenseInput,
            },
          });

          toast({
            variant: 'success',
            title: <FormattedMessage id="Expense.Submitted" defaultMessage="Expense submitted" />,
            message: LoggedInUser ? <Survey hasParentTitle surveyKey={SURVEY_KEY.EXPENSE_SUBMITTED_NEW_FLOW} /> : null,
            duration: 20000,
          });
        } else {
          const inviteInput: InviteExpenseFromDashboardMutationVariables['expenseInviteInput'] = {
            ...expenseInput,
            payee: {
              ...pick(values.invitePayee, ['legacyId', 'slug', 'name', 'email', 'organization']),
              isInvite: true,
            },
            recipientNote: values.inviteNote,
            ...(!('legacyId' in values.invitePayee) && 'payoutMethod' in values.invitePayee
              ? { payoutMethod: values.invitePayee.payoutMethod }
              : {}),
          };
          result = await draftExpenseAndInviteUser({
            variables: {
              account: {
                slug: values.collectiveSlug,
              },
              expenseInviteInput: inviteInput,
            },
          });

          toast({
            variant: 'success',
            title: <FormattedMessage defaultMessage="Expense invite sent" id="Fhue1N" />,
            message: LoggedInUser ? <Survey hasParentTitle surveyKey={SURVEY_KEY.EXPENSE_SUBMITTED_NEW_FLOW} /> : null,
            duration: 20000,
          });
        }

        track(AnalyticsEvent.EXPENSE_SUBMISSION_SUBMITTED_SUCCESS);
        setSubmittedExpenseId(result.data.expense.legacyId);
      } catch (err) {
        track(AnalyticsEvent.EXPENSE_SUBMISSION_SUBMITTED_ERROR);
        toast({ variant: 'error', message: i18nGraphqlException(intl, err) });
      } finally {
        h.setSubmitting(false);
      }
    },
  });

  const { currentStep, setCurrentStep, prevStep, nextStep, onNextStepClick, step } = useSteps({
    steps: ExpenseStepOrder,
    form: expenseForm,
  });

  const [confirmNavigation] = useNavigationWarning({
    enabled: !submittedExpenseId,
    confirmationMessage: intl.formatMessage(I18nMessages.ConfirmExit),
  });

  const { onClose } = props;
  const handleOnClose = React.useCallback(() => {
    if (confirmNavigation()) {
      onClose(!!submittedExpenseId);
    }
  }, [confirmNavigation, onClose, submittedExpenseId]);

  if (submittedExpenseId) {
    return (
      <Dialog
        defaultOpen
        onOpenChange={open => {
          if (!open) {
            handleOnClose();
          }
        }}
      >
        <DialogContent>
          <SubmittedExpense expenseId={submittedExpenseId} />
          <DialogFooter className="flex justify-center sm:justify-center">
            <Button onClick={handleOnClose}>
              <FormattedMessage id="Finish" defaultMessage="Finish" />
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog
      defaultOpen
      onOpenChange={open => {
        if (!open) {
          handleOnClose();
        }
      }}
    >
      <DialogContent
        hideCloseButton
        overlayClassName="p-0 sm:p-0"
        className={clsx({
          'sm:max-w-screen sm:min-w-screen rounded-none p-0 sm:rounded-none sm:p-0': !submittedExpenseId,
        })}
      >
        <div className="max-w-screen min-w-screen flex max-h-screen min-h-screen flex-col">
          <header className="min-w-screen flex items-center justify-between border-b border-slate-100 px-4 py-3 sm:px-10">
            <span className="text-xl font-bold leading-7 text-slate-800">
              <FormattedMessage id="ExpenseForm.Submit" defaultMessage="Submit expense" />
            </span>
            <Button
              onClick={handleOnClose}
              variant="ghost"
              className="hidden cursor-pointer items-center gap-2 px-4 py-3 text-base font-medium leading-5 text-slate-800 sm:visible sm:flex"
              asChild
            >
              <span>
                <FormattedMessage id="Close" defaultMessage="Close" />
                <X />
              </span>
            </Button>

            <Button onClick={handleOnClose} variant="ghost" className="cursor-pointer sm:hidden" asChild>
              <X />
            </Button>
          </header>
          <main className="flex w-full flex-grow overflow-auto">
            <div className="flex w-full flex-grow justify-center sm:px-8 sm:pt-10">
              <div className="flex h-max w-full flex-col pb-4 sm:flex sm:w-[768px] sm:flex-row sm:gap-8 sm:pb-0">
                <SubmitExpenseFlowSteps
                  onStepClick={newStepName => setCurrentStep(newStepName)}
                  expenseForm={expenseForm}
                  currentStep={currentStep}
                />

                <div className="flex-grow px-4 pt-4 sm:px-0 sm:pt-0">
                  <form ref={formRef} onSubmit={e => e.preventDefault()}>
                    <step.Form form={expenseForm} />
                  </form>
                </div>
              </div>
            </div>
          </main>
          <ExpenseWarnings form={expenseForm} />
          <SubmitExpenseFlowFooter
            expenseForm={expenseForm}
            isLastStep={ExpenseStepOrder.indexOf(currentStep) === ExpenseStepOrder.length - 1}
            isStepValid={!step.hasError(expenseForm)}
            onNextStepClick={onNextStepClick}
            readyToSubmit={!nextStep && isEmpty(expenseForm.errors)}
            setCurrentStep={setCurrentStep}
            nextStep={nextStep}
            prevStep={prevStep}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}

type SubmitExpenseFlowStepsProps = {
  expenseForm: ExpenseForm;
  currentStep: ExpenseFlowStep;
  onStepClick: (stepName: ExpenseFlowStep) => void;
};

function SubmitExpenseFlowSteps(props: SubmitExpenseFlowStepsProps) {
  const [collapsed, setCollapsed] = React.useState(true);

  const currentStep = Steps[props.currentStep];
  return (
    <React.Fragment>
      <div className="sticky top-0 z-50 w-full self-start bg-white drop-shadow-lg sm:top-10 sm:w-[165px] sm:min-w-[165px] sm:drop-shadow-none">
        <div
          className={clsx('flex items-center gap-2 px-4 py-2 text-sm sm:hidden', {
            'border-b border-slate-200 ': collapsed,
          })}
        >
          <span className="inline-block max-w-[120px] overflow-hidden text-ellipsis whitespace-nowrap text-oc-blue-tints-800">
            <currentStep.Title form={props.expenseForm} />
          </span>
          <span className="text-oc-blue-tints-800">/</span>
          <div className="flex gap-3 text-xs">
            {ExpenseStepOrder.map((stepName, i) => {
              const step = Steps[stepName];
              return (
                <StepListItemIcon
                  key={stepName}
                  completed={
                    (props.currentStep === stepName &&
                      (!step.hasError(props.expenseForm) || i === ExpenseStepOrder.length - 1)) ||
                    (!step.hasError(props.expenseForm) && i < ExpenseStepOrder.indexOf(props.currentStep))
                  }
                  current={props.currentStep === stepName}
                />
              );
            })}
          </div>
          <Button variant="ghost" size="xs" className="ml-auto cursor-pointer" onClick={() => setCollapsed(!collapsed)}>
            {collapsed ? <ChevronDown /> : <ChevronUp />}
          </Button>
        </div>
        <StepList
          className={clsx(
            'z-50 w-full border-b border-slate-100 bg-white px-4 py-2 drop-shadow-lg sm:block  sm:border-b-0 sm:px-0 sm:py-0 sm:drop-shadow-none',
            {
              'hidden sm:block': collapsed,
              'absolute block': !collapsed,
            },
          )}
        >
          {ExpenseStepOrder.map((stepName, i) => {
            const step = Steps[stepName];
            const completed =
              (props.currentStep === stepName &&
                (!step.hasError(props.expenseForm) || i === ExpenseStepOrder.length - 1)) ||
              (!step.hasError(props.expenseForm) && i < ExpenseStepOrder.indexOf(props.currentStep));
            const disabled = !completed || i > ExpenseStepOrder.indexOf(props.currentStep);
            const isInitialLoadOfExpense = props.expenseForm.startOptions.expenseId && props.expenseForm.initialLoading;
            return (
              <StepListItem
                key={stepName}
                onClick={() => props.onStepClick(stepName)}
                className="w-full"
                current={props.currentStep === stepName}
                disabled={disabled}
                completed={completed}
                title={<step.Title form={props.expenseForm} />}
                subtitle={
                  isInitialLoadOfExpense ? (
                    <LoadingPlaceholder height={20} />
                  ) : step.Subtitle ? (
                    <step.Subtitle form={props.expenseForm} />
                  ) : null
                }
              />
            );
          })}
        </StepList>
      </div>
    </React.Fragment>
  );
}

type SubmitExpenseFlowFooterProps = {
  prevStep?: ExpenseFlowStep;
  nextStep?: ExpenseFlowStep;
  isLastStep: boolean;
  readyToSubmit: boolean;
  expenseForm: ExpenseForm;
  isStepValid: boolean;
  onNextStepClick: () => void;
  setCurrentStep: (s: ExpenseFlowStep) => void;
};

function SubmitExpenseFlowFooter(props: SubmitExpenseFlowFooterProps) {
  return (
    <footer className="min-w-screen flex items-center justify-between gap-4 border-t border-slate-100 px-10 py-2 sm:justify-center">
      <Button
        variant="outline"
        disabled={!props.prevStep}
        className={clsx('flex gap-2', { invisible: !props.prevStep })}
        onClick={props.prevStep ? () => props.setCurrentStep(props.prevStep) : undefined}
      >
        <ArrowLeft />
        <FormattedMessage defaultMessage="Go back" id="orvpWh" />
      </Button>

      {props.isLastStep ? (
        <Button
          disabled={!props.readyToSubmit || props.expenseForm.isSubmitting || props.expenseForm.isValidating}
          onClick={props.expenseForm.submitForm}
        >
          <FormattedMessage id="submit" defaultMessage="Submit" />
        </Button>
      ) : (
        <Button
          disabled={
            !props.nextStep || !props.isStepValid || props.expenseForm.isSubmitting || props.expenseForm.isValidating
          }
          className={clsx('flex gap-2', { invisible: !props.nextStep })}
          onClick={props.onNextStepClick}
        >
          <FormattedMessage id="Pagination.Next" defaultMessage="Next" />
          <ArrowRight />
        </Button>
      )}
    </footer>
  );
}
