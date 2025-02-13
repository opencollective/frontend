import React from 'react';
import { isNil, isString, omit } from 'lodash';
import { CircleAlert, Upload } from 'lucide-react';
import type { Accept, FileRejection } from 'react-dropzone';
import { useDropzone } from 'react-dropzone';
import { FormattedMessage, useIntl } from 'react-intl';
import { v4 as uuid } from 'uuid';

import type { OcrParsingOptionsInput, UploadedFileKind, UploadFileResult } from '../lib/graphql/types/v2/schema';
import { useGraphQLFileUploader } from '../lib/hooks/useGraphQLFileUploader';
import { useImageUploader } from '../lib/hooks/useImageUploader';
import { cn } from '@/lib/utils';

import { Button } from './ui/Button';
import { useToast } from './ui/useToast';
import { getI18nLink } from './I18nFormatters';
import LocalFilePreview from './LocalFilePreview';
import StyledSpinner from './StyledSpinner';
import UploadedFilePreview from './UploadedFilePreview';

export const DROPZONE_ACCEPT_IMAGES = { 'image/*': ['.jpeg', '.png'] };
export const DROPZONE_ACCEPT_CSV = { 'text/csv': ['.csv'] };
export const DROPZONE_ACCEPT_PDF = { 'application/pdf': ['.pdf'] };
export const DROPZONE_ACCEPT_ALL = { ...DROPZONE_ACCEPT_IMAGES, ...DROPZONE_ACCEPT_PDF };

/**
 * A dropzone to upload one or multiple files
 */
