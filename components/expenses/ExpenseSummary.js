import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { themeGet } from '@styled-system/theme-get';
import { includes } from 'lodash';
import { MessageSquare } from 'lucide-react';
import { createPortal } from 'react-dom';
import { FormattedDate, FormattedMessage, useIntl } from 'react-intl';
import styled from 'styled-components';

import expenseTypes from '../../lib/constants/expenseTypes';
import { PayoutMethodType } from '../../lib/constants/payout-method';
import { ExpenseStatus, ExpenseType } from '../../lib/graphql/types/v2/graphql';
import useLoggedInUser from '../../lib/hooks/useLoggedInUser';
import { PREVIEW_FEATURE_KEYS } from '../../lib/preview-features';
import { AmountPropTypeShape } from '../../lib/prop-types';
import { shouldDisplayExpenseCategoryPill } from './lib/accounting-categories';
import { expenseTypeSupportsAttachments } from './lib/attachments';
import { expenseItemsMustHaveFiles, getExpenseItemAmountV2FromNewAttrs } from './lib/items';
import { getExpenseExchangeRateWarningOrError } from './lib/utils';

import { AccountHoverCard } from '../AccountHoverCard';
import AmountWithExchangeRateInfo from '../AmountWithExchangeRateInfo';
import Avatar from '../Avatar';
import Container from '../Container';
import FormattedMoneyAmount from '../FormattedMoneyAmount';
import { Box, Flex } from '../Grid';
import HTMLContent from '../HTMLContent';
import LinkCollective from '../LinkCollective';
import LoadingPlaceholder from '../LoadingPlaceholder';
import StyledCard from '../StyledCard';
import StyledHr from '../StyledHr';
import Tags from '../Tags';
import { H1, P, Span } from '../Text';
import TruncatedTextWithTooltip from '../TruncatedTextWithTooltip';
import UploadedFilePreview from '../UploadedFilePreview';

import EditExpenseDialog from './EditExpenseDialog';
import { ExpenseAccountingCategoryPill } from './ExpenseAccountingCategoryPill';
import ExpenseAmountBreakdown from './ExpenseAmountBreakdown';
import ExpenseAttachedFiles from './ExpenseAttachedFiles';
import ExpenseMoreActionsButton from './ExpenseMoreActionsButton';
import ExpenseStatusTag from './ExpenseStatusTag';
import ExpenseSummaryAdditionalInformation from './ExpenseSummaryAdditionalInformation';
import ExpenseTypeTag from './ExpenseTypeTag';
import ProcessExpenseButtons, { hasProcessButtons } from './ProcessExpenseButtons';

export const SummaryHeader = styled(H1)`
  > a {
    color: inherit;
    text-decoration: underline;

    :hover {
      color: ${themeGet('colors.black.600')};
    }
  }
`;

const CreatedByUserLink = ({ account }) => {
  return (
    <LinkCollective collective={account} noTitle>
      <span className="font-medium text-foreground underline hover:text-primary">
        {account ? account.name : <FormattedMessage id="profile.incognito" defaultMessage="Incognito" />}
      </span>
    </LinkCollective>
  );
};

CreatedByUserLink.propTypes = {
  account: PropTypes.object,
};

const Spacer = () => <Span mx="6px">{'•'}</Span>;

const prepareDraftItems = (items, expenseCurrency) => {
  if (!items) {
    return [];
  }

  return items.map(item => {
    const amountV2 = getExpenseItemAmountV2FromNewAttrs(item, expenseCurrency);
    return { ...item, amountV2 };
  });
};

/**
 * Last step of the create expense flow, shows the summary of the expense with
 * the ability to submit it.
 */
