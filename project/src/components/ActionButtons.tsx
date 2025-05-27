import React from 'react';
import { Download, FilePlus2 } from 'lucide-react';
import { AuditResult } from '../types';

interface ActionButtonsProps {
  auditResult: AuditResult | null;
  onReset: () => void;
  hasErrors: boolean;
  downloadFixed: () => void;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({
  auditResult,
  onReset,
  hasErrors,
  downloadFixed
}) => {
  return (
    <div className="flex flex-wrap gap-3 justify-center sm:justify-end">
      <button
        onClick={onReset}
        className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 transition-colors flex items-center"
      >
        <FilePlus2 className="w-4 h-4 mr-2" />
        Upload New File
      </button>
      
      {auditResult && (
        <>
          <button
            onClick={downloadFixed}
            disabled={!hasErrors}
            className={`px-4 py-2 rounded-lg flex items-center ${
              hasErrors
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            } transition-colors`}
          >
            <Download className="w-4 h-4 mr-2" />
            {hasErrors ? 'Download Fixed File' : 'No Fixes Needed'}
          </button>
        </>
      )}
    </div>
  );
};

export default ActionButtons;