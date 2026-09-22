/**
 * GBblitz - Configuration & Data Endpoints
 * Pulls live video submissions from Google Sheets (targeting the "Test" tab).
 * 
/**
 * Column mapping:
 * - Tab "Video Submissions":
 *   - Column C (row[2]): Title
 *   - Column D (row[3]): Video Link (Google Drive)
 *   - Column E (row[4]): Category ("Sentiment" or "Teach-back")
 *   - Column F (row[5]): Designation (strictly "Approved" or "Highlighted")
 * - Tab "Test":
 *   - Column A (row[0]): Title
 *   - Column B (row[1]): Video Link
 *   - Column C / E: Category ("Sentiment" or "Teach-back")
 *   - Column D / F: Designation ("Approved" or "Highlighted")
 */
export const GOOGLE_SHEET_ID = '1-tUxNTmDerBRmzS7xbG6fiHMn1Ix5e2G4cI_dGFY3RA';
export const GOOGLE_SHEET_TABS = ['Video Submissions', 'Test'];
export const GOOGLE_SHEET_CSV_URL = `https://docs.google.com/spreadsheets/d/${GOOGLE_SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(GOOGLE_SHEET_TABS[0])}`;

export function getTabCsvUrl(sheetId, tabName) {
  return `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(tabName)}`;
}

