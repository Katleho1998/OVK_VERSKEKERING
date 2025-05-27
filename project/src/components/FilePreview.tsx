import React, { useState } from 'react';
import { AuditResult } from '../types';
import { Code, Eye, FileText } from 'lucide-react';

interface FilePreviewProps {
  auditResult: AuditResult;
  wrapText?: boolean;
  onToggleWrap?: () => void;
}

const FilePreview: React.FC<FilePreviewProps> = ({ auditResult, wrapText = false, onToggleWrap }) => {
  const [activeTab, setActiveTab] = useState<'original' | 'fixed'>('original');
  const { originalContent, fixedContent, fileName } = auditResult;

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center">
          <FileText className="w-5 h-5 text-blue-600 mr-2" />
          <h3 className="font-medium text-gray-800">{fileName}</h3>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex rounded-md overflow-hidden border border-gray-300 bg-white">
            <button
              className={`px-3 py-1.5 text-sm font-medium flex items-center ${
                activeTab === 'original' ? 'bg-blue-50 text-blue-700' : 'bg-white text-gray-600'
              }`}
              onClick={() => setActiveTab('original')}
            >
              <Code className="w-4 h-4 mr-1.5" />
              Original
            </button>
            <button
              className={`px-3 py-1.5 text-sm font-medium flex items-center ${
                activeTab === 'fixed' ? 'bg-blue-50 text-blue-700' : 'bg-white text-gray-600'
              }`}
              onClick={() => setActiveTab('fixed')}
            >
              <Eye className="w-4 h-4 mr-1.5" />
              Fixed
            </button>
          </div>
          {/* Material-like Switch for Wrap Text */}
          <label className="flex items-center cursor-pointer select-none ml-2">
            <span className="mr-2 text-xs text-gray-600">Wrap Text</span>
            <span className="relative">
              <input
                type="checkbox"
                checked={wrapText}
                onChange={onToggleWrap}
                className="sr-only peer"
              />
              <span
                className={`
                  w-10 h-6 flex items-center bg-gray-200 rounded-full p-1 duration-300
                  peer-checked:bg-blue-500
                `}
              >
                <span
                  className={`
                    bg-white w-4 h-4 rounded-full shadow-md transform duration-300
                    ${wrapText ? 'translate-x-4' : ''}
                  `}
                />
              </span>
            </span>
          </label>
        </div>
      </div>
      <div className="bg-gray-900 p-4 overflow-x-auto">
        <pre
          className={`text-gray-300 font-mono text-sm overflow-x-auto ${wrapText ? 'whitespace-pre-wrap break-words' : 'whitespace-pre'}`}
          style={{ minHeight: 200, maxHeight: 400 }}
        >
          {activeTab === 'original' ? originalContent : fixedContent}
        </pre>
      </div>
    </div>
  );
};

export default FilePreview;