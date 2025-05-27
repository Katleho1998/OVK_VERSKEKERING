import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { FilePlus, FileX, Download, Files } from 'lucide-react';
import { CombineResult } from '../types';

interface FileCombinerProps {
  onCombine: (files: File[]) => void;
  combineResult: CombineResult | null;
  onDownload: () => void;
  onReset: () => void;
}

const FileCombiner: React.FC<FileCombinerProps> = ({
  onCombine,
  combineResult,
  onDownload,
  onReset
}) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const totalFiles = selectedFiles.length + acceptedFiles.length;
    if (totalFiles > 20) {
      alert('Maximum 20 files allowed');
      return;
    }
    setSelectedFiles(prev => [...prev, ...acceptedFiles]);
  }, [selectedFiles]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/plain': ['.txt']
    }
  });

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleCombine = () => {
    if (selectedFiles.length > 0) {
      onCombine(selectedFiles);
    }
  };

  const handleReset = () => {
    setSelectedFiles([]);
    onReset();
  };

  if (combineResult) {
    return (
      <div className="space-y-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h3 className="text-lg font-medium text-gray-800 mb-3">Combined Files</h3>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {combineResult.files.map((file, index) => (
              <div key={index} className="flex items-center text-sm text-gray-600 py-1 px-2 bg-gray-50 rounded">
                <Files className="w-4 h-4 mr-2" />
                {file.name}
              </div>
            ))}
          </div>
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={onDownload}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
          >
            <Download className="w-4 h-4 mr-2" />
            Download Combined File
          </button>
          <button
            onClick={handleReset}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center"
          >
            <FilePlus className="w-4 h-4 mr-2" />
            Combine New Files
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`p-8 border-2 border-dashed rounded-lg cursor-pointer transition-colors duration-200
          ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400'}
        `}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center text-center">
          <Files className={`w-16 h-16 mb-4 ${isDragActive ? 'text-blue-500' : 'text-gray-400'}`} />
          <p className="text-lg font-medium text-gray-700 mb-2">
            {isDragActive
              ? "Drop the files here"
              : "Drag and drop text files here, or click to select"}
          </p>
          <p className="text-sm text-gray-500">
            Maximum 20 .txt files
          </p>
        </div>
      </div>

      {selectedFiles.length > 0 && (
        <div className="space-y-4">
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h3 className="text-lg font-medium text-gray-800 mb-3">
              Selected Files ({selectedFiles.length}/20)
            </h3>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {selectedFiles.map((file, index) => (
                <div key={index} className="flex items-center justify-between text-sm text-gray-600 py-1 px-2 bg-gray-50 rounded">
                  <span className="flex items-center">
                    <Files className="w-4 h-4 mr-2" />
                    {file.name}
                  </span>
                  <button
                    onClick={() => removeFile(index)}
                    className="text-gray-500 hover:text-red-500"
                  >
                    <FileX className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={handleCombine}
            disabled={selectedFiles.length === 0}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center"
          >
            <Files className="w-4 h-4 mr-2" />
            Combine Files
          </button>
        </div>
      )}
    </div>
  );
};

export default FileCombiner;