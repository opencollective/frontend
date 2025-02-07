import React from 'react';
import { gql, useMutation } from '@apollo/client';
import { useFormikContext } from 'formik';
import { get, isEmpty, omit, pick, truncate } from 'lodash';
import { Pencil, Trash2 } from 'lucide-react';
import { FormattedMessage, useIntl } from 'react-intl';

import { CollectiveType } from '../../../lib/constants/collectives';
import { i18nGraphqlException } from '../../../lib/errors';
import { API_V2_CONTEXT, gqlV1 } from '../../../lib/graphql/helpers';
import {
  ExpenseStatus,
  type SavePayoutMethodMutation,
  type SavePayoutMethodMutationVariables,
} from '../../../lib/graphql/types/v2/graphql';
import { PayoutMethodType } from '../../../lib/graphql/types/v2/schema';

import { ComboSelect } from '@/components/ComboSelect';
import { FormField } from '@/components/FormField';
import { useModal } from '@/components/ModalContext';
import { Input } from '@/components/ui/Input';

import { CONFIRMATION_MODAL_TERMINATE } from '../../ConfirmationModal';
import PayoutMethodForm, { validatePayoutMethod } from '../../expenses/PayoutMethodForm';
import LoadingPlaceholder from '../../LoadingPlaceholder';
import MessageBox from '../../MessageBox';
import { I18nPayoutMethodLabels, PayoutMethodLabel } from '../../PayoutMethodLabel';
import { Button } from '../../ui/Button';
import { RadioGroup, RadioGroupCard } from '../../ui/RadioGroup';
import { useToast } from '../../ui/useToast';
import { PayoutMethodDetailsContainer } from '../PayoutMethodDetails';
import { Step } from '../SubmitExpenseFlowSteps';
import { type ExpenseForm } from '../useExpenseForm';

import { FormSectionContainer } from './FormSectionContainer';
import { memoWithGetFormProps } from './helper';

type PayoutMethodSectionProps = {
  inViewChange: (inView: boolean, entry: IntersectionObserverEntry) => void;
} & ReturnType<typeof getFormProps>;

function getFormProps(form: ExpenseForm) {
  return {
    ...pick(form, ['setFieldTouched', 'setFieldValue', 'initialLoading', 'refresh']),
    ...pick(form.values, ['payeeSlug', 'payoutMethodId']),
    ...pick(form.options, [
      'payee',
      'payoutMethods',
      'recentlySubmittedExpenses',
      'isAdminOfPayee',
      'loggedInAccount',
      'expense',
    ]),
  };
}

// eslint-disable-next-line prefer-arrow-callback
export const PayoutMethodSection = memoWithGetFormProps(function PayoutMethodSection(props: PayoutMethodSectionProps) {
  const { inViewChange, ...rest } = props;
  return (
    <FormSectionContainer
      step={Step.PAYOUT_METHOD}
      inViewChange={inViewChange}
      title={<FormattedMessage defaultMessage="Select a payout method" id="Ri4REE" />}
    >
      <PayoutMethodFormContent {...rest} />
    </FormSectionContainer>
  );
}, getFormProps);

