/**
 * GBblitz - Google Sheet Background Sync Service
 * Polls Google Sheet CSV with cache-busting, validates designations, and notifies on change.
 */

import { GOOGLE_SHEET_ID, GOOGLE_SHEET_TABS, getTabCsvUrl } from '../config.js?v=5.39.0';
import { isUsableDesignation, parseCSV } from './sheet-service.js?v=5.39.0';

const CACHE_STORAGE_KEY = 'gbblitz_cached_videos_v24';
const CACHE_SIG_KEY = 'gbblitz_cached_sig_v24';
const MIN_COOLDOWN_MS = 30000; // 30s cooldown between visibility/focus syncs

function detectHeaders(headerRow) {
  const map = { title: 0, link: 1, designation: 2, wave: 3 };
  if (!headerRow || headerRow.length === 0) return map;

  headerRow.forEach((col, idx) => {
    const c = String(col).toLowerCase().trim();
    if (c.includes('title')) map.title = idx;
    else if (c.includes('teach-back') || c.includes('video') || c.includes('submit') || c.includes('link') || c.includes('url')) map.link = idx;
    else if (c.includes('wave') || c.includes('blitz')) map.wave = idx;
    else if (c.includes('designation') || c.includes('status')) map.designation = idx;
  });

  return map;
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
            const link = (row[headerMap.link] || '').trim();
            let rawDesignation = (row[headerMap.designation] || '').trim();
            const title = (row[headerMap.title] || '').trim();
            let wave = (row[headerMap.wave] || '').trim() || 'Wave 1';

            // Smart designation resolution: if headerMap.designation does not yield an approved/highlighted status,
            // check wave or candidate columns C/D (supporting both standard and swapped layouts)
            if (!isUsableDesignation(rawDesignation)) {
              if (isUsableDesignation(wave)) {
                const temp = rawDesignation;
                rawDesignation = wave;
                wave = temp;
              } else if (row[2] && isUsableDesignation(row[2].trim())) {
                rawDesignation = row[2].trim();
                if (!wave || wave === rawDesignation) wave = (row[3] || '').trim();
              } else if (row[3] && isUsableDesignation(row[3].trim())) {
                rawDesignation = row[3].trim();
                if (!wave || wave === rawDesignation) wave = (row[2] || '').trim();
              }
            }

            // Ensure wave is sensible and not holding the designation text
            if (!wave || isUsableDesignation(wave)) {
              if (row[2] && !isUsableDesignation(row[2].trim()) && row[2].trim().length > 0) {
                wave = row[2].trim();
              } else if (row[3] && !isUsableDesignation(row[3].trim()) && row[3].trim().length > 0) {
                wave = row[3].trim();
              } else {
                wave = 'Wave 1';
              }
            }

            if (!link || !isUsableDesignation(rawDesignation)) continue;

            const idMatch = link.match(/id=([a-zA-Z0-9_-]+)/) || link.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
            const fileId = idMatch ? idMatch[1] : null;
            if (!fileId) continue;

            tabVideos.push({
              fileId,
              title,
              rawDesignation,
              wave
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
            title: item.title || ('Video #' + (liveVideos.length + 1)),
            designation: item.rawDesignation,
            type: item.rawDesignation,
            wave: item.wave,
            category: item.wave,
            duration: 'HD',
            thumbnail: 'https://lh3.googleusercontent.com/d/' + item.fileId + '=s800',
            videoUrl: 'https://drive.google.com/file/d/' + item.fileId + '/preview',
            streamUrl: 'https://drive.google.com/uc?export=download&id=' + item.fileId,
            driveUrl: 'https://drive.google.com/file/d/' + item.fileId + '/view',
            description: item.wave + (item.rawDesignation && !item.rawDesignation.toLowerCase().includes('approved') ? ' • ' + item.rawDesignation : '')
          });
        }
      }

      this.consecutiveFailures = 0;
      const signature = liveVideos.map(v => `${v.driveFileId}_${v.title}_${v.designation}_${v.wave}`).join('||');
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
