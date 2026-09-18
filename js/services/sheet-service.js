/**
 * GBblitz - Google Sheet & CSV Data Service
 */
/**
 * Strict Column C designation validation rule:
 * ONLY videos that say "Approved" or "Highlighted" are usable.
 * Blank or anything else MUST NOT be shown under any circumstances.
 */
export function isUsableDesignation(designation) {
  if (!designation) return false;
  const str = String(designation).trim().toLowerCase();
  if (!str) return false;
  return str.includes('approved') || str.includes('highlight');
}

// RFC-compliant CSV Parsing Helper Function
export function parseCSV(text) {
  const rows = [];
  let currentRow = [];
  let currentField = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        currentField += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      currentRow.push(currentField.trim());
      currentField = '';
    } else if ((char === '\r' || char === '\n') && !inQuotes) {
      if (char === '\r' && nextChar === '\n') i++;
      currentRow.push(currentField.trim());
      if (currentRow.some(f => f.length > 0)) rows.push(currentRow);
      currentRow = [];
      currentField = '';
    } else {
      currentField += char;
    }
  }
  if (currentField.length > 0 || currentRow.length > 0) {
    currentRow.push(currentField.trim());
    if (currentRow.some(f => f.length > 0)) rows.push(currentRow);
  }
  return rows;
}

