import React, { useState } from 'react';
import { IoCloudUploadOutline } from 'react-icons/io5';

interface FileUploadProps {
  onUpload: (file: File) => Promise<void>;
  accept?: string;
  label: string;
  className?: string;
}

const FileUpload: React.FC<FileUploadProps> = ({
  onUpload,
  accept = '.json',
  label,
  className = '',
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      setFileName(file.name);
      setIsUploading(true);

      try {
        await onUpload(file);
      } catch (error) {
        console.error('Error uploading file:', error);
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (!file.name.endsWith('.json')) {
        alert('Please upload a JSON file');
        return;
      }

      setFileName(file.name);
      setIsUploading(true);

      try {
        await onUpload(file);
      } catch (error) {
        console.error('Error uploading file:', error);
      } finally {
        setIsUploading(false);
      }
    }
  };

  return (
    <div
      className={`rounded-lg border-2 border-dashed p-6 text-center ${
        isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
      } ${className}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input
        type="file"
        id={`file-upload-${label.replace(/\s+/g, '-').toLowerCase()}`}
        className="hidden"
        accept={accept}
        onChange={handleFileChange}
      />
      <label
        htmlFor={`file-upload-${label.replace(/\s+/g, '-').toLowerCase()}`}
        className="flex cursor-pointer flex-col items-center justify-center space-y-2"
      >
        <IoCloudUploadOutline className="text-4xl text-blue-500" />
        <div className="font-medium">{label}</div>
        <p className="text-sm text-gray-500">
          {fileName ? fileName : 'Drag & drop your file here or click to browse'}
        </p>
        {isUploading && (
          <div className="mt-2">
            <div className="h-1 w-32 overflow-hidden rounded-full bg-gray-200">
              <div className="h-full animate-pulse bg-blue-500" />
            </div>
          </div>
        )}
      </label>
    </div>
  );
};

export default FileUpload;
