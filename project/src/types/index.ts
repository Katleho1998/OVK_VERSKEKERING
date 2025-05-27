export interface FileError {
  line: number;
  description: string;
  type: ErrorType;
  original: string;
  fixed: string;
}

export enum ErrorType {
  EMPTY_LINE = "Empty Line",
  TRAILING_WHITESPACE = "Trailing Whitespace",
  INCONSISTENT_INDENTATION = "Inconsistent Indentation",
  INCONSISTENT_LINE_ENDINGS = "Inconsistent Line Endings",
  INVALID_JSON = "Invalid JSON",
  INVALID_CSV = "Invalid CSV",
  MIXED_ENCODING = "Mixed Encoding",
  OTHER = "Other"
}

export interface AuditResult {
  originalContent: string;
  fixedContent: string;
  errors: FileError[];
  fileName: string;
  fileType: string;
}

export interface CombineResult {
  files: Array<{
    name: string;
    content: string;
  }>;
  combinedContent: string;
}