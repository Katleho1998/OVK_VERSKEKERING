import { useState } from 'react';
import FileUpload from './components/FileUpload';
import ErrorList from './components/ErrorList';
import FilePreview from './components/FilePreview';
import FileCombiner from './components/FileCombiner';
import ActionButtons from './components/ActionButtons';
import { AuditResult, CombineResult } from './types';
import { auditTextFile, readFile } from './utils/fileUtils';
import { FileCheck, FileWarning, Files, Download } from 'lucide-react';
import {
  auditFixLineWithIssues,
  auditFixLineForCombine
} from './utils/lineUtils';

function App() {
  const [auditResult, setAuditResult] = useState<AuditResult | null>(null);
  const [auditResults, setAuditResults] = useState<AuditResult[]>([]);
  const [combineResult, setCombineResult] = useState<CombineResult | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [activeMode, setActiveMode] = useState<'audit' | 'combine'>('audit');
  const [wrapTextMap, setWrapTextMap] = useState<Record<string, boolean>>({});


  const handleMultipleFileUpload = async (files: FileList | File[]) => {
    setIsProcessing(true);
    const results: AuditResult[] = [];
    for (const file of Array.from(files)) {
      try {
        const content = await readFile(file);
        const lines = content.split('\n');
        const issues: any[] = [];
        const fixedLines: string[] = [];

        lines.forEach((line, idx) => {
          const fixed = auditFixLineWithIssues(line, idx + 1, issues);
          fixedLines.push(fixed);
        });

        const fixedContent = fixedLines.join('\n');
        let result = auditTextFile(fixedContent, file.name);

        const fileErrors = issues.map(issue => ({
          ...issue,
          description: issue.message,
          original: lines[issue.line - 1] ?? '',
          fixed: fixedLines[issue.line - 1] ?? '',
        }));

        result = {
          ...result,
          originalContent: content,
          fixedContent,
          errors: fileErrors,
          fileName: file.name,
        };
        results.push(result);
      } catch (error) {
        console.error('Error processing file:', file.name, error);
      }
    }
    setAuditResults(results);
    setAuditResult(null);
    setIsProcessing(false);
  };

  const handleCombineFiles = async (files: File[]) => {
    try {
      setIsProcessing(true);
      const fileContents = await Promise.all(
        files.map(async (file) => ({
          name: file.name,
          content: await readFile(file)
        }))
      );

      const processedLines: string[] = [];
      fileContents.forEach(file => {
        file.content
          .split(/\r?\n/)
          .filter(line => line.trim() !== '' && !line.includes('(No column name)'))
          .forEach(line => {
            processedLines.push(auditFixLineForCombine(line));
          });
      });

      const combinedContent = processedLines.join('\n');

      setCombineResult({
        files: fileContents,
        combinedContent
      });
    } catch (error) {
      console.error('Error combining files:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadFixedFile = () => {
    if (!auditResult) return;
    
    const blob = new Blob([auditResult.fixedContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    
    const fileNameParts = auditResult.fileName.split('.');
    const extension = fileNameParts.pop();
    const baseName = fileNameParts.join('.');
    const fixedFileName = `${baseName}-fixed.${extension}`;
    
    a.href = url;
    a.download = fixedFileName;
    document.body.appendChild(a);
    a.click();
    
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 0);
  };

  const downloadCombinedFile = () => {
    if (!combineResult) return;
    
    const blob = new Blob([combineResult.combinedContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    
    a.href = url;
    a.download = 'DOOVK.txt';
    document.body.appendChild(a);
    a.click();
    
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 0);
  };

  const resetApplication = () => {
    setAuditResult(null);
    setCombineResult(null);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Text File Tools</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Upload text files to audit formatting issues or combine multiple files into one.
          </p>
        </header>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveMode('audit')}
              className={`flex-1 px-4 py-3 text-sm font-medium ${
                activeMode === 'audit'
                  ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-700'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <FileCheck className="w-5 h-5 inline-block mr-2" />
              Audit File
            </button>
            <button
              onClick={() => setActiveMode('combine')}
              className={`flex-1 px-4 py-3 text-sm font-medium ${
                activeMode === 'combine'
                  ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-700'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Files className="w-5 h-5 inline-block mr-2" />
              Combine Files
            </button>
          </div>

          <div className="p-6">
            {activeMode === 'audit' ? (
              <div className="space-y-4">
                {(!auditResult && auditResults.length === 0) ? (
                  <div className="space-y-4">
                    <FileUpload
                      onFileUpload={file => handleMultipleFileUpload([file])}
                      onMultipleFilesUpload={handleMultipleFileUpload}
                      multiple
                    />
                    {isProcessing && (
                      <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                        <p className="text-gray-600">Processing your file(s)...</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-6">
                    {auditResults.length > 0 ? (
                      <div className="space-y-8">
                        {auditResults.map((result, idx) => {
                          const fileKey = result.fileName + idx;
                          return (
                            <div key={fileKey} className="border rounded-lg shadow-sm bg-white mb-8">
                              <div className="flex items-center justify-between px-4 py-2 border-b">
                                <span className="font-semibold text-gray-800">{result.fileName}</span>
                                <button
                                  className="text-xs text-blue-600 hover:underline"
                                  onClick={() => {
                                    setAuditResults(auditResults.filter((_, i) => i !== idx));
                                    setWrapTextMap(prev => {
                                      const copy = { ...prev };
                                      delete copy[fileKey];
                                      return copy;
                                    });
                                  }}
                                >
                                  Remove
                                </button>
                              </div>
                              <div className="p-4 space-y-4">
                                <div className="flex items-center">
                                  {result.errors.length > 0 ? (
                                    <div className="flex items-center text-amber-500 bg-amber-50 px-4 py-2 rounded-lg">
                                      <FileWarning className="w-5 h-5 mr-2" />
                                      <span className="font-medium">
                                        Found {result.errors.length} formatting issue{result.errors.length === 1 ? '' : 's'}
                                      </span>
                                    </div>
                                  ) : (
                                    <div className="flex items-center text-green-500 bg-green-50 px-4 py-2 rounded-lg">
                                      <FileCheck className="w-5 h-5 mr-2" />
                                      <span className="font-medium">File format looks good!</span>
                                    </div>
                                  )}
                                </div>
                                <FilePreview
                                  auditResult={result}
                                  wrapText={!!wrapTextMap[fileKey]}
                                  onToggleWrap={() =>
                                    setWrapTextMap(prev => ({
                                      ...prev,
                                      [fileKey]: !prev[fileKey],
                                    }))
                                  }
                                />
                                <ErrorList errors={result.errors} />
                                <div className="flex justify-end">
                                  <button
                                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm flex items-center"
                                    onClick={() => {
                                      const blob = new Blob([result.fixedContent], { type: 'text/plain' });
                                      const url = URL.createObjectURL(blob);
                                      const a = document.createElement('a');
                                      const fileNameParts = result.fileName.split('.');
                                      const extension = fileNameParts.pop();
                                      const baseName = fileNameParts.join('.');
                                      const fixedFileName = `${baseName}-fixed.${extension}`;
                                      a.href = url;
                                      a.download = fixedFileName;
                                      document.body.appendChild(a);
                                      a.click();
                                      setTimeout(() => {
                                        document.body.removeChild(a);
                                        URL.revokeObjectURL(url);
                                      }, 0);
                                    }}
                                  >
                                    <Download className="w-4 h-4 mr-2" />
                                    Download Fixed
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                        <div className="flex justify-end">
                          <button
                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-sm"
                            onClick={() => {
                              setAuditResults([]);
                              setWrapTextMap({});
                            }}
                          >
                            Reset
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        <div className="flex items-center justify-center sm:justify-start">
                          {auditResult && auditResult.errors.length > 0 ? (
                            <div className="flex items-center text-amber-500 bg-amber-50 px-4 py-2 rounded-lg">
                              <FileWarning className="w-5 h-5 mr-2" />
                              <span className="font-medium">
                                Found {auditResult.errors.length} formatting issue{auditResult.errors.length === 1 ? '' : 's'}
                              </span>
                            </div>
                          ) : (
                            <div className="flex items-center text-green-500 bg-green-50 px-4 py-2 rounded-lg">
                              <FileCheck className="w-5 h-5 mr-2" />
                              <span className="font-medium">File format looks good!</span>
                            </div>
                          )}
                        </div>
                        <div className="grid grid-cols-1 gap-6">
                          {auditResult && (
                            <FilePreview
                              auditResult={auditResult}
                              wrapText={!!wrapTextMap['single']}
                              onToggleWrap={() =>
                                setWrapTextMap(prev => ({
                                  ...prev,
                                  single: !prev.single,
                                }))
                              }
                            />
                          )}
                          {auditResult && <ErrorList errors={auditResult.errors} />}
                        </div>
                        <ActionButtons
                          auditResult={auditResult}
                          onReset={resetApplication}
                          hasErrors={!!auditResult && auditResult.errors.length > 0}
                          downloadFixed={downloadFixedFile}
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <FileCombiner
                onCombine={handleCombineFiles}
                combineResult={combineResult}
                onDownload={downloadCombinedFile}
                onReset={resetApplication}
              />
            )}
          </div>
        </div>
        
        <footer className="mt-8 text-center text-gray-500 text-sm">
          <p>Text File Tools &copy; {new Date().getFullYear()}</p>
        </footer>
      </div>
    </div>
  );
}

export default App;