const ExpenseSummary = ({
  expense,
  collective,
  host,
  isLoading,
  isLoadingLoggedInUser,
  isEditing,
  borderless = undefined,
  canEditTags,
  showProcessButtons,
  onClose = undefined,
  onDelete,
  onEdit,
  drawerActionsContainer,
  openFileViewer,
  enableKeyboardShortcuts,
  ...props
}) => {
  const intl = useIntl();
  const isReceipt = expense?.type === expenseTypes.RECEIPT;
  const isCreditCardCharge = expense?.type === expenseTypes.CHARGE;
  const isGrant = expense?.type === expenseTypes.GRANT;
  const isDraft = expense?.status === ExpenseStatus.DRAFT;
  const existsInAPI = expense && (expense.id || expense.legacyId);
  const createdByAccount =
    (isDraft ? expense?.requestedByAccount || expense?.createdByAccount : expense?.createdByAccount) || {};
  const expenseItems =
    expense?.items?.length > 0 ? expense.items : prepareDraftItems(expense?.draft?.items, expense?.currency);
  const expenseTaxes = expense?.taxes?.length > 0 ? expense.taxes : expense?.draft?.taxes || [];
  const isMultiCurrency =
    expense?.amountInAccountCurrency && expense.amountInAccountCurrency.currency !== expense.currency;
  const { LoggedInUser } = useLoggedInUser();
  const isLoggedInUserExpenseHostAdmin = LoggedInUser?.isHostAdmin(expense?.account);
  const isLoggedInUserExpenseAdmin = LoggedInUser?.isAdminOfCollective(expense?.account);
  const isViewingExpenseInHostContext = isLoggedInUserExpenseHostAdmin && !isLoggedInUserExpenseAdmin;
  const useInlineExpenseEdit =
    LoggedInUser?.hasPreviewFeatureEnabled(PREVIEW_FEATURE_KEYS.INLINE_EDIT_EXPENSE) &&
    expense?.permissions?.canEdit &&
    expense?.type !== ExpenseType.GRANT &&
    expense?.status !== ExpenseStatus.DRAFT;

  const files = React.useMemo(() => expense?.attachedFiles || [], [expense?.attachedFiles]);
  const invoiceFile = React.useMemo(() => files.find(f => f.isInvoice), [files]);
  const attachedFiles = React.useMemo(() => files.filter(f => f !== invoiceFile), [files, invoiceFile]);

  const processButtons = (
    <Flex
      display="flex"
      flex={1}
      justifyContent="space-between"
      flexDirection={['column-reverse', 'row']}
      alignItems={['flex-end', 'center']}
      gridGap={[2, 3]}
    >
      <ExpenseMoreActionsButton
        onEdit={useInlineExpenseEdit ? undefined : onEdit}
        expense={expense}
        isViewingExpenseInHostContext={isViewingExpenseInHostContext}
        enableKeyboardShortcuts={enableKeyboardShortcuts}
        disabled={isLoading}
        hasAttachedInvoiceFile={Boolean(invoiceFile)}
        onDelete={() => {
          onDelete?.(expense);
          onClose?.();
        }}
      />
      {Boolean(showProcessButtons && existsInAPI && collective && hasProcessButtons(expense?.permissions)) && (
        <Flex flexWrap="wrap" gridGap={[2, 3]}>
          <ProcessExpenseButtons
            expense={expense}
            isMoreActions
            isViewingExpenseInHostContext={isViewingExpenseInHostContext}
            permissions={expense?.permissions}
            collective={collective}
            host={host}
            disabled={isLoading}
            onDelete={() => {
              onDelete?.(expense);
              onClose?.();
            }}
            enableKeyboardShortcuts={enableKeyboardShortcuts}
            displayMarkAsIncomplete
          />
        </Flex>
      )}
    </Flex>
  );
  return (
    <StyledCard
      p={borderless ? 0 : [16, 24, 32]}
      mb={borderless ? [4, 0] : 0}
      borderStyle={borderless ? 'none' : 'solid'}
      {...props}
    >
      <Flex
        flexDirection={['column-reverse', 'row']}
        alignItems={['stretch', 'center']}
        justifyContent="space-between"
        data-cy="expense-title"
        mb={3}
      >
        <div className="mr-0 flex items-center gap-4 sm:mr-2">
          <h4 className="text-xl font-medium" data-cy="expense-description">
            {!expense?.description && isLoading ? (
              <LoadingPlaceholder height={32} minWidth={250} />
            ) : (
              expense.description
            )}
          </h4>
          {useInlineExpenseEdit && (
            <EditExpenseDialog
              expense={expense}
              field="title"
              title={intl.formatMessage({ defaultMessage: 'Edit expense title', id: 'expense.editTitle' })}
            />
          )}
        </div>
        <Flex mb={[3, 0]} justifyContent={['space-between', 'flex-end']} alignItems="center">
          {expense?.status && (
            <Box>
              <ExpenseStatusTag
                display="block"
                status={expense.onHold ? 'ON_HOLD' : expense.status}
                letterSpacing="0.8px"
                fontWeight="bold"
                fontSize="12px"
                showTaxFormTag={includes(expense.requiredLegalDocuments, 'US_TAX_FORM')}
                payee={expense.payee}
              />
            </Box>
          )}
        </Flex>
      </Flex>
      {expense?.type && (
        <div className="mb-3 flex items-center gap-1">
          <ExpenseTypeTag type={expense.type} legacyId={expense.legacyId} isLoading={isLoading} />

          {useInlineExpenseEdit && (
            <EditExpenseDialog
              field="type"
              title={intl.formatMessage({ defaultMessage: 'Edit expense type', id: 'expense.editType' })}
              description={intl.formatMessage({
                defaultMessage: 'To edit expense type, use the legacy edit expense flow.',
                id: 'expense.editType.description',
              })}
              expense={expense}
              goToLegacyEdit={onEdit}
            />
          )}
        </div>
      )}

      <div className="flex items-baseline gap-2">
        {shouldDisplayExpenseCategoryPill(LoggedInUser, expense, collective, host) && (
          <React.Fragment>
            <ExpenseAccountingCategoryPill
              host={host}
              account={expense.account}
              expense={expense}
              canEdit={Boolean(expense.permissions?.canEditAccountingCategory)}
              allowNone={!isLoggedInUserExpenseHostAdmin}
              showCodeInSelect={isLoggedInUserExpenseHostAdmin}
            />
          </React.Fragment>
        )}
        <Tags expense={expense} canEdit={canEditTags} />
      </div>
      <Flex alignItems="center" mt="12px">
        {isLoading && !expense ? (
          <LoadingPlaceholder height={24} width={200} />
        ) : (
          <React.Fragment>
            <LinkCollective collective={createdByAccount}>
              <Avatar collective={createdByAccount} size={24} />
            </LinkCollective>
            <P ml={2} lineHeight="16px" fontSize="14px" color="black.700" data-cy="expense-author">
              {isDraft && expense.requestedByAccount ? (
                <FormattedMessage
                  id="Expense.RequestedBy"
                  defaultMessage="Invited by {name}"
                  values={{
                    name: (
                      <AccountHoverCard
                        account={createdByAccount}
                        includeAdminMembership={{
                          accountSlug: expense.account?.slug,
                          hostSlug: host?.slug,
                        }}
                        trigger={
                          <span>
                            <CreatedByUserLink account={createdByAccount} />
                          </span>
                        }
                      />
                    ),
                  }}
                />
              ) : (
                <FormattedMessage
                  id="Expense.SubmittedBy"
                  defaultMessage="Submitted by {name}"
                  values={{
                    name: (
                      <AccountHoverCard
                        account={createdByAccount}
                        includeAdminMembership={{
                          accountSlug: expense.account?.slug,
                          hostSlug: host?.slug,
                        }}
                        trigger={
                          <span>
                            <CreatedByUserLink account={createdByAccount} />
                          </span>
                        }
                      />
                    ),
                  }}
                />
              )}
              {expense.approvedBy?.length > 0 && (
                <React.Fragment>
                  <Spacer />
                  <FormattedMessage
                    id="Expense.ApprovedBy"
                    defaultMessage="Approved by {name}"
                    values={{
                      name: (
                        <AccountHoverCard
                          account={expense.approvedBy.find(Boolean)}
                          includeAdminMembership={{
                            accountSlug: expense.account.slug,
                            hostSlug: host?.slug,
                          }}
                          trigger={
                            <span>
                              <CreatedByUserLink account={expense.approvedBy.find(Boolean)} />
                            </span>
                          }
                        />
                      ),
                    }}
                  />
                </React.Fragment>
              )}
            </P>
          </React.Fragment>
        )}
      </Flex>
      <Flex alignItems="center" mt="12px">
        {isLoading && !expense ? (
          <LoadingPlaceholder height={24} width={200} />
        ) : (
          <P fontSize="14px" color="black.700" data-cy="expense-author">
            <FormattedDate value={expense.createdAt} dateStyle="medium" />
            {expense.merchantId && (
              <React.Fragment>
                <Spacer />
                <FormattedMessage
                  id="Expense.MerchantId"
                  defaultMessage="Merchant ID: {id}"
                  values={{ id: expense.merchantId }}
                />
              </React.Fragment>
            )}
            {expense.reference && (
              <React.Fragment>
                <Spacer />
                <FormattedMessage
                  id="ReferenceValue"
                  defaultMessage="Ref: {reference}"
                  values={{
                    reference: (
                      <TruncatedTextWithTooltip value={expense.reference} length={10} truncatePosition="middle" />
                    ),
                  }}
                />
              </React.Fragment>
            )}
            {expense.comments && (
              <React.Fragment>
                <Spacer />
                <MessageSquare size="16px" style={{ display: 'inline-block' }} />
                &nbsp;
                {expense.comments.totalCount}
              </React.Fragment>
            )}
          </P>
        )}
      </Flex>
      {isGrant && expense.longDescription && (
        <Fragment>
          <Flex alignItems="center" mt={4}>
            <Span fontWeight="bold" fontSize="16px">
              <FormattedMessage id="Expense.RequestDescription" defaultMessage="Request Description" />
            </Span>
            <StyledHr flex="1 1" borderColor="black.300" ml={2} />
          </Flex>
          <P mt={4}>{expense.longDescription}</P>
        </Fragment>
      )}

      <Flex mt={4} mb={2} alignItems="center" gridGap={2}>
        {!expense && isLoading ? (
          <LoadingPlaceholder height={20} maxWidth={150} />
        ) : (
          <Span fontWeight="bold" fontSize="16px">
            {isReceipt || isCreditCardCharge ? (
              <FormattedMessage id="Expense.AttachedReceipts" defaultMessage="Attached receipts" />
            ) : isGrant ? (
              <FormattedMessage id="Expense.RequestDetails" defaultMessage="Request Details" />
            ) : (
              <FormattedMessage id="Expense.InvoiceItems" defaultMessage="Invoice items" />
            )}
          </Span>
        )}
        <StyledHr flex="1 1" borderColor="black.300" />
        {useInlineExpenseEdit && (
          <EditExpenseDialog
            expense={expense}
            dialogContentClassName="sm:max-w-xl"
            field="expenseItems"
            title={intl.formatMessage({ defaultMessage: 'Edit expense items', id: 'expense.editItems' })}
          />
        )}
      </Flex>
      {!expense && isLoading ? (
        <LoadingPlaceholder height={68} mb={3} />
      ) : (
        <div data-cy="expense-summary-items">
          {expenseItems.map((attachment, attachmentIdx) => (
            <React.Fragment key={attachment.id || attachmentIdx}>
              <Flex my={24} flexWrap="wrap" data-cy="expense-summary-item">
                {attachment.url && expenseItemsMustHaveFiles(expense.type) && (
                  <Box mr={3} mb={3} width={['100%', 'auto']}>
                    <UploadedFilePreview
                      url={attachment.url}
                      isLoading={isLoading || isLoadingLoggedInUser}
                      isPrivate={!attachment.url && !isLoading}
                      size={[64, 48]}
                      maxHeight={48}
                      openFileViewer={openFileViewer}
                    />
                  </Box>
                )}
                <Flex justifyContent="space-between" alignItems="flex-start" flex="1">
                  <Flex flexDirection="column" justifyContent="center" flexGrow="1">
                    {attachment.description ? (
                      <HTMLContent
                        content={attachment.description}
                        fontSize="14px"
                        color="black.900"
                        collapsable
                        fontWeight="500"
                        maxCollapsedHeight={100}
                        collapsePadding={22}
                      />
                    ) : (
                      <Span color="black.600" fontStyle="italic">
                        <FormattedMessage id="NoDescription" defaultMessage="No description provided" />
                      </Span>
                    )}
                    {!isGrant && (
                      <Span mt={1} fontSize="12px" color="black.700">
                        <FormattedMessage
                          id="withColon"
                          defaultMessage="{item}:"
                          values={{
                            item: <FormattedMessage id="expense.incurredAt" defaultMessage="Date" />,
                          }}
                        />{' '}
                        {/* Using timeZone=UTC as we only store the date as a UTC string, without time */}
                        <FormattedDate value={attachment.incurredAt} dateStyle="long" timeZone="UTC" />{' '}
                      </Span>
                    )}
                  </Flex>
                  <Container
                    fontSize={15}
                    color="black.600"
                    mt={2}
                    textAlign="right"
                    ml={3}
                    data-cy="expense-summary-item-amount"
                  >
                    {attachment.amountV2?.exchangeRate ? (
                      <div>
                        <FormattedMoneyAmount
                          amount={Math.round(attachment.amountV2.valueInCents * attachment.amountV2.exchangeRate.value)}
                          currency={expense.currency}
                          amountClassName="font-medium text-foreground"
                          precision={2}
                        />
                        <div className="mt-[2px] text-xs">
                          <AmountWithExchangeRateInfo
                            amount={attachment.amountV2}
                            invertIconPosition
                            {...getExpenseExchangeRateWarningOrError(
                              intl,
                              attachment.amountV2.exchangeRate,
                              attachment.referenceExchangeRate,
                            )}
                          />
                        </div>
                      </div>
                    ) : (
                      <FormattedMoneyAmount
                        amount={attachment.amountV2?.valueInCents || attachment.amount}
                        currency={attachment.amountV2?.currency || expense.currency}
                        amountClassName="font-medium text-foreground"
                        precision={2}
                      />
                    )}
                  </Container>
                </Flex>
              </Flex>
              <StyledHr borderStyle="dotted" />
            </React.Fragment>
          ))}
        </div>
      )}
      <Flex flexDirection="column" alignItems="flex-end" mt={4} mb={2}>
        <Flex alignItems="center">
          {!expense && isLoading ? (
            <LoadingPlaceholder height={18} width={150} />
          ) : (
            <ExpenseAmountBreakdown
              currency={expense.currency}
              items={expenseItems}
              taxes={expenseTaxes}
              expenseTotalAmount={isEditing ? null : expense.amount}
            />
          )}
        </Flex>
        {isMultiCurrency && (
          <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
            <Container fontWeight="500" mr={3} whiteSpace="nowrap">
              <FormattedMessage
                defaultMessage="Accounted as ({currency}):"
                id="4Wdhe4"
                values={{ currency: expense.amountInAccountCurrency.currency }}
              />
            </Container>
            <Container>
              <AmountWithExchangeRateInfo amount={expense.amountInAccountCurrency} />
            </Container>
          </div>
        )}
      </Flex>
      {expenseTypeSupportsAttachments(expense?.type) && (Boolean(invoiceFile) || useInlineExpenseEdit) && (
        <React.Fragment>
          <Flex my={4} alignItems="center" gridGap={2}>
            {!expense && isLoading ? (
              <LoadingPlaceholder height={20} maxWidth={150} />
            ) : (
              <Span fontWeight="bold" fontSize="16px">
                <FormattedMessage defaultMessage="Invoice" id="Expense.Type.Invoice" />
              </Span>
            )}
            <StyledHr flex="1 1" borderColor="black.300" />
            {useInlineExpenseEdit && (
              <EditExpenseDialog
                title={intl.formatMessage({ defaultMessage: 'Edit invoice file', id: 'expense.editInvoice' })}
                field="invoiceFile"
                expense={expense}
                onEdit={onEdit}
              />
            )}
          </Flex>
          <ExpenseAttachedFiles files={invoiceFile ? [invoiceFile] : []} openFileViewer={openFileViewer} />
        </React.Fragment>
      )}
      {expenseTypeSupportsAttachments(expense?.type) && (attachedFiles.length > 0 || useInlineExpenseEdit) && (
        <React.Fragment>
          <Flex my={4} alignItems="center" gridGap={2}>
            {!expense && isLoading ? (
              <LoadingPlaceholder height={20} maxWidth={150} />
            ) : (
              <Span fontWeight="bold" fontSize="16px">
                <FormattedMessage id="Expense.Attachments" defaultMessage="Attachments" />
              </Span>
            )}
            <StyledHr flex="1 1" borderColor="black.300" />
            {useInlineExpenseEdit && (
              <EditExpenseDialog
                title={intl.formatMessage({ defaultMessage: 'Edit attachments', id: 'expense.editAttachments' })}
                field="attachments"
                expense={expense}
                onEdit={onEdit}
              />
            )}
          </Flex>
          <ExpenseAttachedFiles files={attachedFiles} openFileViewer={openFileViewer} />
        </React.Fragment>
      )}

      <Flex mt={4} mb={3} alignItems="center">
        <Span fontWeight="bold" fontSize="16px">
          <FormattedMessage defaultMessage="Additional Information" id="laUK3e" />
        </Span>
        <StyledHr flex="1 1" borderColor="black.300" ml={2} />
      </Flex>

      <ExpenseSummaryAdditionalInformation
        isLoading={isLoading}
        host={host}
        expense={expense}
        collective={collective}
        isDraft={!isEditing && expense?.status === ExpenseStatus.DRAFT}
        useInlineExpenseEdit={useInlineExpenseEdit}
      />
      {!isEditing &&
        (drawerActionsContainer ? (
          createPortal(processButtons, drawerActionsContainer)
        ) : showProcessButtons ? (
          <Fragment>
            <StyledHr flex="1" mt={4} mb={3} borderColor="black.300" />
            {processButtons}
          </Fragment>
        ) : null)}
    </StyledCard>
  );
};

