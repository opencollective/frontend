import React from 'react';
import { gql, useMutation, useQuery } from '@apollo/client';
import { Form } from 'formik';
import { get } from 'lodash';
import { useRouter } from 'next/router';
import { FormattedMessage, useIntl } from 'react-intl';
import { z } from 'zod';

import { i18nGraphqlException } from '../../lib/errors';
import { API_V2_CONTEXT } from '../../lib/graphql/helpers';
import useLoggedInUser from '../../lib/hooks/useLoggedInUser';

import Container from '../Container';
import { FormikZod } from '../FormikZod';
import Loading from '../Loading';
import MessageBoxGraphqlError from '../MessageBoxGraphqlError';
import StyledButton from '../StyledButton';
import StyledInputFormikField from '../StyledInputFormikField';
import StyledInputGroup from '../StyledInputGroup';
import StyledModal, { ModalBody, ModalFooter, ModalHeader } from '../StyledModal';
import { Switch } from '../ui/Switch';
import { useToast } from '../ui/useToast';

const duplicateAccountMutation = gql`
  mutation DuplicateAccount(
    $account: AccountReferenceInput!
    $newSlug: String
    $newName: String
    $include: DuplicateAccountDataTypeInput
  ) {
    duplicateAccount(account: $account, newSlug: $newSlug, newName: $newName, include: $include) {
      id
      slug
    }
  }
`;

const duplicateAccountQuery = gql`
  query AccountInfoForDuplicateAccount($slug: String) {
    account(slug: $slug, throwIfMissing: true) {
      id
      type
      currency
      name
      slug
      settings
      admins: members(role: ADMIN) {
        totalCount
      }
      ... on AccountWithContributions {
        tiers {
          totalCount
        }
      }
      activeProjects: childrenAccounts(isActive: true, accountType: [PROJECT]) {
        totalCount
      }
      activeEvents: childrenAccounts(isActive: true, accountType: [EVENT]) {
        totalCount
      }
    }
  }
`;

const formSchema = z.object({
  account: z.object({ id: z.string() }),
  newName: z.string(),
  newSlug: z.string(),
  connect: z.boolean(),
  include: z.object({
    tiers: z.boolean(),
    admins: z.boolean(),
    projects: z.boolean(),
    events: z.boolean(),
  }),
});

