import React from 'react';
import { css } from '@styled-system/css';
import { get } from 'lodash';
import styled from 'styled-components';
import { v4 as uuid } from 'uuid';
import { isURL } from 'validator';

import { uploadImageWithXHR } from '../lib/api';
import { CustomScrollbarCSS } from '../lib/styled-components-shared-styles';

import Container from './Container';
import HTMLContent from './HTMLContent';
import LoadingPlaceholder from './LoadingPlaceholder';
import MessageBox from './MessageBox';
import StyledTag from './StyledTag';

type RichTextEditorContainerProps = {
  /** This component is borderless by default. Set this to `true` to change that. */
  withBorders?: boolean;
  /** If truthy, will display a red outline */
  error?: any;
  /** Min height for the full component */
  editorMinHeight?: number | string | number[] | string[];
  /** Max height for the full component */
  editorMaxHeight?: number | string | number[] | string[];
  toolbarBackgroundColor?: string;
  /** If true, the toolbar will be sticky */
  withStickyToolbar?: boolean;
  /** Version of the editor */
  version: 'default' | 'simplified';
  /** If position is sticky, this prop defines the `top` property. Support responsive arrays */
  toolbarTop?: number | string | number[] | string[];
  /** Useful to compensate the height of the toolbar when editing inline */
  toolbarOffsetY?: number | string | number[] | string[];
  isDisabled?: boolean;
};

type RichTextEditorProps = RichTextEditorContainerProps & {
  /** If not provided, an id will be automatically generated which will require a component update */
  id?: string;
  defaultValue?: string;
  placeholder?: string;
  /** A unique identified for the category of uploaded files. Required if version is not "simplified" */
  kind?: string;
  /** Font size for the text */
  fontSize?: string;
  autoFocus?: boolean;
  /** Called when text is changed with html content as first param and text content as second param */
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  /** A name for the input */
  inputName?: string;
  /** Change this prop to force a re-render of the component */
  reset?: boolean;
  /** If true, max text length will be displayed at the bottom right */
  showCount?: boolean;
  /** Max length of the text */
  maxLength?: number;
  /** This component is borderless by default. Set this to `true` to change that. */
  withBorders?: boolean;
  /** If truthy, will display a red outline */
  error?: any;
  /** Min height for the full component */
  editorMinHeight?: number | string | number[] | string[];
  /** Max height for the full component */
  editorMaxHeight?: number | string | number[] | string[];
  toolbarBackgroundColor?: string;
  /** If true, the toolbar will be sticky */
  withStickyToolbar?: boolean;
  /** Version of the editor */
  version: 'default' | 'simplified';
  /** If position is sticky, this prop defines the `top` property. Support responsive arrays */
  toolbarTop?: number | string | number[] | string[];
  /** Useful to compensate the height of the toolbar when editing inline */
  toolbarOffsetY?: number | string | number[] | string[];
  disabled?: boolean;

  videoEmbedEnabled?: boolean;
  'data-cy': string;
  /** Called when an image is being uploaded to set a boolean */
  setUploading?: (uploading: boolean) => void;
};

