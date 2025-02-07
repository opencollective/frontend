import React from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { truncate, uniqBy } from 'lodash';
import { useIntl } from 'react-intl';
import styled, { css } from 'styled-components';

import { formatCurrency } from '../../lib/currency-utils';
import { i18nGraphqlException } from '../../lib/errors';
import { API_V2_CONTEXT, gql } from '../../lib/graphql/helpers';
import { stripHTML } from '../../lib/html';

import ConfirmationModal from '../ConfirmationModal';
import DashboardHeader from '../dashboard/DashboardHeader';
import { Box, Flex } from '../Grid';
import LoadingPlaceholder from '../LoadingPlaceholder';
import MessageBoxGraphqlError from '../MessageBoxGraphqlError';
import StyledCollectiveCard from '../search-page/StyledCollectiveCard';
import SearchBar from '../SearchBar';
import StyledButton from '../StyledButton';
import StyledCheckbox from '../StyledCheckbox';
import StyledLink from '../StyledLink';
import { P } from '../Text';
import { Alert, AlertDescription, AlertTitle } from '../ui/Alert';
import { useToast } from '../ui/useToast';

import { banAccountsMutation } from './BanAccounts';
import BanAccountsSummary from './BanAccountsSummary';

const searchQuery = gql`
  query BanAccountSearch($term: String!, $offset: Int) {
    accounts(
      searchTerm: $term
      limit: 30
      offset: $offset
      skipRecentAccounts: false
      includeArchived: true
      orderBy: { field: CREATED_AT, direction: DESC }
      type: [COLLECTIVE, EVENT, FUND, INDIVIDUAL, ORGANIZATION, PROJECT]
    ) {
      nodes {
        id
        isActive
        type
        slug
        name
        isHost
        imageUrl
        backgroundImageUrl
        description
        longDescription
        website
        currency
        location {
          id
          country
        }
        stats {
          id
          totalAmountReceived(useCache: true) {
            currency
            valueInCents
          }
          totalAmountSpent {
            currency
            valueInCents
          }
        }
        ... on Organization {
          host {
            id
            hostFeePercent
            totalHostedCollectives
          }
        }
        ... on AccountWithParent {
          parent {
            id
            slug
            backgroundImageUrl
          }
        }
      }
      limit
      offset
      totalCount
    }
  }
`;

const CardContainer = styled.div`
  border-radius: 16px;
  cursor: crosshair;
  transition:
    box-shadow 0.3s,
    outline 0.3s;
  &:hover {
    box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
  }
  ${props =>
    props.$isSelected &&
    css`
      box-shadow: 0px 0px 5px red;
      outline: 1px solid red;
      &:hover {
        box-shadow: 0px 0px 10px red;
      }
    `}
`;

const AccountsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  grid-gap: 20px;
  margin-top: 20px;
