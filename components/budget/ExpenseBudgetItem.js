import React from 'react';
import PropTypes from 'prop-types';
import { AlertTriangle } from '@styled-icons/feather/AlertTriangle';
import { Maximize2 as MaximizeIcon } from '@styled-icons/feather/Maximize2';
import { get, includes } from 'lodash';
import { FormattedMessage, useIntl } from 'react-intl';
import styled, { css } from 'styled-components';
import { space } from 'styled-system';

import expenseTypes from '../../lib/constants/expenseTypes';
import { getFilesFromExpense } from '../../lib/expenses';
import { ExpenseStatus } from '../../lib/graphql/types/v2/schema';
import useLoggedInUser from '../../lib/hooks/useLoggedInUser';
import { PREVIEW_FEATURE_KEYS } from '../../lib/preview-features';
import { AmountPropTypeShape } from '../../lib/prop-types';
import { toPx } from '../../lib/theme/helpers';
import { getCollectivePageRoute } from '../../lib/url-helpers';
import { shouldDisplayExpenseCategoryPill } from '../expenses/lib/accounting-categories';

import { AccountHoverCard } from '../AccountHoverCard';
import AmountWithExchangeRateInfo from '../AmountWithExchangeRateInfo';
import AutosizeText from '../AutosizeText';
import Avatar from '../Avatar';
import { AvatarWithLink } from '../AvatarWithLink';
import DateTime from '../DateTime';
import AdminExpenseStatusTag from '../expenses/AdminExpenseStatusTag';
import { ExpenseAccountingCategoryPill } from '../expenses/ExpenseAccountingCategoryPill';
import ExpenseStatusTag from '../expenses/ExpenseStatusTag';
import ExpenseTypeTag from '../expenses/ExpenseTypeTag';
import PayoutMethodTypeWithIcon from '../expenses/PayoutMethodTypeWithIcon';
import ProcessExpenseButtons, {
  DEFAULT_PROCESS_EXPENSE_BTN_PROPS,
  hasProcessButtons,
} from '../expenses/ProcessExpenseButtons';
import FilesViewerModal from '../FilesViewerModal';
import FormattedMoneyAmount from '../FormattedMoneyAmount';
import { Box, Flex } from '../Grid';
import CommentIcon from '../icons/CommentIcon';
import Link from '../Link';
import LinkCollective from '../LinkCollective';
import LoadingPlaceholder from '../LoadingPlaceholder';
import StackedAvatars from '../StackedAvatars';
import StyledButton from '../StyledButton';
import StyledLink from '../StyledLink';
import Tags from '../Tags';
import { H3 } from '../Text';
import TransactionSign from '../TransactionSign';
import TruncatedTextWithTooltip from '../TruncatedTextWithTooltip';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/Tooltip';

const DetailColumnHeader = styled.div`
  font-style: normal;
  font-weight: bold;
  font-size: 9px;
  line-height: 14px;
  letter-spacing: 0.6px;
  text-transform: uppercase;
  color: #c4c7cc;
`;

const ButtonsContainer = styled.div.attrs({ 'data-cy': 'expense-actions' })`
  display: flex;
  flex-wrap: wrap;
  margin-top: 8px;
  grid-gap: 8px;
  transition: opacity 0.05s;
  justify-content: flex-end;

  @media (max-width: 40em) {
    justify-content: center;
  }

  & > *:last-child {
    margin-right: 0;
  }
`;

const ExpenseContainer = styled.div`
  outline: none;
  display: block;
  width: 100%;
  border: 0;
  background: white;
  ${space}

  transition: background 0.1s;

  ${props =>
    props.useDrawer &&
    css`
      ${props => props.selected && `background: #E5F3FF;`}
    `}

  ${props =>
    !props.selected &&
    css`
      @media (hover: hover) {
        &:not(:hover):not(:focus-within) ${ButtonsContainer} {
          opacity: 0.24;
        }
      }
    `}
`;

