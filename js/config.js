/**
 * GBblitz - Configuration & Data Endpoints
 * Pulls live video submissions from Google Sheets (targeting the "Test" tab).
 * 
 * Column mapping:
 * - Column A (row[0]): Title
 * - Column B (row[1]): Video Link (Google Drive)
 * - Column C (row[2]): Designation (strictly "Approved" or "Highlighted")
 * - Column D (row[3]): Blitz Wave filter designation ("Wave 1", "Wave 2", etc.)
 */
export const GOOGLE_SHEET_ID = '1-tUxNTmDerBRmzS7xbG6fiHMn1Ix5e2G4cI_dGFY3RA';
export const GOOGLE_SHEET_TAB = 'Test';
export const GOOGLE_SHEET_CSV_URL = `https://docs.google.com/spreadsheets/d/${GOOGLE_SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(GOOGLE_SHEET_TAB)}`;

