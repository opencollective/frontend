import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { Undo } from '@styled-icons/fa-solid/Undo';
import { Field, FieldArray, Form, Formik } from 'formik';
import { first, isEmpty, omit, pick, trimStart } from 'lodash';
import { useRouter } from 'next/router';
import { createPortal } from 'react-dom';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';
import styled from 'styled-components';

import { getAccountReferenceInput, isInternalHost } from '../../lib/collective';
import { CollectiveType } from '../../lib/constants/collectives';
import expenseTypes from '../../lib/constants/expenseTypes';
import { PayoutMethodType } from '../../lib/constants/payout-method';
import { formatErrorMessage } from '../../lib/errors';
import { getSupportedExpenseTypes } from '../../lib/expenses';
import { requireFields } from '../../lib/form-utils';
import { ExpenseLockableFields, ExpenseStatus } from '../../lib/graphql/types/v2/graphql';
import useLoggedInUser from '../../lib/hooks/useLoggedInUser';
import { usePrevious } from '../../lib/hooks/usePrevious';
import { require2FAForAdmins } from '../../lib/policies';
import { AmountPropTypeShape } from '../../lib/prop-types';
import { flattenObjectDeep, parseToBoolean } from '../../lib/utils';
import { userMustSetAccountingCategory } from './lib/accounting-categories';
import { expenseTypeSupportsAttachments } from './lib/attachments';
import { addNewExpenseItem, newExpenseItem } from './lib/items';
import { checkExpenseSupportsOCR, updateExpenseFormWithUploadResult } from './lib/ocr';
import {
  checkRequiresAddress,
  expenseTypeSupportsItemCurrency,
  getSupportedCurrencies,
  validateExpenseTaxes,
} from './lib/utils';

import AccountingCategorySelect, { isSupportedExpenseCategory } from '../AccountingCategorySelect';
import ConfirmationModal from '../ConfirmationModal';
import { expenseTagsQuery } from '../dashboard/filters/ExpenseTagsFilter';
import { AutocompleteEditTags } from '../EditTags';
import { Box, Flex } from '../Grid';
import HTMLContent from '../HTMLContent';
import { serializeAddress } from '../I18nAddressFields';
import PrivateInfoIcon from '../icons/PrivateInfoIcon';
import LoadingPlaceholder from '../LoadingPlaceholder';
import MessageBox from '../MessageBox';
import StyledButton from '../StyledButton';
import StyledCard from '../StyledCard';
import { StyledCurrencyPicker } from '../StyledCurrencyPicker';
import StyledHr from '../StyledHr';
import StyledInput from '../StyledInput';
import StyledInputFormikField from '../StyledInputFormikField';
import StyledTextarea from '../StyledTextarea';
import { Label, P, Span } from '../Text';

import ExpenseAttachedFilesForm from './ExpenseAttachedFilesForm';
import ExpenseFormItems from './ExpenseFormItems';
import ExpenseFormPayeeInviteNewStep, { validateExpenseFormPayeeInviteNewStep } from './ExpenseFormPayeeInviteNewStep';
import ExpenseFormPayeeSignUpStep from './ExpenseFormPayeeSignUpStep';
import ExpenseFormPayeeStep, { checkStepOneCompleted } from './ExpenseFormPayeeStep';
import ExpenseInviteWelcome from './ExpenseInviteWelcome';
import { prepareExpenseItemForSubmit, validateExpenseItem } from './ExpenseItemForm';
import ExpenseRecurringBanner from './ExpenseRecurringBanner';
import ExpenseSummaryAdditionalInformation from './ExpenseSummaryAdditionalInformation';
import ExpenseTypeRadioSelect from './ExpenseTypeRadioSelect';
import ExpenseTypeTag from './ExpenseTypeTag';
import { validatePayoutMethod } from './PayoutMethodForm';

export const msg = defineMessages({
  descriptionPlaceholder: {
    id: `ExpenseForm.DescriptionPlaceholder`,
    defaultMessage: 'Enter expense title here...',
  },
  grantSubjectPlaceholder: {
    id: `ExpenseForm.GrantSubjectPlaceholder`,
    defaultMessage: 'e.g., research, software development, etc...',
  },
  addNewReceipt: {
    id: 'ExpenseForm.AddReceipt',
    defaultMessage: 'Add new receipt',
  },
  addNewItem: {
    id: 'ExpenseForm.AddLineItem',
    defaultMessage: 'Add new item',
  },
  addNewGrantItem: {
    id: 'ExpenseForm.AddGrantItem',
    defaultMessage: 'Add grant item',
  },
  stepReceipt: {
    id: 'ExpenseForm.StepExpense',
    defaultMessage: 'Upload one or multiple receipt',
  },
  stepInvoice: {
    id: 'ExpenseForm.StepExpenseInvoice',
    defaultMessage: 'Set invoice details',
  },
  stepFundingRequest: {
    id: 'ExpenseForm.StepExpenseFundingRequest',
    defaultMessage: 'Set grant details',
  },
  stepPayee: {
    id: 'ExpenseForm.StepPayeeInvoice',
    defaultMessage: 'Payee information',
  },
  cancelEditExpense: {
    id: 'ExpenseForm.CancelEditExpense',
    defaultMessage: 'Cancel Edit',
  },
  confirmCancelEditExpense: {
    id: 'ExpenseForm.ConfirmCancelEditExpense',
    defaultMessage: 'Are you sure you want to cancel the edits?',
  },
  clearExpenseForm: {
    id: 'ExpenseForm.ClearExpenseForm',
    defaultMessage: 'Clear Form',
  },
  confirmClearExpenseForm: {
    id: 'ExpenseForm.ConfirmClearExpenseForm',
    defaultMessage: 'Are you sure you want to clear the expense form?',
  },
});