const ExpenseBudgetItem = ({
  isLoading,
  host,
  isInverted,
  showAmountSign,
  expense,
  showProcessActions,
  view = 'public',
  onProcess,
  selected,
  expandExpense,
  useDrawer,
}) => {
  const intl = useIntl();
  const { LoggedInUser } = useLoggedInUser();
  const [showFilesViewerModal, setShowFilesViewerModal] = React.useState(null);
  const featuredProfile = isInverted ? expense?.account : expense?.payee;
  const isAdminView = view === 'admin';
  const isSubmitterView = view === 'submitter';
  const isCharge = expense?.type === expenseTypes.CHARGE;
  const pendingReceipt = isCharge && expense?.items?.every(i => i.url === null);
  const files = React.useMemo(() => getFilesFromExpense(expense, intl), [expense]);
  const invoiceFile = React.useMemo(() => files.find(f => f.isInvoice), [files]);
  const attachedFiles = React.useMemo(() => files.filter(f => f !== invoiceFile), [files, invoiceFile]);
  const nbAttachedFiles = !isAdminView ? 0 : attachedFiles.length;
  const isExpensePaidOrRejected = [ExpenseStatus.REJECTED, ExpenseStatus.PAID].includes(expense?.status);
  const shouldDisplayStatusTagActions =
    (isExpensePaidOrRejected || expense?.status === ExpenseStatus.APPROVED) &&
    (hasProcessButtons(expense.permissions) || expense.permissions.canMarkAsIncomplete);
  const isMultiCurrency =
    expense?.amountInAccountCurrency && expense.amountInAccountCurrency?.currency !== expense.currency;

  const isLoggedInUserExpenseHostAdmin = LoggedInUser?.isAdminOfCollective(host);
  const isLoggedInUserExpenseAdmin = LoggedInUser?.isAdminOfCollective(expense?.account);
  const isViewingExpenseInHostContext = isLoggedInUserExpenseHostAdmin && !isLoggedInUserExpenseAdmin;
  const hasKeyboardShortcutsEnabled = LoggedInUser?.hasPreviewFeatureEnabled(PREVIEW_FEATURE_KEYS.KEYBOARD_SHORTCUTS);
  const lastComment = expense?.lastComment?.nodes?.[0];
  const approvedBy = expense?.approvedBy?.length > 0 ? expense.approvedBy : null;

  return (
    <ExpenseContainer
      px={[3, '24px']}
      py={3}
      data-cy={`expense-container-${expense?.legacyId}`}
      selected={selected}
      useDrawer={useDrawer}
    >
      <div className="mb-5 flex flex-wrap items-start justify-end gap-3">
        <div className="flex grow gap-3">
          <Box>
            {isLoading ? (
              <LoadingPlaceholder width={40} height={40} />
            ) : (
              <AccountHoverCard
                account={featuredProfile}
                includeAdminMembership={{
                  accountSlug: expense.account?.slug,
                  hostSlug: host?.slug,
                }}
                trigger={
                  <span>
                    <AvatarWithLink
                      size={40}
                      account={featuredProfile}
                      secondaryAccount={
                        featuredProfile.id === expense.createdByAccount.id ? null : expense.createdByAccount
                      }
                    />
                  </span>
                }
              />
            )}
          </Box>
          {isLoading ? (
            <LoadingPlaceholder height={60} />
          ) : (
            <Box>
              <Tooltip>
                <TooltipContent>
                  {useDrawer ? (
                    <FormattedMessage id="Expense.SeeDetails" defaultMessage="See expense details" />
                  ) : (
                    <FormattedMessage id="Expense.GoToPage" defaultMessage="Go to expense page" />
                  )}
                </TooltipContent>
                <TooltipTrigger asChild>
                  <span>
                    <StyledLink
                      $underlineOnHover
                      {...(useDrawer
                        ? {
                            as: Link,
                            href: `${getCollectivePageRoute(expense.account)}/expenses/${expense.legacyId}`,
                            onClick: expandExpense,
                          }
                        : {
                            as: Link,
                            href: `${getCollectivePageRoute(expense.account)}/expenses/${expense.legacyId}`,
                          })}
                    >
                      <AutosizeText
                        value={expense.description}
                        maxLength={255}
                        minFontSizeInPx={12}
                        maxFontSizeInPx={16}
                        lengthThreshold={72}
                        mobileRatio={0.875}
                        valueFormatter={toPx}
                      >
                        {({ value, fontSize }) => {
                          return (
                            <H3
                              fontWeight="500"
                              lineHeight="1.5em"
                              textDecoration="none"
                              color="black.900"
                              fontSize={fontSize}
                              data-cy="expense-title"
                            >
                              {value}
                            </H3>
                          );
                        }}
                      </AutosizeText>
                    </StyledLink>
                  </span>
                </TooltipTrigger>
              </Tooltip>

              {shouldDisplayExpenseCategoryPill(LoggedInUser, expense, expense.account, host) && (
                <div className="flex items-center gap-1">
                  <span className="text-sm font-normal text-neutral-700">
                    <FormattedMessage id="expense.accountingCategory" defaultMessage="Category" />
                  </span>
                  <ExpenseAccountingCategoryPill
                    expense={expense}
                    host={host}
                    account={expense.account}
                    canEdit={get(expense, 'permissions.canEditAccountingCategory', false)}
                    allowNone
                    showCodeInSelect={isLoggedInUserExpenseHostAdmin}
                  />
                </div>
              )}

              <div className="mt-1 text-xs text-slate-700">
                {isAdminView ? (
                  <AccountHoverCard
                    account={expense.account}
                    trigger={
                      <span>
                        <LinkCollective noTitle className="text-primary hover:underline" collective={expense.account} />
                      </span>
                    }
                  />
                ) : (
                  <FormattedMessage
                    defaultMessage="from {payee} to {account}"
                    id="B5z1AU"
                    values={{
                      payee: (
                        <AccountHoverCard
                          account={expense.payee}
                          includeAdminMembership={{
                            accountSlug: expense.account?.slug,
                            hostSlug: host?.slug,
                          }}
                          trigger={
                            <span>
                              <LinkCollective
                                noTitle
                                className="text-primary hover:underline"
                                collective={expense.payee}
                              />
                            </span>
                          }
                        />
                      ),
                      account: (
                        <AccountHoverCard
                          account={expense.account}
                          trigger={
                            <span>
                              <LinkCollective
                                noTitle
                                className="text-primary hover:underline"
                                collective={expense.account}
                              />
                            </span>
                          }
                        />
                      ),
                    }}
                  />
                )}
                {' • '}
                <DateTime value={expense.createdAt} />
                {isAdminView && (
                  <React.Fragment>
                    {' • '}
                    <FormattedMessage
                      id="BalanceAmount"
                      defaultMessage="Balance {balance}"
                      values={{
                        balance: (
                          <FormattedMoneyAmount
                            amount={get(
                              expense.account,
                              'stats.balanceWithBlockedFunds.valueInCents',
                              get(expense.account, 'stats.balanceWithBlockedFunds', 0),
                            )}
                            currency={expense.account.currency}
                          />
                        ),
                      }}
                    />
                    {Boolean(expense.comments?.totalCount) && (
                      <React.Fragment>
                        {' • '}
                        {expense.comments?.totalCount}
                        &nbsp;
                        <CommentIcon size={14} color="#4D4F51" />
                      </React.Fragment>
                    )}
                  </React.Fragment>
                )}
              </div>
            </Box>
          )}
        </div>
        <div className="flex w-full flex-col items-end justify-between sm:w-fit">
          <Flex flexDirection="column" minWidth={100} alignItems="flex-end" data-cy="transaction-amount">
            {isLoading ? (
              <LoadingPlaceholder height={19} width={120} />
            ) : (
              <React.Fragment>
                <div>
                  {showAmountSign && <TransactionSign isCredit={isInverted} />}
                  <FormattedMoneyAmount
                    amountClassName="font-bold"
                    amount={expense.amount}
                    currency={expense.currency}
                    precision={2}
                  />
                </div>
                {isMultiCurrency && (
                  <div className="my-1 text-sm text-muted-foreground">
                    <AmountWithExchangeRateInfo amount={expense.amountInAccountCurrency} />
                  </div>
                )}
              </React.Fragment>
            )}
          </Flex>
          {isLoading ? (
            <LoadingPlaceholder height={20} width={140} />
          ) : (
            <Flex>
              {(isAdminView || isSubmitterView) && pendingReceipt && (
                <Box mr="1px">
                  <Tooltip>
                    <TooltipContent>
                      <FormattedMessage id="Expense.MissingReceipt" defaultMessage="Expense is missing its Receipt" />
                    </TooltipContent>
                    <TooltipTrigger>
                      <AlertTriangle size={18} />
                    </TooltipTrigger>
                  </Tooltip>
                </Box>
              )}
              {(isAdminView || isSubmitterView) && (
                <ExpenseTypeTag type={expense.type} legacyId={expense.legacyId} mb={0} py={0} mr="2px" fontSize="9px" />
              )}
              {shouldDisplayStatusTagActions ? (
                <AdminExpenseStatusTag host={host} collective={expense.account} expense={expense} p="3px 8px" />
              ) : (
                <ExpenseStatusTag
                  status={expense.status}
                  fontSize="12px"
                  fontWeight="bold"
                  letterSpacing="0.06em"
                  lineHeight="16px"
                  p="3px 8px"
                  showTaxFormTag={includes(expense.requiredLegalDocuments, 'US_TAX_FORM')}
                  payee={expense.payee}
                />
              )}
            </Flex>
          )}
        </div>
      </div>
      <div className="mt-2 flex flex-wrap items-end justify-end gap-4">
        <div className="w-full sm:flex sm:w-fit sm:grow">
          {isAdminView || isSubmitterView ? (
            <div className="mx-4 grid grid-cols-2 gap-x-6 gap-y-1 sm:mx-0 sm:grid-flow-col sm:gap-y-0">
              <div>
                <DetailColumnHeader>
                  <FormattedMessage id="expense.payoutMethod" defaultMessage="payout method" />
                </DetailColumnHeader>
                <div className="flex h-6 items-center">
                  <PayoutMethodTypeWithIcon
                    isLoading={isLoading}
                    type={expense.payoutMethod?.type}
                    iconSize="10px"
                    fontSize="11px"
                    fontWeight="normal"
                    color="black.700"
                  />
                </div>
              </div>
              {Boolean(expense.reference) && (
                <div>
                  <DetailColumnHeader>
                    <FormattedMessage id="Expense.Reference" defaultMessage="Reference" />
                  </DetailColumnHeader>
                  {isLoading ? (
                    <LoadingPlaceholder height={15} width={90} />
                  ) : (
                    <div className="text-[11px] leading-6">
                      <TruncatedTextWithTooltip value={expense.reference} length={10} truncatePosition="middle" />
                    </div>
                  )}
                </div>
              )}
              {invoiceFile && (
                <div>
                  <DetailColumnHeader>
                    <FormattedMessage defaultMessage="Invoice" id="Expense.Type.Invoice" />
                  </DetailColumnHeader>
                  {isLoading ? (
                    <LoadingPlaceholder height={15} width={90} />
                  ) : (
                    <StyledButton
                      color="black.700"
                      fontSize="11px"
                      cursor="pointer"
                      buttonSize="tiny"
                      onClick={
                        useDrawer
                          ? e => expandExpense(e, invoiceFile.url)
                          : () => setShowFilesViewerModal([invoiceFile])
                      }
                      px={2}
                      ml={-2}
                      isBorderless
                      textAlign="left"
                    >
                      <MaximizeIcon size={10} />
                      &nbsp;&nbsp;
                      <FormattedMessage
                        id="ExpenseInvoice.count"
                        defaultMessage="{count, plural, one {# invoice} other {# invoices}}"
                        values={{ count: 1 }}
                      />
                    </StyledButton>
                  )}
                </div>
              )}
              {nbAttachedFiles > 0 && (
                <div>
                  <DetailColumnHeader>
                    <FormattedMessage id="Expense.Attachments" defaultMessage="Attachments" />
                  </DetailColumnHeader>
                  {isLoading ? (
                    <LoadingPlaceholder height={15} width={90} />
                  ) : (
                    <StyledButton
                      color="black.700"
                      fontSize="11px"
                      cursor="pointer"
                      buttonSize="tiny"
                      onClick={
                        useDrawer
                          ? e => expandExpense(e, attachedFiles[0].url)
                          : () => setShowFilesViewerModal(attachedFiles)
                      }
                      px={2}
                      ml={-2}
                      isBorderless
                      textAlign="left"
                    >
                      <MaximizeIcon size={10} />
                      &nbsp;&nbsp;
                      <FormattedMessage
                        id="ExepenseAttachments.count"
                        defaultMessage="{count, plural, one {# attachment} other {# attachments}}"
                        values={{ count: nbAttachedFiles }}
                      />
                    </StyledButton>
                  )}
                </div>
              )}

              {lastComment && (
                <div>
                  <DetailColumnHeader>
                    <FormattedMessage defaultMessage="Last Comment" id="gSNApa" />
                  </DetailColumnHeader>
                  <div className="text-[11px]">
                    <LinkCollective
                      collective={lastComment.fromAccount}
                      className="flex items-center gap-2 font-medium text-slate-700 hover:text-slate-700 hover:underline"
                      withHoverCard
                      hoverCardProps={{ includeAdminMembership: { accountSlug: lastComment.fromAccount.slug } }}
                    >
                      <Avatar collective={lastComment.fromAccount} radius={24} /> {lastComment.fromAccount.name}
                    </LinkCollective>
                  </div>
                </div>
              )}
              {approvedBy && expense.status === ExpenseStatus.APPROVED && !expense.onHold && (
                <div>
                  <DetailColumnHeader>
                    <FormattedMessage defaultMessage="Approved By" id="JavAWD" />
                  </DetailColumnHeader>
                  <div className="text-[11px]">
                    <StackedAvatars
                      accounts={approvedBy}
                      imageSize={24}
                      withHoverCard={{ includeAdminMembership: true }}
                    />
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="mt-2">
              <Tags expense={expense} canEdit={get(expense, 'permissions.canEditTags', false)} />
            </div>
          )}
        </div>
        {showProcessActions && expense?.permissions && !isExpensePaidOrRejected && (
          <div
            data-cy="expense-actions"
            className="flex w-full flex-col items-stretch gap-2 self-end sm:float-right sm:w-auto sm:flex-row sm:items-end sm:justify-end"
          >
            <ProcessExpenseButtons
              host={host}
              isViewingExpenseInHostContext={isViewingExpenseInHostContext}
              collective={expense.account}
              expense={expense}
              permissions={expense.permissions}
              buttonProps={{ ...DEFAULT_PROCESS_EXPENSE_BTN_PROPS, mx: 1, py: 2 }}
              onSuccess={onProcess}
              enableKeyboardShortcuts={selected && hasKeyboardShortcutsEnabled}
            />
          </div>
        )}
      </div>
      {showFilesViewerModal && (
        <FilesViewerModal
          files={files}
          parentTitle={intl.formatMessage(
            {
              defaultMessage: 'Expense #{expenseId} attachment',
              id: 'At2m8o',
            },
            { expenseId: expense.legacyId },
          )}
          onClose={() => setShowFilesViewerModal(null)}
        />
      )}
    </ExpenseContainer>
  );
};

ExpenseBudgetItem.propTypes = {
  isLoading: PropTypes.bool,
  /** Set this to true to invert who's displayed (payee or collective) */
  isInverted: PropTypes.bool,
  showAmountSign: PropTypes.bool,
  onDelete: PropTypes.func,
  onProcess: PropTypes.func,
  showProcessActions: PropTypes.bool,
  view: PropTypes.oneOf(['public', 'admin', 'submitter']),
  host: PropTypes.object,
  expense: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    legacyId: PropTypes.number,
    comments: PropTypes.shape({
      totalCount: PropTypes.number,
    }),
    type: PropTypes.string.isRequired,
    reference: PropTypes.string,
    description: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired,
    createdAt: PropTypes.string.isRequired,
    tags: PropTypes.arrayOf(PropTypes.string),
    amount: PropTypes.number.isRequired,
    amountInAccountCurrency: AmountPropTypeShape,
    currency: PropTypes.string.isRequired,
    permissions: PropTypes.object,
    onHold: PropTypes.bool,
    accountingCategory: PropTypes.object,
    items: PropTypes.arrayOf(PropTypes.object),
    requiredLegalDocuments: PropTypes.arrayOf(PropTypes.string),
    attachedFiles: PropTypes.arrayOf(PropTypes.object),
    payee: PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      type: PropTypes.string.isRequired,
      slug: PropTypes.string.isRequired,
      imageUrl: PropTypes.string.isRequired,
      isAdmin: PropTypes.bool,
    }),
    payoutMethod: PropTypes.shape({
      type: PropTypes.string,
    }),
    createdByAccount: PropTypes.shape({
      id: PropTypes.string.isRequired,
      type: PropTypes.string.isRequired,
      slug: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
    }),
    /** If available, this `account` will be used to link expense in place of the `collective` */
    account: PropTypes.shape({
      id: PropTypes.string.isRequired,
      slug: PropTypes.string.isRequired,
      currency: PropTypes.string,
      hostAgreements: PropTypes.shape({
        totalCount: PropTypes.number,
      }),
      stats: PropTypes.shape({
        // Collective / Balance can be v1 or v2 there ...
        balanceWithBlockedFunds: PropTypes.oneOfType([
          PropTypes.number,
          PropTypes.shape({
            valueInCents: PropTypes.number,
          }),
        ]),
      }),
      parent: PropTypes.shape({
        id: PropTypes.string.isRequired,
      }),
    }),
    approvedBy: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string.isRequired,
        type: PropTypes.string.isRequired,
        slug: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
      }),
    ),
    lastComment: PropTypes.shape({
      nodes: PropTypes.arrayOf(
        PropTypes.shape({
          id: PropTypes.string.isRequired,
          createdAt: PropTypes.string.isRequired,
          fromAccount: PropTypes.shape({
            id: PropTypes.string.isRequired,
            slug: PropTypes.string.isRequired,
            type: PropTypes.string.isRequired,
            name: PropTypes.string.isRequired,
            imageUrl: PropTypes.string.isRequired,
          }),
        }),
      ),
    }),
  }),
  selected: PropTypes.bool,
  expandExpense: PropTypes.func,
  useDrawer: PropTypes.bool,
};

export default ExpenseBudgetItem;
