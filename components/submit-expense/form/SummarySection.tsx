/* eslint-disable prefer-arrow-callback */
import React from 'react';
import { FastField } from 'formik';
import { omit, pick, round } from 'lodash';
import { AtSign, Building, Contact, Globe, Lock, Mail } from 'lucide-react';
import { FormattedDate, FormattedMessage, useIntl } from 'react-intl';

import { CollectiveType } from '../../../lib/constants/collectives';
import { ExpenseType } from '../../../lib/graphql/types/v2/schema';
import { RecurringExpenseIntervals } from '../../../lib/i18n/expense';
import { i18nTaxType } from '../../../lib/i18n/taxes';
import { getExpenseExchangeRateWarningOrError, getTaxAmount, isTaxRateValid } from '../../expenses/lib/utils';
import { ExpenseStatus } from '@/lib/graphql/types/v2/graphql';

import { AccountHoverCard } from '../../AccountHoverCard';
import AmountWithExchangeRateInfo from '../../AmountWithExchangeRateInfo';
import Avatar from '../../Avatar';
import { AvatarWithLink } from '../../AvatarWithLink';
import DateTime from '../../DateTime';
import ExpenseTypeTag from '../../expenses/ExpenseTypeTag';
import FormattedMoneyAmount from '../../FormattedMoneyAmount';
import LinkCollective from '../../LinkCollective';
import LoadingPlaceholder from '../../LoadingPlaceholder';
import MessageBox from '../../MessageBox';
import { PayoutMethodLabel } from '../../PayoutMethodLabel';
import { Button } from '../../ui/Button';
import { Input } from '../../ui/Input';
import { Label } from '../../ui/Label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/Select';
import UploadedFilePreview from '../../UploadedFilePreview';
import { PayoutMethodDetailsContainer } from '../PayoutMethodDetails';
import { Step } from '../SubmitExpenseFlowSteps';
import { type ExpenseForm, RecurrenceFrequencyOption, YesNoOption } from '../useExpenseForm';

import { FormSectionContainer } from './FormSectionContainer';

type SummarySectionProps = {
  form: ExpenseForm;
  inViewChange: (inView: boolean, entry: IntersectionObserverEntry) => void;
};
export function SummarySection(props: SummarySectionProps) {
  return (
    <FormSectionContainer step={Step.SUMMARY} inViewChange={props.inViewChange}>
      <div className="rounded-md border border-gray-300 p-4 text-sm">
        <SummaryHeader
          recurrenceFrequency={props.form.values.recurrenceFrequency}
          expenseTypeOption={props.form.values.expenseTypeOption}
          tags={props.form.values.tags}
          submitter={props.form.options.submitter}
        />
      </div>
      <div className="mt-4 rounded-md border border-gray-300 p-4 text-sm">
        <ExpenseItemsSection
          hasTax={props.form.values.hasTax}
          tax={props.form.values.tax}
          expenseItems={props.form.values.expenseItems}
          expenseCurrency={props.form.options.expenseCurrency}
          totalInvoicedInExpenseCurrency={props.form.options.totalInvoicedInExpenseCurrency}
          taxType={props.form.options.taxType}
        />
      </div>
      {props.form.values.additionalAttachments?.length > 0 && (
        <div className="mt-4 rounded-md border border-gray-300 p-4 text-sm">
          <AdditionalAttachmentsSection additionalAttachments={props.form.values.additionalAttachments} />
        </div>
      )}
      {props.form.values.expenseTypeOption === ExpenseType.INVOICE && (
        <div className="mt-4 rounded-md border border-gray-300 p-4 text-sm">
          <InvoiceSection
            hasInvoiceOption={props.form.values.hasInvoiceOption}
            invoiceNumber={props.form.values.invoiceNumber}
            invoiceFile={props.form.values.invoiceFile}
          />
        </div>
      )}
      <div className="mt-4 grid grid-cols-2 gap-4">
        <div className="col-span-2 grow basis-0 rounded-md border border-gray-300 p-4 text-sm sm:col-span-1 sm:min-h-32">
          <WhoIsPayingSummarySection account={props.form.options.account} />
        </div>
        <div className="col-span-2 grow basis-0 rounded-md border border-gray-300 p-4 text-sm sm:col-span-1 sm:min-h-32">
          <WhoIsGettingPaidSummarySection payee={props.form.options.payee} invitee={props.form.options.invitee} />
        </div>
        <div className="col-span-2 h-fit grow basis-0 rounded-md border border-gray-300 p-4 text-sm">
          <PayoutMethodSummarySection
            isAdminOfPayee={props.form.options.isAdminOfPayee}
            payee={props.form.options.payee}
            payoutMethod={props.form.options.payoutMethod}
            expense={props.form.options.expense}
            loggedInAccount={props.form.options.loggedInAccount}
          />
        </div>
      </div>
      <RecurrenceOptionBox form={props.form} />
    </FormSectionContainer>
  );
}