export const DuplicateAccountModal = ({ accountSlug, accountName, onClose }) => {
  const variables = { slug: accountSlug };
  const router = useRouter();
  const { toast } = useToast();
  const intl = useIntl();
  const { refetchLoggedInUser } = useLoggedInUser();
  const { loading, error, data } = useQuery(duplicateAccountQuery, { variables, context: API_V2_CONTEXT });
  const [duplicateAccount, { loading: submitting }] = useMutation(duplicateAccountMutation, {
    context: API_V2_CONTEXT,
  });

  const account = get(data, 'account');
  return (
    <StyledModal width="570px" onClose={onClose}>
      <ModalHeader onClose={onClose}>
        <FormattedMessage defaultMessage="Duplicate {accountName}" id="DOhsfW" values={{ accountName }} />
      </ModalHeader>
      {loading ? (
        <Loading />
      ) : error ? (
        <MessageBoxGraphqlError error={error} />
      ) : (
        <FormikZod
          schema={formSchema}
          initialValues={{
            account: { id: account.id },
            newSlug: `${accountSlug}-new`,
            newName: accountName,
            connect: true,
            include: {
              tiers: true,
              admins: true,
              projects: false,
              events: false,
            },
          }}
          onSubmit={async values => {
            try {
              const result = await duplicateAccount({ variables: values });
              toast({
                variant: 'success',
                message: intl.formatMessage(
                  { defaultMessage: '{accountName} has been duplicated', id: 'uZsh0+' },
                  { accountName: accountName },
                ),
              });

              await refetchLoggedInUser(); // To update permissions before redirecting
              await router.push(`/dashboard/${result.data.duplicateAccount.slug}/info`);
            } catch (e) {
              toast({ variant: 'error', message: i18nGraphqlException(intl, e) });
            }
          }}
        >
          {({ setFieldValue }) => (
            <Form>
              <ModalBody>
                <div className="mt-6 space-y-4">
                  <p className="text-base font-semibold">
                    <FormattedMessage defaultMessage="New profile information" id="qtavi/" />
                  </p>
                  <StyledInputFormikField
                    name="newName"
                    label={intl.formatMessage({ defaultMessage: 'Name', id: 'HAlOn1' })}
                  />
                  <StyledInputFormikField
                    name="newSlug"
                    label={intl.formatMessage({ defaultMessage: 'Handle', id: 'iNWbVV' })}
                    hint={intl.formatMessage({
                      defaultMessage: 'The handle is the unique identifier used in the URL of your page',
                      id: 'S2rv4/',
                    })}
                  >
                    {({ field }) => <StyledInputGroup prepend="opencollective.com/" {...field} />}
                  </StyledInputFormikField>
                  <p className="text-base font-semibold">
                    <FormattedMessage
                      defaultMessage="Settings to copy from {accountName}"
                      id="oryoz3"
                      values={{ accountName }}
                    />
                  </p>
                  <StyledInputFormikField name="include.admins">
                    {({ field }) => (
                      <div className="flex items-center gap-2">
                        <Switch
                          id={field.id}
                          onCheckedChange={checked => setFieldValue(field.name, checked)}
                          checked={field.value}
                          disabled
                        />
                        <label htmlFor={field.id} className="cursor-pointer font-normal">
                          <FormattedMessage defaultMessage="Admins" id="yAaNQA" /> ({account.admins.totalCount})
                        </label>
                        <span className="text-sm italic">
                          - <FormattedMessage defaultMessage="admins duplication is mandatory" id="mskb9Y" />
                        </span>
                      </div>
                    )}
                  </StyledInputFormikField>
                  {account.tiers.totalCount > 0 && (
                    <StyledInputFormikField name="include.tiers">
                      {({ field }) => (
                        <div className="flex items-center gap-2">
                          <Switch
                            id={field.id}
                            onCheckedChange={checked => setFieldValue(field.name, checked)}
                            checked={field.value}
                          />
                          <label htmlFor={field.id} className="cursor-pointer font-normal">
                            {account.type === 'EVENT' ? (
                              <FormattedMessage defaultMessage="Tiers & Tickets" id="hJWDdq" />
                            ) : (
                              <FormattedMessage defaultMessage="Tiers" id="Ft71sH" />
                            )}{' '}
                            ({account.tiers.totalCount})
                          </label>
                        </div>
                      )}
                    </StyledInputFormikField>
                  )}
                  {account.activeProjects.totalCount > 0 && (
                    <StyledInputFormikField name="include.projects">
                      {({ field }) => (
                        <div className="flex items-center gap-2">
                          <Switch
                            id={field.id}
                            onCheckedChange={checked => setFieldValue(field.name, checked)}
                            checked={field.value}
                          />
                          <label htmlFor={field.id} className="cursor-pointer font-normal">
                            <FormattedMessage defaultMessage="Projects" id="UxTJRa" /> (
                            {account.activeProjects.totalCount})
                          </label>
                        </div>
                      )}
                    </StyledInputFormikField>
                  )}
                  {account.activeEvents.totalCount > 0 && (
                    <StyledInputFormikField name="include.events">
                      {({ field }) => (
                        <div className="flex items-center gap-2">
                          <Switch
                            id={field.id}
                            onCheckedChange={checked => setFieldValue(field.name, checked)}
                            checked={field.value}
                          />
                          <label htmlFor={field.id} className="cursor-pointer font-normal">
                            <FormattedMessage defaultMessage="Events" id="ZvKSfJ" /> ({account.activeEvents.totalCount})
                          </label>
                        </div>
                      )}
                    </StyledInputFormikField>
                  )}
                </div>
              </ModalBody>
              <ModalFooter>
                <Container display="flex" justifyContent="flex-end">
                  <StyledButton type="reset" mx={20} onClick={onClose}>
                    <FormattedMessage id="actions.cancel" defaultMessage="Cancel" />
                  </StyledButton>
                  <StyledButton
                    type="submit"
                    buttonStyle="primary"
                    loading={submitting}
                    data-cy="continue"
                    minWidth={100}
                  >
                    <FormattedMessage values={{ accountName }} defaultMessage="Duplicate {accountName}" id="DOhsfW" />
                  </StyledButton>
                </Container>
              </ModalFooter>
            </Form>
          )}
        </FormikZod>
      )}
    </StyledModal>
  );
};
