import React from 'react';
import { gql, useApolloClient, useMutation } from '@apollo/client';
import { Form, Formik } from 'formik';
import { omit } from 'lodash';
import { AlertTriangle } from 'lucide-react';
import { useRouter } from 'next/router';
import { FormattedMessage, useIntl } from 'react-intl';

import { i18nGraphqlException } from '../../../../lib/errors';
import { API_V2_CONTEXT } from '../../../../lib/graphql/helpers';
import type { TransactionsImport } from '../../../../lib/graphql/types/v2/schema';
import type { PlaidDialogStatus } from '../../../../lib/hooks/usePlaidConnectDialog';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '../../../ui/AlertDialog';
import { Button } from '../../../ui/Button';
import { Card, CardContent } from '../../../ui/Card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../../ui/Dialog';
import { Input } from '../../../ui/Input';
import { Label } from '../../../ui/Label';
import { Separator } from '../../../ui/Separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../ui/Tabs';
import { useToast } from '../../../ui/useToast';

const deleteTransactionsImportMutation = gql`
  mutation DeleteTransactionsImport($id: NonEmptyString!) {
    deleteTransactionsImport(id: $id)
  }
`;

const editTransactionsImportMutation = gql`
  mutation EditTransactionsImport($id: NonEmptyString!, $source: NonEmptyString, $name: NonEmptyString) {
    editTransactionsImport(id: $id, source: $source, name: $name) {
      id
      source
      name
    }
  }
`;

const deleteConnectedAccountMutation = gql`
  mutation DeleteConnectedAccount($connectedAccount: ConnectedAccountReferenceInput!) {
    deleteConnectedAccount(connectedAccount: $connectedAccount) {
      id
    }
  }
`;

