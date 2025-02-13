import React from 'react';
import PropTypes from 'prop-types';
import { useMutation, useQuery } from '@apollo/client';
import { PlusCircle } from '@styled-icons/feather/PlusCircle';
import { Form, Formik } from 'formik';
import { get, isNil, map, pick } from 'lodash';
import { withRouter } from 'next/router';
import { defineMessages, FormattedDate, FormattedMessage, useIntl } from 'react-intl';

import { OPENSOURCE_COLLECTIVE_ID } from '../lib/constants/collectives';
import { i18nGraphqlException } from '../lib/errors';
import { requireFields } from '../lib/form-utils';
import { API_V2_CONTEXT, gql } from '../lib/graphql/helpers';

import OnboardingProfileCard from './onboarding-modal/OnboardingProfileCard';
import { useToast } from './ui/useToast';
import Avatar from './Avatar';
import CollectivePicker from './CollectivePicker';
import CollectivePickerAsync from './CollectivePickerAsync';
import HTMLContent from './HTMLContent';
import { getI18nLink } from './I18nFormatters';
import Link from './Link';
import LoadingPlaceholder from './LoadingPlaceholder';
import MessageBox from './MessageBox';
import StepsProgress from './StepsProgress';
import StyledButton from './StyledButton';
import StyledCheckbox from './StyledCheckbox';
import StyledHr from './StyledHr';
import StyledInputFormikField from './StyledInputFormikField';
import StyledModal, { ModalBody, ModalFooter, ModalHeader } from './StyledModal';
import StyledTextarea from './StyledTextarea';
import { H1, P, Span } from './Text';

const messages = defineMessages({
  SUCCESS: {
    id: 'SubmitApplication.SUCCESS',
    defaultMessage:
      "{collectiveName}'s application to {hostName} has been {type, select, APPROVED {approved} other {submitted}}",
  },
});

const hostFields = gql`
  fragment ApplyToHostFields on Host {
    id
    legacyId
    type
    slug
    name
    createdAt
    currency
    isOpenToApplications
    termsUrl
    longDescription
    hostFeePercent
    settings
    policies {
      id
      COLLECTIVE_MINIMUM_ADMINS {
        numberOfAdmins
      }
    }
  }
`;

const accountFields = gql`
  fragment ApplyToHostAccountFields on Account {
    id
    slug
    name
    type
    imageUrl
    memberInvitations(role: [ADMIN]) {
      id
      role
      memberAccount {
        id
        type
        slug
        name
        imageUrl
      }
    }
    admins: members(role: ADMIN) {
      nodes {
        id
        role
        account {
          id
          type
          slug
          name
          imageUrl
        }
      }
    }
  }
`;

const applyToHostQuery = gql`
  query ApplyToHost($hostSlug: String!, $collectiveSlug: String!) {
    host(slug: $hostSlug) {
      id
      ...ApplyToHostFields
    }
    account(slug: $collectiveSlug) {
      id
      ...ApplyToHostAccountFields
    }
  }
  ${hostFields}
  ${accountFields}
`;

/**
 * A query similar to `applyToHostQuery`, except we also fetch user's administrated collectives for the picker
 */
const applyToHostWithAccountsQuery = gql`
  query ApplyToHostWithAccounts($hostSlug: String!) {
    host(slug: $hostSlug) {
      id
      ...ApplyToHostFields
    }
    loggedInAccount {
      id
      memberOf(role: ADMIN, accountType: [COLLECTIVE, FUND], isApproved: false, isArchived: false) {
        nodes {
          id
          account {
            id
            ...ApplyToHostAccountFields
            ... on AccountWithHost {
              host {
                id
                legacyId
              }
            }
          }
        }
      }
    }
  }
  ${hostFields}
  ${accountFields}
`;

const applyToHostMutation = gql`
  mutation ApplyToHost(
    $collective: AccountReferenceInput!
    $host: AccountReferenceInput!
    $message: String
    $inviteMembers: [InviteMemberInput]
  ) {
    applyToHost(collective: $collective, host: $host, message: $message, inviteMembers: $inviteMembers) {
      id
      slug
      ... on AccountWithHost {
        isActive
        isApproved
        host {
          id
          ...ApplyToHostFields
        }
      }
    }
  }
  ${hostFields}
`;

