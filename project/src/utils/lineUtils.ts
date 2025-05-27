// Utility to fix line length and date format
export function fixLineLengthAndDates(line: string): string {
  const TARGET_LENGTH = 284;
  if (line.length >= TARGET_LENGTH) return line.slice(0, TARGET_LENGTH);

  if (line.length >= 173) {
    const secondDateStart = 173;
    let secondDate = line.substring(secondDateStart, secondDateStart + 8);

    if (!/^\d{8}$/.test(secondDate)) {
      let partialSecondDate = line.substring(secondDateStart, secondDateStart + 6);
      if (/^\d{6}$/.test(partialSecondDate)) {
        line = line.substring(0, secondDateStart + 6) + '01' + line.substring(secondDateStart + 6);
      } else {
        line = line.substring(0, secondDateStart) + '00000001' + line.substring(secondDateStart);
      }
    }
  } else if (line.length >= 165 + 8) {
    const firstDate = line.substring(165, 173);
    let secondDate = '';
    if (/^\d{8}$/.test(firstDate)) {
      secondDate = firstDate.substring(0, 6) + '01';
    } else if (/^\d{6}$/.test(firstDate)) {
      secondDate = firstDate + '01';
    } else {
      secondDate = '00000001';
    }
    line = line.substring(0, 173) + secondDate + line.substring(173);
  }
  if (line.length < TARGET_LENGTH) {
    line = line.padEnd(TARGET_LENGTH, ' ');
  }
  return line;
}

// Utility for audit: fix spaces in col 14-23, and if any were removed or "/1" is found, insert "00" at col 14 and remove "/1"
// Also, collect issues for reporting
export function auditFixLineWithIssues(
  line: string,
  lineNumber: number,
  issues: { line: number, type: string, message: string }[]
): string {
  let cleanedLine = line;
  let issueFound = false;

  const accountField = cleanedLine.substring(13, 23);
  if (accountField.includes('/1')) {
    issues.push({
      line: lineNumber,
      type: 'Account Invalid Characters',
      message: `'/1' found by account number (cols 14-23)`
    });
    cleanedLine = cleanedLine.replace(/\/1/g, '');
    issueFound = true;
  }

  if (accountField.includes(' ')) {
    issues.push({
      line: lineNumber,
      type: 'Account Spaces',
      message: `Spaces found by account number (cols 14-23)`
    });
    issueFound = true;
  }

  const before = cleanedLine.substring(0, 13);
  const target = cleanedLine.substring(13, 23);
  const after = cleanedLine.substring(23);

  const targetNoSpaces = target.replace(/ /g, '');
  let newLine = before + targetNoSpaces + after;

  if (target !== targetNoSpaces || accountField.includes('/1')) {
    newLine = newLine.substring(0, 13) + '00' + newLine.substring(13);
  }

  let dateIssue = false;
  if (newLine.length >= 173) {
    const secondDateStart = 173;
    let secondDate = newLine.substring(secondDateStart, secondDateStart + 8);

    if (!/^\d{8}$/.test(secondDate)) {
      dateIssue = true;
    }
  } else if (newLine.length >= 173 - 8) {
    if (!/^\d{8}$/.test(newLine.substring(165, 173))) {
      dateIssue = true;
    }
  }
  const fixedLine = fixLineLengthAndDates(newLine);
  if (dateIssue) {
    issues.push({
      line: lineNumber,
      type: 'Date',
      message: `Date format issue at cols 166+ (see line for details)`
    });
  }

  return fixedLine;
}

// For combine, ignore issues array
export function auditFixLineForCombine(line: string): string {
  return auditFixLineWithIssues(line, 0, []);
}
