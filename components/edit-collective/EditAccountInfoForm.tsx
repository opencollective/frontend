import * as React from 'react';
import { gql, useMutation, useQuery } from '@apollo/client';
import { getApplicableTaxesForCountry, TaxType } from '@opencollective/taxes';
import { Form } from 'formik';
import { get, isNil, omitBy, pick } from 'lodash';
import { FormattedMessage, useIntl } from 'react-intl';
import { z } from 'zod';

import { isIndividualAccount } from '../../lib/collective';
import { AccountTypesWithHost } from '../../lib/constants/collectives';
import { Currency } from '../../lib/constants/currency';
import { VAT_OPTIONS } from '../../lib/constants/vat';
import { i18nGraphqlException } from '../../lib/errors';
import { API_V2_CONTEXT } from '../../lib/graphql/helpers';
import type { Account } from '../../lib/graphql/types/v2/graphql';
import { Currency as CurrencyEnum, SocialLinkType } from '../../lib/graphql/types/v2/graphql';
import { editCollectivePageMutation } from '../../lib/graphql/v1/mutations';

import CollectiveTagsInput from '../CollectiveTagsInput';
import { FormikZod } from '../FormikZod';
import Link from '../Link';
import Loading from '../Loading';
import MessageBoxGraphqlError from '../MessageBoxGraphqlError';
import NotFound from '../NotFound';
import StyledButton from '../StyledButton';
import { StyledCurrencyPicker } from '../StyledCurrencyPicker';
import StyledInputFormikField from '../StyledInputFormikField';
import StyledInputGroup from '../StyledInputGroup';
import StyledInputLocation from '../StyledInputLocation';
import StyledLink from '../StyledLink';
import StyledTextarea from '../StyledTextarea';
import { useToast } from '../ui/useToast';
import WarnIfUnsavedChanges from '../WarnIfUnsavedChanges';

import SocialLinksFormField from './SocialLinksFormField';
import { VATTypeSelect } from './VATTypeSelect';

const getAccountInfoFormSchema = (intl, account: Account | null) =>
  z
    .object({
      name: z.string().max(150).optional().nullable(),
      legalName: z.string().max(150).optional().nullable(),
      description: (account?.type === 'COLLECTIVE' ? z.string().min(10) : z.string()).max(255),
      company: account && isIndividualAccount(account) ? z.string().max(255).optional().nullable() : z.never(),
      slug: z
        .string()
        .min(1)
        .max(200)
        .regex(
          /^[\w-]+$/,
          intl.formatMessage({
            defaultMessage: 'Slug can only contain letters, numbers, hyphens and underscores',
            id: 'KuzJK2',
          }),
        ),
      startsAt: z.string().datetime().optional(), // TODO make sure we respect the timezone
      endsAt: z.string().datetime().optional(), // TODO make sure we respect the timezone
      timezone: z.string().optional().nullable(),
      location: z.object({
        address: z.string().max(600).optional().nullable(),
        country: z.string().min(2).max(2).optional().nullable(),
        structured: z.any().optional().nullable(),
        lat: z.number().optional().nullable(),
        long: z.number().optional().nullable(),
      }),
      privateInstructions: z.string().max(10000).optional(),
      currency: z.nativeEnum(CurrencyEnum),
      tags: z.array(z.string()),
      socialLinks: z.array(
        z.object({
          type: z.nativeEnum(SocialLinkType),
          url: z.string().url(),
        }),
      ),
      settings: z
        .object({
          GST: z.object({ number: z.string() }).optional().nullable(),
          VAT: z
            .object({
              type: z.nativeEnum(VAT_OPTIONS).optional().nullable(),
              number: z.string(),
            })
            .optional()
            .nullable(),
        })
        .nullable(),
    })
    .superRefine((values, context) => {
      // Form-wide validations
      if (!values.legalName && !values.name) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: intl.formatMessage({
            defaultMessage: 'At least one of "Display name" or "Legal name" is required',
            id: 'L7qS8x',
          }),
          path: ['name'],
        });
      }
    });

type AccountInfoFormValues = z.infer<ReturnType<typeof getAccountInfoFormSchema>>;

const INITIAL_VALUES: AccountInfoFormValues = {
  name: '',
  legalName: '',
  slug: '',
  description: '',
  company: '',
} as const;

const getInitialValues = (account: Account): AccountInfoFormValues => ({
  ...INITIAL_VALUES,
  ...omitBy(account, isNil),
  currency: account.currency as CurrencyEnum, // Account.currency is currently exposed as a string. Can be removed after https://github.com/opencollective/opencollective-api/pull/10265.
});

const LABEL_PROPS = { fontWeight: 'bold' };

const ACCOUNT_INFO_QUERY = gql`
  query AccountInfo($slug: String!) {
    account(slug: $slug) {
      id
      legacyId
      name
      slug
      legalName
      description
      isHost
      type
      settings
      location {
        id
        name
        address
        country
        structured
        lat
        long
      }

      currency
      tags
      socialLinks {
        type
        url
      }
      ... on AccountWithParent {
        parent {
          id
          slug
        }
      }
      ... on AccountWithHost {
        host {
          id
          settings
          location {
            country
          }
        }
      }
      ... on Event {
        startsAt
        endsAt
        timezone
      }
    }
  }
`;

