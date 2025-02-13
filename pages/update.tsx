import React, { useState } from 'react';
import { get, pick } from 'lodash';
import type { InferGetServerSidePropsType } from 'next';
import { useRouter } from 'next/router';

import { getSSRQueryHelpers } from '../lib/apollo-client';
import { shouldIndexAccountOnSearchEngines } from '../lib/collective';
import { ERROR } from '../lib/errors';
import { API_V2_CONTEXT, gql } from '../lib/graphql/helpers';
import useLoggedInUser from '../lib/hooks/useLoggedInUser';
import { stripHTML } from '../lib/html';
import { addParentToURLIfMissing, getCollectivePageCanonicalURL } from '../lib/url-helpers';

import CollectiveNavbar from '../components/collective-navbar';
import { NAVBAR_CATEGORIES } from '../components/collective-navbar/constants';
import { accountNavbarFieldsFragment } from '../components/collective-navbar/fragments';
import CommentForm from '../components/conversations/CommentForm';
import { commentFieldsFragment } from '../components/conversations/graphql';
import Thread from '../components/conversations/Thread';
import ErrorPage from '../components/ErrorPage';
import CommentIcon from '../components/icons/CommentIcon';
import Page from '../components/Page';
import StyledUpdate from '../components/StyledUpdate';

const updatePageQuery = gql`
  query UpdatePage($collectiveSlug: String, $updateSlug: String!, $offset: Int) {
    account(slug: $collectiveSlug, throwIfMissing: false) {
      id
      legacyId
      slug
      name
      type
      description
      settings
      imageUrl
      isFrozen
      twitterHandle
      ... on AccountWithHost {
        host {
          id
          slug
          name
          features {
            id
            CONTACT_FORM
          }
        }
      }
      features {
        id
        ...NavbarFields
      }
      conversationsTags {
        id
        tag
      }
      ... on Collective {
        isApproved
      }
      ... on AccountWithParent {
        parent {
          id
          slug
          name
          imageUrl
        }
      }
    }
    update(slug: $updateSlug, account: { slug: $collectiveSlug }) {
      id
      slug
      title
      createdAt
      publishedAt
      html
      summary
      isPrivate
      isChangelog
      makePublicOn
      userCanSeeUpdate
      userCanPublishUpdate
      reactions
      userReactions
      notificationAudience
      account {
        id
        slug
        type
        name
        isHost
      }
      fromAccount {
        id
        slug
        type
        name
      }
      comments(limit: 100, offset: $offset) {
        totalCount
        nodes {
          id
          ...CommentFields
        }
      }
    }
  }
  ${commentFieldsFragment}
  ${accountNavbarFieldsFragment}
`;

type UpdatePageArgs = {
  collectiveSlug: string;
  updateSlug: string;
};

const updatePageSSRQueryHelpers = getSSRQueryHelpers({
  query: updatePageQuery,
  getPropsFromContext: ctx => pick(ctx.query, ['collectiveSlug', 'updateSlug']) as UpdatePageArgs,
  getVariablesFromContext: (ctx, props) => props,
  context: API_V2_CONTEXT,
});

// next.js export
// ts-unused-exports:disable-next-line
export const getServerSideProps = updatePageSSRQueryHelpers.getServerSideProps;

// next.js export
// ts-unused-exports:disable-next-line
export default function UpdatePage(props: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const { LoggedInUser } = useLoggedInUser();
  const queryResult = updatePageSSRQueryHelpers.useQuery(props);
  const router = useRouter();
  const { updateSlug, collectiveSlug } = props;

  const { account, update } = queryResult?.data || {};
  const comments = get(update, 'comments.nodes', []);
  const totalCommentsCount = get(update, 'comments.totalCount', 0);
  const [replyingToComment, setReplyingToComment] = useState(null);

  React.useEffect(() => {
    if (LoggedInUser) {
      queryResult.refetch();
    }
  }, [LoggedInUser, update]);

  React.useEffect(() => {
    addParentToURLIfMissing(router, account, `/updates/${updateSlug}`);
  });

  const fetchMoreComments = async () => {
    await queryResult.fetchMore({
      variables: { collectiveSlug, updateSlug, offset: get(update, 'comments.nodes', []).length },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult) {
          return prev;
        }

        const newValues = {};

        newValues['update'] = {
          ...prev.update,
          comments: {
            ...fetchMoreResult.update.comments,
            nodes: [...prev.update.comments.nodes, ...fetchMoreResult.update.comments.nodes],
          },
        };

        return Object.assign({}, prev, newValues);
      },
    });
  };

  if (!account) {
    return <ErrorPage data={props} />;
  } else if (!update) {
    return <ErrorPage error={{ type: ERROR.NOT_FOUND }} />;
  }

  return (
    <Page
      collective={account}
      title={update.title}
      description={stripHTML(update.summary)}
      canonicalURL={`${getCollectivePageCanonicalURL(account)}/updates/${updateSlug}`}
      metaTitle={`${update.title} - ${account.name}`}
      noRobots={!shouldIndexAccountOnSearchEngines(account)}
    >
      <CollectiveNavbar
        collective={account}
        isAdmin={LoggedInUser && LoggedInUser.isAdminOfCollective(account)}
        selectedCategory={NAVBAR_CATEGORIES.CONNECT}
      />

      <div className="mx-auto max-w-[1260px] px-0 py-4 md:px-4">
        <StyledUpdate
          key={update.id}
          collective={account}
          update={update}
          reactions={update.reactions}
          LoggedInUser={LoggedInUser}
          compact={false}
          isReloadingData={queryResult.loading}
        />
        {update.userCanSeeUpdate && (
          <div className="pl-0 md:pl-5">
            {comments.length > 0 && (
              <div className="mb-3 max-w-[700px] border-t border-neutral-50 pt-3">
                <Thread
                  collective={account}
                  hasMore={comments.length < totalCommentsCount}
                  fetchMore={fetchMoreComments}
                  items={comments}
                  onCommentDeleted={() => queryResult.refetch()}
                  getClickedComment={setReplyingToComment}
                />
              </div>
            )}
            {update.publishedAt && (
              <div className="mt-10 flex max-w-[700px]">
                <div className="hidden flex-none p-3 md:block">
                  <CommentIcon size={24} color="lightgrey" />
                </div>
                <div className="flex-1 p-1 md:max-w-[calc(100%-56px)]">
                  <CommentForm
                    id="new-update"
                    replyingToComment={replyingToComment}
                    UpdateId={update.id}
                    onSuccess={() => queryResult.refetch()}
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Page>
  );
}