const GQL_CONTEXT = { context: API_V2_CONTEXT };
const INITIAL_FORM_VALUES = { message: '', areTosChecked: false, collective: null, inviteMembers: [] };
const STEPS = {
  INFORMATION: { name: 'Information', label: <FormattedMessage defaultMessage="Information" id="E80WrK" /> },
  APPLY: { name: 'Apply', label: <FormattedMessage id="ApplyToHost" defaultMessage="Apply" /> },
};

const getAccountInput = collective => {
  return typeof collective.id === 'number' ? { legacyId: collective.id } : { id: collective.id };
};

const ConfirmButtons = ({ onClose, onBack, onSubmit, isSubmitting, canSubmit, isOSCHost }) => {
  return (
    <div className="flex w-full justify-end">
      <StyledButton
        buttonType="button"
        onClick={onBack || onClose}
        disabled={isSubmitting}
        buttonStyle="standard"
        mt={[2, 3]}
        mb={2}
        px={3}
      >
        {onBack ? (
          <FormattedMessage id="Back" defaultMessage="Back" />
        ) : (
          <FormattedMessage id="actions.cancel" defaultMessage="Cancel" />
        )}
      </StyledButton>
      {isOSCHost ? (
        <StyledButton
          type="submit"
          disabled={!canSubmit}
          loading={isSubmitting}
          buttonStyle="primary"
          onClick={onSubmit}
          mt={[2, 3]}
          mb={2}
          ml={3}
          px={3}
          minWidth={153}
          data-cy="afc-host-submit-button"
        >
          <FormattedMessage id="actions.continue" defaultMessage="Continue" />
        </StyledButton>
      ) : (
        <StyledButton
          type="submit"
          disabled={!canSubmit}
          loading={isSubmitting}
          buttonStyle="primary"
          onClick={onSubmit}
          mt={[2, 3]}
          mb={2}
          ml={3}
          px={3}
          minWidth={153}
          data-cy="afc-host-submit-button"
        >
          <FormattedMessage id="actions.submitApplication" defaultMessage="Submit application" />
        </StyledButton>
      )}
    </div>
  );
};

ConfirmButtons.propTypes = {
  onClose: PropTypes.func,
  onBack: PropTypes.func,
  onSubmit: PropTypes.func,
  isSubmitting: PropTypes.bool,
  canSubmit: PropTypes.bool,
  isOSCHost: PropTypes.bool,
};

/**
 * A modal to apply to a given host
 * This modal triggers a query when mounted
 */