const mapAccountValuesToCollectiveV1Input = values => {
  return {
    id: values.legacyId,
    ...pick(values, ['name', 'legalName', 'description', 'company', 'slug', 'currency', 'tags', 'settings']),
    // TODO location
    // TODO socialLinks
    // TODO event fields: startsAt, endsAt, timezone, privateInstructions
  };
};

export const EditAccountInfoForm = ({ accountSlug }) => {
  const intl = useIntl();
  const { toast } = useToast();
  const { data, loading, error } = useQuery(ACCOUNT_INFO_QUERY, {
    context: API_V2_CONTEXT,
    variables: { slug: accountSlug },
  });
  const [editCollective] = useMutation(editCollectivePageMutation); // API V1 mutation
  const accountInfoFormSchema = React.useMemo(
    () => getAccountInfoFormSchema(intl, data?.account),
    [intl, data?.account],
  );

  if (loading) {
    return <Loading />;
  } else if (error) {
    return <MessageBoxGraphqlError error={error} />;
  } else if (!data.account) {
    return <NotFound />;
  }

  const account = data.account;
  const isUser = isIndividualAccount(account);
  return (
    <FormikZod
      initialValues={getInitialValues(account)}
      schema={accountInfoFormSchema}
      onSubmit={async values => {
        try {
          const variables = { collective: mapAccountValuesToCollectiveV1Input(values) };
          await editCollective({ variables });
          // TODO update cache
        } catch (e) {
          toast({
            variant: 'error',
            title: intl.formatMessage({ defaultMessage: 'Cannot save changes', id: '2zJp/6' }),
            message: i18nGraphqlException(intl, e),
          });
        }
      }}
    >
      {({ values, setFieldValue, dirty }) => {
        const countryForTaxes = get(values, 'location.country') || get(account.host, 'location.country');
        const applicableTaxes = getApplicableTaxesForCountry(countryForTaxes);
        return (
          <WarnIfUnsavedChanges hasUnsavedChanges={dirty}>
            <Form>
              <div className="flex flex-col gap-4">
                <StyledInputFormikField
                  name="name"
                  required={!values.legalName}
                  label={intl.formatMessage({ id: 'Fields.displayName', defaultMessage: 'Display name' })}
                  labelProps={LABEL_PROPS}
                  hint={intl.formatMessage({
                    id: 'Fields.name.description',
                    defaultMessage:
                      'Display names are public and used wherever this profile appears publicly, like contributions, comments on updates, public info on expenses, etc.',
                  })}
                />
                <StyledInputFormikField
                  name="legalName"
                  isPrivate
                  required={!values.name}
                  label={intl.formatMessage({ id: 'LegalName', defaultMessage: 'Legal Name' })}
                  labelProps={LABEL_PROPS}
                  hint={intl.formatMessage({
                    id: 'editCollective.legalName.description',
                    defaultMessage:
                      'Legal names are private and used in receipts, tax forms, payment details on expenses, and other non-public contexts. Legal names are only visible to admins.',
                  })}
                  placeholder={intl.formatMessage(
                    { id: 'examples', defaultMessage: 'e.g., {examples}' },
                    { examples: isUser ? 'Maria Garcia' : 'Salesforce, Inc., Airbnb, Inc.' },
                  )}
                />
                <StyledInputFormikField
                  name="slug"
                  required={true}
                  label={intl.formatMessage({ id: 'account.slug.label', defaultMessage: 'Handle' })}
                  labelProps={LABEL_PROPS}
                  hint={intl.formatMessage({
                    id: 'Fields.slug.description',
                    defaultMessage:
                      'A unique identifier used in URLs for this profile. Changing it will break existing links.',
                  })}
                >
                  {({ field }) => (
                    <StyledInputGroup
                      prepend={`${process.env.WEBSITE_URL}/`}
                      {...field}
                      onChange={e => {
                        e.target.value = e.target.value.trim().toLowerCase();
                        field.onChange(e);
                      }}
                    />
                  )}
                </StyledInputFormikField>
                {isIndividualAccount(account) && (
                  <StyledInputFormikField
                    name="company"
                    label={intl.formatMessage({ defaultMessage: 'Company', id: '9YazHG' })}
                    labelProps={LABEL_PROPS}
                    hint={intl.formatMessage({
                      id: 'collective.company.description',
                      defaultMessage: 'Start with @ to reference an organization (e.g., @airbnb)',
                    })}
                  />
                )}
                <StyledInputFormikField
                  name="description"
                  labelProps={LABEL_PROPS}
                  label={intl.formatMessage({
                    id: 'collective.description.label',
                    defaultMessage: 'Short description',
                  })}
                />
                {account.type === 'EVENT' && (
                  <React.Fragment>
                    <StyledInputFormikField
                      name="startsAt"
                      inputType="datetime-local"
                      label={intl.formatMessage({ id: 'Fields.startsAt', defaultMessage: 'Starts At' })}
                      labelProps={LABEL_PROPS}
                    />
                    <StyledInputFormikField
                      name="endsAt"
                      inputType="datetime-local"
                      label={intl.formatMessage({ id: 'Fields.endsAt', defaultMessage: 'Ends At' })}
                      labelProps={LABEL_PROPS}
                    />
                    <StyledInputFormikField
                      name="timezone"
                      label={intl.formatMessage({ id: 'Fields.timezone', defaultMessage: 'Timezone' })}
                      labelProps={LABEL_PROPS}
                    />
                    <StyledInputFormikField
                      name="privateInstructions"
                      labelProps={LABEL_PROPS}
                      label={intl.formatMessage({
                        id: 'event.privateInstructions.label',
                        defaultMessage: 'Private instructions',
                      })}
                      hint={intl.formatMessage({
                        id: 'event.privateInstructions.description',
                        defaultMessage: 'These instructions will be provided by email to the participants.',
                      })}
                    >
                      {({ field }) => <StyledTextarea {...field} />}
                    </StyledInputFormikField>
                  </React.Fragment>
                )}
                <StyledInputFormikField
                  name="currency"
                  label={intl.formatMessage({ id: 'Fields.currency', defaultMessage: 'Currency' })}
                  labelProps={LABEL_PROPS}
                >
                  {({ field }) => (
                    <StyledCurrencyPicker
                      inputId={field.id}
                      name={field.name}
                      availableCurrencies={Currency}
                      onChange={currency => field.onChange({ target: { value: currency, name: field.name } })}
                      value={field.value}
                    />
                  )}
                </StyledInputFormikField>
                <StyledInputFormikField
                  name="tags"
                  label={intl.formatMessage({ id: 'Fields.tags', defaultMessage: 'Tags' })}
                  labelProps={LABEL_PROPS}
                >
                  {({ field }) => (
                    <CollectiveTagsInput
                      {...field}
                      defaultValue={field.value}
                      onChange={entries =>
                        setFieldValue(
                          'tags',
                          entries.map(e => e.value),
                        )
                      }
                    />
                  )}
                </StyledInputFormikField>
                <StyledInputFormikField
                  name="socialLinks"
                  label={intl.formatMessage({ id: 'Fields.socialLinks', defaultMessage: 'Social Links' })}
                  labelProps={LABEL_PROPS}
                >
                  {({ field, meta }) => (
                    <SocialLinksFormField
                      value={field.value}
                      touched={meta.touched}
                      onChange={items => setFieldValue(field.name, items)}
                    />
                  )}
                </StyledInputFormikField>
                {!isUser && (
                  <StyledInputFormikField
                    name="location"
                    isPrivate
                    label={intl.formatMessage({ id: 'Fields.location', defaultMessage: 'Location' })}
                    labelProps={LABEL_PROPS}
                  >
                    {({ field }) => (
                      <StyledInputLocation
                        location={field.value}
                        onChange={value => setFieldValue('location', value)}
                      />
                    )}
                  </StyledInputFormikField>
                )}
                {applicableTaxes.includes(TaxType.VAT) && (
                  <React.Fragment>
                    {(account.isHost || AccountTypesWithHost.includes(account.type)) && (
                      <StyledInputFormikField
                        name="settings.VAT.type"
                        label={intl.formatMessage({ id: 'EditCollective.VAT', defaultMessage: 'VAT settings' })}
                        labelProps={LABEL_PROPS}
                      >
                        {({ field }) => (
                          <VATTypeSelect
                            inputId={field.id}
                            isHost={account.isHost}
                            value={field.value}
                            onChange={value => setFieldValue(field.name, value)}
                          />
                        )}
                      </StyledInputFormikField>
                    )}
                    {(account.isHost || get(values, 'settings.VAT.type') !== VAT_OPTIONS.HOST) && (
                      <StyledInputFormikField
                        name="settings.VAT.number"
                        label={intl.formatMessage({ id: 'EditCollective.VATNumber', defaultMessage: 'VAT number' })}
                        labelProps={LABEL_PROPS}
                        placeholder="FRXX999999999"
                      />
                    )}
                  </React.Fragment>
                )}
                {applicableTaxes.includes(TaxType.GST) && (
                  <StyledInputFormikField
                    name="settings.GST.number"
                    label={intl.formatMessage({ id: 'EditCollective.GSTNumber', defaultMessage: 'GST number' })}
                    labelProps={LABEL_PROPS}
                    placeholder="9429037631147"
                  />
                )}
              </div>
              <div className="mt-8 flex flex-col items-center">
                <StyledButton buttonStyle="primary" type="submit" disabled={!dirty}>
                  <FormattedMessage id="save" defaultMessage="Save" />
                </StyledButton>
                <StyledLink
                  as={Link}
                  data-cy="edit-collective-back-to-profile"
                  fontSize="14px"
                  mt={3}
                  href={
                    account.type === 'EVENT' ? `/${account.parent.slug}/events/${account.slug}` : `/${account.slug}`
                  }
                >
                  <FormattedMessage defaultMessage="View profile page" id="QxN1ZU" />
                </StyledLink>
              </div>
            </Form>
          </WarnIfUnsavedChanges>
        );
      }}
    </FormikZod>
  );
};