export default function TransactionsImportSettingsModal({
  transactionsImport,
  plaidStatus,
  onOpenChange,
  onReconnectClick,
  isOpen,
}: {
  onOpenChange: (isOpen: boolean) => void;
  isOpen: boolean;
  onReconnectClick: () => void;
  plaidStatus: PlaidDialogStatus;
  transactionsImport: Pick<TransactionsImport, 'id' | 'source' | 'name' | 'type'> & {
    connectedAccount?: Pick<TransactionsImport['connectedAccount'], 'id'>;
  };
}) {
  const router = useRouter();
  const { toast } = useToast();
  const intl = useIntl();
  const mutationParams = { context: API_V2_CONTEXT };
  const apolloClient = useApolloClient();
  const [editTransactionsImport] = useMutation(editTransactionsImportMutation, mutationParams);
  const [deleteConnectedAccount, { loading: isDisconnecting }] = useMutation(
    deleteConnectedAccountMutation,
    mutationParams,
  );
  const [deleteTransactionsImport, { loading: isDeleting }] = useMutation(
    deleteTransactionsImportMutation,
    mutationParams,
  );

  const handleDisconnect = async () => {
    try {
      await deleteConnectedAccount({
        variables: { connectedAccount: { id: transactionsImport.connectedAccount.id } },
      });
      apolloClient.cache.modify({
        id: apolloClient.cache.identify(transactionsImport),
        fields: { connectedAccount: () => null },
      });
      onOpenChange(false);
      toast({
        variant: 'success',
        message: intl.formatMessage({ defaultMessage: 'Bank account disconnected.', id: 'BankAccount.Disconnected' }),
      });
    } catch (error) {
      toast({ variant: 'error', message: i18nGraphqlException(intl, error) });
    }
  };

  const handleDelete = async () => {
    try {
      await deleteTransactionsImport({ variables: { id: transactionsImport.id } });
      apolloClient.cache.evict({ id: apolloClient.cache.identify(transactionsImport) });
      router.push(router.asPath.replace(/\/host-transactions\/import\/.*/, '/host-transactions/import'));
    } catch (error) {
      toast({ variant: 'error', message: i18nGraphqlException(intl, error) });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            <FormattedMessage defaultMessage="Transaction Import Settings" id="38fPNE" />
          </DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="general" className="w-full">
          <TabsList className="mb-3 grid w-full grid-cols-2">
            <TabsTrigger value="general">
              <FormattedMessage id="settings.general" defaultMessage="General" />
            </TabsTrigger>
            <TabsTrigger value="advanced">
              <FormattedMessage id="editCollective.menu.advanced" defaultMessage="Advanced" />
            </TabsTrigger>
          </TabsList>
          <TabsContent value="general" className="px-1">
            <Formik
              initialValues={transactionsImport}
              onSubmit={async values => {
                try {
                  await editTransactionsImport({ variables: { ...omit(values, ['__typename']) } });
                  onOpenChange(false);
                  toast({
                    variant: 'success',
                    message: intl.formatMessage({ defaultMessage: 'Settings updated.', id: 'Settings.Updated' }),
                  });
                } catch (error) {
                  toast({ variant: 'error', message: i18nGraphqlException(intl, error) });
                }
              }}
            >
              {({ values, setFieldValue, dirty, isSubmitting }) => (
                <Form>
                  <div className="space-y-1">
                    <Label htmlFor="sourceName" className="text-sm font-medium">
                      <FormattedMessage defaultMessage="Source name" id="5NOdsW" />
                    </Label>
                    <Input
                      id="sourceName"
                      value={values.source}
                      onChange={e => setFieldValue('source', e.target.value)}
                      maxLength={255}
                      required
                    />
                  </div>
                  <div className="mt-4 space-y-1">
                    <Label htmlFor="importName" className="text-sm font-medium">
                      <FormattedMessage defaultMessage="Import name" id="Me1N3w" />
                    </Label>
                    <Input
                      id="importName"
                      value={values.name}
                      onChange={e => setFieldValue('name', e.target.value)}
                      maxLength={255}
                      required
                    />
                  </div>
                  <div className="mt-6 flex justify-between space-x-2">
                    <Button
                      disabled={isSubmitting}
                      type="reset"
                      variant="outline"
                      className="flex-1"
                      onClick={() => onOpenChange(false)}
                    >
                      <FormattedMessage defaultMessage="Cancel" id="actions.cancel" />
                    </Button>
                    <Button loading={isSubmitting} type="submit" className="flex-1" disabled={!dirty}>
                      <FormattedMessage id="SaveChanges" defaultMessage="Save Changes" />
                    </Button>
                  </div>
                </Form>
              )}
            </Formik>
          </TabsContent>
          <TabsContent value="advanced">
            <Card>
              <CardContent className="space-y-6 pt-6">
                {transactionsImport.connectedAccount && (
                  <React.Fragment>
                    <div>
                      <h3 className="mb-2 text-sm font-medium">
                        <FormattedMessage defaultMessage="Disconnect Bank Account" id="iEOcw+" />
                      </h3>
                      <p className="mb-4 text-sm text-muted-foreground">
                        <FormattedMessage
                          defaultMessage="Stops future imports. Existing data will remain intact."
                          id="RYIqod"
                        />
                      </p>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" className="w-full" loading={isDisconnecting} disabled={isDeleting}>
                            <FormattedMessage defaultMessage="Disconnect Bank Account" id="iEOcw+" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              <FormattedMessage defaultMessage="Disconnect Bank Account" id="iEOcw+" />
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              <FormattedMessage
                                defaultMessage="You'll need to reconnect to continue importing transactions."
                                id="FKMNjH"
                              />
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>
                              <FormattedMessage defaultMessage="Cancel" id="actions.cancel" />
                            </AlertDialogCancel>
                            <AlertDialogAction onClick={handleDisconnect}>
                              <FormattedMessage
                                defaultMessage="Disconnect"
                                id="collective.connectedAccounts.disconnect.button"
                              />
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                    <Separator />
                  </React.Fragment>
                )}
                {!transactionsImport.connectedAccount && transactionsImport.type === 'PLAID' && (
                  <React.Fragment>
                    <div>
                      <h3 className="mb-2 text-sm font-medium">
                        <FormattedMessage defaultMessage="Reconnect Bank Account" id="BankAccount.Reconnect" />
                      </h3>
                      <p className="mb-4 text-sm text-muted-foreground">
                        <FormattedMessage
                          defaultMessage="Reconnect your bank account to resume importing transactions."
                          id="BankAccount.Reconnect.Description"
                        />
                      </p>
                      <Button
                        variant="outline"
                        className="w-full"
                        loading={plaidStatus === 'loading' || plaidStatus === 'active'}
                        disabled={plaidStatus === 'disabled' || isDeleting}
                        onClick={onReconnectClick}
                      >
                        <FormattedMessage
                          id="collective.connectedAccounts.reconnect.button"
                          defaultMessage="Reconnect"
                        />
                      </Button>
                    </div>
                    <Separator />
                  </React.Fragment>
                )}
                <div>
                  <h3 className="mb-2 text-sm font-medium">
                    <FormattedMessage defaultMessage="Delete Import" id="naIILe" />
                  </h3>
                  <p className="mb-4 text-sm text-muted-foreground">
                    <FormattedMessage
                      values={{ hasConnectedAccount: transactionsImport.connectedAccount ? 0 : 1 }}
                      defaultMessage="This will permanently delete the import and remove all associated data. {hasConnectedAccount, select, 0 {The bank account will also be disconnected.} other {}}"
                      id="e2Cd5r"
                    />
                  </p>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" className="w-full" loading={isDeleting} disabled={isDisconnecting}>
                        <AlertTriangle className="mr-2 h-4 w-4" />
                        <FormattedMessage defaultMessage="Delete Import" id="naIILe" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          <FormattedMessage defaultMessage="Delete Import" id="naIILe" />
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          <FormattedMessage
                            defaultMessage="This will permanently delete the import and remove all associated data."
                            id="yNLkKo"
                          />
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>
                          <FormattedMessage defaultMessage="Cancel" id="actions.cancel" />
                        </AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete}>
                          <FormattedMessage defaultMessage="Delete" id="actions.delete" />
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
