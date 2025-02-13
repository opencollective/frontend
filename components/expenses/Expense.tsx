import React, { Fragment, useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { useMutation } from '@apollo/client';
import { Undo } from '@styled-icons/fa-solid/Undo';
import { themeGet } from '@styled-system/theme-get';
import dayjs from 'dayjs';
import { cloneDeep, debounce, get, includes, orderBy, uniqBy, update } from 'lodash';
import { useRouter } from 'next/router';
import { createPortal } from 'react-dom';
import { FormattedMessage, useIntl } from 'react-intl';
import styled, { css } from 'styled-components';

import { getCollectiveTypeForUrl } from '../../lib/collective';
import CommentType from '../../lib/constants/commentTypes';
import expenseTypes from '../../lib/constants/expenseTypes';
import { formatErrorMessage, getErrorFromGraphqlException } from '../../lib/errors';
import { getFilesFromExpense, getPayoutProfiles } from '../../lib/expenses';
import { API_V2_CONTEXT } from '../../lib/graphql/helpers';
import { ExpenseStatus } from '../../lib/graphql/types/v2/graphql';
import useKeyboardKey, { E, ESCAPE_KEY } from '../../lib/hooks/useKeyboardKey';
import useLoggedInUser from '../../lib/hooks/useLoggedInUser';
import { usePrevious } from '../../lib/hooks/usePrevious';
import { useWindowResize, VIEWPORTS } from '../../lib/hooks/useWindowResize';
import { itemHasOCR } from './lib/ocr';
import { PREVIEW_FEATURE_KEYS } from '@/lib/preview-features';

import ConfirmationModal from '../ConfirmationModal';
import Container from '../Container';
import CommentForm from '../conversations/CommentForm';
import Thread from '../conversations/Thread';
import { useDrawerActionsContainer } from '../Drawer';
import FilesViewerModal from '../FilesViewerModal';
import { Box, Flex } from '../Grid';
import HTMLContent from '../HTMLContent';
import { WebsiteName } from '../I18nFormatters';
import CommentIcon from '../icons/CommentIcon';
import PrivateInfoIcon from '../icons/PrivateInfoIcon';
import Link from '../Link';
import LinkCollective from '../LinkCollective';
import LoadingPlaceholder from '../LoadingPlaceholder';
import MessageBox from '../MessageBox';
import StyledButton from '../StyledButton';
import StyledCheckbox from '../StyledCheckbox';
import StyledLink from '../StyledLink';
import { SubmitExpenseFlow } from '../submit-expense/SubmitExpenseFlow';
import { H1, H5, Span } from '../Text';

import { editExpenseMutation } from './graphql/mutations';
import { expensePageQuery } from './graphql/queries';
import { ConfirmOCRValues } from './ConfirmOCRValues';
import ExpenseForm, { msg as expenseFormMsg, prepareExpenseForSubmit } from './ExpenseForm';
import ExpenseInviteNotificationBanner from './ExpenseInviteNotificationBanner';
import ExpenseInviteWelcome from './ExpenseInviteWelcome';
import ExpenseMissingReceiptNotificationBanner from './ExpenseMissingReceiptNotificationBanner';
import ExpenseNotesForm from './ExpenseNotesForm';
import ExpenseRecurringBanner from './ExpenseRecurringBanner';
import ExpenseSummary from './ExpenseSummary';
import PrivateCommentsMessage from './PrivateCommentsMessage';
import TaxFormMessage from './TaxFormMessage';

const getVariableFromProps = props => {
  const firstOfCurrentYear = dayjs(new Date(new Date().getFullYear(), 0, 1))
    .utc(true)
    .toISOString();
  return {
    legacyExpenseId: props.legacyExpenseId,
    draftKey: props.draftKey || null,
    totalPaidExpensesDateFrom: firstOfCurrentYear,
  };
};

const ExpenseHeader = styled(H1)<{ inDrawer?: boolean }>`
  ${props =>
    props.inDrawer
      ? css`
          font-size: 16px;
          font-weight: 500;
          letter-spacing: 0;
          line-height: 24px;
          letter-spacing: 0;
        `
      : css`
          font-size: 24px;
        `}

  margin-bottom: 24px;
  > a {
    color: inherit;
    text-decoration: underline;

    :hover {
      color: ${themeGet('colors.black.600')};
    }
  }
`;

const PrivateNoteLabel = () => {
  return (
    <Span fontSize="12px" color="black.700" fontWeight="bold">
      <FormattedMessage id="Expense.PrivateNote" defaultMessage="Private note" />
      &nbsp;&nbsp;
      <PrivateInfoIcon size={12} className="text-muted-foreground" />
    </Span>
  );
};

const PAGE_STATUS = { VIEW: 1, EDIT: 2, EDIT_SUMMARY: 3 };

function Expense(props) {
  const {
    data,
    loading,
    error,
    refetch,
    fetchMore,
    draftKey,
    client,
    isRefetchingDataForUser,
    legacyExpenseId,
    isDrawer,
    enableKeyboardShortcuts,
    onClose,
  } = props;
  const { LoggedInUser, loadingLoggedInUser } = useLoggedInUser();
  const intl = useIntl();
  const router = useRouter();
  const isNewExpenseSubmissionFlow =
    (LoggedInUser && LoggedInUser.hasPreviewFeatureEnabled(PREVIEW_FEATURE_KEYS.NEW_EXPENSE_FLOW)) ||
    router.query.newExpenseFlowEnabled;

  const [isSubmissionFlowOpen, setIsSubmissionFlowOpen] = React.useState(false);

  const [state, setState] = useState({
    error: error || null,
    status:
      draftKey && data?.expense?.status === ExpenseStatus.DRAFT
        ? isNewExpenseSubmissionFlow
          ? PAGE_STATUS.VIEW
          : PAGE_STATUS.EDIT
        : PAGE_STATUS.VIEW,
    editedExpense: null,
    isSubmitting: false,
    isPollingEnabled: true,
    tos: false,
    newsletterOptIn: false,
    createdUser: null,
    showFilesViewerModal: false,
  });
  const [openUrl, setOpenUrl] = useState(router.query.attachmentUrl as string);
  const [replyingToComment, setReplyingToComment] = useState(null);
  const [hasConfirmedOCR, setConfirmedOCR] = useState(false);
  const hasItemsWithOCR = Boolean(state.editedExpense?.items?.some(itemHasOCR));
  const mustConfirmOCR = hasItemsWithOCR && !hasConfirmedOCR;
  const pollingInterval = 60;
  let pollingTimeout = null;
  let pollingStarted = false;
  let pollingPaused = false;
  const drawerActionsContainer = useDrawerActionsContainer();

  useEffect(() => {
    const shouldEditDraft = isNewExpenseSubmissionFlow
      ? false
      : data?.expense?.status === ExpenseStatus.DRAFT && draftKey;
    if (shouldEditDraft) {
      setState(state => ({
        ...state,
        status: PAGE_STATUS.EDIT,
        editedExpense: data?.expense,
      }));
    }

    handlePolling();
    document.addEventListener('mousemove', handlePolling);

    return () => {
      if (props.stopPolling) {
        props.stopPolling();
      }
      document.removeEventListener('mousemove', handlePolling);
    };
  }, []);

  // Disable polling while editing
  React.useEffect(() => {
    if ([PAGE_STATUS.EDIT, PAGE_STATUS.EDIT_SUMMARY].includes(state.status)) {
      if (state.isPollingEnabled) {
        setState(state => ({ ...state, isPollingEnabled: false }));
      }
    } else if (!state.isPollingEnabled) {
      setState(state => ({ ...state, isPollingEnabled: true }));
    }
  }, [state.status, state.isPollingEnabled]);

  // Automatically edit expense if missing receipt
  useEffect(() => {
    const expense = data?.expense;
    const isMissingReceipt =
      expense?.status === ExpenseStatus.PAID &&
      expense?.type === expenseTypes.CHARGE &&
      expense?.permissions?.canEdit &&
      expense?.items?.every(item => !item.url);

    if (props.edit && isMissingReceipt && state.status !== PAGE_STATUS.EDIT) {
      onEditBtnClick();
      router.replace(document.location.pathname);
    }
  }, [props.edit, props.data, state.status]);

  // Update status when data or draftKey changes
  useEffect(() => {
    const status =
      draftKey && data?.expense?.status === ExpenseStatus.DRAFT
        ? isNewExpenseSubmissionFlow
          ? PAGE_STATUS.VIEW
          : PAGE_STATUS.EDIT
        : PAGE_STATUS.VIEW;
    if (status !== state.status) {
      setState(state => ({ ...state, status }));
    }
  }, [props.data, draftKey, isNewExpenseSubmissionFlow]);

  // Scroll to expense's top when changing status
  const prevState = usePrevious(state);

  useEffect(() => {
    if (prevState && prevState.status !== state.status) {
      scrollToExpenseTop();
    }
  }, [state.status]);

  // Update error state when error prop changes (from Expense query)
  useEffect(() => {
    setState(state => ({ ...state, error }));
  }, [error]);

  useKeyboardKey({
    keyMatch: E,
    callback: e => {
      if (props.enableKeyboardShortcuts && state.status !== PAGE_STATUS.EDIT) {
        e.preventDefault();
        onEditBtnClick();
      }
    },
  });

  useKeyboardKey({
    keyMatch: ESCAPE_KEY,
    callback: e => {
      if (props.isDrawer && state.status !== PAGE_STATUS.EDIT) {
        e.preventDefault();
        onClose?.();
      }
    },
  });

  const [editExpense] = useMutation(editExpenseMutation, {
    context: API_V2_CONTEXT,
  });

  const expenseTopRef = useRef(null);
  const { status, editedExpense } = state;
  const { viewport } = useWindowResize(null, { useMinWidth: true });
  const isDesktop = viewport === VIEWPORTS.LARGE;

  const expense = data?.expense;
  const loggedInAccount = data?.loggedInAccount;
  const collective = expense?.account;
  const host = expense?.host ?? collective?.host;
  const isDraft = expense?.status === ExpenseStatus.DRAFT;
  const isMissingReceipt =
    [ExpenseStatus.PAID, ExpenseStatus.PROCESSING].includes(expense?.status) &&
    expense?.type === expenseTypes.CHARGE &&
    expense?.permissions?.canEdit &&
    expense?.items?.every(item => !item.url);
  const isRecurring = expense?.recurringExpense;
  const skipSummary = isMissingReceipt && status === PAGE_STATUS.EDIT;
  const [showResetModal, setShowResetModal] = useState(false);
  const payoutProfiles = getPayoutProfiles(loggedInAccount);
  const canEditPayoutMethod = !expense || isDraft || expense.permissions.canSeePayoutMethodPrivateDetails;

  const inDrawer = Boolean(drawerActionsContainer);

  const threadItems = React.useMemo(() => {
    const comments = expense?.comments?.nodes || [];
    const activities = expense?.activities || [];
    return orderBy([...comments, ...activities], 'createdAt', 'asc');
  }, [expense, inDrawer]);

  const isEditing = status === PAGE_STATUS.EDIT || status === PAGE_STATUS.EDIT_SUMMARY;
  const showTaxFormMsg = includes(expense?.requiredLegalDocuments, 'US_TAX_FORM') && !isEditing;
  const isEditingExistingExpense = isEditing && expense !== undefined;

  const handlePolling = debounce(() => {
    if (state.isPollingEnabled) {
      if (!pollingStarted) {
        if (pollingPaused) {
          // The polling was paused, so we immediately refetch
          props.refetch?.();
          pollingPaused = false;
        }
        props.startPolling?.(pollingInterval * 1000);
        pollingStarted = true;
      }

      clearTimeout(pollingTimeout);
      pollingTimeout = setTimeout(() => {
        // No mouse movement was detected since 60sec, we stop polling
        props.stopPolling?.();
        pollingStarted = false;
        pollingPaused = true;
      }, pollingInterval * 1000);
    }
  }, 100);

  const clonePageQueryCacheData = () => {
    const { client } = props;
    const query = expensePageQuery;
    const variables = getVariableFromProps(props);
    const data = cloneDeep(client.readQuery({ query, variables }));
    return [data, query, variables];
  };

  const onEditBtnClick = async () => {
    props.stopPolling?.();
    return setState(state => ({ ...state, status: PAGE_STATUS.EDIT, editedExpense: data?.expense }));
  };

  const onCancel = () => {
    props.startPolling?.(pollingInterval * 1000);
    return setState(state => ({ ...state, status: PAGE_STATUS.VIEW, editedExpense: null }));
  };

  const onDelete = async expense => {
    const collective = expense.account;
    const parentCollectiveSlugRoute = collective.parent?.slug ? `${collective.parent?.slug}/` : '';
    const collectiveType = collective.parent ? getCollectiveTypeForUrl(collective) : undefined;
    const collectiveTypeRoute = collectiveType ? `${collectiveType}/` : '';
    return router.replace(`${parentCollectiveSlugRoute}${collectiveTypeRoute}${collective.slug}/expenses`);
  };

  const onSummarySubmit = async editedExpense => {
    try {
      setState(state => ({ ...state, isSubmitting: true, error: null }));

      if (!editedExpense.payee.id && state.newsletterOptIn) {
        editedExpense.payee.newsletterOptIn = state.newsletterOptIn;
      }
      const preparedValues = prepareExpenseForSubmit(editedExpense);
      if (!canEditPayoutMethod) {
        delete preparedValues.payoutMethod;
      }
      await editExpense({
        variables: {
          expense: preparedValues,
          draftKey: data?.expense?.status === ExpenseStatus.DRAFT ? draftKey : null,
        },
      });
      if (data?.expense?.type === expenseTypes.CHARGE) {
        await refetch();
      }
      const createdUser = editedExpense.payee;
      props.startPolling?.(pollingInterval * 1000);
      setState(state => ({
        ...state,
        status: PAGE_STATUS.VIEW,
        isSubmitting: false,
        editedExpense: undefined,
        error: null,
        createdUser,
      }));
    } catch (e) {
      setState(state => ({ ...state, error: getErrorFromGraphqlException(e), isSubmitting: false }));
      scrollToExpenseTop();
    }
  };

  const scrollToExpenseTop = () => {
    if (expenseTopRef?.current) {
      expenseTopRef?.current.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.scrollTo(0, 0);
    }
  };
  const onNotesChanges = e => {
    const name = e.target.name;
    const value = e.target.value;
    setState(state => ({ ...state, editedExpense: { ...state.editedExpense, [name]: value } }));
  };

  const onCommentAdded = comment => {
    //  Add comment to cache if not already fetched
    const [data, query, variables] = clonePageQueryCacheData();
    update(data, 'expense.comments.nodes', comments => uniqBy([...comments, comment], 'id'));
    update(data, 'expense.comments.totalCount', totalCount => totalCount + 1);
    client.writeQuery({ query, variables, data });
  };

  const onCommentDeleted = comment => {
    const [data, query, variables] = clonePageQueryCacheData();
    update(data, 'expense.comments.nodes', comments => comments.filter(c => c.id !== comment.id));
    update(data, 'expense.comments.totalCount', totalCount => totalCount - 1);
    client.writeQuery({ query, variables, data });
  };

  const fetchMoreComments = async () => {
    // refetch before fetching more as comments added to the cache can change the offset
    await refetch();
    await fetchMore({
      variables: { legacyExpenseId, draftKey, offset: get(data, 'expense.comments.nodes', []).length },
      updateQuery: (prev: any, { fetchMoreResult }) => {
        if (!fetchMoreResult) {
          return prev;
        }
        const newValues = {
          expense: {
            ...prev.expense,
            comments: {
              ...fetchMoreResult.expense.comments,
              nodes: [...prev.expense.comments.nodes, ...fetchMoreResult.expense.comments.nodes],
            },
          },
        };
        return Object.assign({}, prev, newValues);
      },
    });
  };

  const openFileViewer = url => {
    setOpenUrl(url);
    setState({ ...state, showFilesViewerModal: true });
  };

  const files = React.useMemo(() => getFilesFromExpense(expense, intl), [expense]);

  useEffect(() => {
    const showFilesViewerModal = isDrawer && isDesktop && files?.length > 0;
    setState(state => ({ ...state, showFilesViewerModal }));
  }, [files, isDesktop, isDrawer]);

  const confirmSaveButtons = (
    <Flex flex={1} flexWrap="wrap" gridGap={[2, 3]}>
      <StyledButton
        minWidth={175}
        whiteSpace="nowrap"
        data-cy="edit-expense-btn"
        onClick={() => setState(state => ({ ...state, status: PAGE_STATUS.EDIT }))}
        disabled={state.isSubmitting}
      >
        ← <FormattedMessage id="Expense.edit" defaultMessage="Edit expense" />
      </StyledButton>
      <StyledButton
        buttonStyle="primary"
        minWidth={175}
        whiteSpace="nowrap"
        data-cy="save-expense-btn"
        onClick={() => onSummarySubmit(state.editedExpense)}
        loading={state.isSubmitting}
        disabled={isDraft ? !loggedInAccount && !state.tos : mustConfirmOCR}
      >
        {isDraft && !loggedInAccount ? (
          <FormattedMessage id="Expense.JoinAndSubmit" defaultMessage="Join and Submit" />
        ) : (
          <FormattedMessage id="Expense.SaveExpense" defaultMessage="Save Expense" />
        )}
      </StyledButton>

      {showResetModal ? (
        <ConfirmationModal
          onClose={() => setShowResetModal(false)}
          header={
            isEditingExistingExpense
              ? intl.formatMessage(expenseFormMsg.cancelEditExpense)
              : intl.formatMessage(expenseFormMsg.clearExpenseForm)
          }
          body={
            isEditingExistingExpense
              ? intl.formatMessage(expenseFormMsg.confirmCancelEditExpense)
              : intl.formatMessage(expenseFormMsg.confirmClearExpenseForm)
          }
          continueHandler={() => {
            onCancel();
            setShowResetModal(false);
          }}
          {...(isEditingExistingExpense && {
            continueLabel: intl.formatMessage({ defaultMessage: 'Yes, cancel editing', id: 'b++lom' }),
            cancelLabel: intl.formatMessage({ defaultMessage: 'No, continue editing', id: 'fIsGOi' }),
          })}
        />
      ) : (
        <StyledButton
          type="button"
          buttonStyle="borderless"
          color="red.500"
          whiteSpace="nowrap"
          marginLeft="auto"
          onClick={() => setShowResetModal(true)}
        >
          <Undo size={11} />
          <Span mx={1}>
            {intl.formatMessage(
              isEditingExistingExpense ? expenseFormMsg.cancelEditExpense : expenseFormMsg.clearExpenseForm,
            )}
          </Span>
        </StyledButton>
      )}
    </Flex>
  );
  return (
    <Box ref={expenseTopRef}>
      <ExpenseHeader inDrawer={inDrawer}>
        {expense?.type && expense?.account ? (
          <FormattedMessage
            id="ExpenseTitle"
            defaultMessage="{type, select, CHARGE {Charge} INVOICE {Invoice} RECEIPT {Receipt} GRANT {Grant} SETTLEMENT {Settlement} other {Expense}} <LinkExpense>{id}</LinkExpense> to <LinkCollective>{collectiveName}</LinkCollective>"
            values={{
              type: expense?.type,
              id: expense?.legacyId,
              LinkExpense: text => {
                if (inDrawer) {
                  return (
                    <Link href={`/${expense?.account.slug}/expenses/${expense?.legacyId}`}>
                      <span>#{text}</span>
                    </Link>
                  );
                }
                return <span>#{text}</span>;
              },
              collectiveName: expense?.account.name,
              LinkCollective: text => <LinkCollective collective={expense?.account}>{text}</LinkCollective>,
            }}
          />
        ) : (
          <LoadingPlaceholder height={32} maxWidth={'200px'} />
        )}
      </ExpenseHeader>

      {state.error && (
        <MessageBox type="error" withIcon mb={4}>
          {formatErrorMessage(intl, state.error)}
        </MessageBox>
      )}
      {showTaxFormMsg && <TaxFormMessage expense={expense} refetch={refetch} />}
      {status === PAGE_STATUS.VIEW &&
        ((expense?.status === ExpenseStatus.UNVERIFIED && state.createdUser) ||
          (isDraft && !isRecurring && !draftKey)) && (
          <ExpenseInviteNotificationBanner expense={expense} createdUser={state.createdUser} />
        )}
      {isMissingReceipt && (
        <ExpenseMissingReceiptNotificationBanner onEdit={status !== PAGE_STATUS.EDIT && onEditBtnClick} />
      )}
      {status !== PAGE_STATUS.EDIT && (
        <Box mb={3}>
          {isNewExpenseSubmissionFlow &&
            (expense?.permissions?.canDeclineExpenseInvite ||
              (expense?.status === ExpenseStatus.DRAFT &&
                !isRecurring &&
                draftKey &&
                expense?.draft?.recipientNote)) && (
              <ExpenseInviteWelcome
                onContinueSubmissionClick={() => {
                  setIsSubmissionFlowOpen(true);
                }}
                className="mb-6"
                expense={expense}
                draftKey={draftKey}
              />
            )}
          <ExpenseSummary
            expense={status === PAGE_STATUS.EDIT_SUMMARY ? editedExpense : expense}
            host={host}
            isLoading={loading || !expense}
            isEditing={status === PAGE_STATUS.EDIT_SUMMARY}
            isLoadingLoggedInUser={loadingLoggedInUser || isRefetchingDataForUser}
            collective={collective}
            onEdit={onEditBtnClick}
            onDelete={onDelete}
            canEditTags={get(expense, 'permissions.canEditTags', false)}
            showProcessButtons
            drawerActionsContainer={drawerActionsContainer}
            openFileViewer={openFileViewer}
            enableKeyboardShortcuts={enableKeyboardShortcuts}
          />

          {status !== PAGE_STATUS.EDIT_SUMMARY && (
            <React.Fragment>
              {expense?.privateMessage && (
                <Container mt={4} pb={4} borderBottom="1px solid #DCDEE0">
                  <H5 fontSize="16px" mb={3}>
                    <FormattedMessage id="expense.notes" defaultMessage="Notes" />
                  </H5>
                  <PrivateNoteLabel />
                  <HTMLContent color="black.700" mt={1} fontSize="13px" content={expense.privateMessage} />
                </Container>
              )}
            </React.Fragment>
          )}
          {status === PAGE_STATUS.EDIT_SUMMARY && (
            <Box mt={24}>
              {isDraft && !loggedInAccount && (
                <Fragment>
                  <MessageBox type="info" fontSize="12px">
                    <FormattedMessage
                      id="Expense.SignUpInfoBox"
                      defaultMessage="You need to create an account to receive a payment from {collectiveName}, by clicking 'Join and Submit' you agree to create an account on {WebsiteName}."
                      values={{ collectiveName: collective.name, WebsiteName }}
                    />
                  </MessageBox>
                  <Box mt={3}>
                    <StyledCheckbox
                      name="tos"
                      label={
                        <FormattedMessage
                          id="TOSAndPrivacyPolicyAgreement"
                          defaultMessage="I agree with the {toslink} and {privacylink} of Open Collective."
                          values={{
                            toslink: (
                              <StyledLink href="/tos" openInNewTab onClick={e => e.stopPropagation()}>
                                <FormattedMessage id="tos" defaultMessage="terms of service" />
                              </StyledLink>
                            ),
                            privacylink: (
                              <StyledLink href="/privacypolicy" openInNewTab onClick={e => e.stopPropagation()}>
                                <FormattedMessage id="privacypolicy" defaultMessage="privacy policy" />
                              </StyledLink>
                            ),
                          }}
                        />
                      }
                      required
                      onChange={({ checked }) => {
                        setState({ ...state, tos: checked });
                      }}
                    />
                  </Box>
                  <Box mt={3}>
                    <StyledCheckbox
                      name="newsletterOptIn"
                      label={
                        <span>
                          <FormattedMessage defaultMessage="Subscribe to our monthly newsletter" id="cNkrNr" />.
                        </span>
                      }
                      required
                      onChange={({ checked }) => {
                        setState(state => ({ ...state, newsletterOptIn: checked }));
                      }}
                    />
                  </Box>
                </Fragment>
              )}
              {!isDraft && <ExpenseNotesForm onChange={onNotesChanges} defaultValue={expense.privateMessage} />}
              {hasItemsWithOCR && (
                <ConfirmOCRValues
                  onConfirm={setConfirmedOCR}
                  items={state.editedExpense.items}
                  currency={state.editedExpense.currency}
                />
              )}
              {isRecurring && <ExpenseRecurringBanner expense={expense} />}
              {drawerActionsContainer ? (
                createPortal(confirmSaveButtons, drawerActionsContainer)
              ) : (
                <Flex flexWrap="wrap" mt="4">
                  {confirmSaveButtons}
                </Flex>
              )}
            </Box>
          )}
        </Box>
      )}
      {status === PAGE_STATUS.EDIT && (
        <Box mb={3}>
          {loading || loadingLoggedInUser ? (
            <LoadingPlaceholder width="100%" height={400} />
          ) : (
            <ExpenseForm
              collective={collective}
              host={host}
              loading={isRefetchingDataForUser}
              expense={editedExpense || expense}
              originalExpense={expense}
              payoutProfiles={payoutProfiles}
              loggedInAccount={loggedInAccount}
              onCancel={() => setState(state => ({ ...state, status: PAGE_STATUS.VIEW, editedExpense: null }))}
              canEditPayoutMethod={canEditPayoutMethod}
              onSubmit={editedExpense => {
                if (skipSummary) {
                  setState(state => ({
                    ...state,
                    editedExpense,
                  }));
                  onSummarySubmit(editedExpense);
                } else {
                  setState(state => ({
                    ...state,
                    editedExpense,
                    status: PAGE_STATUS.EDIT_SUMMARY,
                  }));
                }
              }}
              validateOnChange
              drawerActionsContainer={drawerActionsContainer}
            />
          )}
        </Box>
      )}
      {!(isEditing && inDrawer) && (
        <Fragment>
          <Box my={4}>
            <PrivateCommentsMessage
              isAllowed={expense?.permissions.canComment}
              isLoading={loadingLoggedInUser || isRefetchingDataForUser}
            />
          </Box>

          {!inDrawer ? (
            <React.Fragment>
              <Box mb={3} pt={3}>
                {loading ? (
                  <LoadingPlaceholder width="100%" height="44px" />
                ) : expense ? (
                  <Thread
                    collective={collective}
                    hasMore={expense.comments?.totalCount > threadItems.length}
                    items={threadItems}
                    fetchMore={fetchMoreComments}
                    onCommentDeleted={onCommentDeleted}
                    loading={loading}
                    getClickedComment={setReplyingToComment}
                  />
                ) : null}
              </Box>

              {expense?.permissions.canComment && (
                <Flex mt="40px">
                  <Box display={['none', null, 'block']} flex="0 0" p={3}>
                    <CommentIcon size={24} color="lightgrey" />
                  </Box>
                  <Box flex="1 1" maxWidth={[null, null, 'calc(100% - 56px)']}>
                    <CommentForm
                      replyingToComment={replyingToComment}
                      id="new-comment-on-expense"
                      ExpenseId={expense && expense.id}
                      disabled={!expense}
                      onSuccess={onCommentAdded}
                      canUsePrivateNote={expense.permissions.canUsePrivateNote}
                      defaultType={expense.onHold ? CommentType.PRIVATE_NOTE : CommentType.COMMENT}
                    />
                  </Box>
                </Flex>
              )}
            </React.Fragment>
          ) : (
            <Thread
              variant="small"
              items={threadItems}
              collective={host}
              hasMore={expense?.comments?.totalCount > threadItems.length}
              fetchMore={fetchMoreComments}
              onCommentDeleted={onCommentDeleted}
              loading={loading}
              CommentEntity={{
                ExpenseId: expense && expense.id,
              }}
              onCommentCreated={onCommentAdded}
              canComment={expense?.permissions.canComment}
              canUsePrivateNote={expense?.permissions?.canUsePrivateNote}
              defaultType={expense?.onHold ? CommentType.PRIVATE_NOTE : CommentType.COMMENT}
            />
          )}
        </Fragment>
      )}

      {isSubmissionFlowOpen && (
        <SubmitExpenseFlow
          onClose={submitted => {
            setIsSubmissionFlowOpen(false);
            if (submitted) {
              refetch();
            }
          }}
          expenseId={legacyExpenseId}
          draftKey={draftKey}
          submitExpenseTo={collective?.slug}
          endFlowButtonLabel={<FormattedMessage defaultMessage="View expense" id="CaE5Oi" />}
        />
      )}

      {state.showFilesViewerModal &&
        createPortal(
          <FilesViewerModal
            allowOutsideInteraction={isDrawer}
            files={files}
            parentTitle={intl.formatMessage(
              {
                defaultMessage: 'Expense #{expenseId} attachment',
                id: 'At2m8o',
              },
              { expenseId: expense.legacyId },
            )}
            openFileUrl={openUrl}
            onClose={
              isDrawer && isDesktop ? onClose : () => setState(state => ({ ...state, showFilesViewerModal: false }))
            }
            hideCloseButton={isDrawer && isDesktop}
          />,
          document.body,
        )}
    </Box>
  );
}

Expense.propTypes = {
  collectiveSlug: PropTypes.string,
  parentCollectiveSlug: PropTypes.string,
  legacyExpenseId: PropTypes.number,
  draftKey: PropTypes.string,
  edit: PropTypes.string,
  client: PropTypes.object,
  data: PropTypes.object,
  loading: PropTypes.bool,
  error: PropTypes.any,
  refetch: PropTypes.func,
  fetchMore: PropTypes.func,
  startPolling: PropTypes.func,
  stopPolling: PropTypes.func,
  onClose: PropTypes.func,
  isRefetchingDataForUser: PropTypes.bool,
  drawerActionsContainer: PropTypes.object,
  isDrawer: PropTypes.bool,
  enableKeyboardShortcuts: PropTypes.bool,
};

export default Expense;