const TrixEditorContainer = styled.div<RichTextEditorContainerProps>`
  ${props =>
    props.withBorders &&
    css({
      border: '1px solid',
      borderColor: !props.error ? 'black.300' : 'red.300',
      borderRadius: 10,
      padding: 3,
    })}

  trix-editor {
    border: none;
    padding: 0;
    margin-top: 1px;
    padding-top: 8px;
    padding-right: 4px;
    outline-offset: 0.5em;
    ${CustomScrollbarCSS}
    &::-webkit-scrollbar {
      width: 8px;
    }
    ${props => Boolean(props.editorMaxHeight) && css({ overflowY: 'scroll' })}

    // Outline (only when there's no border)
    ${props =>
      !props.withBorders &&
      css({
        outline: !props.error ? 'none' : `1px dashed ${props.theme.colors.red[300]}`,
        '&:focus': {
          outline: `1px dashed ${props.theme.colors.black[200]}`,
        },
      })}

    // Placeholder
    &:empty:not(:focus)::before {
      color: ${props => props.theme.colors.black[400]};
    }

    // Image captions are disabled
    figcaption {
      display: none;
    }

    ${props =>
      css({
        minHeight: props.editorMinHeight,
        maxHeight: props.editorMaxHeight,
      })}
  }

  trix-toolbar {
    min-height: 40px;
    background: ${props => props.toolbarBackgroundColor};
    z-index: 2;
    margin-bottom: 8px;
    ${props =>
      props.withBorders
        ? css`
            min-height: 0px;
            margin-bottom: 0;
            box-shadow: 0px 4px 4px -5px #b7b7b7;
            padding-bottom: 6px;
          `
        : css`
            box-shadow: 0px 5px 3px -3px rgba(0, 0, 0, 0.1);
          `}

    .trix-button-group {
      border-radius: 6px;
      border-color: #c4c7cc;
      margin-bottom: 0;
      background: white;
      &:not(:first-child) {
        margin-left: min(1.5vw, 10px);
      }
    }

    .trix-button {
      border-bottom: none;
      display: inline-block;
      height: auto;

      &:hover {
        background: ${props => props.theme.colors.blue[100]};
      }

      &.trix-active {
        background: ${props => props.theme.colors.blue[200]};
      }

      &::before,
      &.trix-active::before {
        margin: 4px; // Use this to reduce the icons size
      }
    }

    /** Hide some buttons on the simplified version */
    ${props =>
      props.version === 'simplified' &&
      css({
        '.trix-button-group--file-tools': {
          display: 'none',
        },
        '.trix-button-group--block-tools .trix-button:not(.trix-button--icon-number-list):not(.trix-button--icon-bullet-list)':
          {
            display: 'none',
          },
        '.trix-button--icon-bullet-list': {
          borderLeft: 'none',
        },
      })}

    /** Hide some buttons on mobile */
    @media (max-width: 500px) {
      .trix-button--icon-strike,
      .trix-button--icon-number-list,
      .trix-button--icon-decrease-nesting-level,
      .trix-button--icon-increase-nesting-level {
        display: none;
      }
    }

    /** Sticky mode */
    ${props =>
      props.withStickyToolbar &&
      css({
        position: 'sticky',
        top: props.toolbarTop || 0,
        marginTop: props.toolbarOffsetY,
        p: '10px',
      })}

    /** Custom icons */
    .trix-button--icon-attach::before {
      // See https://feathericons.com/?query=image
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect x='3' y='3' width='18' height='18' rx='2' ry='2'/%3E%3Ccircle cx='8.5' cy='8.5' r='1.5'/%3E%3Cpolyline points='21 15 16 10 5 21'/%3E%3C/svg%3E");
    }
    .trix-button--video-attach::before {
      top: 8%;
      bottom: 4%;
      // See https://feathericons.com/?query=video
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round' class='feather feather-video'%3E%3Cpolygon points='23 7 16 12 23 17 23 7'%3E%3C/polygon%3E%3Crect x='1' y='5' width='15' height='14' rx='2' ry='2'%3E%3C/rect%3E%3C/svg%3E");
    }
  } // End of toolbar customization

  /** Disabled mode */
  ${props =>
    props.isDisabled &&
    css({
      pointerEvents: 'none',
      cursor: 'not-allowed',
      background: '#f3f3f3',
      'trix-toolbar,.trix-button-group': {
        background: '#f3f3f3 !important',
      },
    })}
`;

const SUPPORTED_IFRAME_URLS = { youTube: 'https://www.youtube-nocookie.com/embed/', anchorFm: 'https://anchor.fm/' };

type RichTextEditorState = {
  id: string;
  value: string;
  text: string;
  error: any;
};

/**
 * A React wrapper around the Trix library to edit rich text.
 * Produces HTML and clear text.
 */
export default class RichTextEditor extends React.Component<RichTextEditorProps, RichTextEditorState> {
  static defaultProps = {
    withStickyToolbar: false,
    toolbarTop: 0,
    toolbarOffsetY: -62, // Default Trix toolbar height
    inputName: 'content',
    toolbarBackgroundColor: 'white',
    version: 'default',
    'data-cy': 'RichTextEditor',
    videoEmbedEnabled: false,
  };