`;

const BanAccountsWithSearch = () => {
  const [searchTerm, setSearchTerm] = React.useState('');
  const { data, loading, error, refetch } = useQuery(searchQuery, {
    variables: { term: searchTerm },
    context: API_V2_CONTEXT,
    skip: !searchTerm,
  });
  const [selectedAccounts, setSelectedAccounts] = React.useState([]);
  const [includeAssociatedAccounts, setIncludeAssociatedAccounts] = React.useState(true);
  const [dryRunData, setDryRunData] = React.useState(null);
  const [_banAccounts, { loading: submitting }] = useMutation(banAccountsMutation, { context: API_V2_CONTEXT });
  const { toast } = useToast();
  const intl = useIntl();
  const isValid = Boolean(selectedAccounts?.length);
  const toggleAccountSelection = account => {
    return !selectedAccounts.some(selectedAccount => selectedAccount.id === account.id)
      ? setSelectedAccounts(uniqBy([...selectedAccounts, account], 'id'))
      : setSelectedAccounts(selectedAccounts.filter(a => a.id !== account.id));
  };

  const banAccounts = (dryRun = true) =>
    _banAccounts({
      variables: {
        account: selectedAccounts.map(a => ({ id: a.id })),
        includeAssociatedAccounts,
        dryRun,
      },
    });

  return (
    <div>
      <SearchBar placeholder="Search accounts" onSubmit={setSearchTerm} disabled={loading || submitting} />

      {error ? (
        <MessageBoxGraphqlError error={error} />
      ) : loading ? (
        <LoadingPlaceholder height={300} width="100%" mt="20px" />
      ) : data?.accounts?.nodes?.length ? (
        <div>
          <Flex my={3} alignItems="center">
            <StyledButton buttonSize="small" onClick={() => setSelectedAccounts(data.accounts.nodes)} mr={2}>
              Select all
            </StyledButton>
            <StyledButton buttonSize="small" onClick={() => setSelectedAccounts([])} mr={3}>
              Clear selection
            </StyledButton>
            {selectedAccounts.length > 0 && (
              <P fontSize="12px" title={selectedAccounts.map(a => a.slug).join(', ')}>
                {selectedAccounts.length} Accounts selected
              </P>
            )}
          </Flex>

          <AccountsContainer>
            {data.accounts.nodes.map(account => (
              <CardContainer
                key={account.id}
                $isSelected={selectedAccounts.some(a => a.id === account.id)}
                onClick={() => {
                  toggleAccountSelection(account);
                }}
                role="button"
                tabIndex={0}
                onKeyPress={e => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    toggleAccountSelection(account);
                  }
                }}
              >
                <StyledCollectiveCard
                  collective={account}
                  bodyHeight={200}
                  pb={3}
                  px={2}
                  fontSize="11px"
                  title={truncate(stripHTML(account.longDescription), { length: 256 })}
                >
                  <div>
                    <hr className="my-5" />

                    <Box>
                      <strong>Received</strong>:{' '}
                      {formatCurrency(account.stats.totalAmountReceived.valueInCents, account.currency)}
                    </Box>
                    <Box>
                      <strong>Spent</strong>:{' '}
                      {formatCurrency(account.stats.totalAmountSpent.valueInCents, account.currency)}
                    </Box>

                    {account.description && (
                      <P fontSize="11px">
                        <strong>Description</strong>: {truncate(account.description, { length: 120 })}
                      </P>
                    )}
                    {account.website && (
                      <Box>
                        <strong>Website: </strong>
                        <StyledLink openInNewTabNoFollow href={account.website}>
                          {truncate(account.website, { length: 128 })}
                        </StyledLink>
                      </Box>
                    )}
                  </div>
                </StyledCollectiveCard>
              </CardContainer>
            ))}
          </AccountsContainer>
        </div>
      ) : searchTerm ? (
        <P my={4} textAlign="center" fontSize="25px">
          No results for {searchTerm}
        </P>
      ) : null}

      <Flex flexWrap="wrap" px={1} mt={4} justifyContent="center">
        <StyledCheckbox
          label="Include all associated accounts"
          checked={includeAssociatedAccounts}
          onChange={({ checked }) => {
            setIncludeAssociatedAccounts(checked);
          }}
        />
      </Flex>

      <StyledButton
        mt={3}
        width="100%"
        buttonStyle="primary"
        disabled={!isValid}
        loading={submitting}
        onClick={async () => {
          try {
            const result = await banAccounts(true);
            setDryRunData(result.data.banAccount);
          } catch (e) {
            toast({
              variant: 'error',
              message: i18nGraphqlException(intl, e),
            });
          }
        }}
      >
        Analyze
      </StyledButton>
      {dryRunData && (
        <ConfirmationModal
          isDanger
          continueLabel="Ban accounts"
          header="Ban accounts"
          onClose={() => setDryRunData(null)}
          disableSubmit={!dryRunData.isAllowed}
          continueHandler={async () => {
            try {
              const result = await banAccounts(false);
              setDryRunData(null);
              setSelectedAccounts([]);
              refetch(); // Refresh the search results, no need to wait for it
              toast({
                variant: 'success',
                title: `Successfully banned ${result.data.banAccount.accounts.length} accounts`,
                message: <P whiteSpace="pre-wrap">{result.data.banAccount.message}</P>,
              });
            } catch (e) {
              toast({
                variant: 'error',
                message: i18nGraphqlException(intl, e),
              });
            }
          }}
        >
          <BanAccountsSummary dryRunData={dryRunData} />
        </ConfirmationModal>
      )}
    </div>
  );
};

BanAccountsWithSearch.propTypes = {};

export default BanAccountsWithSearch;
