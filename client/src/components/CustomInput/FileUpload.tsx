import React, { useRef } from 'react';
import { Icon } from '@iconify/react';
import { FileUploadProps } from '../../types/CustomInputTypes';
import { Controller } from 'react-hook-form';

const FileUpload: React.FC<FileUploadProps> = ({
  id,
  setValue,
  getValues,
  trigger,
  filePreview,
  setFilePreview,
  error,
  accept = '',
  maxSizeMB = 5,
  preview = false,
  required = false,
  helperText,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File | null) => {
    if (!file) {
      setValue(id, null, { shouldValidate: true });
      setFilePreview?.(null);
      return;
    }

    const isExcel = file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    const isPDF = file.type === 'application/pdf';
    const isImage = file.type.startsWith('image/');
    const isValidType = accept?.split(',').includes(file.type) || isExcel;
    const isValidSize = file.size <= (maxSizeMB || 2) * 1024 * 1024;

    if (isValidType && isValidSize) {
      setValue(id, file, { shouldValidate: true });

      if (preview) {
        if (isImage || isPDF) {
          setFilePreview?.(URL.createObjectURL(file));
        } else if (isExcel) {
          setFilePreview?.('excel');
        } else {
          setFilePreview?.(null);
        }
      }
    } else {
      setValue(id, null, { shouldValidate: true });
      setFilePreview?.(null);
      alert(`Invalid file. Allowed: ${accept || 'application/pdf'}, Max size: ${maxSizeMB || 2}MB`);
    }
    trigger(id);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    handleFile(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0] || null;
    handleFile(file);
    e.currentTarget.classList.remove('dragover');
  };

  return (
    <div
      className={`file-upload-container border p-4 rounded-md ${filePreview ? 'border-blue-500' : 'border-gray-300'}`}
      onDragOver={(e) => {
        e.preventDefault();
        e.currentTarget.classList.add('dragover');
      }}
      onDragLeave={(e) => {
        e.preventDefault();
        e.currentTarget.classList.remove('dragover');
      }}
      onDrop={handleDrop}
    >
      <Icon icon="mdi:file-upload" className="upload-icon text-3xl text-gray-500 mx-auto" />
      <p className="text-gray-600 mt-2 text-center">
        Drag & Drop or <label htmlFor={id} className="text-blue-600 cursor-pointer">Browse</label> to upload
      </p>
      <input
        id={id}
        type="file"
        accept={accept}
        ref={inputRef}
        onChange={handleFileChange}
        className="hidden"
      />

      {filePreview && preview && (
        <div className="preview mt-4">
          {filePreview.endsWith('.pdf') || accept.includes('pdf') ? (
            <div className="preview mt-4 flex justify-center">
              <iframe src={filePreview} title="Preview" className="max-h-40 rounded" />
            </div>
          ) : (
            <div className="mt-4 flex justify-center">
              <img
                src={filePreview}
                alt="Preview"
                className="max-h-40 rounded"
              />
            </div>
          )}
        </div>
      )}

      {preview && accept === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' && (
        <div className="preview mt-4 flex justify-center flex-col items-center">
          <Icon icon="mdi:file-excel" className="text-green-600 text-5xl" />
          <p className="mt-2 text-sm text-center">{getValues(id)?.name}</p>
        </div>
      )}


      {typeof error?.message === 'string' && (
        <p className="text-red-500 text-sm mt-2">{error.message}</p>
      )}

      <p className="text-xs text-gray-500 mt-1">{helperText}</p>
    </div>
  );
};

export default FileUpload;