  constructor(props) {
    super(props);
    this.editorRef = React.createRef();
    this.mainContainerRef = React.createRef();
    this.state = { id: props.id, error: null, value: this.prepareHTML(props.defaultValue), text: '' };
    this.isReady = false;

    // Load Trix
    if (typeof window !== 'undefined') {
      this.Trix = require('trix').default; // eslint-disable-line @typescript-eslint/no-var-requires
      document.addEventListener('trix-before-initialize', this.trixBeforeInitialize);
    }
  }

  componentDidMount() {
    if (!this.state.id) {
      this.setState({ id: uuid() });
    } else if (!this.isReady) {
      // Initialize Trix
      this.initialize();
    }
  }

  componentDidUpdate(oldProps) {
    if (!this.isReady) {
      this.initialize();
    } else if (oldProps.reset !== this.props.reset) {
      this.getEditor().loadHTML('');
    }
  }

  componentWillUnmount() {
    document.removeEventListener('trix-before-initialize', this.trixBeforeInitialize);
    if (this.isReady) {
      this.editorRef.current.removeEventListener('trix-change', this.handleChange);
      this.editorRef.current.removeEventListener('trix-attachment-add', this.handleAttachmentAdd);
      this.editorRef.current.removeEventListener('trix-attachment-add', this.handleFileAccept);
      this.editorRef.current.removeEventListener('trix-action-invoke', this.trixActionInvoke);
      this.editorRef.current.removeEventListener('trix-initialize', this.trixInitialize);
    }
  }

  private editorRef = null;
  private mainContainerRef = null;
  private isReady: boolean = false;
  private Trix;

  prepareHTML(html: string): string {
    if (!html) {
      return '';
    }

    const parser = new DOMParser();
    const htmlDoc = parser.parseFromString(html, 'text/html');

    // Find all <figure> tags with data-trix-content-type="--embed-iframe-video" and add a data-trix-attachment to them
    const figures = htmlDoc.querySelectorAll('figure[data-trix-content-type="--embed-iframe-video"]');
    figures.forEach(figure => {
      const iframe = figure.querySelector('iframe');
      const dataTrixAttachment = { content: iframe.outerHTML, contentType: '--embed-iframe-video' };
      figure.setAttribute('data-trix-attachment', JSON.stringify(dataTrixAttachment));
    });

    return htmlDoc.querySelector('body').innerHTML;
  }

  getEditor() {
    return this.editorRef.current.editor;
  }

  initialize = async () => {
    if (this.Trix && this.editorRef.current) {
      // Listen for changes
      this.editorRef.current.addEventListener('trix-change', this.handleChange, false);
      this.editorRef.current.addEventListener('trix-attachment-add', this.handleAttachmentAdd);
      this.editorRef.current.addEventListener('trix-file-accept', this.handleFileAccept);
      this.editorRef.current.addEventListener('trix-action-invoke', this.trixActionInvoke);
      this.editorRef.current.addEventListener('trix-initialize', this.trixInitialize);

      // Component ready!
      this.isReady = true;

      // Set initial value for text
      this.setState({ text: this.editorRef.current.innerText });
    }
  };

  /** ---- Trix handlers ---- */

  trixBeforeInitialize = () => {
    this.Trix.config.blockAttributes.heading1 = { tagName: 'h3' };
    this.Trix.config.attachments.preview.caption = { name: false, size: false };
    this.Trix.config.dompurify.ADD_TAGS = ['iframe']; // Allow iframes for video embeds
    this.Trix.config.dompurify.ADD_ATTR = ['allowfullscreen', 'frameborder'];
  };

  trixInitialize = event => {
    if (this.props.videoEmbedEnabled) {
      this.injectTrixEmbedButton(event);
    }
    // Some special handling for links
    if (this.mainContainerRef.current) {
      // We must listen when the user presses the 'Enter' key and when the user clicks the 'Link' button as well
      const linkInput = this.mainContainerRef.current.querySelector("[data-trix-input][name='href']");
      linkInput?.addEventListener('keydown', e => {
        if (e.key === 'Enter') {
          this.handleLink();
        }
      });

      const addLinkBtn = this.mainContainerRef.current.querySelector("[data-trix-method='setAttribute']");
      addLinkBtn?.addEventListener('click', this.handleLink);
    }
  };