// eslint-disable-next-line prefer-arrow-callback
export const PayoutMethodFormContent = memoWithGetFormProps(function PayoutMethodFormContent(
  props: ReturnType<typeof getFormProps>,
) {
  const [lastUsedPayoutMethod, setLastUsedPayoutMethod] =
    React.useState<ExpenseForm['options']['payoutMethods'][number]>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  const isLoadingPayee = props.payeeSlug && !props.payeeSlug.startsWith('__') && props.payee?.slug !== props.payeeSlug;

  const isPickingProfileAdministered = props.payeeSlug === '__findAccountIAdminister';

  const payoutMethods = React.useMemo(() => {
    if (!props.payoutMethods) {
      return [];
    }

    if (!lastUsedPayoutMethod) {
      return props.payoutMethods;
    }

    return [lastUsedPayoutMethod, ...(props.payoutMethods?.filter(p => p.id !== lastUsedPayoutMethod.id) || [])];
  }, [props.payoutMethods, lastUsedPayoutMethod]);

  const { setFieldValue, setFieldTouched, refresh } = props;
  React.useEffect(() => {
    const lastSubmittedExpenseByPayee = (props.recentlySubmittedExpenses?.nodes || [])
      .filter(e => e && e.payee.slug === props.payeeSlug && e.payoutMethod?.id)
      .find(() => true);
    const lastUsedPayoutMethodId = lastSubmittedExpenseByPayee?.payoutMethod?.id;
    const lastUsed = lastUsedPayoutMethodId && (props.payoutMethods || []).find(p => p.id === lastUsedPayoutMethodId);

    if (lastUsed) {
      setLastUsedPayoutMethod(lastUsed);
    } else {
      setLastUsedPayoutMethod(null);
    }

    if (!props.payoutMethodId && lastUsed) {
      setFieldValue('payoutMethodId', lastUsed?.id);
    } else if (
      props.payoutMethodId !== '__newPayoutMethod' &&
      (!props.payoutMethodId || !payoutMethods.some(p => p.id === props.payoutMethodId))
    ) {
      setFieldValue('payoutMethodId', payoutMethods.at(0)?.id);
    }

    if (!props.initialLoading) {
      setIsLoading(false);
    }
  }, [
    props.initialLoading,
    props.payeeSlug,
    props.recentlySubmittedExpenses,
    setFieldValue,
    props.payoutMethodId,
    props.payoutMethods,
    payoutMethods,
  ]);

  const isNewPayoutMethodSelected = !isLoadingPayee && props.payoutMethodId === '__newPayoutMethod';

  const isVendor = props.payee?.type === CollectiveType.VENDOR;

  const onPaymentMethodDeleted = React.useCallback(
    async deletedPayoutMethodId => {
      if (deletedPayoutMethodId === props.payoutMethodId) {
        setFieldValue('payoutMethodId', null);
      }
      await refresh();
    },
    [props.payoutMethodId, refresh, setFieldValue],
  );

  const onPaymentMethodEdited = React.useCallback(
    async newPayoutMethodId => {
      await refresh();
      setFieldValue('payoutMethodId', newPayoutMethodId);
    },
    [refresh, setFieldValue],
  );

  return (
    <div>
      {!isLoading &&
      !isLoadingPayee &&
      !isPickingProfileAdministered &&
      !isVendor &&
      !props.isAdminOfPayee &&
      !(props.expense?.status === ExpenseStatus.DRAFT && !props.loggedInAccount) ? (
        <MessageBox type="info">
          <FormattedMessage
            defaultMessage="The person you are inviting to submit this expense will be asked to provide payout method details."
            id="LHdznY"
          />
        </MessageBox>
      ) : (
        <RadioGroup
          id="payoutMethodId"
          value={props.payoutMethodId}
          onValueChange={payoutMethodId => {
            setFieldValue('payoutMethodId', payoutMethodId);
            setFieldTouched('payoutMethodId', true);
          }}
        >
          {!(isLoading || isLoadingPayee) &&
            payoutMethods?.map(p => (
              <PayoutMethodRadioGroupItemWrapper
                key={p.id}
                payoutMethod={p}
                isChecked={p.id === props.payoutMethodId}
                isEditable={!isVendor}
                onPaymentMethodDeleted={onPaymentMethodDeleted}
                onPaymentMethodEdited={onPaymentMethodEdited}
              />
            ))}

          {(isLoading || isLoadingPayee) && (
            <RadioGroupCard value="" disabled>
              <LoadingPlaceholder height={24} width={1} />
            </RadioGroupCard>
          )}

          {!(isLoading || isLoadingPayee) && !isVendor && (
            <RadioGroupCard
              value="__newPayoutMethod"
              checked={isNewPayoutMethodSelected}
              disabled={isLoading || props.initialLoading}
              showSubcontent={!props.initialLoading && isNewPayoutMethodSelected}
              subContent={<NewPayoutMethodOptionWrapper />}
            >
              <FormattedMessage defaultMessage="New payout method" id="vJEJ0J" />
            </RadioGroupCard>
          )}
        </RadioGroup>
      )}
    </div>
  );
}, getFormProps);

