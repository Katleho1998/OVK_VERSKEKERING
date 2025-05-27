import { FileError, ErrorType, AuditResult } from '../types';

export async function readFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}

export function getFileExtension(fileName: string): string {
  return fileName.split('.').pop()?.toLowerCase() || '';
}

export function auditTextFile(content: string, fileName: string): AuditResult {
  const lines = content.split(/\r?\n/);
  const errors: FileError[] = [];
  let fixedLines = [...lines];
  
  // Check for trailing whitespace
  lines.forEach((line, index) => {
    if (line.trim() === '' && line !== '') {
      errors.push({
        line: index + 1,
        description: 'Line contains only whitespace',
        type: ErrorType.EMPTY_LINE,
        original: line,
        fixed: ''
      });
      fixedLines[index] = '';
    } else if (line.trimEnd() !== line) {
      errors.push({
        line: index + 1,
        description: 'Line has trailing whitespace',
        type: ErrorType.TRAILING_WHITESPACE,
        original: line,
        fixed: line.trimEnd()
      });
      fixedLines[index] = line.trimEnd();
    }
  });
  
  // Check for inconsistent line endings
  const hasCarriageReturn = content.includes('\r\n');
  const hasLineFeed = content.includes('\n') && !content.includes('\r\n');
  
  if (hasCarriageReturn && hasLineFeed) {
    errors.push({
      line: 0,
      description: 'File contains mixed line endings (CRLF and LF)',
      type: ErrorType.INCONSISTENT_LINE_ENDINGS,
      original: 'Mixed \\r\\n and \\n',
      fixed: 'Standardized to \\n'
    });
    // Standardize to LF
    fixedLines = content.replace(/\r\n/g, '\n').split('\n');
  }
  
  // Check for inconsistent indentation
  const indentationTypes = new Set<string>();
  const indentationSizes = new Set<number>();
  
  lines.forEach((line, index) => {
    if (line.trim() !== '') {
      const match = line.match(/^(\s+)/);
      if (match) {
        const indent = match[1];
        if (indent.includes('\t') && indent.includes(' ')) {
          errors.push({
            line: index + 1,
            description: 'Line uses mixed tabs and spaces for indentation',
            type: ErrorType.INCONSISTENT_INDENTATION,
            original: line,
            fixed: line.replace(/^\s+/, indent.replace(/\t/g, '  '))
          });
          fixedLines[index] = line.replace(/^\s+/, indent.replace(/\t/g, '  '));
        } else {
          if (indent.includes('\t')) {
            indentationTypes.add('tab');
          } else {
            indentationTypes.add('space');
            indentationSizes.add(indent.length);
          }
        }
      }
    }
  });
  
  if (indentationTypes.size > 1) {
    lines.forEach((line, index) => {
      if (line.startsWith('\t')) {
        const fixed = line.replace(/^\t+/, match => '  '.repeat(match.length));
        errors.push({
          line: index + 1,
          description: 'Line uses tabs for indentation while other lines use spaces',
          type: ErrorType.INCONSISTENT_INDENTATION,
          original: line,
          fixed
        });
        fixedLines[index] = fixed;
      }
    });
  }
  
  if (indentationSizes.size > 1) {
    const mostCommonSize = [...indentationSizes].sort()[0];
    errors.push({
      line: 0,
      description: `File uses inconsistent space indentation (${[...indentationSizes].join(', ')} spaces)`,
      type: ErrorType.INCONSISTENT_INDENTATION,
      original: 'Mixed indentation sizes',
      fixed: `Standardized to ${mostCommonSize} spaces`
    });
  }

  // Check file type specific formats
  const fileType = getFileExtension(fileName);
  
  if (fileType === 'json') {
    try {
      JSON.parse(content);
    } catch (e) {
      errors.push({
        line: 0,
        description: `Invalid JSON format: ${(e as Error).message}`,
        type: ErrorType.INVALID_JSON,
        original: 'Malformed JSON',
        fixed: 'Fixed JSON structure'
      });
      
      try {
        // Attempt to fix common JSON errors
        let fixedContent = content
          .replace(/,\s*}/g, '}')  // Remove trailing commas in objects
          .replace(/,\s*\]/g, ']') // Remove trailing commas in arrays
          .replace(/(['"])?([a-zA-Z0-9_]+)(['"])?:/g, '"$2":'); // Ensure property names are quoted
        
        JSON.parse(fixedContent);
        fixedLines = fixedContent.split(/\r?\n/);
      } catch {
        // If we can't fix it automatically, don't modify the content
      }
    }
  }
  
  if (fileType === 'csv') {
    // Check for consistent number of columns
    const columnCounts = new Set<number>();
    
    lines.forEach((line, index) => {
      if (line.trim() !== '') {
        const columns = line.split(',');
        columnCounts.add(columns.length);
        
        if (columnCounts.size > 1) {
          errors.push({
            line: index + 1,
            description: 'Inconsistent number of columns in CSV',
            type: ErrorType.INVALID_CSV,
            original: line,
            fixed: line // We don't attempt to fix this automatically
          });
        }
      }
    });
  }
  
  return {
    originalContent: content,
    fixedContent: fixedLines.join('\n'),
    errors,
    fileName,
    fileType: getFileExtension(fileName)
  };
}