export const NewFileUpload: React.FC<FileUploadProps & { label?: string }> = ({
  id,
  label,
  setValue,
  getValues,
  trigger,
  filePreview,
  setFilePreview,
  docPath,
  error,
  accept = '',
  maxSizeMB = 5,
  preview = false,
  required = false,
  control,
  index,
  onPreviewClick,
  name
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File | null) => {
    if (!file) {
      setValue(id, null, { shouldValidate: true });
      setFilePreview?.(null);
      return;
    }

    const isPDF = file.type === 'application/pdf';
    const isImage = file.type.startsWith('image/');
    const isValidType =
      !accept ||
      accept.split(',').some(type => {
        type = type.trim();
        if (type.endsWith('/*')) {
          return file.type.startsWith(type.replace('/*', ''));
        }
        return file.type === type;
      });

    const isValidSize = file.size <= maxSizeMB * 1024 * 1024;

    if (isValidType && isValidSize) {
      setValue(id, file, { shouldValidate: true });
      setValue(`${id}Name`, file.name, { shouldValidate: true }); // Store filename
      if (preview) {
        const url = URL.createObjectURL(file);
        setFilePreview?.(url);
      }
    } else {
      setValue(id, null, { shouldValidate: true });
      setFilePreview?.(null);
      alert(`Invalid file. Allowed: ${accept}. Max size: ${maxSizeMB}MB`);
    }

    trigger(id);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    handleFile(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0] || null;
    handleFile(file);
    e.currentTarget.classList.remove('dragover');
  };

  const getFilenameFromUrl = (url: string | undefined): string => {
    if (!url) return 'View Document';
    const urlParts = url.split('/');
    return urlParts[urlParts.length - 1] || 'View Document';
  };

  const truncateFilename = (filename: string, maxLength: number = 30): string => {
    if (filename.length <= maxLength) return filename;
    return filename.substring(0, maxLength - 3) + '...';
  };

  return (
    <div>
      <div
        className="flex items-center justify-between border border-gray-400 rounded-md bg-gray-50 p-3 cursor-pointer text-sm"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          e.currentTarget.classList.add('dragover');
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          e.currentTarget.classList.remove('dragover');
        }}
        onDrop={handleDrop}
      >
        <p className="text-xs text-gray-800">{label}</p>
        <Icon icon="mdi:file-upload-outline" className="text-gray-400 text-base" />
      </div>

      <Controller
        name={id}
        control={control}
        rules={required ? { required: 'This field is required' } : {}}
        render={({ field }) => (
          <input
            id={id}
            type="file"
            accept={accept}
            ref={inputRef}
            onChange={handleFileChange}
            className="hidden"
          />
        )}
      />
      
      {filePreview && preview && (
        <div className="mt-1 flex items-center gap-1 bg-gray-100 border border-gray-300 p-1 rounded w-full text-xs">
          {(() => {
            const fileValue = getValues(id) || getValues(`partners.${index}.image`);

            const isPdfAccept = accept.includes('pdf');
            const isImageAccept = accept.includes('image/');
            const isSvgAccept = accept.includes('svg');

            const isRemoteFile = typeof filePreview === 'string' && filePreview.startsWith('http');
            const isLocalPDF =
              typeof fileValue === 'string'
                ? fileValue.toLowerCase().endsWith('.pdf')
                : fileValue?.type === 'application/pdf';

            const fileName =
              getValues(`${id}Name`) ||
              (isRemoteFile || isLocalPDF ? getFilenameFromUrl(filePreview) : fileValue?.name) ||
              'View Document';

            return (
              <>
                {isPdfAccept ? (
                  <div className="w-12 h-12 flex items-center justify-center bg-white border rounded">
                    <Icon icon="mdi:file-pdf-box" className="text-red-500 text-2xl" />
                  </div>
                ) : isImageAccept || isSvgAccept ? (
                  <img
                    src={filePreview}
                    alt="Preview"
                    className="w-12 h-12 object-cover rounded border"
                  />
                ) : null}

                {isPdfAccept ? (
                  <a
                    href={isRemoteFile ? filePreview : docPath || filePreview}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline flex items-center text-xs justify-end"
                    onClick={onPreviewClick}
                    title={fileName}
                  >
                    <span>{truncateFilename(fileName)}</span>
                    <Icon icon="mdi:download" className="text-sm ml-0.5" />
                  </a>
                ) : (
                  <span>{truncateFilename(fileName)}</span>
                )}
              </>
            );
          })()}
        </div>
      )}

      {error?.message && (
        <p className="text-red-500 text-xs mt-1">{error.message as string}</p>
      )}
    </div>
  );
};