ExpenseSummary.propTypes = {
  /** Set this to true if the expense is not loaded yet */
  isLoading: PropTypes.bool,
  /** Set this to true if the logged in user is currenltly loading */
  isLoadingLoggedInUser: PropTypes.bool,
  host: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    slug: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    website: PropTypes.string,
    location: PropTypes.shape({
      address: PropTypes.string,
      country: PropTypes.string,
    }),
  }),
  /** Must be provided if isLoading is false */
  expense: PropTypes.shape({
    id: PropTypes.string,
    legacyId: PropTypes.number,
    accountingCategory: PropTypes.object,
    description: PropTypes.string.isRequired,
    reference: PropTypes.string,
    longDescription: PropTypes.string,
    amount: PropTypes.number.isRequired,
    currency: PropTypes.string.isRequired,
    invoiceInfo: PropTypes.string,
    merchantId: PropTypes.string,
    createdAt: PropTypes.string,
    status: PropTypes.oneOf(Object.values(ExpenseStatus)),
    onHold: PropTypes.bool,
    type: PropTypes.oneOf(Object.values(expenseTypes)).isRequired,
    tags: PropTypes.arrayOf(PropTypes.string),
    requiredLegalDocuments: PropTypes.arrayOf(PropTypes.string),
    amountInAccountCurrency: AmountPropTypeShape,
    account: PropTypes.shape({
      id: PropTypes.string.isRequired,
      slug: PropTypes.string.isRequired,
      host: PropTypes.shape({
        id: PropTypes.string.isRequired,
      }),
      parent: PropTypes.shape({
        id: PropTypes.string.isRequired,
      }),
    }).isRequired,
    items: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string,
        incurredAt: PropTypes.string,
        description: PropTypes.string,
        amount: PropTypes.number.isRequired,
        url: PropTypes.string,
      }).isRequired,
    ),
    attachedFiles: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string,
        url: PropTypes.string.isRequired,
      }).isRequired,
    ),
    taxes: PropTypes.arrayOf(
      PropTypes.shape({
        type: PropTypes.string,
        rate: PropTypes.number,
      }).isRequired,
    ),
    payee: PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      slug: PropTypes.string.isRequired,
      type: PropTypes.string.isRequired,
      isAdmin: PropTypes.bool,
    }).isRequired,
    approvedBy: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
        slug: PropTypes.string.isRequired,
        type: PropTypes.string.isRequired,
        isAdmin: PropTypes.bool,
      }),
    ),
    payeeLocation: PropTypes.shape({
      address: PropTypes.string,
      country: PropTypes.string,
    }),
    createdByAccount: PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      slug: PropTypes.string.isRequired,
      type: PropTypes.string.isRequired,
    }),
    requestedByAccount: PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      slug: PropTypes.string.isRequired,
      type: PropTypes.string.isRequired,
    }),
    payoutMethod: PropTypes.shape({
      id: PropTypes.string,
      type: PropTypes.oneOf(Object.values(PayoutMethodType)),
      data: PropTypes.object,
    }),
    draft: PropTypes.shape({
      items: PropTypes.arrayOf(
        PropTypes.shape({
          id: PropTypes.string,
          incurredAt: PropTypes.string,
          description: PropTypes.string,
          amount: PropTypes.number,
          amountV2: PropTypes.object,
          url: PropTypes.string,
        }),
      ),
      taxes: PropTypes.arrayOf(
        PropTypes.shape({
          type: PropTypes.string,
          rate: PropTypes.number,
        }).isRequired,
      ),
    }),
    permissions: PropTypes.shape({
      canSeeInvoiceInfo: PropTypes.bool,
      canDelete: PropTypes.bool,
      canEditAccountingCategory: PropTypes.bool,
      canEdit: PropTypes.bool,
    }),
    comments: PropTypes.shape({
      totalCount: PropTypes.number,
    }),
  }),
  /** Whether current user can edit the tags */
  canEditTags: PropTypes.bool,
  /** Whether or not this is being displayed for an edited Expense */
  isEditing: PropTypes.bool,
  /** Whether to show the process buttons (Approve, Pay, etc) */
  showProcessButtons: PropTypes.bool,
  /** The account where the expense has been submitted, required to display the process actions */
  collective: PropTypes.object,
  /** Disable border and paiding in styled card, usefull for modals */
  borderless: PropTypes.bool,
  /** Passed down from ExpenseModal */
  onClose: PropTypes.func,
  /** Passed down from Expense */
  onEdit: PropTypes.func,
  /** Passed down from either ExpenseModal or Expense */
  onDelete: PropTypes.func,
  /** Passwed down from Expense */
  openFileViewer: PropTypes.func,
  /** Reference to the actions container element in the Expense Drawer */
  drawerActionsContainer: PropTypes.object,
  enableKeyboardShortcuts: PropTypes.bool,
};

export default ExpenseSummary;