const SummaryHeader = React.memo(function SummaryHeader(props: {
  recurrenceFrequency: ExpenseForm['values']['recurrenceFrequency'];
  expenseTypeOption: ExpenseForm['values']['expenseTypeOption'];
  tags: ExpenseForm['values']['tags'];
  submitter: ExpenseForm['options']['submitter'];
}) {
  return (
    <React.Fragment>
      <div className="mb-4 flex justify-between">
        <div className="text-base font-bold">
          <FastField name="title">
            {({ field }) => {
              return (
                field.value || (
                  <span className="text-muted-foreground">
                    <FormattedMessage defaultMessage="Expense title" id="yH3Z6O" />
                  </span>
                )
              );
            }}
          </FastField>
        </div>
        {props.recurrenceFrequency && props.recurrenceFrequency !== 'none' && (
          <span className="rounded-xl bg-slate-100 px-3 py-1 font-mono text-xs text-muted-foreground uppercase">
            <FormattedMessage defaultMessage="Recurring" id="v84fNv" />
          </span>
        )}
      </div>
      <div>
        {props.expenseTypeOption ? (
          <ExpenseTypeTag type={props.expenseTypeOption} mb={0} mr={0} />
        ) : (
          <span className="text-muted-foreground">
            <FormattedMessage defaultMessage="Expense Type" id="wbd643" />
          </span>
        )}
        {props.tags?.length > 0 &&
          props.tags.map(tag => (
            <span
              key={tag}
              className="rounded-xl rounded-ss-none rounded-es-none bg-slate-100 px-3 py-1 text-xs text-slate-800"
            >
              {tag}
            </span>
          ))}
      </div>
      <div className="mt-2 flex gap-2 text-xs">
        <div>
          <FormattedMessage
            id="Expense.SubmittedBy"
            defaultMessage="Submitted by {name}"
            values={{
              name: (
                <AccountHoverCard
                  account={props.submitter}
                  trigger={
                    <span>
                      <LinkCollective collective={props.submitter} noTitle>
                        <span className="font-medium text-foreground underline hover:text-primary">
                          {props.submitter ? (
                            props.submitter.name
                          ) : (
                            <FormattedMessage id="profile.incognito" defaultMessage="Incognito" />
                          )}
                        </span>
                      </LinkCollective>
                    </span>
                  }
                />
              ),
            }}
          />
        </div>
        <div className="text-slate-700">•</div>
        <div>
          <DateTime value={new Date()} dateStyle="medium" />
        </div>
      </div>
    </React.Fragment>
  );
});

