import React from 'react';
import PropTypes from 'prop-types';
import { useMutation, useQuery } from '@apollo/client';
import { useFormik } from 'formik';
import { cloneDeep, filter, get, isEmpty, isNil, set, size } from 'lodash';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import { isSelfHostedAccount } from '../../../lib/collective';
import { MODERATION_CATEGORIES } from '../../../lib/constants/moderation-categories';
import { i18nGraphqlException } from '../../../lib/errors';
import { DEFAULT_SUPPORTED_EXPENSE_TYPES } from '../../../lib/expenses';
import { API_V2_CONTEXT, gql } from '../../../lib/graphql/helpers';
import { editCollectivePolicyMutation } from '../../../lib/graphql/v1/mutations';
import { stripHTML } from '../../../lib/html';
import { omitDeep } from '../../../lib/utils';

import Container from '../../Container';
import { Flex } from '../../Grid';
import { getI18nLink } from '../../I18nFormatters';
import Link from '../../Link';
import LoadingPlaceholder from '../../LoadingPlaceholder';
import MessageBox from '../../MessageBox';
import MessageBoxGraphqlError from '../../MessageBoxGraphqlError';
import RichTextEditor from '../../RichTextEditor';
import StyledCheckbox from '../../StyledCheckbox';
import StyledInputAmount from '../../StyledInputAmount';
import StyledInputField from '../../StyledInputField';
import StyledSelect from '../../StyledSelect';
import { P } from '../../Text';
import { Button } from '../../ui/Button';
import { Collapsible, CollapsibleContent } from '../../ui/Collapsible';
import { Switch } from '../../ui/Switch';
import { useToast } from '../../ui/useToast';

import { getSettingsQuery } from './EditCollectivePage';
import SettingsSectionTitle from './SettingsSectionTitle';

const EXPENSE_POLICY_MAX_LENGTH = 16000; // max in database is ~15,500
const CONTRIBUTION_POLICY_MAX_LENGTH = 3000; // 600 words * 5 characters average length word

const updateFilterCategoriesMutation = gql`
  mutation UpdateFilterCategories($account: AccountReferenceInput!, $key: AccountSettingsKey!, $value: JSON!) {
    editAccountSetting(account: $account, key: $key, value: $value) {
      id
      type
      isActive
      settings
    }
  }
`;

const setPoliciesMutation = gql`
  mutation SetPolicies($account: AccountReferenceInput!, $policies: PoliciesInput!) {
    setPolicies(account: $account, policies: $policies) {
      id
      policies {
        id
        EXPENSE_AUTHOR_CANNOT_APPROVE {
          enabled
          amountInCents
          appliesToHostedCollectives
          appliesToSingleAdminCollectives
        }
        REQUIRE_2FA_FOR_ADMINS
        COLLECTIVE_ADMINS_CAN_REFUND
        COLLECTIVE_MINIMUM_ADMINS {
          numberOfAdmins
          applies
          freeze
        }
        EXPENSE_CATEGORIZATION {
          requiredForExpenseSubmitters
          requiredForCollectiveAdmins
        }
        EXPENSE_PUBLIC_VENDORS
      }
    }
  }
`;

const messages = defineMessages({
  'rejectCategories.placeholder': {
    id: 'editCollective.rejectCategories.placeholder',
    defaultMessage: 'Choose categories',
  },
  'contributionPolicy.label': {
    id: 'collective.contributionPolicy.label',
    defaultMessage: 'Contribution Policy',
  },
  'contributionPolicy.placeholder': {
    id: 'collective.contributionPolicy.placeholder',
    defaultMessage: 'E.g. what types of contributions you will and will not accept.',
  },
  'contributionPolicy.error': {
    id: 'collective.contributionPolicy.error',
    defaultMessage: 'Contribution policy must contain less than {maxLength} characters',
  },
  'expensePolicy.label': {
    id: 'editCollective.menu.expenses',
    defaultMessage: 'Expenses Policy',
  },
  'expensePolicy.placeholder': {
    id: 'collective.expensePolicy.placeholder',
    defaultMessage: 'E.g. approval criteria, limitations, or required documentation.',
  },
  'expensePolicy.error': {
    id: 'collective.expensePolicy.error',
    defaultMessage: 'Expense policy must contain less than {maxLength} characters',
  },
  'invoiceExpensePolicy.label': {
    id: 'collective.invoiceExpensePolicy.label',
    defaultMessage: 'Invoice Expenses Policy',
  },
  'invoiceExpensePolicy.placeholder': {
    id: 'collective.expensePolicy.placeholder',
    defaultMessage: 'E.g. approval criteria, limitations, or required documentation.',
  },
  'invoiceExpensePolicy.error': {
    id: 'collective.expensePolicy.error',
    defaultMessage: 'Expense policy must contain less than {maxLength} characters',
  },
  'receiptExpensePolicy.label': {
    id: 'collective.receiptExpensePolicy.label',
    defaultMessage: 'Receipt Expenses Policy',
  },
  'receiptExpensePolicy.placeholder': {
    id: 'collective.expensePolicy.placeholder',
    defaultMessage: 'E.g. approval criteria, limitations, or required documentation.',
  },
  'receiptExpensePolicy.error': {
    id: 'collective.expensePolicy.error',
    defaultMessage: 'Expense policy must contain less than {maxLength} characters',
  },
  'titleExpensePolicy.label': {
    id: 'collective.titleExpensePolicy.label',
    defaultMessage: 'Expenses Title Policy',
  },
  'titleExpensePolicy.placeholder': {
    id: 'collective.expensePolicy.placeholder',
    defaultMessage: 'E.g. approval criteria, limitations, or required documentation.',
  },
  'titleExpensePolicy.error': {
    id: 'collective.expensePolicy.error',
    defaultMessage: 'Expense policy must contain less than {maxLength} characters',
  },
  'expensePolicy.allowExpense': {
    id: 'collective.expensePolicy.allowExpense',
    defaultMessage:
      'Only allow expenses to be created by Team Members and Financial Contributors (they may invite expenses from other payees)',
  },
  'expensePolicy.RECEIPT': {
    id: 'collective.expensePolicy.hasReceipt',
    defaultMessage: 'Allow receipts',
  },
  'expensePolicy.GRANT': {
    id: 'collective.expensePolicy.hasGrant',
    defaultMessage: 'Allow grants',
  },
  'expensePolicy.INVOICE': {
    id: 'collective.expensePolicy.hasInvoice',
    defaultMessage: 'Allow invoices',
  },
  'requiredAdmins.numberOfAdmins': {
    defaultMessage: '{admins, plural, =0 {Do not enforce minimum number of admins} one {# Admin} other {# Admins} }',
    id: 'tGmvPD',
  },
});

