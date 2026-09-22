/**
 * GBblitz - Google Sheet Background Sync Service
 * Polls Google Sheet CSV with cache-busting, validates designations, and notifies on change.
 */

import { GOOGLE_SHEET_ID, GOOGLE_SHEET_TABS, getTabCsvUrl } from '../config.js?v=5.58.0';
import { isUsableDesignation, parseCSV } from './sheet-service.js?v=5.58.0';

const CACHE_STORAGE_KEY = 'gbblitz_cached_videos_v31';
const CACHE_SIG_KEY = 'gbblitz_cached_sig_v31';
const MIN_COOLDOWN_MS = 30000; // 30s cooldown between visibility/focus syncs

function detectHeaders(headerRow) {
  const map = { title: -1, link: -1, designation: -1, category: -1 };
  if (!headerRow || headerRow.length === 0) return map;

  headerRow.forEach((col, idx) => {
    const c = String(col).toLowerCase().trim();
    if (c.includes('title')) {
      map.title = idx;
    } else if (c.includes('link') || c.includes('url') || (c.includes('submit') && c.includes('video'))) {
      map.link = idx;
    } else if (c.includes('teach-back') || c.includes('sentiment') || c.includes('wave') || c.includes('blitz')) {
      map.category = idx;
    } else if (c.includes('designation') || c.includes('status')) {
      map.designation = idx;
    }
  });

  return map;
}

function normalizeCategory(val) {
  if (!val) return 'Sentiment';
  const clean = String(val).trim().toLowerCase();
  if (clean.includes('teach')) return 'Teach-back';
  if (clean.includes('sent')) return 'Sentiment';
  return 'Sentiment';
}

export class SheetSyncService {
  constructor(options = {}) {
    this.sheetId = options.sheetId || GOOGLE_SHEET_ID;
    this.tabs = options.tabs || GOOGLE_SHEET_TABS;
    this.pollInterval = options.pollInterval || 60000; // 60s background polling
    this.onUpdate = options.onUpdate || (() => {});
    this.lastSignature = null;
    this.lastSyncTime = 0;
    this.isSyncing = false;
    this.timer = null;
    this.consecutiveFailures = 0;
    this.hasDeliveredInitial = false;

    // Hydrate last signature from cache if available
    try {
      this.lastSignature = localStorage.getItem(CACHE_SIG_KEY) || null;
    } catch (_) {}
  }

