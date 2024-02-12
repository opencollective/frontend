import React from 'react';
import { closestCenter, DndContext } from '@dnd-kit/core';
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Plus } from '@styled-icons/fa-solid/Plus';
import { Times } from '@styled-icons/fa-solid/Times';
import { DragIndicator } from '@styled-icons/material/DragIndicator';
import { get, sortBy } from 'lodash';
import { FormattedMessage } from 'react-intl';

import type { SocialLink, SocialLinkInput } from '../../lib/graphql/types/v2/graphql';
import { SocialLinkType } from '../../lib/graphql/types/v2/graphql';
import { isValidUrl } from '../../lib/utils';

import { Box, Flex } from '../Grid';
import StyledButton from '../StyledButton';
import StyledInput from '../StyledInput';
import StyledSelect from '../StyledSelect';
import { Span } from '../Text';

type SocialLinksFormFieldProps = {
  value?: SocialLink[];
  touched?: boolean;
  onChange: (value: SocialLinkInput[]) => void;
};

export default function SocialLinksFormField({ value = [], touched, onChange }: SocialLinksFormFieldProps) {
  const [items, setItems] = React.useState(value.map(({ url, type }, i) => ({ url, type, sortId: i.toString() })));

  React.useEffect(() => {
    onChange(items.map(({ url, type }) => ({ url, type })));
  }, [items]);

  const onItemChange = React.useCallback(
    (socialLink, sortId) => {
      const newItems = items.map(item => {
        if (item.sortId === sortId) {
          return { ...item, ...socialLink };
        }
        return item;
      });
      setItems(newItems);
    },
    [items, onChange],
  );

  const onRemoveItem = React.useCallback(
    sortId => {
      const newItems = items.filter(item => item.sortId !== sortId);
      setItems(newItems);
    },
    [items, onChange],
  );

  const addItem = React.useCallback(() => {
    const newItems = [...items, { url: '', type: SocialLinkType.WEBSITE }].map((item, i) => ({
      ...item,
      sortId: i.toString(),
    }));
    setItems(newItems);
  }, [items, onChange]);

  function handleDragEnd(event) {
    const { active, over } = event;
    if (active.id !== over.id) {
      const oldIndex = items.findIndex(item => item.sortId === active.id);
      const newIndex = items.findIndex(item => item.sortId === over.id);
      const newItems = arrayMove(items, oldIndex, newIndex);
      setItems(newItems);
    }
  }

  return (
    <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <Flex width="100%" flexDirection="column" data-cy="social-link-inputs">
        <SortableContext items={items.map(item => item.sortId)} strategy={verticalListSortingStrategy}>
          {items.map(socialLink => {
            return (
              <SocialLinkItem
                key={socialLink.sortId}
                error={touched && !isValidUrl(socialLink.url)}
                value={socialLink}
                onChange={onItemChange}
                onRemoveItem={onRemoveItem}
              />
            );
          })}
          <Flex mt={2} justifyContent="center">
            <StyledButton
              disabled={value.length >= 10}
              type="button"
              buttonSize="tiny"
              buttonStyle="standard"
              onClick={addItem}
            >
              <Plus size="10px" />
              <Span ml={2}>
                <FormattedMessage defaultMessage="Add social link" id="FH4TgN" />
              </Span>
            </StyledButton>
          </Flex>
        </SortableContext>
      </Flex>
    </DndContext>
  );
}

type SocialLinkTypePickerProps = {
  value: SocialLinkType;
  onChange: (value: SocialLinkType) => void;
} & any;

function SocialLinkTypePicker({ value, onChange, ...pickerProps }: SocialLinkTypePickerProps) {
  const options = [
    {
      value: SocialLinkType.WEBSITE.toString(),
      label: 'Website',
    },
    {
      value: SocialLinkType.DISCORD.toString(),
      label: 'Discord',
    },
    {
      value: SocialLinkType.FACEBOOK.toString(),
      label: 'Facebook',
    },
    {
      value: SocialLinkType.GITHUB.toString(),
      label: 'GitHub',
    },
    {
      value: SocialLinkType.GITLAB.toString(),
      label: 'GitLab',
    },
    {
      value: SocialLinkType.GIT.toString(),
      label: 'Git Repository',
    },
    {
      value: SocialLinkType.INSTAGRAM.toString(),
      label: 'Instagram',
    },
    {
      value: SocialLinkType.MASTODON.toString(),
      label: 'Mastodon',
    },
    {
      value: SocialLinkType.MATTERMOST.toString(),
      label: 'Mattermost',
    },
    {
      value: SocialLinkType.TUMBLR.toString(),
      label: 'Tumblr',
    },
    {
      value: SocialLinkType.TWITTER.toString(),
      label: 'Twitter',
    },
    {
      value: SocialLinkType.YOUTUBE.toString(),
      label: 'YouTube',
    },
    {
      value: SocialLinkType.MEETUP.toString(),
      label: 'Meetup',
    },
    {
      value: SocialLinkType.LINKEDIN.toString(),
      label: 'LinkedIn',
    },
    {
      value: SocialLinkType.SLACK.toString(),
      label: 'Slack',
    },
    {
      value: SocialLinkType.DISCOURSE.toString(),
      label: 'Discourse',
    },
    {
      value: SocialLinkType.PIXELFED.toString(),
      label: 'Pixelfed',
    },
    {
      value: SocialLinkType.GHOST.toString(),
      label: 'Ghost',
    },
    {
      value: SocialLinkType.PEERTUBE.toString(),
      label: 'PeerTube',
    },
    {
      value: SocialLinkType.TIKTOK.toString(),
      label: 'TikTok',
    },
    {
      value: SocialLinkType.TWITCH.toString(),
      label: 'Twitch',
    },
  ];

  return (
    <StyledSelect
      {...pickerProps}
      data-cy="social-link-type-picker"
      value={options.find(o => o.value === value?.toString())}
      defaultValue={options.find(o => o.value === SocialLinkType.WEBSITE.toString())}
      onChange={({ value }) => onChange(value)}
      options={sortBy(options, 'label')}
    />
  );
}