const getDefaultExpense = (collective, supportedExpenseTypes) => {
  const isSingleSupportedExpenseType = supportedExpenseTypes.length === 1;

  return {
    description: '',
    longDescription: '',
    items: [],
    attachedFiles: [],
    payee: null,
    payoutMethod: undefined,
    privateMessage: '',
    invoiceInfo: '',
    currency: collective.currency,
    taxes: null,
    type: isSingleSupportedExpenseType ? supportedExpenseTypes[0] : undefined,
    accountingCategory: undefined,
    payeeLocation: {
      address: '',
      country: null,
    },
  };
};

const CREATE_PAYEE_PROFILE_FIELDS = ['name', 'email', 'legalName', 'organization', 'newsletterOptIn'];

/**
 * Take the expense's data as generated by `ExpenseForm` and strips out all optional data
 * like URLs for items when the expense is an invoice.
 */
export const prepareExpenseForSubmit = expenseData => {
  const keepAttachedFiles = expenseTypeSupportsAttachments(expenseData.type);

  // Prepare payee
  let payee;
  if (expenseData.payee) {
    // Invites use a different format: the payee ID is passed as a number, not a uuid
    // See https://github.com/opencollective/opencollective-api/blob/88e9864a716e4a2ad5237a81cee177b781829f42/server/graphql/v2/input/ExpenseInviteDraftInput.ts#L29
    if (expenseData.payee.isInvite) {
      payee = pick(expenseData.payee, ['id', 'legacyId', ...CREATE_PAYEE_PROFILE_FIELDS]);
      // The collective picker still uses API V1 for when creating a new profile on the fly
      if (payee.legacyId) {
        payee.id = payee.legacyId;
        delete payee.legacyId;
      }
    } else if (expenseData.payee.isNewUser) {
      payee = pick(expenseData.payee, CREATE_PAYEE_PROFILE_FIELDS);
    } else {
      payee = getAccountReferenceInput(expenseData.payee);
    }
  }

  const payeeLocation = expenseData.payee?.isInvite
    ? expenseData.payeeLocation
    : checkRequiresAddress(expenseData)
      ? pick(expenseData.payeeLocation, ['address', 'country', 'structured'])
      : null;

  const payoutMethod = pick(expenseData.payoutMethod, ['id', 'name', 'data', 'isSaved', 'type']);
  if (payoutMethod.id === 'new') {
    payoutMethod.id = null;
  }

  return {
    ...pick(expenseData, ['id', 'type', 'tags', 'currency']),
    payee,
    payeeLocation,
    payoutMethod,
    attachedFiles: keepAttachedFiles
      ? expenseData.attachedFiles?.map(file => pick(file, ['id', 'url', 'name', 'isInvoice']))
      : [],
    tax: expenseData.taxes?.filter(tax => !tax.isDisabled).map(tax => pick(tax, ['type', 'rate', 'idNumber'])),
    items: expenseData.items.map(item => prepareExpenseItemForSubmit(expenseData, item)),
    accountingCategory: !expenseData.accountingCategory ? null : pick(expenseData.accountingCategory, ['id']),
    description: expenseData.description?.trim(),
    longDescription: expenseData.longDescription?.trim(),
    privateMessage: expenseData.privateMessage?.trim(),
    invoiceInfo: expenseData.invoiceInfo?.trim(),
    reference: expenseData.reference?.trim(),
  };
};

/**
 * Validate the expense
 */
const validateExpense = (intl, expense, collective, host, LoggedInUser, canEditPayoutMethod) => {
  const isCardCharge = expense.type === expenseTypes.CHARGE;
  if (expense.payee?.isInvite) {
    return expense.payee.id
      ? requireFields(expense, ['description', 'payee', 'payee.id'])
      : requireFields(expense, ['description', 'payee', 'payee.name', 'payee.email']);
  }

  const errors = isCardCharge
    ? {}
    : expense.payee?.type === CollectiveType.VENDOR
      ? requireFields(expense, ['description', 'payee', 'currency'])
      : requireFields(expense, ['description', 'payee', 'payoutMethod', 'currency']);

  if (expense.items.length > 0) {
    const itemsErrors = expense.items.map(item => validateExpenseItem(expense, item));
    const hasErrors = itemsErrors.some(errors => !isEmpty(errors));
    if (hasErrors) {
      errors.items = itemsErrors;
    }
  }

  if (expense.taxes?.length) {
    const taxesErrors = validateExpenseTaxes(intl, expense.taxes);
    if (taxesErrors) {
      errors['taxes'] = taxesErrors;
    }
  }

  if (
    canEditPayoutMethod &&
    expense.payoutMethod &&
    // CHARGE expenses have VirtualCard and do not have PayoutMethod
    isCardCharge
  ) {
    const payoutMethodErrors = validatePayoutMethod(expense.payoutMethod);
    if (!isEmpty(payoutMethodErrors)) {
      errors.payoutMethod = payoutMethodErrors;
    }
  }

  if (checkRequiresAddress(expense)) {
    Object.assign(errors, requireFields(expense, ['payeeLocation.country', 'payeeLocation.address']));
  }

  if (userMustSetAccountingCategory(LoggedInUser, collective, host)) {
    Object.assign(errors, requireFields(expense, ['accountingCategory'], { allowNull: true }));
  }

  return errors;
};

const setLocationFromPayee = (formik, payee) => {
  formik.setFieldValue('payeeLocation.country', payee.location.country || null);
  formik.setFieldValue('payeeLocation.address', payee.location.address || '');
  formik.setFieldValue('payeeLocation.structured', payee.location.structured);
};

const HiddenFragment = styled.div`
  display: ${({ show }) => (show ? 'block' : 'none')};
`;

export const EXPENSE_FORM_STEPS = {
  PAYEE: 'PAYEE',
  EXPENSE: 'EXPENSE',
};