const Dropzone = ({
  onReject = undefined,
  onDrop = undefined,
  children = null,
  isLoading = false,
  loadingProgress = undefined,
  minHeight = 96,
  size,
  mockImageGenerator = () => `https://loremflickr.com/120/120?lock=${uuid()}`,
  accept,
  minSize,
  maxSize,
  onSuccess,
  collectFilesOnly,
  name,
  error = undefined,
  value,
  isMulti = true,
  useGraphQL = false,
  parseDocument = false,
  parsingOptions = {},
  onGraphQLSuccess = undefined,
  UploadingComponent = undefined,
  showInstructions = false,
  showIcon = false,
  showActions = false,
  previewSize = size,
  limit = undefined,
  kind = null,
  showReplaceAction = true,
  className = '',
  id,
  ...props
}: DropzoneProps) => {
  const { toast } = useToast();
  const intl = useIntl();
  const imgUploaderParams = { isMulti, mockImageGenerator, onSuccess, onReject, kind, accept, minSize, maxSize };
  const { uploadFiles, isUploading, uploadProgress } = useImageUploader(imgUploaderParams);
  const { isUploading: isUploadingWithGraphQL, uploadFile: uploadFileWithGraphQL } = useGraphQLFileUploader({
    mockImageGenerator,
    onSuccess: onGraphQLSuccess,
    onReject,
    isMulti,
    accept,
    minSize,
    maxSize,
  });

  // Sanity checks
  if (parseDocument && !useGraphQL) {
    throw new Error('StyledDropzone: parseDocument can only be used with useGraphQL');
  } else if (parseDocument && collectFilesOnly) {
    throw new Error('StyledDropzone: parseDocument cannot be used with collectFilesOnly');
  }

  const onDropCallback = React.useCallback(
    (acceptedFiles: File[], fileRejections: FileRejection[]) => {
      if (isMulti && acceptedFiles.length > (limit || 0)) {
        toast({
          variant: 'error',
          message: intl.formatMessage(
            {
              defaultMessage: 'You can only upload {count, plural, one {# file} other {# files}} at once',
              id: 'KLENgi',
            },
            { count: limit },
          ),
        });
        return;
      }

      onDrop?.(acceptedFiles, fileRejections);
      if (collectFilesOnly) {
        onSuccess?.(acceptedFiles, fileRejections);
      } else if (useGraphQL) {
        uploadFileWithGraphQL(
          acceptedFiles.map(file => ({ file, kind, parseDocument, parsingOptions })),
          fileRejections,
        );
      } else {
        uploadFiles(acceptedFiles, fileRejections);
      }
    },
    [collectFilesOnly, onSuccess, uploadFiles, uploadFileWithGraphQL, onDrop],
  );
  const dropzoneParams = { accept, minSize, maxSize, multiple: isMulti, onDrop: onDropCallback };
  const { getRootProps, getInputProps, isDragActive } = useDropzone(dropzoneParams);

  minHeight = size || minHeight;
  const innerMinHeight = minHeight - 2; // -2 To account for the borders
  const dropProps = getRootProps();

  const errorMsg = isString(error) ? error : undefined;
  return (
    <div
      className={cn(
        'group relative flex h-full w-full cursor-pointer place-items-center overflow-hidden rounded-lg border-2 border-dashed border-muted-foreground/25 text-center transition hover:bg-muted/25',
        'ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-hidden',
        '[&>img]:max-h-full [&>img]:max-w-full',
        isDragActive && 'border-muted-foreground/50',
        props.disabled && 'pointer-events-none opacity-60',
        error && 'ring-2 ring-destructive ring-offset-2',
        className,
      )}
      {...props}
      {...(value ? omit(dropProps, ['onClick']) : dropProps)}
      style={{ height: size, width: size, minHeight: size || minHeight }}
    >
      <input id={id} name={name} disabled={props.disabled} {...getInputProps()} />
      {isLoading || isUploading || isUploadingWithGraphQL ? (
        <div
          className="relative flex h-full w-full items-center justify-center"
          style={{ minHeight: innerMinHeight }}
          data-loading="true"
        >
          <div
            className="absolute flex items-center justify-center"
            style={{ height: innerMinHeight, width: innerMinHeight }}
          >
            {UploadingComponent ? <UploadingComponent /> : <StyledSpinner size="50%" />}
          </div>
          {isUploading && <div className="text-xs">{uploadProgress}%</div>}
          {isLoading && !isNil(loadingProgress) && <div>{loadingProgress}%</div>}
        </div>
      ) : (
        <div className="relative flex h-full w-full max-w-full justify-center">
          {isDragActive ? (
            <div className="flex flex-col items-center gap-2 text-xs">
              <Upload size={20} />
              <p>
                <FormattedMessage
                  id="StyledDropzone.DropMsg"
                  defaultMessage="Drop {count,plural, one {file} other {files}} here"
                  values={{ count: isMulti ? 2 : 1 }}
                />
              </p>
            </div>
          ) : (
            <React.Fragment>
              {!value ? (
                <div
                  className={cn(
                    'flex flex-col items-center justify-center px-2 text-sm text-balance',
                    errorMsg ? 'text-destructive' : 'text-muted-foreground',
                  )}
                >
                  {errorMsg ? (
                    <div className="flex flex-col items-center gap-1">
                      <CircleAlert size={20} />
                      <p className="font-semibold">{errorMsg}</p>
                    </div>
                  ) : isMulti ? (
                    <div className="flex flex-col items-center">
                      {showIcon && (
                        <div className="mb-1 text-muted-foreground">
                          <Upload size={24} />
                        </div>
                      )}
                      <div>
                        <FormattedMessage
                          id="DropZone.UploadBox"
                          defaultMessage="Drag and drop one or multiple files or <i18n-link>click here to select</i18n-link>."
                          values={{ 'i18n-link': getI18nLink() }}
                        />
                      </div>
                      {showInstructions && (
                        <p className="mt-1 text-xs text-muted-foreground">
                          <FormattedMessage
                            defaultMessage="{count,plural, one {File} other {Files}} should be {acceptedFormats} and no larger than {maxSize}."
                            id="StyledDropzone.FileInstructions"
                            values={{
                              count: 10,
                              acceptedFormats: Object.values(accept).join(', '),
                              maxSize: `${Math.round(maxSize / 1024 / 1024)}MB`,
                            }}
                          />
                          {Boolean(limit) && (
                            <span>
                              {' '}
                              <FormattedMessage
                                defaultMessage="You can upload up to {count} files."
                                id="StyledDropzone.Limit"
                                values={{ count: limit }}
                              />
                            </span>
                          )}
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      {showIcon && (
                        <div className="mb-1 text-muted-foreground">
                          <Upload size={24} />
                        </div>
                      )}
                      <div>
                        {collectFilesOnly ? (
                          <FormattedMessage
                            id="DragAndDropOrClickToSelect"
                            defaultMessage="Drag & drop or <i18n-link>click to select</i18n-link>"
                            values={{ 'i18n-link': getI18nLink() }}
                            tagName="span"
                          />
                        ) : (
                          <FormattedMessage
                            id="DragAndDropOrClickToUpload"
                            defaultMessage="Drag & drop or <i18n-link>click to upload</i18n-link>"
                            values={{ 'i18n-link': getI18nLink() }}
                            tagName="span"
                          />
                        )}
                      </div>
                      {showInstructions && (
                        <p className="mt-1 text-xs text-muted-foreground">
                          <FormattedMessage
                            defaultMessage="{count,plural, one {File} other {Files}} should be {acceptedFormats} and no larger than {maxSize}."
                            id="StyledDropzone.FileInstructions"
                            values={{
                              count: 1,
                              acceptedFormats: Object.values(accept).join(', '),
                              maxSize: `${Math.round(maxSize / 1024 / 1024)}MB`,
                            }}
                          />
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ) : typeof value === 'string' ? (
                <React.Fragment>
                  <UploadedFilePreview size={previewSize || size} url={value} border="none" />
                  {showReplaceAction && (
                    <div
                      className="absolute bottom-0 box-border flex h-6 w-full cursor-pointer items-center justify-center bg-foreground/50 p-2 text-xs leading-none text-background hover:bg-foreground/60"
                      onClick={dropProps.onClick}
                      role="button"
                      tabIndex={0}
                      onKeyDown={event => {
                        if (event.key === 'Enter') {
                          event.preventDefault();
                          dropProps.onClick(null);
                        }
                      }}
                    >
                      <FormattedMessage id="Image.Replace" defaultMessage="Replace" />
                    </div>
                  )}
                </React.Fragment>
              ) : value instanceof File ? (
                <LocalFilePreview size={previewSize || size} file={value} alignItems="center" />
              ) : null}
              {children}
            </React.Fragment>
          )}
        </div>
      )}
      {value && showActions && (
        <div className="absolute top-3 right-3">
          <Button
            variant="outline"
            size="xs"
            onClick={() => {
              if (isMulti) {
                (onSuccess as (files: File[], fileRejections: FileRejection[]) => void)([], []);
              } else {
                (onSuccess as (file: UploadedFile) => void)(null);
              }
            }}
            disabled={isLoading}
          >
            <FormattedMessage defaultMessage="Clear" id="/GCoTA" />
          </Button>
        </div>
      )}
    </div>
  );
};

type UploadedFile = {
  name?: string;
  url: string;
  size?: number;
  type: string;
};

type DropzoneProps = React.HTMLAttributes<HTMLDivElement> & {
  /** Called back with the rejected files */
  onReject?: (msg: string) => void;
  /** Called when the user drops files */
  onDrop?: (acceptedFiles, rejectedFiles) => void;
  /** Name for the input */
  name: string;
  /** Content to show inside the dropzone. Defaults to message "Drag and drop one or..." */
  children?: React.ReactNode;
  /** Force loading state to be displayed */
  isLoading?: boolean;
  /** Use this to override the loading progress indicator */
  loadingProgress?: number;
  /** Min height of the container */
  minHeight?: number;
  /** To have square container */
  size?: number;
  previewSize?: number;
  /** A function to generate mock images */
  mockImageGenerator?: () => string;
  /** Filetypes to accept */
  accept: Accept;
  /** Min file size, in bytes */
  minSize: number;
  /** Max file size, in bytes */
  maxSize: number;
  /** A truthy/falsy value defining if the field has an error (ie. if it's required) */
  error?: any;
  /** required field */
  required?: boolean;
  /** A unique identified for the category of uploaded files */
  kind?: UploadedFileKind | `${UploadedFileKind}`;
  /** To disabled the input */
  disabled?: boolean;
  showInstructions?: boolean;
  showIcon?: boolean;
  value?: any;
  useGraphQL?: boolean;
  showActions?: boolean;
  onGraphQLSuccess?: (uploadResults: UploadFileResult[]) => void;
  parseDocument?: boolean;
  parsingOptions?: OcrParsingOptionsInput;
  UploadingComponent?: React.ComponentType;
  /** When isMulti is true, limit the number of files that can be uploaded */
  limit?: number;
  showReplaceAction?: boolean;
} & (
    | {
        /** Collect File only, do not upload files */
        collectFilesOnly: true;
        /** Whether the dropzone should accept multiple files */
        isMulti?: boolean;
        /** Called back with the uploaded files on success */
        onSuccess: (acceptedFiles: File[], fileRejections: FileRejection[]) => void;
        /** if set, the image will be displayed and a "replace" banner will be added */
        value?: File;
      }
    | ({
        collectFilesOnly?: false;
      } & (
        | {
            isMulti?: true;
            /** Called back with the uploaded files on success */
            onSuccess?: (files: UploadedFile[]) => void;
          }
        | {
            isMulti: false;
            /** Called back with the uploaded files on success */
            onSuccess?: (file: UploadedFile | null) => void;
            /** if set, the image will be displayed and a "replace" banner will be added */
            value?: string;
          }
      ))
  );

export default Dropzone;

export const MemoizedDropzone = React.memo(Dropzone);
