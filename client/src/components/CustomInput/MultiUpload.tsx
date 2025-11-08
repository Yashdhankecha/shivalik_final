import { Icon } from '@iconify/react';
import { Controller } from 'react-hook-form';

const MultiUpload = ({
    id,
    label,
    getValues,
    error,
    previewFiles = [],
    setFilePreviews,
    onFileChange,
    isShowRemove,
    onFileDrop,
    control,
    accept,
    docPath,
    setValue,
    disabled = false,
    required = false
}) => {

    const handleRemove = (index: number) => {
        const fileValues = [...(getValues(id) || [])];
        const fileNames = [...(getValues(`${id}Names`) || [])];
        const updatedPreviews = [...previewFiles];
        const updatedDocPath = docPath ? [...docPath] : [];

        // Remove the file at the given index
        fileValues.splice(index, 1);
        fileNames.splice(index, 1);
        updatedPreviews.splice(index, 1);
        if (Array.isArray(updatedDocPath)) updatedDocPath.splice(index, 1);

        // Update state
        setFilePreviews(updatedPreviews);
        setValue(id, fileValues);
        setValue(`${id}Names`, fileNames);
    };

    return (
        <div className="mb-4 space-y-2">
            <div className="flex items-center justify-between border border-gray-400 rounded-md bg-gray-50 p-3 cursor-pointer"
                onClick={() => document.getElementById(id)?.click()}
                onDragOver={(e) => {
                    e.preventDefault();
                    e.currentTarget.classList.add('dragover');
                }}
                onDragLeave={(e) => {
                    e.preventDefault();
                    e.currentTarget.classList.remove('dragover');
                }}
                onDrop={(e) => onFileDrop(e, id, setFilePreviews)}
            >
                <p className="text-sm text-gray-800">{label}</p>
                <Icon icon="mdi:file-upload-outline" className="text-gray-400 text-xl" />
            </div>

            <Controller
                name={id}
                control={control}
                rules={required ? { required: 'This field is required' } : {}}
                render={({ field }) => (
                    <input
                        id={id}
                        type="file"
                        disabled={disabled}
                        accept={accept}
                        multiple
                        className="hidden"
                        onChange={(e) => onFileChange(e, id, setFilePreviews)}
                        ref={field.ref}
                    />
                )}
            />

            <div className="flex flex-wrap gap-3 mt-2">
                {Array.isArray(previewFiles) && previewFiles?.length > 0 && previewFiles.map((file, idx) => {
                    const isObject = typeof file === 'object' && file !== null;
                    const url = isObject ? file.url : file;

                    const fileValues = getValues(id) || [];
                    const fileItem = fileValues[idx];

                    const fileNames = getValues(`${id}Names`) || [];
                    const fallbackName =
                        typeof fileItem === 'string'
                            ? fileItem?.split('/').pop()
                            : fileItem instanceof File
                                ? fileItem?.name
                                : '';

                    const fileName = fileNames[idx] || fallbackName;

                    const isPdf =
                        (typeof fileItem === 'string' && fileItem.toLowerCase().endsWith('.pdf')) ||
                        (fileItem instanceof File && fileItem.type === 'application/pdf');

                    return (
                        <div
                            key={idx}
                            className="relative flex items-center gap-2 bg-gray-100 border border-gray-300 p-2 rounded w-fit text-sm"
                        >
                            {/* Remove button */}
                            {isShowRemove && (
                                <button
                                    type="button"
                                    onClick={() => handleRemove(idx)}
                                    className="absolute top-[-8px] right-[-8px] bg-white border border-gray-300 rounded-full p-[2px] shadow hover:bg-red-100"
                                    title="Remove"
                                >
                                    <Icon icon="mdi:close" className="text-red-500 text-sm" />
                                </button>
                            )}

                            {isPdf ? (
                                <div className="w-16 h-16 flex items-center justify-center bg-white border rounded">
                                    <Icon icon="mdi:file-pdf-box" className="text-red-500 text-3xl" />
                                </div>
                            ) : (
                                <img
                                    src={url}
                                    alt={`preview-${idx}`}
                                    className="w-16 h-16 object-cover rounded border"
                                />
                            )}

                            {isPdf && Array.isArray(docPath) && docPath[idx] ? (
                                <a
                                    href={docPath[idx]}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-500 hover:underline flex items-center text-sm justify-end p-2"
                                >
                                    {fileName}
                                    <Icon icon="mdi:download" className="text-lg ml-1" />
                                </a>
                            ) : (
                                <span className="text-xs text-gray-700 line-clamp-1 max-w-[150px]">
                                    {fileName}
                                </span>
                            )}
                        </div>
                    );
                })}
            </div>

            {error?.message && <p className="text-red-500 text-sm">{error.message}</p>}
        </div>
    );
};

export default MultiUpload;