const getDefaultStep = (defaultStep, stepOneCompleted, isCreditCardCharge) => {
  // Card Charges take priority here because they are technically incomplete.
  if (isCreditCardCharge) {
    return EXPENSE_FORM_STEPS.EXPENSE;
  } else if (!stepOneCompleted) {
    return EXPENSE_FORM_STEPS.PAYEE;
  } else {
    return defaultStep || EXPENSE_FORM_STEPS.PAYEE;
  }
};

const checkOCREnabled = (router, host) => {
  const urlFlag = router.query.ocr && parseToBoolean(router.query.ocr);
  return urlFlag !== false && isInternalHost(host);
};

const STYLED_CURRENCY_PICKER_STYLE = { menu: { width: '280px' } };

const ExpenseFormBody = ({
  formik,
  payoutProfiles,
  collective,
  host,
  expense,
  autoFocusTitle,
  onCancel,
  formPersister,
  loggedInAccount,
  loading,
  shouldLoadValuesFromPersister,
  isDraft,
  defaultStep,
  drawerActionsContainer,
  supportedExpenseTypes,
  canEditPayoutMethod,
}) => {
  const intl = useIntl();
  const { formatMessage } = intl;
  const router = useRouter();
  const formRef = React.useRef();
  const { LoggedInUser } = useLoggedInUser();
  const { values, handleChange, errors, setValues, dirty, touched, resetForm, setErrors } = formik;
  const hasBaseFormFieldsCompleted = values.type && values.description;
  const hasOCRPreviewEnabled = checkOCREnabled(router, host);
  const hasOCRFeature = hasOCRPreviewEnabled && checkExpenseSupportsOCR(values.type, LoggedInUser);
  const isInvite = values.payee?.isInvite;
  const isNewUser = !values.payee?.id;
  const isHostAdmin = Boolean(LoggedInUser?.isAdminOfCollective(host));
  const isReceipt = values.type === expenseTypes.RECEIPT;
  const isGrant = values.type === expenseTypes.GRANT;
  const isCreditCardCharge = values.type === expenseTypes.CHARGE;
  const isRecurring = expense && expense.recurringExpense !== null;
  const [isOnBehalf, setOnBehalf] = React.useState(false);
  const isMissing2FA = require2FAForAdmins(values.payee) && !loggedInAccount?.hasTwoFactorAuth;
  const stepOneCompleted =
    checkStepOneCompleted(values, isOnBehalf, isMissing2FA, canEditPayoutMethod) &&
    isEmpty(flattenObjectDeep(omit(errors, 'payoutMethod.data.currency')));
  const stepTwoCompleted = isInvite
    ? true
    : (stepOneCompleted || isCreditCardCharge) && hasBaseFormFieldsCompleted && values.items.length > 0;
  const availableCurrencies = getSupportedCurrencies(collective, values);
  const [step, setStep] = React.useState(() => getDefaultStep(defaultStep, stepOneCompleted, isCreditCardCharge));
  const [initWithOCR, setInitWithOCR] = React.useState(null);

  // Only true when logged in and drafting the expense
  const [showResetModal, setShowResetModal] = React.useState(false);
  const editingExpense = expense !== undefined;

  // Scroll to top when step changes
  React.useEffect(() => {
    const boundingRect = formRef.current?.getBoundingClientRect();
    if (boundingRect) {
      const elemTop = boundingRect.top + window.scrollY;
      window.scroll({ top: elemTop - 75 });
    }
  }, [step]);

  // When user logs in we set its account as the default payout profile if not yet defined
  React.useEffect(() => {
    const payeePayoutProfile = values?.payee && payoutProfiles?.find(p => p.slug === values.payee.slug);
    if (values?.draft?.payee && !loggedInAccount && !isRecurring) {
      formik.setFieldValue('payee', {
        ...values.draft.payee,
        isInvite: false,
        isNewUser: true,
      });
    }
    // If logged in user edits a DRAFT without a key and it's not the payee, we'll presume they only want to edit the draft and not submit the draft
    else if (
      !payeePayoutProfile &&
      loggedInAccount &&
      isDraft &&
      values?.payee.type !== CollectiveType.VENDOR &&
      !router.query?.key &&
      !isRecurring
    ) {
      setOnBehalf(true);
    }
    // If creating a new expense or completing an expense submitted on your behalf, automatically select your default profile.
    else if (!isOnBehalf && (isDraft || !values.payee) && loggedInAccount && !isEmpty(payoutProfiles)) {
      const defaultProfile = payeePayoutProfile || first(payoutProfiles);
      formik.setFieldValue('payee', defaultProfile);
    }
    // Update the form state with private fields that were refeched after the user was authenticated
    if (isDraft && loggedInAccount) {
      const privateFields = ['payoutMethod', 'invoiceInfo'];
      for (const field of privateFields) {
        if (!values[field] && expense[field]) {
          formik.setFieldValue(field, expense[field]);
        }
      }
    }
  }, [payoutProfiles, loggedInAccount]);

  // Pre-fill with OCR data when the expense type is set
  React.useEffect(() => {
    if (initWithOCR && values.type) {
      updateExpenseFormWithUploadResult(collective, formik, initWithOCR);
      setInitWithOCR(null);
    }
  }, [initWithOCR, values.type]);

  // Pre-fill address based on the payout profile
  React.useEffect(() => {
    if (!values.payeeLocation?.address && values.payee?.location) {
      setLocationFromPayee(formik, values.payee);
    }
  }, [values.payee]);

  // Return to Payee step if type is changed and reset some values
  const previousType = usePrevious(values.type);
  React.useEffect(() => {
    if (!isCreditCardCharge && previousType && values.type !== previousType) {
      setStep(EXPENSE_FORM_STEPS.PAYEE);
      setOnBehalf(false);

      if (!isDraft && values.payee?.isInvite) {
        formik.setFieldValue('payee', null);
      }

      // Only invoices can have taxes
      if (values.taxes?.length && !values.taxes[0].isDisabled && values.type !== expenseTypes.INVOICE) {
        formik.setFieldValue('taxes', [{ ...values.taxes[0], isDisabled: true }]);
      }
    }

    // Reset the accounting category (if not supported by the new expense type)
    if (values.accountingCategory && !isSupportedExpenseCategory(values.type, values.accountingCategory)) {
      formik.setFieldValue('accountingCategory', undefined);
    }

    // If the new type does not support setting items currency, reset it
    if (!expenseTypeSupportsItemCurrency(values.type)) {
      const itemHasExpenseCurrency = item => !item.amountV2?.currency || item.amountV2?.currency === values.currency;
      const resetItemAmount = item => ({ ...item, amount: null, amountV2: null });
      const updatedItems = values.items.map(item => (itemHasExpenseCurrency(item) ? item : resetItemAmount(item)));
      formik.setFieldValue('items', updatedItems);
    }
  }, [values.type]);

  React.useEffect(() => {
    if (values.payeeLocation?.structured) {
      formik.setFieldValue('payeeLocation.address', serializeAddress(values.payeeLocation.structured));
    }
  }, [values.payeeLocation]);

  // Handle currency updates
  React.useEffect(() => {
    // Do nothing while loading
    if (loading) {
      return;
    }

    const payoutMethodCurrency = values.payoutMethod?.currency || values.payoutMethod?.data?.currency;
    const hasValidPayoutMethodCurrency = payoutMethodCurrency && availableCurrencies.includes(payoutMethodCurrency);
    const hasItemsWithAmounts = values.items.some(item => Boolean(item.amountV2?.valueInCents));

    // If the currency is not supported anymore, we need to do something
    if (!values.currency || !availableCurrencies.includes(values.currency)) {
      if (!hasItemsWithAmounts) {
        // If no items have amounts yet, we can safely set the default currency
        const defaultCurrency = hasValidPayoutMethodCurrency ? payoutMethodCurrency : availableCurrencies[0];
        formik.setFieldValue('currency', defaultCurrency);
      } else if (values.currency) {
        // If there are items with amounts, we need to reset the currency
        formik.setFieldValue('currency', null);
      }
    } else if (
      payoutMethodCurrency &&
      hasValidPayoutMethodCurrency &&
      !hasItemsWithAmounts &&
      values.currency !== payoutMethodCurrency
    ) {
      // When the payout method changes, if there's no items yet, we set the default currency to the payout method's currency
      formik.setFieldValue('currency', payoutMethodCurrency);
    }
  }, [loading, values.payoutMethod]);

  // Load values from localstorage
  React.useEffect(() => {
    if (shouldLoadValuesFromPersister && formPersister && !dirty && !isDraft) {
      const formValues = formPersister.loadValues();
      if (formValues) {
        // Reset payoutMethod if host is no longer connected to TransferWise
        if (formValues.payoutMethod?.type === PayoutMethodType.BANK_ACCOUNT && !host?.transferwise) {
          formValues.payoutMethod = undefined;
        }
        setValues(
          omit(
            formValues,
            // Omit deprecated fields, otherwise it will prevent expense submission
            ['location', 'privateInfo'],
          ),
        );
      }
    }
  }, [formPersister, dirty]);

  // Save values in localstorage
  React.useEffect(() => {
    if (dirty && formPersister) {
      formPersister.saveValues(values);
    }
  }, [formPersister, dirty, values]);

  const { setFieldValue } = formik;
  const onCurrencyPickerChange = React.useCallback(value => setFieldValue('currency', value), [setFieldValue]);

  let payeeForm;
  if (loading) {
    payeeForm = <LoadingPlaceholder height={32} />;
  } else if (isDraft && !loggedInAccount) {
    payeeForm = (
      <ExpenseFormPayeeSignUpStep
        collective={collective}
        formik={formik}
        onCancel={onCancel}
        onNext={() => setStep(EXPENSE_FORM_STEPS.EXPENSE)}
        expense={expense}
      />
    );
  } else if (isOnBehalf === true && isNewUser) {
    payeeForm = (
      <ExpenseFormPayeeInviteNewStep
        collective={collective}
        formik={formik}
        onBack={() => {
          setStep(EXPENSE_FORM_STEPS.PAYEE);
          setOnBehalf(false);
          formik.setFieldValue('payee', null);
          formik.setFieldValue('payoutMethod', null);
          formik.setFieldValue('payeeLocation', null);
        }}
        onNext={() => {
          formik.setFieldValue('payee', { ...values.payee, isInvite: true });
          const errors = validateExpenseFormPayeeInviteNewStep(formik.values);
          if (!isEmpty(errors)) {
            formik.setErrors(errors);
          } else {
            setStep(EXPENSE_FORM_STEPS.EXPENSE);
          }
        }}
        payoutProfiles={payoutProfiles}
      />
    );
  } else {
    payeeForm = (
      <ExpenseFormPayeeStep
        collective={collective}
        formik={formik}
        isOnBehalf={isOnBehalf}
        onCancel={onCancel}
        handleClearPayeeStep={() => setShowResetModal(true)}
        payoutProfiles={payoutProfiles}
        loggedInAccount={loggedInAccount}
        disablePayee={isDraft && isOnBehalf}
        canEditPayoutMethod={canEditPayoutMethod}
        onChange={payee => {
          setOnBehalf(payee.isInvite);
        }}
        onNext={values => {
          const shouldSkipPayoutMethodValidation =
            !canEditPayoutMethod ||
            ((isOnBehalf || values.payee?.type === CollectiveType.VENDOR) && isEmpty(values.payoutMethod));
          const validation = !shouldSkipPayoutMethodValidation && validatePayoutMethod(values.payoutMethod);
          if (isEmpty(validation)) {
            setStep(EXPENSE_FORM_STEPS.EXPENSE);
          } else {
            setErrors({ payoutMethod: validation });
          }
        }}
        editingExpense={editingExpense}
        resetDefaultStep={() => setStep(EXPENSE_FORM_STEPS.PAYEE)}
        formPersister={formPersister}
        onInvite={isInvite => {
          setOnBehalf(isInvite);
          formik.setFieldValue('payeeLocation', {});
          formik.setFieldValue('payee', {});
          formik.setFieldValue('payoutMethod', {});
        }}
        drawerActionsContainer={drawerActionsContainer}
      />
    );
  }

  const actionButtons = (
    <Flex flex={1} gridGap={[2, 3]} flexWrap="wrap">
      <StyledButton
        type="button"
        width={['100%', 'auto']}
        whiteSpace="nowrap"
        data-cy="expense-back"
        onClick={() => {
          if (isCreditCardCharge) {
            onCancel();
          } else {
            setStep(EXPENSE_FORM_STEPS.PAYEE);
          }
        }}
      >
        ←&nbsp;
        <FormattedMessage id="Back" defaultMessage="Back" />
      </StyledButton>
      <StyledButton
        type="submit"
        width={['100%', 'auto']}
        whiteSpace="nowrap"
        data-cy="expense-summary-btn"
        buttonStyle="primary"
        disabled={!stepTwoCompleted || !formik.isValid}
        loading={formik.isSubmitting}
        onClick={() => {
          // When used inside the drawer, the submit button is rendered outside the form (with a portal). The form must be manually submitted.
          if (drawerActionsContainer && formRef.current) {
            formRef.current.requestSubmit();
          }
        }}
      >
        {isInvite && !isDraft ? (
          <FormattedMessage id="Expense.SendInvite" defaultMessage="Send Invite" />
        ) : isCreditCardCharge ? (
          <FormattedMessage id="Expense.SaveReceipt" defaultMessage="Save Receipt" />
        ) : (
          <FormattedMessage id="Pagination.Next" defaultMessage="Next" />
        )}
        &nbsp;→
      </StyledButton>
      {errors.payoutMethod?.data?.currency && touched.items?.some?.(i => i.amountV2?.valueInCents) && (
        <Box mx={[2, 0]} mt={2} color="red.500" fontSize="12px" letterSpacing={0}>
          {errors.payoutMethod.data.currency.toString()}
        </Box>
      )}

      <StyledButton
        type="button"
        buttonStyle="borderless"
        width={['100%', 'auto']}
        color="red.500"
        marginLeft="auto"
        whiteSpace="nowrap"
        onClick={() => setShowResetModal(true)}
      >
        <Undo size={11} />
        <Span mx={1}>{formatMessage(editingExpense ? msg.cancelEditExpense : msg.clearExpenseForm)}</Span>
      </StyledButton>
    </Flex>
  );

  return (
    <Form ref={formRef}>
      {(expense?.permissions?.canDeclineExpenseInvite ||
        (expense?.status === ExpenseStatus.DRAFT && expense?.draft?.recipientNote)) && (
        <ExpenseInviteWelcome className="mb-8" expense={expense} draftKey={router.query.key} />
      )}
      {!isCreditCardCharge && (
        <ExpenseTypeRadioSelect
          name="type"
          onChange={handleChange}
          value={values.type}
          supportedExpenseTypes={supportedExpenseTypes}
          disabled={expense?.lockedFields?.includes(ExpenseLockableFields.TYPE)}
        />
      )}
      {isRecurring && <ExpenseRecurringBanner expense={expense} />}
      {values.type && (
        <StyledCard mt={4} p={[16, 16, 32]} overflow="initial">
          {step === EXPENSE_FORM_STEPS.PAYEE ? (
            <div>
              <Flex alignItems="center" mb={16}>
                <Span color="black.900" fontSize="18px" lineHeight="26px" fontWeight="bold">
                  {formatMessage(msg.stepPayee)}
                </Span>
                <Box ml={2}>
                  <PrivateInfoIcon size={12} className="text-muted-foreground" />
                </Box>
                <StyledHr flex="1" borderColor="black.300" mx={2} />
              </Flex>
              {payeeForm}
            </div>
          ) : step === EXPENSE_FORM_STEPS.EXPENSE ? (
            <div>
              <Flex alignItems="center" mb={10}>
                <P
                  as="label"
                  htmlFor="expense-description"
                  color="black.900"
                  fontSize="18px"
                  lineHeight="26px"
                  fontWeight="bold"
                >
                  {values.type === expenseTypes.GRANT ? (
                    <FormattedMessage
                      id="Expense.EnterRequestSubject"
                      defaultMessage="Enter grant subject <small>(Public)</small>"
                      values={{
                        small(msg) {
                          return (
                            <Span fontSize="14px" fontWeight="normal" color="black.600" fontStyle="italic">
                              {msg}
                            </Span>
                          );
                        },
                      }}
                    />
                  ) : (
                    <FormattedMessage
                      id="Expense.EnterExpenseTitle"
                      defaultMessage="Expense title <small>(Public)</small>"
                      values={{
                        small(msg) {
                          return (
                            <Span fontSize="14px" fontWeight="normal" color="black.600" fontStyle="italic">
                              {msg}
                            </Span>
                          );
                        },
                      }}
                    />
                  )}
                </P>
                <StyledHr flex="1" borderColor="black.300" ml={2} />
              </Flex>
              <P fontSize="12px" color="black.600">
                <FormattedMessage
                  id="Expense.PrivacyWarning"
                  defaultMessage="This information is public. Do not put any private details in this field."
                />
              </P>
              <Field
                as={StyledTextarea}
                autoFocus={autoFocusTitle}
                error={errors.description}
                fontSize="24px"
                id="expense-description"
                maxLength={255}
                mt={3}
                name="description"
                px="12px"
                py="8px"
                width="100%"
                autoSize
                placeholder={
                  values.type === expenseTypes.GRANT
                    ? formatMessage(msg.grantSubjectPlaceholder)
                    : formatMessage(msg.descriptionPlaceholder)
                }
                disabled={expense?.lockedFields?.includes(ExpenseLockableFields.DESCRIPTION)}
              />
              <HiddenFragment show={hasBaseFormFieldsCompleted || isInvite}>
                <div className="mt-2 flex flex-wrap justify-between gap-3">
                  {/* Tags */}
                  <div>
                    <Span color="black.900" fontSize="18px" lineHeight="26px" fontWeight="bold">
                      <FormattedMessage defaultMessage="Tag your expense" id="EosA8s" />
                    </Span>
                    <Flex alignItems="flex-start" mt={2}>
                      <ExpenseTypeTag type={values.type} mr="4px" />
                      <AutocompleteEditTags
                        query={expenseTagsQuery}
                        variables={{ account: { slug: collective.slug } }}
                        onChange={tags => {
                          formik.setFieldValue(
                            'tags',
                            tags.map(t => t.value.toLowerCase()),
                          );
                        }}
                        value={values.tags}
                      />
                    </Flex>
                  </div>
                  {/* Currency */}
                  <div>
                    <Span color="black.900" fontSize="18px" lineHeight="26px" fontWeight="bold" mr={2}>
                      <FormattedMessage defaultMessage="Expense Currency" id="3135/i" />
                    </Span>
                    <div className="mt-2 flex">
                      <div className="basis-[300px]">
                        <StyledInputFormikField name="currency" lab>
                          {({ field }) => (
                            <StyledCurrencyPicker
                              data-cy="expense-currency-picker"
                              availableCurrencies={availableCurrencies}
                              value={field.value}
                              onChange={onCurrencyPickerChange}
                              width="100%"
                              maxWidth="160px"
                              disabled={
                                (availableCurrencies.length < 2 && availableCurrencies[0] === values.currency) ||
                                (values.currency && expense?.lockedFields?.includes(ExpenseLockableFields.AMOUNT))
                              }
                              styles={STYLED_CURRENCY_PICKER_STYLE}
                            />
                          )}
                        </StyledInputFormikField>
                      </div>
                    </div>
                  </div>
                </div>
                {userMustSetAccountingCategory(LoggedInUser, collective, host) && (
                  <div className="mt-10">
                    <Label
                      htmlFor="ExpenseCategoryInput"
                      color="black.900"
                      fontSize="18px"
                      lineHeight="26px"
                      fontWeight="bold"
                    >
                      <FormattedMessage defaultMessage="Expense Category" id="38dzz9" />
                    </Label>
                    <MessageBox type="info" fontSize="12px" mt={2}>
                      <FormattedMessage
                        defaultMessage="Please make sure that all the expense items in this expense belong to the selected expense category. If needed, you may submit additional items in separate expenses with different expense categories."
                        id="Pkq+ZR"
                      />
                    </MessageBox>
                    <div className="mt-4 flex">
                      <StyledInputFormikField name="accountingCategory" lab>
                        {({ meta }) => (
                          <div>
                            <AccountingCategorySelect
                              id="ExpenseCategoryInput"
                              kind="EXPENSE"
                              host={host}
                              account={collective}
                              selectedCategory={values.accountingCategory}
                              onChange={value => formik.setFieldValue('accountingCategory', value)}
                              error={Boolean(meta.error)}
                              allowNone={!isHostAdmin}
                              showCode={isHostAdmin}
                              expenseType={values.type}
                              expenseValues={values}
                              predictionStyle="full"
                              selectFirstOptionIfSingle
                            />
                            {meta.error && meta.touched && (
                              <Span color="red.500" fontSize="12px" mt="4px">
                                {formatErrorMessage(intl, meta.error)}
                              </Span>
                            )}
                          </div>
                        )}
                      </StyledInputFormikField>
                    </div>
                    {formik.values.accountingCategory?.instructions && (
                      <React.Fragment>
                        <div className="mt-4 mb-2 text-sm font-semibold text-slate-800">
                          <FormattedMessage
                            id="withColon"
                            defaultMessage="{item}:"
                            values={{
                              item: <FormattedMessage defaultMessage="Account Category Instructions" id="+t6c4i" />,
                            }}
                          />
                        </div>
                        <HTMLContent openLinksInNewTab content={formik.values.accountingCategory.instructions} />
                      </React.Fragment>
                    )}
                  </div>
                )}
                {values.type === expenseTypes.INVOICE && (
                  <React.Fragment>
                    <div className="mt-2">
                      <div className="text-lg font-normal text-muted-foreground">
                        <FormattedMessage
                          defaultMessage="{field} (optional)"
                          id="OptionalFieldLabel"
                          values={{
                            field: (
                              <span className="font-bold text-foreground">
                                <FormattedMessage id="InvoiceReference" defaultMessage="Invoice reference" />
                              </span>
                            ),
                          }}
                        />
                      </div>
                      <p className="text-xs text-gray-500">
                        <FormattedMessage
                          id="InvoiceReferenceDescription"
                          defaultMessage="If the invoice being submitted has a reference number, add it here"
                        />
                      </p>
                      <Field
                        as={StyledInput}
                        error={errors.reference}
                        fontSize="14px"
                        id="expense-reference"
                        mt={3}
                        name="reference"
                        px="12px"
                        py="8px"
                        width="100%"
                        maxLength={255}
                        onChange={e => {
                          e.target.value = trimStart(e.target.value).replace(/\s+/g, ' ');
                          handleChange(e);
                        }}
                      />
                    </div>
                    <div className="mt-5">
                      <ExpenseAttachedFilesForm
                        title={<FormattedMessage id="UploadInvoice" defaultMessage="Upload invoice" />}
                        description={
                          <FormattedMessage
                            id="UploadInvoiceDescription"
                            defaultMessage="If you already have an invoice document, you can upload it here."
                          />
                        }
                        onChange={attachedFiles =>
                          formik.setFieldValue(
                            'attachedFiles',
                            attachedFiles.map((f, i) => ({ ...f, isInvoice: i === 0 })),
                          )
                        }
                        form={formik}
                        defaultValue={values.attachedFiles}
                      />
                    </div>
                  </React.Fragment>
                )}

                <Flex alignItems="center" my={24}>
                  <Span color="black.900" fontSize="18px" lineHeight="26px" fontWeight="bold">
                    {formatMessage(isReceipt ? msg.stepReceipt : isGrant ? msg.stepFundingRequest : msg.stepInvoice)}
                  </Span>
                  <StyledHr flex="1" borderColor="black.300" mx={2} />
                  <StyledButton
                    buttonSize="tiny"
                    type="button"
                    onClick={() => addNewExpenseItem(formik)}
                    minWidth={135}
                    data-cy="expense-add-item-btn"
                    disabled={isCreditCardCharge || expense?.lockedFields?.includes(ExpenseLockableFields.AMOUNT)}
                  >
                    +&nbsp;
                    {formatMessage(isReceipt ? msg.addNewReceipt : isGrant ? msg.addNewGrantItem : msg.addNewItem)}
                  </StyledButton>
                </Flex>
                <Box>
                  <FieldArray name="items">
                    {fieldsArrayProps => (
                      <ExpenseFormItems
                        {...fieldsArrayProps}
                        collective={collective}
                        hasOCRFeature={hasOCRFeature}
                        expense={expense}
                      />
                    )}
                  </FieldArray>
                </Box>

                {values.type === expenseTypes.GRANT && (
                  <Box my={40}>
                    <ExpenseAttachedFilesForm
                      title={<FormattedMessage id="UploadDocumentation" defaultMessage="Upload documentation" />}
                      description={
                        <FormattedMessage
                          id="UploadDocumentationDescription"
                          defaultMessage="If you want to include any documentation, you can upload it here."
                        />
                      }
                      onChange={attachedFiles => formik.setFieldValue('attachedFiles', attachedFiles)}
                      defaultValue={values.attachedFiles}
                    />
                  </Box>
                )}

                {drawerActionsContainer ? (
                  createPortal(actionButtons, drawerActionsContainer)
                ) : (
                  <Fragment>
                    <StyledHr flex="1" mt={4} mb={3} borderColor="black.300" />
                    {actionButtons}
                  </Fragment>
                )}
              </HiddenFragment>
            </div>
          ) : null}
        </StyledCard>
      )}
      {step === EXPENSE_FORM_STEPS.EXPENSE && (
        <StyledCard mt={4} p={[16, 24, 32]} overflow="initial">
          <ExpenseSummaryAdditionalInformation expense={formik.values} host={host} collective={collective} />
        </StyledCard>
      )}
      {showResetModal && (
        <ConfirmationModal
          onClose={() => setShowResetModal(false)}
          header={editingExpense ? formatMessage(msg.cancelEditExpense) : formatMessage(msg.clearExpenseForm)}
          body={
            editingExpense ? formatMessage(msg.confirmCancelEditExpense) : formatMessage(msg.confirmClearExpenseForm)
          }
          continueHandler={() => {
            if (editingExpense) {
              onCancel();
            } else {
              setStep(EXPENSE_FORM_STEPS.PAYEE);
              resetForm({ values: getDefaultExpense(collective, supportedExpenseTypes) });
              if (formPersister) {
                formPersister.clearValues();
                window.scrollTo(0, 0);
              }
            }
            setShowResetModal(false);
          }}
          {...(editingExpense && {
            continueLabel: formatMessage({ defaultMessage: 'Yes, cancel editing', id: 'b++lom' }),
            cancelLabel: formatMessage({ defaultMessage: 'No, continue editing', id: 'fIsGOi' }),
          })}
        />
      )}
    </Form>
  );
};

