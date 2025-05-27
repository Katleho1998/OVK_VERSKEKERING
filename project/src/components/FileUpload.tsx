import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud } from 'lucide-react';

interface FileUploadProps {
  onFileUpload: (file: File) => void;
  onMultipleFilesUpload?: (files: FileList | File[]) => void;
  multiple?: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileUpload, onMultipleFilesUpload, multiple }) => {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      if (multiple && onMultipleFilesUpload) {
        onMultipleFilesUpload(acceptedFiles);
      } else {
        onFileUpload(acceptedFiles[0]);
      }
    }
  }, [onFileUpload, onMultipleFilesUpload, multiple]);

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    maxFiles: multiple ? undefined : 1,
    accept: {
      'text/plain': ['.txt'],
      'text/csv': ['.csv'],
      'application/json': ['.json'],
      'application/vnd.ms-excel': ['.csv'],
      'text/javascript': ['.js', '.jsx', '.ts', '.tsx']
    }
  });

  return (
    <div
      {...getRootProps()}
      className={`p-8 border-2 border-dashed rounded-lg cursor-pointer transition-colors duration-200
        ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400'}
        ${isDragReject ? 'border-red-500 bg-red-50' : ''}
      `}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center justify-center text-center">
        <UploadCloud 
          className={`w-16 h-16 mb-4 ${isDragActive ? 'text-blue-500' : 'text-gray-400'}`}
        />
        
        <p className="text-lg font-medium text-gray-700 mb-2">
          {isDragActive
            ? "Drop the file here"
            : "Drag and drop a text file here, or click to select"}
        </p>
        
        <p className="text-sm text-gray-500">
          Supports .txt, .csv, .json, and code files (.js, .ts, etc.)
        </p>
      </div>
    </div>
  );
};

export default FileUpload;