type SocialLinkItemProps = {
  value: SocialLink & { sortId: string };
  error?: boolean;
  onChange: (value: SocialLink, sortId: string) => void;
  onRemoveItem: (sortId: string) => void;
};

function SocialLinkItem({ value, error, errors, onChange, onRemoveItem }: SocialLinkItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: value.sortId });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const onFieldChange = React.useCallback(
    (field, fieldValue) => {
      onChange(
        {
          ...value,
          [field]: fieldValue,
        },
        value.sortId,
      );
    },
    [onChange, value],
  );

  const onUrlChange = React.useCallback(
    e => {
      const newUrl = e.target.value;
      onChange(
        {
          type: typeFromUrl(newUrl) ?? value.type,
          url: newUrl,
        },
        value.sortId,
      );
    },
    [onChange, value],
  );

  const onUrlBlur = React.useCallback(() => {
    const hasSchemaRegexp = /^[^:]+:\/\//;

    if (value.url.trim() === '') {
      return;
    }

    if (!value.url.match(hasSchemaRegexp)) {
      onChange(
        {
          ...value,
          url: `https://${value.url}`,
        },
        value.sortId,
      );
    }
  }, [onChange, value]);

  const onRemove = React.useCallback(() => {
    onRemoveItem(value.sortId);
  }, [onRemoveItem, value.sortId]);

  return (
    <Flex ref={setNodeRef} style={style} alignItems="center" my={1} gap="5px">
      <div {...listeners} {...attributes}>
        <DragIndicator size="15px" style={{ cursor: 'grab' }} />
      </div>
      <Flex flexGrow={1} flexWrap="wrap" gap="5px">
        <Box width={['100%', '120px']}>
          <SocialLinkTypePicker value={value.type} onChange={type => onFieldChange('type', type)} />
        </Box>
        <StyledInput
          autoFocus={value.url === ''}
          flexGrow={1}
          value={value.url}
          onBlur={onUrlBlur}
          onChange={onUrlChange}
          placeholder="https://example.com/my-profile"
          type="url"
        />
      </Flex>

      <StyledButton
        tabIndex={-1}
        padding={0}
        width="20px"
        height="20px"
        type="button"
        buttonStyle="borderless"
        onClick={onRemove}
      >
        <Times size="10px" />
      </StyledButton>
    </Flex>
  );
}

const knownSocialLinkDomains = [
  { type: SocialLinkType.DISCORD, regexp: /^(https:\/\/)?discord.com/ },
  { type: SocialLinkType.FACEBOOK, regexp: /^(https:\/\/)?(www\.)?facebook.com/ },
  { type: SocialLinkType.GITHUB, regexp: /^(https:\/\/)?github.com/ },
  { type: SocialLinkType.GITLAB, regexp: /^(https:\/\/)?gitlab.com/ },
  { type: SocialLinkType.INSTAGRAM, regexp: /^(https:\/\/)?(www\.)?instagram.com/ },
  { type: SocialLinkType.LINKEDIN, regexp: /^(https:\/\/)?(www\.)?linkedin.com/ },
  { type: SocialLinkType.MEETUP, regexp: /^(https:\/\/)?meetup.com/ },
  { type: SocialLinkType.SLACK, regexp: /^(https:\/\/)?[^.]+.?slack.com/ },
  { type: SocialLinkType.TIKTOK, regexp: /^(https:\/\/)?(www\.)?tiktok.com/ },
  { type: SocialLinkType.TUMBLR, regexp: /^(https:\/\/)?[^.]+\.?tumblr.com/ },
  { type: SocialLinkType.TWITCH, regexp: /^(https:\/\/)?(www\.)?twitch.tv/ },
  { type: SocialLinkType.TWITTER, regexp: /^(https:\/\/)?twitter.com/ },
  { type: SocialLinkType.YOUTUBE, regexp: /^(https:\/\/)?(www\.)?youtube.com/ },
];

function typeFromUrl(url: string): SocialLinkType | null {
  for (const knownDomain of knownSocialLinkDomains) {
    if (url.match(knownDomain.regexp)) {
      return knownDomain.type;
    }
  }

  return null;
}