const ExpenseItemsSection = React.memo(function ExpenseItemSection(
  props: Required<
    Pick<ExpenseForm['values'], 'hasTax' | 'tax' | 'expenseItems'> &
      Pick<ExpenseForm['options'], 'expenseCurrency' | 'totalInvoicedInExpenseCurrency' | 'taxType'>
  >,
) {
  const intl = useIntl();

  return (
    <React.Fragment>
      <Label className="mb-4 font-bold">
        <FormattedMessage defaultMessage="Items" id="yNmV/R" />
      </Label>
      <div role="list">
        {props.expenseItems.map(ei => (
          <div
            role="listitem"
            key={`${ei.description}-${ei.incurredAt}-${ei.amount?.valueInCents}`}
            className="mb-2 border-b border-dotted border-gray-300 pb-2 text-sm last:mb-0 last:border-b-0"
          >
            <div className="flex items-center justify-between gap-4">
              {ei.attachment && (
                <div>
                  <UploadedFilePreview
                    size={64}
                    url={typeof ei.attachment === 'string' ? ei.attachment : ei.attachment.url}
                    border="none"
                  />
                </div>
              )}
              <div className="grow">
                <div>
                  {ei.description || (
                    <span className="text-muted-foreground">
                      <FormattedMessage defaultMessage="Item description" id="1TNkWq" />
                    </span>
                  )}
                </div>
                <div className="text-xs">{ei.incurredAt && <DateTime value={ei.incurredAt} dateStyle="medium" />}</div>
              </div>
              <div className="text-right">
                <FormattedMoneyAmount
                  amount={
                    props.expenseCurrency !== ei.amount?.currency
                      ? ei.amount?.exchangeRate?.value
                        ? Math.round(ei.amount?.valueInCents * ei.amount?.exchangeRate.value)
                        : null
                      : ei.amount?.valueInCents
                  }
                  currency={props.expenseCurrency}
                  showCurrencyCode
                  amountClassName="font-bold"
                />
                {props.expenseCurrency !== ei.amount.currency && (
                  <div className="mt-1 text-xs">
                    <AmountWithExchangeRateInfo
                      amount={ei.amount as React.ComponentProps<typeof AmountWithExchangeRateInfo>['amount']}
                      invertIconPosition
                      {...getExpenseExchangeRateWarningOrError(
                        intl,
                        ei.amount.exchangeRate,
                        ei.amount.referenceExchangeRate,
                      )}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-end">
        <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-right">
          <SummaryItemsTotal
            {...pick(props, ['hasTax', 'tax', 'expenseCurrency', 'totalInvoicedInExpenseCurrency', 'taxType'])}
          />
        </div>
      </div>
    </React.Fragment>
  );
});

const AdditionalAttachmentsSection = React.memo(function AdditionalAttachmentsSection(props: {
  additionalAttachments: ExpenseForm['values']['additionalAttachments'];
}) {
  return (
    <React.Fragment>
      <Label className="mb-4 font-bold">
        <FormattedMessage defaultMessage="Attachments" id="Expense.Attachments" />
      </Label>
      <div className="flex flex-wrap gap-4">
        {props.additionalAttachments.map(at => (
          <div key={typeof at === 'string' ? at : at.id}>
            <UploadedFilePreview
              size={60}
              url={typeof at === 'string' ? at : at.url}
              border="none"
              showFileName={typeof at === 'string' ? false : at?.name}
              fileName={typeof at === 'string' ? null : at?.name}
              fileSize={typeof at === 'string' ? null : at?.size}
            />
          </div>
        ))}
      </div>
    </React.Fragment>
  );
});

const InvoiceSection = React.memo(function InvoiceSection(props: {
  hasInvoiceOption: ExpenseForm['values']['hasInvoiceOption'];
  invoiceNumber: ExpenseForm['values']['invoiceNumber'];
  invoiceFile: ExpenseForm['values']['invoiceFile'];
}) {
  return (
    <React.Fragment>
      <Label className="mb-4 font-bold">
        <FormattedMessage defaultMessage="Invoice" id="Expense.Type.Invoice" />
      </Label>
      {props.hasInvoiceOption === YesNoOption.NO ? (
        <div>
          <MessageBox type="info">
            <FormattedMessage defaultMessage="Invoice will be generated once you submit the expense." id="aWQ0X7" />
          </MessageBox>
        </div>
      ) : (
        <div>
          <div className="mb-2">
            {props.invoiceNumber || (
              <span className="text-muted-foreground">
                <FormattedMessage defaultMessage="Invoice reference number" id="o6znkL" />
              </span>
            )}
          </div>
          <UploadedFilePreview
            size={60}
            url={typeof props.invoiceFile === 'string' ? props.invoiceFile : props.invoiceFile?.url}
          />
        </div>
      )}
    </React.Fragment>
  );
});

const SummaryItemsTotal = React.memo(function SummaryItemsTotal(
  props: Required<
    Pick<ExpenseForm['values'], 'hasTax' | 'tax'> &
      Pick<ExpenseForm['options'], 'expenseCurrency' | 'totalInvoicedInExpenseCurrency' | 'taxType'>
  >,
) {
  const intl = useIntl();
  return (
    <React.Fragment>
      {props.hasTax && props.tax && (
        <React.Fragment>
          <div>
            <FormattedMessage defaultMessage="Subtotal:" id="WWhVAU" />
          </div>
          <div>
            <FormattedMoneyAmount
              amount={props.totalInvoicedInExpenseCurrency}
              precision={2}
              currency={props.expenseCurrency}
              showCurrencyCode
            />
          </div>
        </React.Fragment>
      )}
      {props.hasTax && props.tax && (
        <React.Fragment>
          <span className="captilize">
            {i18nTaxType(intl, props.taxType, 'short')}
            {isTaxRateValid(props.tax.rate) && ` (${round(props.tax.rate * 100, 2)}%)`}:
          </span>
          <div>
            <FormattedMoneyAmount
              amount={
                !isTaxRateValid(props.tax.rate) ? null : getTaxAmount(props.totalInvoicedInExpenseCurrency, props.tax)
              }
              precision={2}
              currency={props.expenseCurrency}
              showCurrencyCode
            />
          </div>
        </React.Fragment>
      )}

      <div className="col-span-2 text-right">
        <FormattedMoneyAmount
          amount={
            props.hasTax && props.tax && isTaxRateValid(props.tax.rate)
              ? getTaxAmount(props.totalInvoicedInExpenseCurrency, props.tax) + props.totalInvoicedInExpenseCurrency
              : props.totalInvoicedInExpenseCurrency
          }
          precision={2}
          currency={props.expenseCurrency}
          showCurrencyCode
          amountClassName="font-bold"
        />
      </div>
    </React.Fragment>
  );
});

const WhoIsPayingSummarySection = React.memo(function WhoIsPayingSummarySection(props: {
  account: ExpenseForm['options']['account'];
}) {
  return (
    <React.Fragment>
      <div className="font-bold">
        <FormattedMessage defaultMessage="Who is paying?" id="IdR7BG" />
      </div>
      {props.account && (
        <React.Fragment>
          <div className="mt-2">
            <AccountHoverCard
              account={omit(props.account, 'stats')}
              trigger={
                <div className="flex items-center gap-2 truncate font-bold">
                  <AvatarWithLink size={20} account={props.account} />
                  {props.account?.name}
                </div>
              }
            />
          </div>
          <div className="mt-4">
            <div className="font-bold">
              <FormattedMessage defaultMessage="Collective balance:" id="cJFNHQ" />
            </div>
            <div className="mt-2">
              <FormattedMoneyAmount
                amount={props.account.stats.balance.valueInCents}
                currency={props.account.stats.balance.currency}
              />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center -space-x-1">
              {props.account?.admins?.nodes &&
                props.account.admins.nodes.slice(0, 3).map(admin => (
                  <AccountHoverCard
                    key={admin.id}
                    account={admin.account}
                    trigger={
                      <span>
                        <Avatar collective={admin.account} radius={24} />
                      </span>
                    }
                  />
                ))}
              {props.account?.admins?.totalCount > 3 && (
                <div className="pl-2 text-slate-600">+{props.account?.admins.totalCount - 3}</div>
              )}
            </div>
          </div>
        </React.Fragment>
      )}
    </React.Fragment>
  );
});

const WhoIsGettingPaidSummarySection = React.memo(function WhoIsGettingPaidSummarySection(props: {
  payee: ExpenseForm['options']['payee'];
  invitee: ExpenseForm['options']['invitee'];
}) {
  return (
    <React.Fragment>
      <div className="font-bold">
        <FormattedMessage defaultMessage="Who is getting paid?" id="W5Z+Fm" />
      </div>
      {props.payee ? (
        <React.Fragment>
          <div className="mt-2">
            <AccountHoverCard
              account={props.payee}
              trigger={
                <div className="flex items-center gap-2 truncate font-bold">
                  <AvatarWithLink size={20} account={props.payee} />
                  {props.payee.name}
                </div>
              }
            />
          </div>
          {props.payee.location && (
            <React.Fragment>
              <div className="mt-4 flex items-center gap-2 font-bold">
                <FormattedMessage defaultMessage="Private address" id="RmME7+" /> <Lock size={14} />
              </div>
              <div className="mt-2">{props.payee.location.address}</div>
              <div>{props.payee.location.country}</div>
            </React.Fragment>
          )}
        </React.Fragment>
      ) : (
        props.invitee && (
          <React.Fragment>
            <div className="mt-2 flex items-center gap-2 font-bold">
              <Contact size={14} /> {props.invitee.name || <LoadingPlaceholder height={14} width={1} />}
            </div>
            <div className="mt-2 flex items-center gap-2">
              <Mail size={14} /> {props.invitee.email || <LoadingPlaceholder height={14} width={1} />}
            </div>
            {'name' in props.invitee && props.invitee.name && (
              <div className="mt-2 flex items-center gap-2">
                <Building size={14} /> {props.invitee.name}
              </div>
            )}
            {'organization' in props.invitee && props.invitee.organization.slug && (
              <div className="mt-2 flex items-center gap-2">
                <AtSign size={14} /> {props.invitee.organization.slug}
              </div>
            )}
            {'organization' in props.invitee && props.invitee.organization.website && (
              <div className="mt-2 flex items-center gap-2">
                <Globe size={14} /> {props.invitee.organization.website}
              </div>
            )}
          </React.Fragment>
        )
      )}
    </React.Fragment>
  );
});

const PayoutMethodSummarySection = React.memo(function PayoutMethodSummarySection(props: {
  isAdminOfPayee: ExpenseForm['options']['isAdminOfPayee'];
  payee: ExpenseForm['options']['payee'];
  payoutMethod: ExpenseForm['options']['payoutMethod'];
  loggedInAccount: ExpenseForm['options']['loggedInAccount'];
  expense: ExpenseForm['options']['expense'];
}) {
  return (
    <React.Fragment>
      <div className="font-bold">
        <FormattedMessage defaultMessage="Payout Method" id="SecurityScope.PayoutMethod" />
      </div>
      {!props.isAdminOfPayee &&
      !(props.expense?.status === ExpenseStatus.DRAFT && !props.loggedInAccount) &&
      props.payee?.type !== CollectiveType.VENDOR ? (
        <React.Fragment>
          <div className="mt-2 text-sm text-muted-foreground">
            <FormattedMessage
              defaultMessage="The person you are inviting to submit this expense will be asked to provide payout method details."
              id="LHdznY"
            />
          </div>
        </React.Fragment>
      ) : (
        (props.payee || !props.loggedInAccount) &&
        props.payoutMethod?.type && (
          <div className="mt-2 space-y-2">
            <PayoutMethodLabel showIcon payoutMethod={props.payoutMethod} />

            <PayoutMethodDetailsContainer payoutMethod={props.payoutMethod} maxItems={3} />
          </div>
        )
      )}
    </React.Fragment>
  );
});

function RecurrenceOptionBox(props: { form: ExpenseForm }) {
  const intl = useIntl();
  const [isEditingRecurrence, setIsEdittingRecurrence] = React.useState(false);
  const [recurrenceFrequencyEdit, setRecurrenceFrequencyEdit] = React.useState(props.form.values.recurrenceFrequency);
  const [recurrenceEndAtEdit, setRecurrenceEndAtEdit] = React.useState(props.form.values.recurrenceEndAt);

  const recurrenceFrequency = isEditingRecurrence ? recurrenceFrequencyEdit : props.form.values.recurrenceFrequency;
  const recurrenceEndAt = isEditingRecurrence ? recurrenceEndAtEdit : props.form.values.recurrenceEndAt;

  return (
    <div className="mt-4">
      <MessageBox type="info">
        <div className="mb-4 font-bold">
          <FormattedMessage defaultMessage="Expense Recurrence" id="JnFWfB" />
        </div>
        {!recurrenceFrequency ||
          (recurrenceFrequency === 'none' && (
            <div>
              <FormattedMessage
                defaultMessage="This expense will be submitted as a one-time expense. To make this a recurring expense, please specify the frequency."
                id="4j+TF1"
              />
            </div>
          ))}

        {recurrenceFrequency && recurrenceFrequency !== 'none' && (
          <div>
            <span>
              <FormattedMessage
                defaultMessage="Once submitted, you will also be prompted to review and submit a copy of this expense every {recurrenceFrequency, select, week {week} month {month} quarter {quarter} year {year} other {}}."
                id="I3xpNh"
                values={{
                  recurrenceFrequency: recurrenceFrequency,
                }}
              />
            </span>
            {recurrenceEndAt && (
              <span>
                &nbsp;
                <FormattedMessage
                  defaultMessage="The prompts will stop on {date}."
                  id="LiFjWf"
                  values={{
                    date: <FormattedDate dateStyle="medium" value={recurrenceEndAt} />,
                  }}
                />
              </span>
            )}
          </div>
        )}
        {!isEditingRecurrence && (
          <Button
            disabled={props.form.initialLoading || props.form.isSubmitting}
            onClick={() => setIsEdittingRecurrence(true)}
            className="mt-2 p-0 text-sm"
            size="xs"
            variant="link"
          >
            <FormattedMessage defaultMessage="Edit recurrence frequency" id="E997St" />
          </Button>
        )}

        {isEditingRecurrence && (
          <div>
            <div className="my-4 border-t border-dotted border-gray-400" />
            <Label className="mb-2 block">
              <FormattedMessage defaultMessage="Frequency" id="Frequency" />
            </Label>
            <Select
              value={recurrenceFrequency}
              disabled={props.form.initialLoading || props.form.isSubmitting}
              onValueChange={newValue => setRecurrenceFrequencyEdit(newValue as RecurrenceFrequencyOption)}
            >
              <SelectTrigger data-cy="expense-frequency">
                <div className="flex items-center gap-2 overflow-hidden">
                  <span className="truncate">
                    <SelectValue placeholder={intl.formatMessage({ defaultMessage: 'Select one', id: 'aJxdzZ' })} />
                  </span>
                </div>
              </SelectTrigger>

              <SelectContent className="relative max-h-80 max-w-full">
                <SelectItem value={RecurrenceFrequencyOption.NONE}>
                  <FormattedMessage defaultMessage="None" id="450Fty" />
                </SelectItem>
                <SelectItem data-cy="expense-frequency-option" value={RecurrenceFrequencyOption.WEEK}>
                  {RecurringExpenseIntervals.week}
                </SelectItem>
                <SelectItem data-cy="expense-frequency-option" value={RecurrenceFrequencyOption.MONTH}>
                  {RecurringExpenseIntervals.month}
                </SelectItem>
                <SelectItem data-cy="expense-frequency-option" value={RecurrenceFrequencyOption.QUARTER}>
                  {RecurringExpenseIntervals.quarter}
                </SelectItem>
                <SelectItem data-cy="expense-frequency-option" value={RecurrenceFrequencyOption.YEAR}>
                  {RecurringExpenseIntervals.year}
                </SelectItem>
              </SelectContent>
            </Select>

            {recurrenceFrequency && recurrenceFrequency !== 'none' && (
              <React.Fragment>
                <Label htmlFor="expenseRecurrenceEndAt" className="mt-4 mb-2 block">
                  <FormattedMessage defaultMessage="End Date" id="EndDate" />
                </Label>
                <Input
                  id="expenseRecurrenceEndAt"
                  disabled={props.form.initialLoading || props.form.isSubmitting}
                  type="date"
                  value={recurrenceEndAt}
                  onChange={e => setRecurrenceEndAtEdit(e.target.value)}
                />
              </React.Fragment>
            )}

            <div className="mt-4 flex gap-2">
              <Button
                disabled={props.form.initialLoading || props.form.isSubmitting}
                onClick={() => {
                  props.form.setFieldValue('recurrenceEndAt', recurrenceEndAtEdit);
                  props.form.setFieldValue('recurrenceFrequency', recurrenceFrequencyEdit);
                  setIsEdittingRecurrence(false);
                }}
                variant="outline"
              >
                <FormattedMessage defaultMessage="Save changes" id="X0ha1a" />
              </Button>
              <Button
                disabled={props.form.initialLoading || props.form.isSubmitting}
                onClick={() => {
                  setRecurrenceEndAtEdit(props.form.values.recurrenceEndAt);
                  setRecurrenceFrequencyEdit(props.form.values.recurrenceFrequency);
                  setIsEdittingRecurrence(false);
                }}
                variant="outline"
              >
                <FormattedMessage defaultMessage="Cancel" id="actions.cancel" />
              </Button>
            </div>
          </div>
        )}
      </MessageBox>
    </div>
  );
}
