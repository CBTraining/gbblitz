/**
 * GBblitz - Google Sheet Background Sync Service
 * Polls Google Sheet CSV with cache-busting, validates designations, and notifies on change.
 */

import { GOOGLE_SHEET_CSV_URL } from '../config.js?v=5.20.0';
import { isUsableDesignation, parseCSV } from './sheet-service.js?v=5.20.0';

const CACHE_STORAGE_KEY = 'gbblitz_cached_videos_v5';
const CACHE_SIG_KEY = 'gbblitz_cached_sig_v5';
const MIN_COOLDOWN_MS = 60000; // 60s cooldown between visibility/focus syncs

export class SheetSyncService {
  constructor(options = {}) {
    this.csvUrl = options.csvUrl || GOOGLE_SHEET_CSV_URL;
    this.pollInterval = options.pollInterval || 120000; // 2 minutes default
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
      const url = this.csvUrl + (this.csvUrl.includes('?') ? '&' : '?') + '_t=' + Date.now();
      const res = await fetch(url, {
        headers: { 'Cache-Control': 'no-cache', 'Pragma': 'no-cache' }
      });

      if (!res.ok) {
        this.consecutiveFailures++;
        console.warn(`SheetSync: HTTP ${res.status}. Backing off...`);
        return;
      }

      const csvText = await res.text();
      const rows = parseCSV(csvText);
      if (rows.length < 2) return;

      const liveVideos = [];
      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const title = (row[0] || '').trim();
        const link = (row[1] || '').trim();
        const rawDesignation = (row[2] || '').trim();
        const wave = (row[3] || '').trim() || 'Wave 1';

        if (i === 0 && !link.toLowerCase().includes('http')) continue;
        if (!link) continue;
        if (!isUsableDesignation(rawDesignation)) continue;

        const idMatch = link.match(/id=([a-zA-Z0-9_-]+)/) || link.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
        const fileId = idMatch ? idMatch[1] : null;

        if (fileId) {
          liveVideos.push({
            id: 'drive-' + fileId,
            driveFileId: fileId,
            title: title || ('Video #' + (liveVideos.length + 1)),
            designation: rawDesignation,
            type: rawDesignation,
            wave: wave,
            category: wave,
            duration: 'HD',
            thumbnail: 'https://lh3.googleusercontent.com/d/' + fileId + '=s800',
            videoUrl: 'https://drive.google.com/file/d/' + fileId + '/preview',
            streamUrl: 'https://drive.google.com/uc?export=download&id=' + fileId,
            driveUrl: 'https://drive.google.com/file/d/' + fileId + '/view',
            description: wave + (rawDesignation && !rawDesignation.toLowerCase().includes('approved') ? ' • ' + rawDesignation : '')
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