  injectTrixEmbedButton = e => {
    const videoEmbedButton = `<button type="button" tabindex="-1" data-trix-action="x-video-dialog-open" title="Attach Video" class="trix-button trix-button--icon trix-button--video-attach">Attach Video</button>`;
    const videoEmbedDialog = `
      <div class="trix-dialog" data-trix-dialog="video-url" data-trix-dialog-attribute="video">
        <div class="trix-dialog__link-fields">
          <input type="url" name="video-url" class="trix-input trix-input--dialog trix-input--dialog-embed" placeholder="Enter Video URL…" aria-label="Video URL" data-trix-input="">
          <div class="trix-button-group">
            <input data-cy="add-video-submit" type="button" class="trix-button trix-button--dialog" value="Add Video" data-trix-action="x-add-embed">
          </div>
        </div>
        <strong>Note: Only YouTube links are supported.</strong>
      </div>`;
    const { toolbarElement } = e.target;
    const attachFilesButton = toolbarElement.querySelector('[data-trix-action=attachFiles]');
    attachFilesButton.insertAdjacentHTML('afterend', videoEmbedButton);
    const trixDialog = toolbarElement.querySelector('.trix-dialog--link');
    trixDialog.insertAdjacentHTML('afterend', videoEmbedDialog);
  };

  trixActionInvoke = e => {
    const { toolbarElement } = e.target;
    if (e.actionName === 'x-video-dialog-open') {
      const attachVideoDialog = toolbarElement.querySelector('[data-trix-dialog=video-url]');
      const attachVideoDialogInput = toolbarElement.querySelector('.trix-input--dialog-embed');
      if (attachVideoDialog.getAttribute('data-trix-active') === '') {
        attachVideoDialog.removeAttribute('data-trix-active');
      } else {
        attachVideoDialog.setAttribute('data-trix-active', '');
        attachVideoDialogInput.removeAttribute('disabled');
      }
    } else if (e.actionName === 'x-add-embed') {
      const embedLink = toolbarElement.querySelector('.trix-input--dialog-embed').value?.trim();
      if (embedLink) {
        this.embedIframe(embedLink);

        const attachVideoDialog = toolbarElement.querySelector('[data-trix-dialog=video-url]');

        // Clear input
        attachVideoDialog.querySelector('.trix-input--dialog-embed').value = '';

        // Close dialog
        if (attachVideoDialog.getAttribute('data-trix-active') === '') {
          attachVideoDialog.removeAttribute('data-trix-active');
        }
      }
    }
  };

  constructVideoEmbedURL = (service, id) => {
    if (service === 'youtube') {
      return `${SUPPORTED_IFRAME_URLS.youTube}${id}`;
    } else if (service === 'anchorFm') {
      return `${SUPPORTED_IFRAME_URLS.anchorFm}${id}`;
    } else {
      return null;
    }
  };

  parseServiceLink = videoLink => {
    const regexps = {
      youtube: new RegExp(
        '(?:https?://)?(?:www\\.)?youtu(?:\\.be/|be\\.com/\\S*(?:watch|embed|shorts)(?:(?:(?=/[^&\\s?]+(?!\\S))/)|(?:\\S*v=|v/)))([^&\\s?]+)',
        'i',
      ),
      anchorFm: /^(http|https)?:\/\/(www\.)?anchor\.fm\/([^/]+)(\/embed)?(\/episodes\/)?([^/]+)?\/?$/, // TODO: moved to https://podcasters.spotify.com
    };
    for (const service in regexps) {
      const matches = regexps[service].exec(videoLink);
      if (matches) {
        if (service === 'anchorFm') {
          const podcastName = matches[3];
          const episodeId = matches[6];
          const podcastUrl = `${podcastName}/embed`;
          return { service, id: episodeId ? `${podcastUrl}/episodes/${episodeId}` : podcastUrl };
        } else {
          return { service, id: matches[matches.length - 1] };
        }
      }
    }
    return {};
  };