const ApplyToHostModal = ({ hostSlug, collective, onClose, onSuccess, router, ...props }) => {
  const query = collective ? applyToHostQuery : applyToHostWithAccountsQuery;
  const { data, loading, error } = useQuery(query, {
    ...GQL_CONTEXT,
    variables: { hostSlug, collectiveSlug: collective?.slug },
    fetchPolicy: 'network-only',
  });
  const [applyToHost, { loading: submitting }] = useMutation(applyToHostMutation, GQL_CONTEXT);
  const intl = useIntl();
  const { toast } = useToast();
  const [step, setStep] = React.useState(STEPS.INFORMATION);
  const contentRef = React.useRef();
  const canApply = Boolean(data?.host?.isOpenToApplications);
  const collectives = map(get(data, 'loggedInAccount.memberOf.nodes'), 'account');
  const selectedCollective = collective
    ? { ...collective, ...pick(data?.account, ['admins', 'memberInvitations']) }
    : collectives.length === 1
      ? collectives[0]
      : undefined;
  const host = data?.host;
  const isOSCHost = host?.legacyId === OPENSOURCE_COLLECTIVE_ID;
  const useTwoSteps = !isNil(data?.host?.longDescription);

  React.useEffect(() => {
    if (host && !useTwoSteps) {
      setStep(STEPS.APPLY);
    }
  }, [useTwoSteps]);

  return (
    <StyledModal onClose={onClose} {...props}>
      {loading ? (
        <React.Fragment>
          <ModalHeader hideCloseIcon>
            <LoadingPlaceholder width="100%" height={163} />
          </ModalHeader>
          <ModalBody>
            <StyledHr my={32} borderColor="black.300" />
            <LoadingPlaceholder width="100%" height={225} />
          </ModalBody>
        </React.Fragment>
      ) : (
        <Formik
          validateOnBlur={false}
          initialValues={{ ...INITIAL_FORM_VALUES, collective: selectedCollective }}
          validate={values => {
            if (!values.collective && contentRef.current) {
              contentRef.current.scrollIntoView({ behavior: 'smooth' });
            }

            // Since the OSC flow is using a standalone form, without any TOS checkbox in this modal, skip validation here
            if (isOSCHost) {
              return {};
            }

            return requireFields(values, host.termsUrl ? ['areTosChecked', 'collective'] : ['collective']);
          }}
          onSubmit={async values => {
            if (isOSCHost) {
              await router.push(`/opensource/apply/intro?collectiveSlug=${values.collective.slug}`);
              window.scrollTo(0, 0);
              return;
            }

            try {
              const result = await applyToHost({
                variables: {
                  host: getAccountInput(host),
                  collective: getAccountInput(values.collective),
                  message: values.message,
                  inviteMembers: values.inviteMembers.map(invite => ({
                    ...invite,
                    memberAccount: { legacyId: invite.memberAccount.id },
                  })),
                },
              });

              if (onSuccess) {
                await onSuccess(result);
              } else {
                toast({
                  variant: 'success',
                  message: intl.formatMessage(messages.SUCCESS, {
                    hostName: host.name,
                    collectiveName: values.collective.name,
                    type: result.data.applyToHost.isApproved ? 'APPROVED' : 'SENT',
                  }),
                });
                onClose();
              }
            } catch (e) {
              toast({ variant: 'error', message: i18nGraphqlException(intl, e) });
            }
          }}
        >
          {({ handleSubmit, values, setFieldValue }) => (
            <React.Fragment>
              <ModalHeader hideCloseIcon>
                {loading ? (
                  <LoadingPlaceholder width="100%" height={163} />
                ) : host ? (
                  <div className="flex w-full flex-col items-center">
                    <Avatar collective={host} type={host.type} radius={64} />
                    <H1 fontSize="20px" lineHeight="28px" color="black.900" mt={3} mb={3}>
                      {host.name}
                    </H1>
                    <div className="flex w-full flex-wrap justify-center gap-8">
                      <div className="flex flex-col">
                        <P fontWeight="400" fontSize="12px" lineHeight="18px" color="black.600" mb={1}>
                          <FormattedMessage id="HostSince" defaultMessage="Host since" />
                        </P>
                        <P fontSize="16px" fontWeight="500" lineHeight="24px">
                          <FormattedDate value={host.createdAt} month="short" year="numeric" />
                        </P>
                      </div>
                      <div className="flex flex-col">
                        <P fontWeight="400" fontSize="12px" lineHeight="18px" color="black.600" mb={1}>
                          <FormattedMessage id="Currency" defaultMessage="Currency" />
                        </P>
                        <P fontSize="16px" fontWeight="500" lineHeight="24px">
                          {host.currency}
                        </P>
                      </div>
                      <div className="flex flex-col">
                        <P fontWeight="400" fontSize="12px" lineHeight="18px" color="black.600" mb={1}>
                          <FormattedMessage id="HostFee" defaultMessage="Host fee" />
                        </P>
                        <P fontSize="16px" fontWeight="500" lineHeight="24px">
                          {host.hostFeePercent}%
                        </P>
                      </div>
                    </div>
                    <div className="my-3">
                      {useTwoSteps && (
                        <StepsProgress steps={Object.values(STEPS)} focus={step} onStepSelect={setStep}>
                          {({ step }) => (
                            <P fontWeight="500" fontSize="14px" textTransform="uppercase">
                              {step.label}
                            </P>
                          )}
                        </StepsProgress>
                      )}
                    </div>
                  </div>
                ) : null}
              </ModalHeader>

              <ModalBody>
                {loading ? (
                  <LoadingPlaceholder width="100%" height={250} />
                ) : !host ? (
                  <MessageBox type="warning" withIcon>
                    <FormattedMessage id="notFound" defaultMessage="Not found" />
                  </MessageBox>
                ) : !canApply ? (
                  <MessageBox type="warning" withIcon>
                    <FormattedMessage
                      id="collectives.create.error.HostNotOpenToApplications"
                      defaultMessage="This Fiscal Host is not open to applications"
                    />
                  </MessageBox>
                ) : (
                  <Form ref={contentRef}>
                    {step === STEPS.INFORMATION && host.longDescription && (
                      <HTMLContent content={host.longDescription} />
                    )}
                    {step === STEPS.APPLY && (
                      <React.Fragment>
                        <div>
                          <StyledInputFormikField name="collective">
                            {({ form, field }) => (
                              <div>
                                <P fontSize="13px" lineHeight="16px" fontWeight="600" color="black.700" mb={2}>
                                  <FormattedMessage
                                    id="ApplyToHost.PickCollective"
                                    defaultMessage="Which account is applying to {hostName}?"
                                    values={{ hostName: host.name }}
                                  />
                                </P>
                                <CollectivePicker
                                  inputId="host-apply-collective-picker"
                                  data-cy="host-apply-collective-picker"
                                  collective={field.value}
                                  collectives={collectives}
                                  isDisabled={Boolean(collective)}
                                  error={field.error}
                                  onBlur={() => form.setFieldTouched(field.name, true)}
                                  onChange={({ value }) => form.setFieldValue(field.name, value)}
                                  isSearchable={collectives.length > 8}
                                  types={['COLLECTIVE']}
                                  creatable
                                  renderNewCollectiveOption={() => (
                                    <Link
                                      href={isOSCHost ? '/opensource/apply/intro' : `/${host.slug}/create`}
                                      data-cy="host-apply-new-collective-link"
                                    >
                                      <StyledButton borderRadius="14px" width="100%">
                                        <div className="flex items-center">
                                          <PlusCircle size={24} />
                                          <div className="ml-4 text-xs">
                                            <FormattedMessage
                                              id="Collective.CreateNew"
                                              defaultMessage="Create new Collective"
                                            />
                                          </div>
                                        </div>
                                      </StyledButton>
                                    </Link>
                                  )}
                                />
                              </div>
                            )}
                          </StyledInputFormikField>
                        </div>
                        {!isOSCHost && (
                          <React.Fragment>
                            <StyledHr my="18px" width="100%" borderColor="black.300" />
                            {host?.policies?.COLLECTIVE_MINIMUM_ADMINS?.numberOfAdmins > 1 && (
                              <React.Fragment>
                                <div>
                                  <P fontSize="13px" lineHeight="16px" fontWeight="600" color="black.700">
                                    <FormattedMessage defaultMessage="Minimum Administrators Required" id="ceGKEG" />
                                  </P>
                                  <div className="mt-1 flex w-full">
                                    <P
                                      my={2}
                                      fontSize="9px"
                                      textTransform="uppercase"
                                      color="black.700"
                                      letterSpacing="0.06em"
                                    >
                                      <FormattedMessage id="administrators" defaultMessage="Administrators" />
                                      {values.collective &&
                                        ` (${
                                          values.collective?.admins?.nodes.length +
                                          values.collective?.memberInvitations?.length +
                                          values.inviteMembers.length
                                        }/${host.policies.COLLECTIVE_MINIMUM_ADMINS.numberOfAdmins})`}
                                    </P>
                                    <div className="flex flex-grow items-center">
                                      <StyledHr width="100%" ml={2} borderColor="black.300" />
                                    </div>
                                  </div>
                                  <div className="flex w-full flex-wrap" data-cy="profile-card">
                                    {values.collective?.admins?.nodes.map(admin => (
                                      <OnboardingProfileCard key={admin.account.id} collective={admin.account} />
                                    ))}
                                    {values.collective?.memberInvitations?.map(invitations => (
                                      <OnboardingProfileCard
                                        key={invitations.memberAccount.id}
                                        collective={invitations.memberAccount}
                                        isPending
                                      />
                                    ))}
                                    {values.inviteMembers?.map(invite => (
                                      <OnboardingProfileCard
                                        key={invite.memberAccount.id}
                                        collective={invite.memberAccount}
                                        removeAdmin={() =>
                                          setFieldValue(
                                            'inviteMembers',
                                            values.inviteMembers.filter(
                                              i => i.memberAccount.id !== invite.memberAccount.id,
                                            ),
                                          )
                                        }
                                      />
                                    ))}
                                  </div>
                                  <div className="mt-1 flex w-full">
                                    <P
                                      my={2}
                                      fontSize="9px"
                                      textTransform="uppercase"
                                      color="black.700"
                                      letterSpacing="0.06em"
                                    >
                                      <FormattedMessage
                                        id="InviteAdministrators"
                                        defaultMessage="Invite Administrators"
                                      />
                                    </P>
                                    <div className="flex flex-grow items-center">
                                      <StyledHr width="100%" ml={2} borderColor="black.300" />
                                    </div>
                                  </div>
                                  <div>
                                    <CollectivePickerAsync
                                      inputId="onboarding-admin-picker"
                                      creatable
                                      collective={null}
                                      types={['USER']}
                                      data-cy="admin-picker"
                                      filterResults={collectives =>
                                        collectives.filter(
                                          collective =>
                                            !values.inviteMembers.some(
                                              invite => invite.memberAccount.id === collective.id,
                                            ),
                                        )
                                      }
                                      onChange={option => {
                                        setFieldValue('inviteMembers', [
                                          ...values.inviteMembers,
                                          { role: 'ADMIN', memberAccount: option.value },
                                        ]);
                                      }}
                                    />
                                  </div>
                                  {host?.policies?.COLLECTIVE_MINIMUM_ADMINS && (
                                    <MessageBox type="info" mt={3} fontSize="13px">
                                      <FormattedMessage
                                        defaultMessage="Your selected Fiscal Host requires you to add a minimum of {numberOfAdmins, plural, one {# admin} other {# admins} }. You can manage your admins from the Collective Settings."
                                        id="GTK0Wf"
                                        values={host.policies.COLLECTIVE_MINIMUM_ADMINS}
                                      />
                                    </MessageBox>
                                  )}
                                </div>
                                <StyledHr my="18px" width="100%" borderColor="black.300" />
                              </React.Fragment>
                            )}
                            <StyledInputFormikField
                              name="message"
                              htmlFor="apply-host-modal-message"
                              label={
                                <Span fontSize="13px" lineHeight="16px" fontWeight="600" color="black.700">
                                  {get(host, 'settings.applyMessage') || (
                                    <FormattedMessage
                                      id="ApplyToHost.WriteMessage"
                                      defaultMessage="Message to the Fiscal Host"
                                    />
                                  )}
                                </Span>
                              }
                            >
                              {({ field }) => (
                                <StyledTextarea
                                  {...field}
                                  width="100%"
                                  minHeight={76}
                                  maxLength={3000}
                                  fontSize="14px"
                                  showCount
                                />
                              )}
                            </StyledInputFormikField>
                            {host.termsUrl && (
                              <StyledInputFormikField name="areTosChecked">
                                {({ form, field }) => (
                                  <div className="mx-1 mt-5 flex flex-col">
                                    <StyledCheckbox
                                      name="tos"
                                      label={
                                        <FormattedMessage
                                          id="Host.TOSCheckbox"
                                          defaultMessage="I agree with the <TOSLink>terms of service</TOSLink> of {hostName}"
                                          values={{
                                            hostName: host.name,
                                            TOSLink: getI18nLink({
                                              href: host.termsUrl,
                                              openInNewTabNoFollow: true,
                                              onClick: e => e.stopPropagation(), // don't check the checkbox when clicking on the link
                                            }),
                                          }}
                                        />
                                      }
                                      required
                                      checked={field.value}
                                      onChange={({ checked }) => form.setFieldValue('areTosChecked', checked)}
                                      error={field.error}
                                    />
                                  </div>
                                )}
                              </StyledInputFormikField>
                            )}
                          </React.Fragment>
                        )}

                        {error && (
                          <MessageBox type="error" withIcon my={[1, 3]}>
                            {error}
                          </MessageBox>
                        )}
                      </React.Fragment>
                    )}
                  </Form>
                )}
              </ModalBody>
              <ModalFooter isFullWidth>
                {step === STEPS.INFORMATION && (
                  <div className="flex justify-end">
                    <StyledButton
                      data-cy="host-apply-modal-next"
                      buttonStyle="primary"
                      onClick={() => setStep(STEPS.APPLY)}
                    >
                      <FormattedMessage id="Pagination.Next" defaultMessage="Next" />
                    </StyledButton>
                  </div>
                )}
                {step === STEPS.APPLY && (
                  <ConfirmButtons
                    onBack={() => setStep(STEPS.INFORMATION)}
                    onSubmit={handleSubmit}
                    isSubmitting={submitting}
                    canSubmit={canApply}
                    isOSCHost={isOSCHost}
                  />
                )}
              </ModalFooter>
            </React.Fragment>
          )}
        </Formik>
      )}
    </StyledModal>
  );
};

ApplyToHostModal.propTypes = {
  hostSlug: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
  /** If not provided, the default is to ad a success toast and to call onClose */
  onSuccess: PropTypes.func,
  /** Use this to force the value for `collective`. If not specified, user's administrated collectives will be displayed instead */
  collective: PropTypes.object,
  router: PropTypes.object,
};

export default withRouter(ApplyToHostModal);