export function generatePayoutMethodName(type, data) {
  switch (type) {
    case PayoutMethodType.PAYPAL:
      return data.email;
    case PayoutMethodType.BANK_ACCOUNT:
      if (data?.details?.IBAN) {
        return `IBAN ${data.details.IBAN}`;
      } else if (data?.details?.accountNumber) {
        return `A/N ${data.details.accountNumber}`;
      } else if (data?.details?.clabe) {
        return `Clabe ${data.details.clabe}`;
      } else if (data?.details?.bankgiroNumber) {
        return `BankGiro ${data.details.bankgiroNumber}`;
      } else if (data?.accountHolderName && data?.currency) {
        return `${data.accountHolderName} (${data.currency})`;
      }
      return `Bank Account`;
    case PayoutMethodType.OTHER:
      return truncate(data?.content, { length: 20 }).replace(/\n|\t/g, ' ');
    default:
      return type;
  }
}

export function NewPayoutMethodOptionWrapper(props) {
  const form = useFormikContext() as ExpenseForm;
  return <NewPayoutMethodOption {...props} {...NewPayoutMethodOption.getFormProps(form)} />;
}

type NewPayoutMethodOptionProps = ReturnType<typeof getNewPayoutMethodOptionFormProps>;

function getNewPayoutMethodOptionFormProps(form: ExpenseForm) {
  return {
    ...pick(form, ['setFieldValue', 'setFieldTouched', 'validateForm', 'refresh']),
    ...pick(form.values, ['newPayoutMethod', 'payeeSlug']),
    ...pick(form.options, ['supportedPayoutMethods', 'host', 'loggedInAccount']),
    touchedNewPayoutMethod: form.touched.newPayoutMethod,
  };
}

// eslint-disable-next-line prefer-arrow-callback
const NewPayoutMethodOption = memoWithGetFormProps(function NewPayoutMethodOption(props: NewPayoutMethodOptionProps) {
  const intl = useIntl();
  const { toast } = useToast();
  const [creatingPayoutMethod, setIsCreatingPayoutMethod] = React.useState(false);

  const { setFieldValue, setFieldTouched, validateForm, refresh } = props;
  React.useEffect(() => {
    if (!props.touchedNewPayoutMethod?.name) {
      setFieldValue(
        'newPayoutMethod.name',
        generatePayoutMethodName(props.newPayoutMethod.type, props.newPayoutMethod.data),
      );
    }
  }, [
    props.newPayoutMethod.name,
    props.newPayoutMethod.type,
    props.newPayoutMethod.data.email,
    props.newPayoutMethod.data.details,
    props.newPayoutMethod.data.currency,
    props.touchedNewPayoutMethod?.name,
    props.newPayoutMethod.data,
    setFieldValue,
  ]);

  const [createPayoutMethod] = useMutation<SavePayoutMethodMutation, SavePayoutMethodMutationVariables>(
    gql`
      mutation SavePayoutMethod($payoutMethod: PayoutMethodInput!, $payeeSlug: String!) {
        createPayoutMethod(payoutMethod: $payoutMethod, account: { slug: $payeeSlug }) {
          id
        }
      }
    `,
    {
      context: API_V2_CONTEXT,
      variables: {
        payoutMethod: props.newPayoutMethod,
        payeeSlug: props.payeeSlug,
      },
    },
  );

  const onSaveButtonClick = React.useCallback(async () => {
    try {
      setFieldTouched('newPayoutMethod.type');
      setFieldTouched('newPayoutMethod.data.currency');
      validateForm();
      const errors = validatePayoutMethod(props.newPayoutMethod);
      if (!isEmpty(errors)) {
        return;
      }
      setIsCreatingPayoutMethod(true);
      const response = await createPayoutMethod();
      const newPayoutMethodId = response.data.createPayoutMethod.id;
      await refresh();
      setFieldValue('payoutMethodId', newPayoutMethodId);
      setFieldValue('newPayoutMethod', { data: {} });
      toast({ variant: 'success', message: 'Payout method created' });
    } catch (e) {
      toast({ variant: 'error', message: i18nGraphqlException(intl, e) });
    } finally {
      setIsCreatingPayoutMethod(false);
    }
  }, [createPayoutMethod, intl, props.newPayoutMethod, refresh, setFieldTouched, setFieldValue, toast, validateForm]);

  return (
    <div className="space-y-3 p-2">
      {creatingPayoutMethod ? (
        <LoadingPlaceholder width={1} height={24} />
      ) : (
        <React.Fragment>
          <FormField
            label={intl.formatMessage({ defaultMessage: 'Choose a payout method', id: 'SlAq2H' })}
            isPrivate
            name="newPayoutMethod.type"
          >
            {({ field }) => (
              <ComboSelect
                {...field}
                options={props.supportedPayoutMethods.map(m => ({
                  value: m,
                  label: intl.formatMessage(I18nPayoutMethodLabels[m]),
                }))}
                onChange={value => setFieldValue('newPayoutMethod.type', value as PayoutMethodType)}
              />
            )}
          </FormField>

          {props.newPayoutMethod?.type && (
            <React.Fragment>
              <PayoutMethodForm
                required
                alwaysSave
                fieldsPrefix="newPayoutMethod"
                payoutMethod={props.newPayoutMethod}
                host={props.host}
              />
              <div>
                <FormField
                  name="newPayoutMethod.name"
                  label={intl.formatMessage({ defaultMessage: 'Name', id: 'Fields.name' })}
                  onFocus={() => setFieldTouched('newPayoutMethod.name', true)}
                />

                {props.newPayoutMethod.name !==
                  generatePayoutMethodName(props.newPayoutMethod.type, props.newPayoutMethod.data) && (
                  <Button
                    size="xs"
                    variant="link"
                    className="p-0"
                    onClick={() => setFieldTouched('newPayoutMethod.name', false)}
                  >
                    <FormattedMessage defaultMessage="Use default generated name" id="+6P7pM" />
                  </Button>
                )}
              </div>
            </React.Fragment>
          )}
        </React.Fragment>
      )}

      {props.loggedInAccount && (
        <Button loading={creatingPayoutMethod} onClick={onSaveButtonClick} className="mt-2">
          <FormattedMessage defaultMessage="Save" id="save" />
        </Button>
      )}
    </div>
  );
}, getNewPayoutMethodOptionFormProps);

