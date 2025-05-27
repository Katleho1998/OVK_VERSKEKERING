import React from 'react';
import { FileError } from '../types';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

interface ErrorListProps {
  errors: FileError[];
}

const ErrorList: React.FC<ErrorListProps> = ({ errors }) => {
  if (errors.length === 0) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-6 flex items-center text-green-700">
        <CheckCircle2 className="w-6 h-6 mr-3 text-green-500" />
        <p className="font-medium">No formatting issues detected in this file.</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-800 flex items-center">
          <AlertCircle className="w-5 h-5 mr-2 text-amber-500" />
          Found {errors.length} issue{errors.length === 1 ? '' : 's'}
        </h3>
      </div>
      <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
        {errors.map((error, index) => (
          <div key={index} className="p-4 hover:bg-gray-50">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center">
                <span className="font-medium text-gray-900 mr-2">
                  {error.line ? `Line ${error.line}:` : 'File:'}
                </span>
                <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-0.5 rounded">
                  {error.type}
                </span>
              </div>
              {error.line > 0 && (
                <span className="text-xs text-gray-500">
                  Line {error.line}
                </span>
              )}
            </div>
            <p className="text-gray-700 text-sm mb-2">{error.description}</p>
            {error.original !== error.fixed && (
              <div className="mt-2 text-sm grid grid-cols-1 gap-2 sm:grid-cols-2">
                <div className="bg-red-50 p-2 rounded border border-red-200">
                  <div className="text-xs text-red-600 mb-1 font-medium">Original:</div>
                  <pre className="whitespace-pre-wrap break-all font-mono text-xs text-red-800 overflow-x-auto">
                    {error.original || '[empty]'}
                  </pre>
                </div>
                <div className="bg-green-50 p-2 rounded border border-green-200">
                  <div className="text-xs text-green-600 mb-1 font-medium">Fixed:</div>
                  <pre className="whitespace-pre-wrap break-all font-mono text-xs text-green-800 overflow-x-auto">
                    {error.fixed || '[empty]'}
                  </pre>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ErrorList;