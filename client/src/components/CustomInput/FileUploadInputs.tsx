import { Icon } from "@iconify/react";
import { FileUploadInputsProps } from "@/types/CustomInputTypes";

const FileUploadInputs: React.FC<FileUploadInputsProps> = ({
    id,
    label,
    filePreview,
    onChange,
    onDrop,
    fileType,
}) => {
    return (
        <div className="mb-4">
            {/* Label */}
            <label htmlFor={id} className="block text-sm font-bold text-gray-700 mb-1">
                {label} 
            </label>

            {/* Upload Box */}
            <div
                className={`file-upload-container ${filePreview ? "border-blue-500" : ""}`}
                onDragOver={(e) => {
                    e.preventDefault();
                    e.currentTarget.classList.add("dragover");
                }}
                onDragLeave={(e) => {
                    e.preventDefault();
                    e.currentTarget.classList.remove("dragover");
                }}
                onDrop={(e) => onDrop(e, id)}
            >
                <Icon icon="mdi:file-upload" className="upload-icon" />
                <p className="text-gray-600 mt-2">
                    Drag & Drop or <label htmlFor={id}>Browse</label> to upload
                </p>
                <input
                    id={id}
                    type="file"
                    accept="image/jpeg,application/pdf"
                    onChange={(e) => onChange(e, id)}
                    className="hidden"
                />

                {filePreview && (
                    <div className="preview mt-4">
                        {filePreview.endsWith('.pdf') || fileType === "application/pdf" ? (
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

                <p className="text-xs text-gray-500 mt-1">
                    Allow only JPEG or PDF file format. (Max 1MB)
                </p>
            </div>
        </div>
    );
};

export default FileUploadInputs;