export function PayoutMethodRadioGroupItemWrapper(props: PayoutMethodRadioGroupItemProps) {
  const form = useFormikContext() as ExpenseForm;

  return <PayoutMethodRadioGroupItem {...props} {...PayoutMethodRadioGroupItem.getFormProps(form)} />;
}

function getPayoutMethodRadioGroupItemFormProps(form: ExpenseForm) {
  return {
    ...pick(form, ['setFieldValue', 'setFieldTouched', 'refresh']),
    ...pick(form.values, ['payeeSlug', 'editingPayoutMethod']),
    ...pick(form.options, ['payee', 'host']),
    touchedEditingPayoutMethod: form.touched.editingPayoutMethod,
  };
}

type PayoutMethodRadioGroupItemProps = {
  payoutMethod: ExpenseForm['options']['payoutMethods'][number];
  isChecked?: boolean;
  onPaymentMethodDeleted: (deletedPayoutMethodId) => void;
  onPaymentMethodEdited: (newPayoutMethodId: string) => void;
  isEditable?: boolean;
  Component?: React.ComponentType<{
    value?: string;
    showSubcontent?: boolean;
    asChild?: boolean;
    subContent: React.ReactNode;
  }>;
};

// eslint-disable-next-line prefer-arrow-callback
export const PayoutMethodRadioGroupItem = memoWithGetFormProps(function PayoutMethodRadioGroupItem(
  props: PayoutMethodRadioGroupItemProps & ReturnType<typeof getPayoutMethodRadioGroupItemFormProps>,
) {
  const Component = props.Component || RadioGroupCard;
  const intl = useIntl();
  const { toast } = useToast();

  const [isEditingPayoutMethod, setIsEditingPayoutMethod] = React.useState(false);
  const [isLoadingEditPayoutMethod, setIsLoadingEditPayoutMethod] = React.useState(false);

  const isMissingCurrency = isEmpty(props.payoutMethod.data?.currency);
  const isLegalNameFuzzyMatched = React.useMemo(() => {
    const accountHolderName: string = props.payoutMethod.data?.accountHolderName ?? '';
    const payeeLegalName: string = props.payee?.legalName ?? '';
    return accountHolderName.trim().toLowerCase() === payeeLegalName.trim().toLowerCase();
  }, [props.payoutMethod.data?.accountHolderName, props.payee?.legalName]);

  const hasLegalNameMismatch =
    props.payoutMethod.type === PayoutMethodType.BANK_ACCOUNT &&
    props.payeeSlug &&
    !props.payeeSlug.startsWith('__') &&
    props.payeeSlug === props.payee?.slug &&
    !isLegalNameFuzzyMatched;
  const isOpen = props.isChecked;

  const [isDeleted, setIsDeleted] = React.useState(false);

  const [keepNameDifferent, setKeepNameDifferent] = React.useState(false);

  const [legalNameUpdated, setLegalNameUpdated] = React.useState(false);

  const [submitLegalNameMutation, { loading }] = useMutation(
    gqlV1`
    mutation UpdatePayoutProfileLegalName($input: CollectiveInputType!) {
      editCollective(collective: $input) {
        id
        legalName
      }
    }
  `,
    {
      variables: {
        input: {
          id: props.payee?.legacyId,
          legalName: props.payoutMethod.data?.accountHolderName,
        },
      },
      update(cache, result) {
        cache.writeFragment({
          id: `Individual:${props.payee?.id}`,
          fragment: gql`
            fragment PayoutProfile on Account {
              legalName
            }
          `,
          data: {
            legalName: result.data.editCollective.legalName,
          },
        });

        props.refresh();
      },
    },
  );

  const onUpdateLegalNameToMatch = React.useCallback(async () => {
    try {
      await submitLegalNameMutation();
      setLegalNameUpdated(true);
      toast({ variant: 'success', message: 'Updated' });
    } catch (e) {
      toast({ variant: 'error', message: i18nGraphqlException(intl, e) });
    }
  }, [submitLegalNameMutation, toast, intl]);

  const [deletePayoutMethod] = useMutation(
    gql`
      mutation DeletePayoutMethod($payoutMethodId: String!) {
        removePayoutMethod(payoutMethodId: $payoutMethodId) {
          id
        }
      }
    `,
    {
      context: API_V2_CONTEXT,
      variables: {
        payoutMethodId: props.payoutMethod?.id,
      },
    },
  );

  const editPayoutMethodValue = omit(get(props.editingPayoutMethod, props.payoutMethod.id), ['id', '__typename']);
  const [createPayoutMethod] = useMutation<SavePayoutMethodMutation, SavePayoutMethodMutationVariables>(
    gql`
      mutation SavePayoutMethod($payoutMethod: PayoutMethodInput!, $payeeSlug: String!) {
        createPayoutMethod(payoutMethod: $payoutMethod, account: { slug: $payeeSlug }) {
          id
        }
      }
    `,
    {
      context: API_V2_CONTEXT,
      variables: {
        payeeSlug: props.payeeSlug,
        payoutMethod: editPayoutMethodValue,
      },
    },
  );

  const { showConfirmationModal } = useModal();

  const onDeleteClick = React.useCallback(
    e => {
      e.stopPropagation();
      e.preventDefault();
      showConfirmationModal({
        title: intl.formatMessage({
          defaultMessage: 'Delete Payout Method?',
          id: 'weGvmF',
        }),
        description: intl.formatMessage({
          defaultMessage: 'Are you sure you want to delete this payout method?',
          id: 'uR+TjD',
        }),
        children: <PayoutMethodLabel payoutMethod={props.payoutMethod} />,
        onConfirm: async () => {
          try {
            await deletePayoutMethod();
            await props.onPaymentMethodDeleted(props.payoutMethod.id);
            toast({
              variant: 'success',
              message: <FormattedMessage defaultMessage="Payout Method deleted successfully" id="2sVunP" />,
            });
          } catch (e) {
            toast({
              variant: 'error',
              message: i18nGraphqlException(intl, e),
            });
          }
        },
        confirmLabel: intl.formatMessage({ defaultMessage: 'Delete Payout Method', id: 'Rs7g0Y' }),
        variant: 'destructive',
      });
    },
    [intl, deletePayoutMethod, props, showConfirmationModal, toast],
  );

  const { setFieldValue, setFieldTouched } = props;
  const onEditClick = React.useCallback(
    e => {
      e.stopPropagation();
      e.preventDefault();
      setFieldValue(`editingPayoutMethod.${props.payoutMethod.id}`, {
        ...omit(props.payoutMethod, ['id', '__typename']),
        name: props.payoutMethod.name || generatePayoutMethodName(props.payoutMethod.type, props.payoutMethod.data),
      });
      setIsEditingPayoutMethod(!isEditingPayoutMethod);
    },
    [isEditingPayoutMethod, props.payoutMethod, setFieldValue],
  );

  const editNameTouched = get(props.touchedEditingPayoutMethod, `${props.payoutMethod.id}.name`, false);
  React.useEffect(() => {
    if (!isEditingPayoutMethod) {
      return;
    }

    if (!editNameTouched) {
      setFieldValue(
        `editingPayoutMethod.${props.payoutMethod.id}.name`,
        generatePayoutMethodName(editPayoutMethodValue.type, editPayoutMethodValue.data),
      );
    }
  }, [
    editPayoutMethodValue.name,
    editPayoutMethodValue.type,
    editPayoutMethodValue.data?.email,
    editPayoutMethodValue.data?.details,
    editPayoutMethodValue.data?.currency,
    editPayoutMethodValue.data,
    setFieldValue,
    isEditingPayoutMethod,
    editNameTouched,
    props.payoutMethod.id,
  ]);

  const { onPaymentMethodEdited } = props;
  const onSaveClick = React.useCallback(async () => {
    try {
      setIsLoadingEditPayoutMethod(true);
      const newPayoutMethodResponse = await createPayoutMethod();
      await deletePayoutMethod();
      setIsDeleted(true);
      toast({
        variant: 'success',
        message: <FormattedMessage defaultMessage="Payout Method edit successfully" id="cFfn2l" />,
      });
      await onPaymentMethodEdited(newPayoutMethodResponse.data.createPayoutMethod.id);
      return CONFIRMATION_MODAL_TERMINATE;
    } catch (e) {
      toast({
        variant: 'error',
        message: i18nGraphqlException(intl, e),
      });
    } finally {
      setIsLoadingEditPayoutMethod(false);
    }
  }, [createPayoutMethod, deletePayoutMethod, intl, onPaymentMethodEdited, toast]);

  if (isDeleted) {
    return null;
  }

  return (
    <React.Fragment>
      <Component
        value={props.payoutMethod.id}
        data-disabled={props.disabled}
        showSubcontent={isOpen}
        asChild
        subContent={
          isEditingPayoutMethod ? (
            <React.Fragment>
              {isLoadingEditPayoutMethod ? (
                <LoadingPlaceholder width={1} height={24} />
              ) : (
                <div className="space-y-2">
                  <PayoutMethodForm
                    required
                    alwaysSave
                    fieldsPrefix={`editingPayoutMethod.${props.payoutMethod.id}`}
                    payoutMethod={omit(props.payoutMethod, 'id')}
                    host={props.host}
                  />
                  <FormField
                    label={intl.formatMessage({ defaultMessage: 'Name', id: 'Fields.name' })}
                    name={`editingPayoutMethod.${props.payoutMethod.id}.name`}
                  >
                    {({ field }) => (
                      <Input
                        {...field}
                        onFocus={() => props.setFieldTouched(`editingPayoutMethod.${props.payoutMethod.id}.name`, true)}
                      />
                    )}
                  </FormField>
                  {editPayoutMethodValue?.name !==
                    generatePayoutMethodName(editPayoutMethodValue.type, editPayoutMethodValue.data) && (
                    <Button
                      size="xs"
                      variant="link"
                      className="p-0"
                      onClick={() => setFieldTouched(`editingPayoutMethod.${props.payoutMethod.id}.name`, false)}
                    >
                      <FormattedMessage defaultMessage="Use default generated name" id="+6P7pM" />
                    </Button>
                  )}
                </div>
              )}

              <div className="mt-4 flex justify-end gap-2">
                <Button
                  disabled={isLoadingEditPayoutMethod}
                  variant="secondary"
                  onClick={() => setIsEditingPayoutMethod(false)}
                >
                  <FormattedMessage defaultMessage="Cancel" id="actions.cancel" />
                </Button>
                <Button loading={isLoadingEditPayoutMethod} onClick={onSaveClick}>
                  <FormattedMessage defaultMessage="Save" id="save" />
                </Button>
              </div>
            </React.Fragment>
          ) : (
            <div className="flex flex-col gap-4">
              <PayoutMethodDetailsContainer payoutMethod={props.payoutMethod} maxItems={3} />
              {isMissingCurrency && (
                <div className="mt-2">
                  <MessageBox type="warning">
                    <div className="mb-2 font-bold">
                      <FormattedMessage defaultMessage="Missing currency" id="dkeCt1" />
                    </div>
                    <div>
                      <FormattedMessage
                        defaultMessage="Your payout method is missing a currency. Please edit your payout method to update it."
                        id="nrG4vz"
                      />
                    </div>
                  </MessageBox>
                </div>
              )}
              {hasLegalNameMismatch && (
                <MessageBox type="warning">
                  <div className="mb-2 font-bold">
                    <FormattedMessage defaultMessage="The names you provided do not match." id="XAPZa0" />
                  </div>
                  <div>
                    <FormattedMessage
                      defaultMessage="The legal name in the payee profile is: {legalName}."
                      id="NSammt"
                      values={{
                        legalName: props.payee?.legalName,
                      }}
                    />
                  </div>
                  <div>
                    <FormattedMessage
                      defaultMessage="The contact name in the payout method is: {accountHolderName}."
                      id="XC+vMa"
                      values={{
                        accountHolderName: props.payoutMethod.data?.accountHolderName,
                      }}
                    />
                  </div>

                  {!keepNameDifferent && (
                    <React.Fragment>
                      <div className="mt-4 mb-2 font-bold">
                        <FormattedMessage
                          defaultMessage=" Would you like to update your legal name to match your payout method contact name?"
                          id="fEYP7x"
                        />
                      </div>

                      <div className="flex gap-4">
                        <Button
                          disabled={loading}
                          loading={loading}
                          variant="outline"
                          onClick={onUpdateLegalNameToMatch}
                        >
                          <FormattedMessage defaultMessage="Yes, Update and Match" id="qjpM/f" />
                        </Button>
                        <Button disabled={loading} variant="outline" onClick={() => setKeepNameDifferent(true)}>
                          <FormattedMessage defaultMessage="No, Keep Them Different" id="PCBOGA" />
                        </Button>
                      </div>
                    </React.Fragment>
                  )}
                  {keepNameDifferent && (
                    <FormField
                      className="mt-4"
                      label={intl.formatMessage({
                        defaultMessage: 'Please explain why they are different',
                        id: 'bzGbkJ',
                      })}
                      name="payoutMethodNameDiscrepancyReason"
                    />
                  )}
                </MessageBox>
              )}
              {legalNameUpdated && !hasLegalNameMismatch && (
                <MessageBox type="warning">
                  <FormattedMessage
                    defaultMessage="Legal name is updated to match the payout method name."
                    id="TI6gwx"
                  />
                </MessageBox>
              )}
            </div>
          )
        }
      >
        <div className="grow">
          <PayoutMethodLabel showIcon payoutMethod={props.payoutMethod} />
        </div>
        {!isEditingPayoutMethod && props.isEditable && (
          <div className="flex gap-2">
            {props.isChecked && (
              <Button onClick={onEditClick} size="icon-xs" variant="ghost">
                <Pencil size={16} />
              </Button>
            )}
            <Button className="text-muted-foreground" onClick={onDeleteClick} size="icon-xs" variant="ghost">
              <Trash2 size={16} />
            </Button>
          </div>
        )}
      </Component>
    </React.Fragment>
  );
}, getPayoutMethodRadioGroupItemFormProps);