const Policies = ({ collective }) => {
  const intl = useIntl();
  const { formatMessage } = intl;
  const [selected, setSelected] = React.useState([]);
  const { toast } = useToast();
  const isSelfHosted = isSelfHostedAccount(collective);

  // GraphQL
  const { loading, data } = useQuery(getSettingsQuery, {
    variables: { slug: collective.slug },
    context: API_V2_CONTEXT,
  });
  const [updateCategories, { loading: isSubmittingCategories, error: categoriesError }] = useMutation(
    updateFilterCategoriesMutation,
    {
      context: API_V2_CONTEXT,
    },
  );
  const [updateCollective, { loading: isSubmittingSettings, error: settingsError }] =
    useMutation(editCollectivePolicyMutation);
  const [setPolicies, { loading: isSettingPolicies, error: policiesError }] = useMutation(setPoliciesMutation, {
    context: API_V2_CONTEXT,
  });
  const error = categoriesError || settingsError || policiesError;

  // Data and data handling
  const collectiveContributionFilteringCategories = get(data, 'account.settings.moderation.rejectedCategories', null);
  const collectiveContributionPolicy = get(collective, 'contributionPolicy', null);
  const collectiveDisableExpenseSubmission = get(collective, 'settings.disablePublicExpenseSubmission', false);
  const expenseTypes = get(collective, 'settings.expenseTypes') || DEFAULT_SUPPORTED_EXPENSE_TYPES;
  const numberOfAdmins = size(filter(collective.members, m => m.role === 'ADMIN'));
  const policies = omitDeep(data?.account?.policies || {}, ['__typename']);

  const selectOptions = React.useMemo(() => {
    const optionsArray = Object.entries(MODERATION_CATEGORIES).map(([key, value], index) => ({
      id: index,
      value: key,
      label: value,
    }));
    return optionsArray;
  }, [MODERATION_CATEGORIES]);

  // Form
  const formik = useFormik({
    initialValues: {
      contributionPolicy: collectiveContributionPolicy || '',
      disablePublicExpenseSubmission: collectiveDisableExpenseSubmission || false,
      expenseTypes,
      policies,
    },
    async onSubmit(values) {
      const { contributionPolicy, disablePublicExpenseSubmission, expenseTypes, policies } = values;
      const newSettings = { ...collective.settings, disablePublicExpenseSubmission };
      if (collective.isHost) {
        newSettings.expenseTypes = expenseTypes;
      }

      try {
        await updateCollective({
          variables: {
            collective: {
              id: collective.id,
              contributionPolicy,
              settings: newSettings,
            },
          },
        });
        const selectedRejectCategories = selected.map(option => option.value);
        await Promise.all([
          updateCategories({
            variables: {
              account: {
                legacyId: collective.id,
              },
              key: 'moderation',
              value: { rejectedCategories: selectedRejectCategories },
            },
          }),
          setPolicies({
            variables: {
              account: {
                legacyId: collective.id,
              },
              policies,
            },
          }),
        ]);

        toast({
          variant: 'success',
          message: formatMessage({ defaultMessage: 'Policies updated successfully', id: 'Owy3QB' }),
        });
      } catch (e) {
        toast({
          variant: 'error',
          message: i18nGraphqlException(intl, e),
        });
      }
    },
    validate(values) {
      const errors = {};
      const contributionPolicyText = stripHTML(values.contributionPolicy);
      const expensePolicyText = stripHTML(values.expensePolicy);

      if (contributionPolicyText.length > CONTRIBUTION_POLICY_MAX_LENGTH) {
        errors.contributionPolicy = formatMessage(messages['contributionPolicy.error'], {
          maxLength: CONTRIBUTION_POLICY_MAX_LENGTH,
        });
      }
      if (expensePolicyText.length > EXPENSE_POLICY_MAX_LENGTH) {
        errors.expensePolicy = formatMessage(messages['expensePolicy.error'], { maxLength: EXPENSE_POLICY_MAX_LENGTH });
      }
      return errors;
    },
  });

  React.useEffect(() => {
    if (collectiveContributionFilteringCategories && isEmpty(selected)) {
      const alreadyPickedCategories = collectiveContributionFilteringCategories.map(category => {
        return selectOptions.find(option => option.value === category);
      });
      setSelected(alreadyPickedCategories);
    }
  }, [loading, collectiveContributionFilteringCategories]);

  React.useEffect(() => {
    if (data) {
      formik.setFieldValue('policies', omitDeep(data?.account?.policies || {}, ['__typename', 'id']));
    }
  }, [data]);

  const numberOfAdminsOptions = [0, 2, 3, 4, 5].map(n => ({
    value: n,
    label: formatMessage(messages['requiredAdmins.numberOfAdmins'], { admins: n }),
  }));
  const minAdminsApplies = [
    { value: 'NEW_COLLECTIVES', label: <FormattedMessage defaultMessage="New Collectives Only" id="SeQW9/" /> },
    { value: 'ALL_COLLECTIVES', label: <FormattedMessage defaultMessage="All Collectives" id="uQguR/" /> },
  ];

  const hostAuthorCannotApproveExpensePolicy = data?.account?.host?.policies?.['EXPENSE_AUTHOR_CANNOT_APPROVE'];
  const authorCannotApproveExpenseEnforcedByHost =
    hostAuthorCannotApproveExpensePolicy?.enabled && hostAuthorCannotApproveExpensePolicy?.appliesToHostedCollectives;

  return (
    <Flex flexDirection="column">
      {error && <MessageBoxGraphqlError error={error} />}
      <form onSubmit={formik.handleSubmit}>
        <Container>
          <SettingsSectionTitle>
            <FormattedMessage defaultMessage="Contributions" id="Contributions" />
          </SettingsSectionTitle>

          <Container mb={4}>
            <div className="mb-2 font-bold">{formatMessage(messages['contributionPolicy.label'])}</div>
            <StyledInputField
              name="contributionPolicy"
              htmlFor="contributionPolicy"
              error={formik.errors.contributionPolicy}
              disabled={isSubmittingSettings}
            >
              {inputProps => (
                <RichTextEditor
                  withBorders
                  showCount
                  maxLength={CONTRIBUTION_POLICY_MAX_LENGTH}
                  error={formik.errors.contributionPolicy}
                  version="simplified"
                  editorMinHeight="12.5rem"
                  editorMaxHeight={500}
                  id={inputProps.id}
                  inputName={inputProps.name}
                  onChange={formik.handleChange}
                  placeholder={formatMessage(messages['contributionPolicy.placeholder'])}
                  defaultValue={formik.values.contributionPolicy}
                  fontSize="14px"
                />
              )}
            </StyledInputField>

            {collective.isHost && (
              <div className="mt-4 flex flex-col gap-2">
                <div className="font-bold">
                  <FormattedMessage defaultMessage="Mandatory Information" id="IuoUBR" />
                </div>
                <div className="mb-2 text-sm text-gray-500">
                  <FormattedMessage
                    defaultMessage="Activate the fields that you want as mandatory information. Once activated, you can set up the threshold for the individual fields."
                    id="erAK+p"
                  />
                </div>
                <div className="flex flex-col rounded-2xl border p-4">
                  <div className="flex items-center justify-between gap-2">
                    <h1 className="text-sm/6 font-bold">
                      <FormattedMessage defaultMessage="Legal Name" id="LegalName" />
                    </h1>
                    <Switch
                      name={`checkbox-CONTRIBUTOR_INFO_THRESHOLDS-legalName`}
                      checked={!isNil(formik.values.policies?.CONTRIBUTOR_INFO_THRESHOLDS?.legalName)}
                      onCheckedChange={checked => {
                        const newPolicies = cloneDeep(formik.values.policies);
                        if (checked) {
                          set(newPolicies, 'CONTRIBUTOR_INFO_THRESHOLDS.legalName', 250e2);
                        } else if (!isNil(newPolicies.CONTRIBUTOR_INFO_THRESHOLDS?.legalName)) {
                          delete newPolicies.CONTRIBUTOR_INFO_THRESHOLDS?.legalName;
                        }
                        formik.setFieldValue('policies', newPolicies);
                      }}
                    />
                  </div>
                  <Collapsible open={!isNil(formik.values.policies?.CONTRIBUTOR_INFO_THRESHOLDS?.legalName)}>
                    <CollapsibleContent className="animate-none! pt-2">
                      <p className="text-sm">
                        <FormattedMessage
                          defaultMessage="Require the contributor to provide their legal name when they contribute more than:"
                          id="MKoNvi"
                        />
                      </p>
                      <StyledInputAmount
                        className="mt-2 sm:max-w-1/3"
                        maxWidth="11em"
                        suffix={<FormattedMessage defaultMessage="/ fiscal year" id="fD5OMn" />}
                        disabled={isSettingPolicies || authorCannotApproveExpenseEnforcedByHost}
                        currency={data?.account?.currency}
                        currencyDisplay="CODE"
                        value={formik.values.policies?.CONTRIBUTOR_INFO_THRESHOLDS?.legalName || 250e2}
                        onChange={value =>
                          !isNil(value) &&
                          formik.setFieldValue('policies', {
                            ...formik.values.policies,
                            ['CONTRIBUTOR_INFO_THRESHOLDS']: {
                              ...formik.values.policies?.['CONTRIBUTOR_INFO_THRESHOLDS'],
                              legalName: value || 0,
                            },
                          })
                        }
                      />
                    </CollapsibleContent>
                  </Collapsible>
                </div>
                <div className="flex flex-col rounded-2xl border p-4">
                  <div className="flex items-center justify-between gap-2">
                    <h1 className="text-sm/6 font-bold">
                      <FormattedMessage defaultMessage="Physical Address" id="OQhu3R" />
                    </h1>

                    <Switch
                      name={`checkbox-CONTRIBUTOR_INFO_THRESHOLDS-address`}
                      checked={!isNil(formik.values.policies?.CONTRIBUTOR_INFO_THRESHOLDS?.address)}
                      onCheckedChange={checked => {
                        const newPolicies = cloneDeep(formik.values.policies);
                        if (checked) {
                          set(newPolicies, 'CONTRIBUTOR_INFO_THRESHOLDS.address', 500e2);
                        } else if (!isNil(newPolicies.CONTRIBUTOR_INFO_THRESHOLDS?.address)) {
                          delete newPolicies.CONTRIBUTOR_INFO_THRESHOLDS?.address;
                        }
                        formik.setFieldValue('policies', newPolicies);
                      }}
                    />
                  </div>

                  <Collapsible open={!isNil(formik.values.policies?.CONTRIBUTOR_INFO_THRESHOLDS?.address)}>
                    <CollapsibleContent className="animate-none! pt-2">
                      <p className="text-sm">
                        <FormattedMessage
                          defaultMessage="Require the contributor to provide their physical address when they contribute more than:"
                          id="pKF7TO"
                        />
                      </p>
                      <StyledInputAmount
                        className="mt-2 sm:max-w-1/3"
                        suffix={<FormattedMessage defaultMessage="/ fiscal year" id="fD5OMn" />}
                        maxWidth="11em"
                        disabled={
                          isSettingPolicies ||
                          authorCannotApproveExpenseEnforcedByHost ||
                          isNil(formik.values.policies?.CONTRIBUTOR_INFO_THRESHOLDS?.address)
                        }
                        currency={data?.account?.currency}
                        currencyDisplay="CODE"
                        value={formik.values.policies?.CONTRIBUTOR_INFO_THRESHOLDS?.address || 500e2}
                        onChange={value =>
                          formik.setFieldValue('policies', {
                            ...formik.values.policies,
                            ['CONTRIBUTOR_INFO_THRESHOLDS']: {
                              ...formik.values.policies?.['CONTRIBUTOR_INFO_THRESHOLDS'],
                              address: value || 0,
                            },
                          })
                        }
                      />
                    </CollapsibleContent>
                  </Collapsible>
                </div>
              </div>
            )}
          </Container>

          <SettingsSectionTitle>{formatMessage(messages['expensePolicy.label'])}</SettingsSectionTitle>

          <StyledInputField
            name="policies.EXPENSE_POLICIES.invoicePolicy"
            htmlFor="policies.EXPENSE_POLICIES.invoicePolicy"
            error={formik.errors.policies?.EXPENSE_POLICIES?.invoicePolicy}
            disabled={isSubmittingSettings}
            labelProps={{ mb: 2, pt: 2, lineHeight: '18px', fontWeight: 'bold' }}
            label={formatMessage(messages['invoiceExpensePolicy.label'])}
          >
            {inputProps =>
              loading ? (
                <LoadingPlaceholder height={50} width={1} />
              ) : (
                <RichTextEditor
                  key={data?.account?.policies?.EXPENSE_POLICIES?.invoicePolicy}
                  data-cy="invoice-expense-policy-input"
                  withBorders
                  showCount
                  maxLength={EXPENSE_POLICY_MAX_LENGTH}
                  error={formik.errors.policies?.EXPENSE_POLICIES?.invoicePolicy}
                  version="simplified"
                  editorMinHeight="12.5rem"
                  editorMaxHeight={500}
                  id={inputProps.id}
                  inputName={inputProps.name}
                  onChange={formik.handleChange}
                  placeholder={formatMessage(messages['invoiceExpensePolicy.placeholder'])}
                  defaultValue={data?.account?.policies?.EXPENSE_POLICIES?.invoicePolicy}
                  fontSize="14px"
                  maxHeight={600}
                />
              )
            }
          </StyledInputField>
          <P fontSize="14px" lineHeight="18px" color="black.600" my={2}>
            <FormattedMessage
              id="collective.expensePolicy.description"
              defaultMessage="It can be daunting to file an expense if you're not sure what's allowed. Provide a clear policy to guide expense submitters."
            />
          </P>

          <StyledInputField
            name="policies.EXPENSE_POLICIES.receiptPolicy"
            htmlFor="policies.EXPENSE_POLICIES.receiptPolicy"
            error={formik.errors.policies?.EXPENSE_POLICIES?.receiptPolicy}
            disabled={isSubmittingSettings}
            labelProps={{ mb: 2, pt: 2, lineHeight: '18px', fontWeight: 'bold' }}
            label={formatMessage(messages['receiptExpensePolicy.label'])}
          >
            {inputProps =>
              loading ? (
                <LoadingPlaceholder height={50} width={1} />
              ) : (
                <RichTextEditor
                  key={data?.account?.policies?.EXPENSE_POLICIES?.receiptPolicy}
                  data-cy="receipt-expense-policy-input"
                  withBorders
                  showCount
                  maxLength={EXPENSE_POLICY_MAX_LENGTH}
                  error={formik.errors.policies?.EXPENSE_POLICIES?.receiptPolicy}
                  version="simplified"
                  editorMinHeight="12.5rem"
                  editorMaxHeight={500}
                  id={inputProps.id}
                  inputName={inputProps.name}
                  onChange={formik.handleChange}
                  placeholder={formatMessage(messages['receiptExpensePolicy.placeholder'])}
                  defaultValue={data?.account?.policies?.EXPENSE_POLICIES?.receiptPolicy}
                  fontSize="14px"
                  maxHeight={600}
                />
              )
            }
          </StyledInputField>
          <P fontSize="14px" lineHeight="18px" color="black.600" my={2}>
            <FormattedMessage
              id="collective.expensePolicy.description"
              defaultMessage="It can be daunting to file an expense if you're not sure what's allowed. Provide a clear policy to guide expense submitters."
            />
          </P>

          <StyledInputField
            name="policies.EXPENSE_POLICIES.titlePolicy"
            htmlFor="policies.EXPENSE_POLICIES.titlePolicy"
            error={formik.errors.policies?.EXPENSE_POLICIES?.titlePolicy}
            disabled={isSubmittingSettings}
            labelProps={{ mb: 2, pt: 2, lineHeight: '18px', fontWeight: 'bold' }}
            label={formatMessage(messages['titleExpensePolicy.label'])}
          >
            {inputProps =>
              loading ? (
                <LoadingPlaceholder height={50} width={1} />
              ) : (
                <RichTextEditor
                  key={data?.account?.policies?.EXPENSE_POLICIES?.titlePolicy}
                  data-cy="title-expense-policy-input"
                  withBorders
                  showCount
                  maxLength={EXPENSE_POLICY_MAX_LENGTH}
                  error={formik.errors.policies?.EXPENSE_POLICIES?.titlePolicy}
                  version="simplified"
                  editorMinHeight="12.5rem"
                  editorMaxHeight={500}
                  id={inputProps.id}
                  inputName={inputProps.name}
                  onChange={formik.handleChange}
                  placeholder={formatMessage(messages['titleExpensePolicy.placeholder'])}
                  defaultValue={data?.account?.policies?.EXPENSE_POLICIES?.titlePolicy}
                  fontSize="14px"
                  maxHeight={600}
                />
              )
            }
          </StyledInputField>
          <P fontSize="14px" lineHeight="18px" color="black.600" my={2}>
            <FormattedMessage
              id="collective.expensePolicy.description"
              defaultMessage="It can be daunting to file an expense if you're not sure what's allowed. Provide a clear policy to guide expense submitters."
            />
          </P>
        </Container>

        {collective.isHost && !isSelfHosted && (
          <Container>
            <SettingsSectionTitle mt={4}>
              <FormattedMessage id="editCollective.admins.header" defaultMessage="Required Admins" />
            </SettingsSectionTitle>
            <P mb={2}>
              <FormattedMessage
                id="editCollective.admins.description"
                defaultMessage="Please specify the minimum number of admins a collective needs to have for being accepted by your fiscal host and to accept contributions."
              />
            </P>
            <Flex gap="12px 24px" mb={3} mt={2} flexDirection={['column', 'row']}>
              <StyledInputField
                disabled={isSubmittingSettings}
                labelFontSize="13px"
                labelFontWeight="700"
                label={<FormattedMessage defaultMessage="Minimum number of admins" id="s01/Qi" />}
                flexGrow={1}
              >
                <StyledSelect
                  inputId="numberOfAdmins"
                  isSearchable={false}
                  options={numberOfAdminsOptions}
                  onChange={option => {
                    if (option.value === 0) {
                      formik.setFieldValue('policies', { ...formik.values.policies, COLLECTIVE_MINIMUM_ADMINS: null });
                    } else {
                      formik.setFieldValue('policies.COLLECTIVE_MINIMUM_ADMINS', {
                        ...formik.values.policies.COLLECTIVE_MINIMUM_ADMINS,
                        numberOfAdmins: option.value,
                      });
                    }
                  }}
                  value={numberOfAdminsOptions.find(
                    option => option.value === (formik.values.policies?.COLLECTIVE_MINIMUM_ADMINS?.numberOfAdmins || 0),
                  )}
                />
              </StyledInputField>
              <StyledInputField
                disabled={isSubmittingSettings}
                labelFontSize="13px"
                labelFontWeight="700"
                label={<FormattedMessage defaultMessage="Whom does this apply to" id="8F65mn" />}
                flexGrow={1}
              >
                <StyledSelect
                  inputId="applies"
                  isSearchable={false}
                  options={minAdminsApplies}
                  onChange={option =>
                    formik.setFieldValue('policies.COLLECTIVE_MINIMUM_ADMINS', {
                      ...formik.values.policies.COLLECTIVE_MINIMUM_ADMINS,
                      applies: option.value,
                    })
                  }
                  disabled
                  value={minAdminsApplies[0]}
                />
              </StyledInputField>
            </Flex>
            <StyledCheckbox
              name="minAdminsFreeze"
              label={
                <FormattedMessage
                  defaultMessage="Freeze collectives that don’t meet the minimum requirement"
                  id="FcYV6Y"
                />
              }
              onChange={({ checked }) => {
                formik.setFieldValue('policies.COLLECTIVE_MINIMUM_ADMINS', {
                  ...formik.values.policies.COLLECTIVE_MINIMUM_ADMINS,
                  freeze: checked,
                });
              }}
              checked={Boolean(formik.values.policies?.COLLECTIVE_MINIMUM_ADMINS?.freeze)}
            />
            <P fontSize="14px" lineHeight="18px" color="black.600" ml="1.4rem">
              <FormattedMessage
                defaultMessage="Freezing the collective will prevent them from accepting and distributing contributions till they meet the requirements. This is a security measure to make sure the admins are within their rights. Read More."
                id="mp9gR3"
              />
            </P>
            {formik.values.policies?.COLLECTIVE_MINIMUM_ADMINS?.applies === 'ALL_COLLECTIVES' &&
              formik.values.policies?.COLLECTIVE_MINIMUM_ADMINS?.freeze && (
                <MessageBox type="warning" mt={2} fontSize="13px">
                  <FormattedMessage
                    defaultMessage="Some collectives hosted by you may not fulfill the minimum admin requirements. If you choose to apply the setting to all Collectives, the ones that don't comply will be frozen until they meet the minimum requirements for admins."
                    id="amI2+/"
                  />
                </MessageBox>
              )}
          </Container>
        )}
        <Container>
          <SettingsSectionTitle mt={4}>
            <FormattedMessage id="editCollective.expenseApprovalsPolicy.header" defaultMessage="Expense approvals" />
          </SettingsSectionTitle>
          <StyledCheckbox
            name="authorCannotApproveExpense"
            label={
              <FormattedMessage
                id="editCollective.expenseApprovalsPolicy.authorCannotApprove"
                defaultMessage="Admins cannot approve their own expenses. With this feature turned on, admins will need another admin to approve their expenses"
              />
            }
            onChange={() =>
              formik.setFieldValue('policies', {
                ...formik.values.policies,
                ['EXPENSE_AUTHOR_CANNOT_APPROVE']: {
                  ...formik.values.policies?.['EXPENSE_AUTHOR_CANNOT_APPROVE'],
                  enabled: !formik.values.policies?.['EXPENSE_AUTHOR_CANNOT_APPROVE']?.enabled,
                  appliesToHostedCollectives: false,
                  appliesToSingleAdminCollectives: false,
                  amountInCents: 0,
                },
              })
            }
            checked={
              authorCannotApproveExpenseEnforcedByHost ||
              Boolean(formik.values.policies?.['EXPENSE_AUTHOR_CANNOT_APPROVE']?.enabled)
            }
            disabled={
              isSettingPolicies ||
              (numberOfAdmins < 2 && Boolean(!formik.values.policies?.['EXPENSE_AUTHOR_CANNOT_APPROVE']?.enabled)) ||
              authorCannotApproveExpenseEnforcedByHost
            }
          />
          <Flex
            ml="1.4rem"
            mt="0.65rem"
            alignItems="center"
            color={!formik.values.policies?.['EXPENSE_AUTHOR_CANNOT_APPROVE']?.enabled ? 'black.600' : undefined}
          >
            <P mr="1.25rem">
              <FormattedMessage defaultMessage="Enforce for expenses above:" id="8bP95s" />
            </P>
            <StyledInputAmount
              maxWidth="11em"
              disabled={
                isSettingPolicies ||
                authorCannotApproveExpenseEnforcedByHost ||
                !formik.values.policies?.['EXPENSE_AUTHOR_CANNOT_APPROVE']?.enabled
              }
              currency={data?.account?.currency}
              currencyDisplay="CODE"
              placeholder="0"
              value={
                authorCannotApproveExpenseEnforcedByHost
                  ? hostAuthorCannotApproveExpensePolicy.amountInCents
                  : formik.values.policies?.['EXPENSE_AUTHOR_CANNOT_APPROVE']?.amountInCents
              }
              onChange={value =>
                formik.setFieldValue('policies', {
                  ...formik.values.policies,
                  ['EXPENSE_AUTHOR_CANNOT_APPROVE']: {
                    ...formik.values.policies?.['EXPENSE_AUTHOR_CANNOT_APPROVE'],
                    amountInCents: value,
                  },
                })
              }
            />
          </Flex>
          {collective.isHost && !isSelfHosted && (
            <React.Fragment>
              <P
                ml="1.4rem"
                mt="0.65rem"
                color={!formik.values.policies?.['EXPENSE_AUTHOR_CANNOT_APPROVE']?.enabled ? 'black.600' : undefined}
              >
                <StyledCheckbox
                  name="authorCannotApproveExpense.appliesToHostedCollectives"
                  label={
                    <FormattedMessage
                      id="editCollective.expenseApprovalsPolicy.authorCannotApprove.appliesToHostedCollectives"
                      defaultMessage="Enforce this policy on collectives hosted by you."
                    />
                  }
                  checked={formik.values.policies?.['EXPENSE_AUTHOR_CANNOT_APPROVE']?.appliesToHostedCollectives}
                  disabled={isSettingPolicies || !formik.values.policies?.['EXPENSE_AUTHOR_CANNOT_APPROVE']?.enabled}
                  onChange={() =>
                    formik.setFieldValue('policies', {
                      ...formik.values.policies,
                      ['EXPENSE_AUTHOR_CANNOT_APPROVE']: {
                        ...formik.values.policies?.['EXPENSE_AUTHOR_CANNOT_APPROVE'],
                        appliesToHostedCollectives:
                          !formik.values.policies?.['EXPENSE_AUTHOR_CANNOT_APPROVE']?.appliesToHostedCollectives,
                        appliesToSingleAdminCollectives: false,
                      },
                    })
                  }
                />
              </P>
              <P
                ml="1.4rem"
                mt="0.65rem"
                color={
                  !formik.values.policies?.['EXPENSE_AUTHOR_CANNOT_APPROVE']?.appliesToHostedCollectives
                    ? 'black.600'
                    : undefined
                }
              >
                <StyledCheckbox
                  name="authorCannotApproveExpense.appliesToSingleAdminCollectives"
                  label={
                    <FormattedMessage
                      id="editCollective.expenseApprovalsPolicy.authorCannotApprove.appliesToSingleAdminCollectives"
                      defaultMessage="Enforce this policy on collectives with a single admin."
                    />
                  }
                  checked={formik.values.policies?.['EXPENSE_AUTHOR_CANNOT_APPROVE']?.appliesToSingleAdminCollectives}
                  disabled={
                    isSettingPolicies ||
                    !formik.values.policies?.['EXPENSE_AUTHOR_CANNOT_APPROVE']?.appliesToHostedCollectives
                  }
                  onChange={() =>
                    formik.setFieldValue('policies', {
                      ...formik.values.policies,
                      ['EXPENSE_AUTHOR_CANNOT_APPROVE']: {
                        ...formik.values.policies?.['EXPENSE_AUTHOR_CANNOT_APPROVE'],
                        appliesToSingleAdminCollectives:
                          !formik.values.policies?.['EXPENSE_AUTHOR_CANNOT_APPROVE']?.appliesToSingleAdminCollectives,
                      },
                    })
                  }
                />
              </P>
            </React.Fragment>
          )}
          {numberOfAdmins < 2 && Boolean(!formik.values.policies?.['EXPENSE_AUTHOR_CANNOT_APPROVE']?.enabled) && (
            <P fontSize="14px" lineHeight="18px" color="black.600" ml="1.4rem">
              <FormattedMessage
                id="editCollective.expenseApprovalsPolicy.authorCannotApprove.minAdminRequired"
                defaultMessage="You need to have at least two admins to enable this policy."
              />
            </P>
          )}
        </Container>
        <Container mt={3}>
          <StyledCheckbox
            name="allow-expense-submission"
            label={formatMessage(messages['expensePolicy.allowExpense'])}
            onChange={() =>
              formik.setFieldValue('disablePublicExpenseSubmission', !formik.values.disablePublicExpenseSubmission)
            }
            defaultChecked={Boolean(formik.values.disablePublicExpenseSubmission)}
          />
        </Container>
        {collective.isHost && (
          <React.Fragment>
            <Container>
              <SettingsSectionTitle mt={4}>
                <FormattedMessage defaultMessage="Expense types" id="7oAuzt" />
              </SettingsSectionTitle>
              <P mb={2}>
                {isSelfHosted ? (
                  <FormattedMessage
                    defaultMessage="Specify the types of expenses allowed for your Collective."
                    id="a9eYkM"
                  />
                ) : (
                  <FormattedMessage
                    id="editCollective.expenseTypes.description"
                    defaultMessage="Specify the types of expenses allowed for all the collectives you're hosting. If you wish to customize these options for specific collectives, head to the <HostedCollectivesLink>Hosted Collectives</HostedCollectivesLink> section."
                    values={{
                      HostedCollectivesLink: getI18nLink({
                        as: Link,
                        href: `/dashboard/${collective.slug}/hosted-collectives`,
                      }),
                    }}
                  />
                )}
              </P>

              {['RECEIPT', 'INVOICE', 'GRANT'].map(type => (
                <StyledCheckbox
                  key={type}
                  name={`allow-${type}-submission`}
                  label={formatMessage(messages[`expensePolicy.${type}`])}
                  checked={Boolean(formik.values.expenseTypes[type])}
                  onChange={() =>
                    formik.setFieldValue('expenseTypes', {
                      ...formik.values.expenseTypes,
                      [type]: !formik.values.expenseTypes[type],
                    })
                  }
                />
              ))}
            </Container>
            <Container>
              <SettingsSectionTitle mt={4}>
                <FormattedMessage defaultMessage="Vendors" id="RilevA" />
              </SettingsSectionTitle>
              <div className="mb-1">
                <div className="mb-2 text-base font-bold">
                  <FormattedMessage defaultMessage="Public Expense submission" id="p5Icf1" />
                </div>
                <p className="mb-2 text-sm">
                  {isSelfHosted ? (
                    <FormattedMessage
                      defaultMessage="By default only Collective administrators can submit expenses on behalf of vendors. You can allow other users to also submit expenses on behalf vendors."
                      id="QtxPLy"
                    />
                  ) : (
                    <FormattedMessage
                      defaultMessage="By default only fiscal host administrators can submit expenses on behalf of vendors. You can allow other users who submit expenses to collectives you host to also submit expenses on behalf vendors."
                      id="dK5ItS"
                    />
                  )}
                </p>
                <StyledCheckbox
                  name={`checkbox-EXPENSE_PUBLIC_VENDORS-requiredForExpenseSubmitters`}
                  label={
                    <FormattedMessage
                      defaultMessage="Allow expense submission on behalf of vendors by all users"
                      id="l15EJO"
                    />
                  }
                  checked={formik.values.policies?.EXPENSE_PUBLIC_VENDORS}
                  onChange={({ checked }) => {
                    const newPolicies = cloneDeep(formik.values.policies);
                    set(newPolicies, 'EXPENSE_PUBLIC_VENDORS', checked);
                    formik.setFieldValue('policies', newPolicies);
                  }}
                />
              </div>
            </Container>
            {collective.isHost && (
              <Container>
                <SettingsSectionTitle mt={4}>
                  <FormattedMessage defaultMessage="Expense categorization" id="apLY+L" />
                </SettingsSectionTitle>
                <P mb={3}>
                  <FormattedMessage
                    defaultMessage="Involve expense submitters and collective admins in expense categorization, based on the categories you've set up in your <LinkAccountingCategories>chart of accounts</LinkAccountingCategories>."
                    id="QwktWn"
                    values={{
                      LinkAccountingCategories: getI18nLink({
                        as: Link,
                        href: `/dashboard/${collective.slug}/chart-of-accounts`,
                      }),
                    }}
                  />
                </P>

                <div className="mb-1">
                  <StyledCheckbox
                    name={`checkbox-EXPENSE_CATEGORIZATION-requiredForExpenseSubmitters`}
                    label={
                      <FormattedMessage
                        defaultMessage="Require expense submitters to select a category when submitting an expense"
                        id="CwU4gm"
                      />
                    }
                    checked={formik.values.policies?.EXPENSE_CATEGORIZATION?.requiredForExpenseSubmitters}
                    onChange={({ checked }) => {
                      const newPolicies = cloneDeep(formik.values.policies);
                      set(newPolicies, 'EXPENSE_CATEGORIZATION.requiredForExpenseSubmitters', checked);
                      formik.setFieldValue('policies', newPolicies);
                    }}
                  />
                </div>
                <div>
                  <StyledCheckbox
                    name={`checkbox-EXPENSE_CATEGORIZATION-requiredForCollectiveAdmins`}
                    label={
                      <FormattedMessage
                        defaultMessage="Require collective admins to verify expense categories when reviewing and approving expenses"
                        id="4cDrzh"
                      />
                    }
                    checked={formik.values.policies?.EXPENSE_CATEGORIZATION?.requiredForCollectiveAdmins}
                    onChange={({ checked }) => {
                      const newPolicies = cloneDeep(formik.values.policies);
                      set(newPolicies, 'EXPENSE_CATEGORIZATION.requiredForCollectiveAdmins', checked);
                      formik.setFieldValue('policies', newPolicies);
                    }}
                  />
                </div>
              </Container>
            )}
          </React.Fragment>
        )}
        <Container>
          <SettingsSectionTitle mt={4}>
            <FormattedMessage id="editCollective.rejectCategories.header" defaultMessage="Rejected categories" />
          </SettingsSectionTitle>
          <P mb={2}>
            <FormattedMessage
              id="editCollective.rejectCategories.description"
              defaultMessage="Specify any categories of contributor that you do not wish to accept money from, to automatically prevent these types of contributions. (You can also reject contributions individually using the button on a specific unwanted transaction)"
            />
          </P>
          <StyledSelect
            inputId="policy-select"
            isSearchable={false}
            isLoading={loading}
            placeholder={formatMessage(messages['rejectCategories.placeholder'])}
            minWidth={300}
            maxWidth={600}
            options={selectOptions}
            value={selected}
            onChange={selectedOptions => setSelected(selectedOptions)}
            isMulti
          />
        </Container>
        {collective.isHost && (
          <Container>
            <SettingsSectionTitle mt={4}>
              <FormattedMessage defaultMessage="Refunds" id="pXQSzm" />
            </SettingsSectionTitle>

            <StyledCheckbox
              name={`checkbox-COLLECTIVE_ADMINS_CAN_REFUND`}
              label={
                <FormattedMessage
                  defaultMessage="Allow collective admins to refund contributions for up to 30 days after the transaction date."
                  id="ctV8Cf"
                />
              }
              checked={formik.values.policies?.COLLECTIVE_ADMINS_CAN_REFUND}
              onChange={() =>
                formik.setFieldValue('policies', {
                  ...formik.values.policies,
                  COLLECTIVE_ADMINS_CAN_REFUND: !formik.values.policies?.COLLECTIVE_ADMINS_CAN_REFUND,
                })
              }
            />
          </Container>
        )}
        <div className="mt-10 flex w-full justify-stretch">
          <Button
            data-cy="submit-policy-btn"
            className="w-full"
            loading={isSubmittingSettings || isSubmittingCategories}
            type="submit"
            onSubmit={formik.handleSubmit}
          >
            <FormattedMessage id="save" defaultMessage="Save" />
          </Button>
        </div>
      </form>
    </Flex>
  );
};

Policies.propTypes = {
  collective: PropTypes.shape({
    settings: PropTypes.object,
    id: PropTypes.number,
    slug: PropTypes.string,
    isHost: PropTypes.bool,
    members: PropTypes.arrayOf(
      PropTypes.shape({
        role: PropTypes.string,
      }),
    ),
  }),
};

export default Policies;