ExpenseFormBody.propTypes = {
  formik: PropTypes.object,
  payoutProfiles: PropTypes.array, // Can be null when loading
  autoFocusTitle: PropTypes.bool,
  canEditPayoutMethod: PropTypes.bool,
  shouldLoadValuesFromPersister: PropTypes.bool,
  onCancel: PropTypes.func,
  formPersister: PropTypes.object,
  /** Defines the default selected step, if accessible (previous steps need to be completed) */
  defaultStep: PropTypes.oneOf(Object.values(EXPENSE_FORM_STEPS)),
  loggedInAccount: PropTypes.object,
  loading: PropTypes.bool,
  isDraft: PropTypes.bool,
  host: PropTypes.shape({
    transferwise: PropTypes.shape({
      availableCurrencies: PropTypes.arrayOf(PropTypes.object),
    }),
    settings: PropTypes.shape({
      expenseTypes: PropTypes.shape({
        GRANT: PropTypes.bool,
        RECEIPT: PropTypes.bool,
        INVOICE: PropTypes.bool,
      }),
    }),
  }),
  collective: PropTypes.shape({
    slug: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    currency: PropTypes.string.isRequired,
    settings: PropTypes.object,
    isApproved: PropTypes.bool,
  }).isRequired,
  expense: PropTypes.shape({
    type: PropTypes.oneOf(Object.values(expenseTypes)),
    currency: PropTypes.string,
    description: PropTypes.string,
    status: PropTypes.string,
    payee: PropTypes.object,
    draft: PropTypes.object,
    payoutMethod: PropTypes.object,
    lockedFields: PropTypes.arrayOf(PropTypes.string),
    recurringExpense: PropTypes.shape({
      interval: PropTypes.string,
      endsAt: PropTypes.string,
    }),
    amountInAccountCurrency: AmountPropTypeShape,
    items: PropTypes.arrayOf(
      PropTypes.shape({
        url: PropTypes.string,
      }),
    ),
    permissions: PropTypes.shape({
      canDeclineExpenseInvite: PropTypes.bool,
    }),
  }),
  drawerActionsContainer: PropTypes.object,
  supportedExpenseTypes: PropTypes.arrayOf(PropTypes.string),
};