  embedIframe = videoLink => {
    const { id, service } = this.parseServiceLink(videoLink);
    const embedLink = this.constructVideoEmbedURL(service, id);
    const Trix = this.Trix;
    if (embedLink) {
      const sanitizedLink = embedLink.replace(/["\\]/g, ''); // Small security enhancement, prevents going out of `src`
      const videoServices = ['youtube', 'vimeo'];
      let attachmentData;
      if (videoServices.includes(service)) {
        attachmentData = {
          contentType: '--embed-iframe-video',
          content: `<iframe src="${sanitizedLink}/?showinfo=0" width="100%" height="394" frameborder="0" allowfullscreen/>`,
        };
      } else {
        attachmentData = {
          contentType: `--embed-iframe-${service}`,
          content: `<iframe src="${sanitizedLink}" width="100%" frameborder="0"/>`,
        };
      }

      this.getEditor().insertAttachment(new Trix.Attachment(attachmentData));
    }
  };

  handleChange = e => {
    // Trigger content formatters
    this.autolink();

    // Notify parent function
    if (this.props.onChange) {
      this.props.onChange(e);
    }

    // Reset errors
    if (this.state.error) {
      this.setState({ error: null });
    }

    // If showing count, we have to store the text value in state
    if (this.props.showCount) {
      this.setState({ text: e.target.innerText });
    }
  };

  handleFileAccept = e => {
    if (!/^image\//.test(e.file.type)) {
      alert('You can only upload images.');
      e.preventDefault();
    } else if (e.file.size > 4000000) {
      // Prevent attaching files > 4MB
      alert('This file is too big (max: 4mb).');
      e.preventDefault();
    }
  };

  handleAttachmentAdd = e => {
    const { attachment } = e;
    const attachmentContent = get(attachment, 'attachment.attributes.values.content');
    const isEmbedAttachment =
      attachmentContent?.includes(`<iframe src="${SUPPORTED_IFRAME_URLS.youTube}`) ||
      attachmentContent?.includes(`<iframe src="${SUPPORTED_IFRAME_URLS.anchorFm}`);

    if (isEmbedAttachment) {
      return;
    } else if (!attachment.file) {
      // Nothing to upload if there's no file
      const url = get(attachment, 'attachment.attributes.values.url');

      if (!/https:\/\/opencollective-(production|staging)\.s3[.-]us-west-1\.amazonaws\.com/.test(url)) {
        attachment.remove(); // Remove unknown stuff, usually when copy-pasting HTML
      }

      return;
    } else if (this.props.version === 'simplified') {
      // Don't upload files in simplified mode
      attachment.remove();
      return;
    }

    this.props.setUploading?.(true);

    const onProgress = progress => attachment.setUploadProgress(progress);
    const onSuccess = fileURL => {
      this.props.setUploading?.(false);
      attachment.setAttributes({ url: fileURL, href: fileURL });
    };
    const onFailure = () => {
      this.props.setUploading?.(false);
      this.setState({ error: 'File upload failed' });
      attachment.remove();
    };
    uploadImageWithXHR(attachment.file, this.props.kind, { onProgress, onSuccess, onFailure });
    return e;
  };

  handleLink = () => {
    const urlInput = this.mainContainerRef.current?.querySelector("[data-trix-input][name='href']");
    const urlInputValue = urlInput?.value?.trim();

    // Ignore missing input or empty values
    if (!urlInputValue) {
      return;
    }

    // Automatically add 'https://' to the url
    // eslint-disable-next-line camelcase
    if (isURL(urlInputValue, { require_protocol: false }) && !isURL(urlInputValue, { require_protocol: true })) {
      urlInput.value = `https://${urlInputValue}`;
    }
  };

  /** Automatically create anchors with hrefs for links */
  autolink() {
    const linkRegex = new RegExp(`(https?://\\S+\\.\\S+)\\s`, 'ig');
    const editor = this.getEditor();
    const content = editor.getDocument().toString();
    let match;
    while ((match = linkRegex.exec(content))) {
      const url = match[1];
      if (isURL(url)) {
        const position = match.index;
        const urlLength = this.autolinkDelimiter(url);
        const range = [position, position + urlLength];
        const hrefAtRange = editor.getDocument().getCommonAttributesAtRange(range).href;
        const newURL = url.slice(0, urlLength);
        if (hrefAtRange !== newURL) {
          this.updateInRange(editor, range, 0, () => {
            if (editor.canActivateAttribute('href')) {
              editor.activateAttribute('href', newURL);
            }
          });
        }
      }
    }
  }

  /** A helper used by autolink to find where the url actually ends
   * Credits:
   * https://github.com/github/cmark-gfm/blob/36c1553d2a1f04dc1628e76b18490edeff78b8d0/extensions/autolink.c#L37
   * https://github.com/vmg/redcarpet/blob/92a7b3ae2241b862e9bf45e0af3cf53ebdfb0afb/ext/redcarpet/autolink.c#L58
   */
  autolinkDelimiter = url => {
    let lastCharacterPosition = url.length;

    while (lastCharacterPosition > 0) {
      const lastCharacterIndex = lastCharacterPosition - 1;
      const closingPair = url[lastCharacterIndex];

      let openingPair;
      if (closingPair === ')') {
        openingPair = '(';
      } else if (closingPair === ']') {
        openingPair = '[';
      } else if (closingPair === '}') {
        openingPair = '{';
      } else if (closingPair === '"') {
        openingPair = '"';
      } else if (closingPair === "'") {
        openingPair = "'";
      }

      // Ensure single punctuations marks at the end of the URL are not included as part of link
      if ('?!.,:;*_~'.includes(url[lastCharacterIndex])) {
        lastCharacterPosition--;
      } else if (openingPair) {
        let opening = 0,
          closing = 0;

        /** Check to ensure that when a URL is enclosed within pair punctuations,
         * we do not include the closing punctuation as part of the link.
         * We only want to accept a closing punctuation at the end of the link,
         * if there is a corresponding opening punctuation within the URL.
         */

        for (let i = 0; i < lastCharacterPosition; i++) {
          if (url[i] === openingPair) {
            opening++;
          } else if (url[i] === closingPair) {
            closing++;
          }
        }

        if (opening >= closing) {
          break;
        }

        lastCharacterPosition--;
      } else {
        break;
      }
    }

    return lastCharacterPosition;
  };

  /** A trix helper that will apply func in range then restore base range when it's done */
  updateInRange(editor, range, offset = 0, updateFunc) {
    const baseRange = editor.getSelectedRange();
    editor.setSelectedRange(range);
    updateFunc();
    editor.setSelectedRange([baseRange[0] + offset, baseRange[1] + offset]);
  }

  /** ---- Render ---- */

  render() {
    const {
      withStickyToolbar,
      toolbarTop,
      toolbarOffsetY,
      toolbarBackgroundColor,
      autoFocus,
      placeholder,
      editorMinHeight,
      withBorders,
      inputName,
      disabled,
      error,
      fontSize,
      version,
      showCount,
      maxLength,
      editorMaxHeight,
    } = this.props;

    return !this.state.id ? (
      <LoadingPlaceholder
        maxHeight={editorMaxHeight && typeof editorMaxHeight === 'number' ? editorMaxHeight + 56 : undefined}
        height={editorMinHeight && typeof editorMinHeight === 'number' ? editorMinHeight + 56 : 200}
      />
    ) : (
      <TrixEditorContainer
        withStickyToolbar={withStickyToolbar}
        toolbarTop={toolbarTop}
        toolbarOffsetY={toolbarOffsetY}
        toolbarBackgroundColor={toolbarBackgroundColor}
        editorMinHeight={editorMinHeight}
        editorMaxHeight={editorMaxHeight}
        withBorders={withBorders}
        version={version}
        isDisabled={disabled}
        error={error}
        data-cy={this.props['data-cy']}
        ref={this.mainContainerRef}
        className="focus-within:border-ring"
      >
        {this.state.error && (
          <MessageBox type="error" mb="36px" withIcon>
            {this.state.error.toString()}
          </MessageBox>
        )}

        <input id={this.state.id} value={this.state.value} type="hidden" name={inputName} disabled={disabled} />
        <HTMLContent fontSize={fontSize}>
          <div className="relative focus-visible:[&>_trix-editor]:outline-none">
            {React.createElement('trix-editor', {
              ref: this.editorRef,
              input: this.state.id,
              autofocus: !disabled && autoFocus ? true : undefined,
              placeholder: placeholder,
              disabled,
            })}
            <Container position="absolute" bottom="1em" right="1em">
              {showCount && !disabled && (
                <StyledTag textTransform="uppercase">
                  <span>{this.state.text.length}</span>
                  {maxLength && <span> / {maxLength}</span>}
                </StyledTag>
              )}
            </Container>
          </div>
        </HTMLContent>
      </TrixEditorContainer>
    );
  }
}
