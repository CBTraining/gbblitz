/**
 * GBblitz - Google Sheet Background Sync Service
 * Polls Google Sheet CSV with cache-busting, validates designations, and notifies on change.
 */

import { GOOGLE_SHEET_CSV_URL } from '../config.js';
import { isUsableDesignation, parseCSV } from './sheet-service.js';

export class SheetSyncService {
  constructor(options = {}) {
    this.csvUrl = options.csvUrl || GOOGLE_SHEET_CSV_URL;
    this.pollInterval = options.pollInterval || 15000;
    this.onUpdate = options.onUpdate || (() => {});
    this.lastSignature = null;
    this.isSyncing = false;
    this.timer = null;
  }

  start() {
    this.syncNow();
    this.timer = setInterval(() => this.syncNow(), this.pollInterval);

    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) this.syncNow();
    });
    window.addEventListener('focus', () => this.syncNow());
  }

  stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  async syncNow() {
    if (this.isSyncing) return;
    this.isSyncing = true;

    try {
      const url = this.csvUrl + (this.csvUrl.includes('?') ? '&' : '?') + '_t=' + Date.now();
      const res = await fetch(url, {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate', 'Pragma': 'no-cache' }
      });
      if (!res.ok) return;
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
            description: wave + ' • ' + rawDesignation
          });
        }
      }

      const signature = liveVideos.map(v => `${v.driveFileId}_${v.title}_${v.designation}_${v.wave}`).join('||');
      if (this.lastSignature === signature) return;
      this.lastSignature = signature;

      this.onUpdate(liveVideos);
    } catch (err) {
      console.warn('SheetSync note:', err.message);
    } finally {
      this.isSyncing = false;
    }
  }
}