/**
 * Main create expense form
 */
const ExpenseForm = ({
  onSubmit,
  collective,
  host,
  expense,
  originalExpense,
  payoutProfiles,
  autoFocusTitle,
  onCancel,
  validateOnChange = false,
  formPersister,
  loggedInAccount,
  loading,
  shouldLoadValuesFromPersister,
  defaultStep,
  drawerActionsContainer,
  canEditPayoutMethod,
}) => {
  const isDraft = expense?.status === ExpenseStatus.DRAFT;
  const [hasValidate, setValidate] = React.useState(validateOnChange && !isDraft);
  const intl = useIntl();
  const { LoggedInUser } = useLoggedInUser();
  const supportedExpenseTypes = React.useMemo(() => getSupportedExpenseTypes(collective), [collective]);
  const initialValues = { ...getDefaultExpense(collective, supportedExpenseTypes), ...expense };
  const validate = expenseData =>
    validateExpense(intl, expenseData, collective, host, LoggedInUser, canEditPayoutMethod);

  if (isDraft) {
    initialValues.items = expense.draft.items?.map(newExpenseItem) || [];
    initialValues.taxes = expense.draft.taxes;
    initialValues.attachedFiles = expense.draft.attachedFiles;
    initialValues.reference = expense.draft.reference;
    initialValues.payoutMethod = expense.draft.payoutMethod || expense.payoutMethod;
    initialValues.payeeLocation = expense.draft.payeeLocation;
    initialValues.payee = expense.recurringExpense ? expense.payee : expense.draft.payee;
  }

  return (
    <Formik
      initialValues={initialValues}
      validate={hasValidate && validate}
      onSubmit={async (values, formik) => {
        // We initially let the browser do the validation. Then once users try to submit the
        // form at least once, we validate on each change to make sure they fix all the errors.
        const errors = validate(values);
        if (!isEmpty(errors)) {
          setValidate(true);
          formik.setErrors(errors);
        } else {
          return onSubmit(values);
        }
      }}
    >
      {formik => (
        <ExpenseFormBody
          formik={formik}
          payoutProfiles={payoutProfiles}
          collective={collective}
          host={host}
          expense={originalExpense}
          autoFocusTitle={autoFocusTitle}
          onCancel={onCancel}
          formPersister={formPersister}
          loggedInAccount={loggedInAccount}
          loading={loading}
          shouldLoadValuesFromPersister={shouldLoadValuesFromPersister}
          isDraft={isDraft}
          defaultStep={defaultStep}
          drawerActionsContainer={drawerActionsContainer}
          supportedExpenseTypes={supportedExpenseTypes}
          canEditPayoutMethod={canEditPayoutMethod}
        />
      )}
    </Formik>
  );
};

ExpenseForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  autoFocusTitle: PropTypes.bool,
  validateOnChange: PropTypes.bool,
  canEditPayoutMethod: PropTypes.bool,
  shouldLoadValuesFromPersister: PropTypes.bool,
  onCancel: PropTypes.func,
  /** To save draft of form values */
  formPersister: PropTypes.object,
  loggedInAccount: PropTypes.object,
  loading: PropTypes.bool,
  /** Defines the default selected step, if accessible (previous steps need to be completed) */
  defaultStep: PropTypes.oneOf(Object.values(EXPENSE_FORM_STEPS)),
  host: PropTypes.shape({
    slug: PropTypes.string.isRequired,
    transferwise: PropTypes.shape({
      availableCurrencies: PropTypes.arrayOf(PropTypes.object),
    }),
  }),
  collective: PropTypes.shape({
    currency: PropTypes.string.isRequired,
    slug: PropTypes.string.isRequired,
    settings: PropTypes.object,
    isApproved: PropTypes.bool,
  }).isRequired,
  /** If editing */
  expense: PropTypes.shape({
    type: PropTypes.oneOf(Object.values(expenseTypes)),
    description: PropTypes.string,
    status: PropTypes.string,
    payee: PropTypes.object,
    draft: PropTypes.object,
    payoutMethod: PropTypes.object,
    recurringExpense: PropTypes.object,
    items: PropTypes.arrayOf(
      PropTypes.shape({
        url: PropTypes.string,
      }),
    ),
    permissions: PropTypes.shape({
      canDeclineExpenseInvite: PropTypes.bool,
    }),
  }),
  /** To reset form */
  originalExpense: PropTypes.shape({
    type: PropTypes.oneOf(Object.values(expenseTypes)),
    description: PropTypes.string,
    status: PropTypes.string,
    payee: PropTypes.object,
    draft: PropTypes.object,
    payoutMethod: PropTypes.object,
    items: PropTypes.arrayOf(
      PropTypes.shape({
        url: PropTypes.string,
      }),
    ),
  }),
  /** Payout profiles that user has access to */
  payoutProfiles: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string,
      name: PropTypes.string,
      slug: PropTypes.string,
      location: PropTypes.shape({
        address: PropTypes.string,
        country: PropTypes.string,
        structured: PropTypes.object,
      }),
      payoutMethods: PropTypes.arrayOf(
        PropTypes.shape({
          id: PropTypes.string,
          type: PropTypes.oneOf(Object.values(PayoutMethodType)),
          name: PropTypes.string,
          data: PropTypes.object,
        }),
      ),
    }),
  ),
  drawerActionsContainer: PropTypes.object,
};

export default React.memo(ExpenseForm);