  /**
   * Retrieves any cached video array from localStorage for zero-latency initial render,
   * strictly verifying that only Approved or Highlighted videos are returned.
   */
  static getCachedVideos() {
    try {
      const raw = localStorage.getItem(CACHE_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const validated = parsed.filter(v => isUsableDesignation(v.designation));
          if (validated.length > 0) return validated;
        }
      }
    } catch (_) {}
    return null;
  }

  start() {
    // Initial sync
    this.syncNow();
    this.startTimer();

    // Respect tab visibility: pause polling when tab is in background
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.stopTimer();
      } else {
        this.startTimer();
        // Only trigger sync on return if minimum cooldown elapsed
        if (Date.now() - this.lastSyncTime > MIN_COOLDOWN_MS) {
          this.syncNow();
        }
      }
    });

    // Window focus: only sync if cooldown elapsed and tab is active
    window.addEventListener('focus', () => {
      if (!document.hidden && Date.now() - this.lastSyncTime > MIN_COOLDOWN_MS) {
        this.syncNow();
      }
    });
  }

  startTimer() {
    this.stopTimer();
    const delay = Math.min(this.pollInterval * Math.pow(1.5, this.consecutiveFailures), 300000);
    this.timer = setTimeout(() => {
      this.syncNow().finally(() => {
        if (!document.hidden) {
          this.startTimer();
        }
      });
    }, delay);
  }

  stopTimer() {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }

  stop() {
    this.stopTimer();
  }

  async syncNow() {
    if (this.isSyncing) return;
    this.isSyncing = true;
    this.lastSyncTime = Date.now();

    try {
      const seenFileIds = new Set();
      const liveVideos = [];

      const tabResults = await Promise.all(this.tabs.map(async (tabName) => {
        try {
          const url = getTabCsvUrl(this.sheetId, tabName) + '&_t=' + Date.now();
          const res = await fetch(url, {
            headers: { 'Cache-Control': 'no-cache', 'Pragma': 'no-cache' }
          });
          if (!res.ok) return [];
          const csvText = await res.text();
          const rows = parseCSV(csvText);
          if (rows.length < 1) return [];

          const headerMap = detectHeaders(rows[0]);
          const tabVideos = [];

          for (let i = 1; i < rows.length; i++) {
            const row = rows[i];
            
            // 1. Identify link & fileId
            let link = (headerMap.link >= 0 ? (row[headerMap.link] || '').trim() : '');
            let fileId = null;
            let idMatch = link.match(/id=([a-zA-Z0-9_-]+)/) || link.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
            if (idMatch) {
              fileId = idMatch[1];
            } else {
              for (let c = 0; c < row.length; c++) {
                const val = (row[c] || '').trim();
                const m = val.match(/id=([a-zA-Z0-9_-]+)/) || val.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
                if (m) {
                  link = val;
                  fileId = m[1];
                  break;
                }
              }
            }
            if (!fileId) continue;

            // 2. Identify designation (strictly Approved or Highlighted)
            let rawDesignation = (headerMap.designation >= 0 ? (row[headerMap.designation] || '').trim() : '');
            if (!isUsableDesignation(rawDesignation)) {
              for (let c = 0; c < row.length; c++) {
                const val = (row[c] || '').trim();
                if (isUsableDesignation(val)) {
                  rawDesignation = val;
                  break;
                }
              }
            }
            if (!isUsableDesignation(rawDesignation)) continue;

            // 3. Identify category (Sentiment or Teach-back)
            // Priority: Column E (row[4]) per user specification, followed by header map, then cell scan
            let category = '';
            if (row[4] && (row[4].toLowerCase().includes('teach') || row[4].toLowerCase().includes('sent'))) {
              category = normalizeCategory(row[4]);
            } else if (headerMap.category >= 0 && row[headerMap.category]) {
              category = normalizeCategory(row[headerMap.category]);
            } else {
              for (let c = 0; c < row.length; c++) {
                const val = (row[c] || '').trim().toLowerCase();
                if (val.includes('teach') || val.includes('sentiment')) {
                  category = normalizeCategory(val);
                  break;
                }
              }
            }
            if (!category) category = 'Sentiment';

            // 4. Identify title
            let title = (headerMap.title >= 0 ? (row[headerMap.title] || '').trim() : '');
            if (!title || title === link || isUsableDesignation(title) || title.toLowerCase() === 'sentiment' || title.toLowerCase().includes('teach-back')) {
              for (let c = 0; c < row.length; c++) {
                const val = (row[c] || '').trim();
                if (!val || val === link || isUsableDesignation(val)) continue;
                if (val.toLowerCase() === 'sentiment' || val.toLowerCase().includes('teach-back')) continue;
                if (val.includes('@') || /^\d{1,2}\/\d{1,2}\/\d{4}/.test(val)) continue;
                title = val;
                break;
              }
            }

            tabVideos.push({
              fileId,
              title: title || 'Googlebook Video',
              rawDesignation,
              category
            });
          }
          return tabVideos;
        } catch (tabErr) {
          console.warn(`SheetSync: Error reading tab "${tabName}":`, tabErr.message);
          return [];
        }
      }));

      // Flatten and deduplicate in order (earlier tabs take precedence)
      for (const list of tabResults) {
        for (const item of list) {
          if (seenFileIds.has(item.fileId)) continue;
          seenFileIds.add(item.fileId);

          liveVideos.push({
            id: 'drive-' + item.fileId,
            driveFileId: item.fileId,
            title: item.title,
            designation: item.rawDesignation,
            type: item.rawDesignation,
            wave: item.category,
            category: item.category,
            duration: 'HD',
            thumbnail: 'https://lh3.googleusercontent.com/d/' + item.fileId + '=s800',
            videoUrl: 'https://drive.google.com/file/d/' + item.fileId + '/preview',
            streamUrl: 'https://drive.google.com/uc?export=download&id=' + item.fileId,
            driveUrl: 'https://drive.google.com/file/d/' + item.fileId + '/view',
            description: item.category + (item.rawDesignation && !item.rawDesignation.toLowerCase().includes('approved') ? ' • ' + item.rawDesignation : '')
          });
        }
      }

      this.consecutiveFailures = 0;

      // CRITICAL GUARD: Never wipe displayed videos if fetch returned 0 items
      // (e.g. transient network glitch, rate limit, or temporary sheet issue)
      if (liveVideos.length === 0) {
        console.warn('SheetSync: Live fetch returned 0 usable videos. Retaining existing gallery videos.');
        return;
      }

      const signature = liveVideos.map(v => `${v.driveFileId}_${v.title}_${v.designation}_${v.category}`).join('||');
      if (this.lastSignature === signature && this.hasDeliveredInitial) return;
      this.lastSignature = signature;
      this.hasDeliveredInitial = true;

      // Persist in localStorage for instant cold start
      try {
        localStorage.setItem(CACHE_STORAGE_KEY, JSON.stringify(liveVideos));
        localStorage.setItem(CACHE_SIG_KEY, signature);
      } catch (_) {}

      this.onUpdate(liveVideos);
    } catch (err) {
      this.consecutiveFailures++;
      console.warn('SheetSync note:', err.message);
    } finally {
      this.isSyncing = false;
    }
  }
}
