/**
 * GBblitz - Video Gallery Application
 * Coordinates highlighted carousel, video grid, wave filters, live search, and theater modal.
 */

import { PRELOADED_VIDEOS } from '../data/preloaded-videos.js?v=5.9.0';
import { HighlightCarousel } from './carousel.js?v=5.9.0';
import { TheaterModal } from './theater-modal.js?v=5.9.0';
import { SheetSyncService } from '../services/live-sync.js?v=5.9.0';

export class VideoGalleryApp {
  constructor() {
    const cached = SheetSyncService.getCachedVideos();
    this.videos = (cached && cached.length > 0) ? cached : PRELOADED_VIDEOS;
    this.activeWave = 'all';
    this.searchQuery = '';
    this.currentModalIndex = -1;
    this.activePreviewCleaner = null;

    this.aspectRatioCache = {
      '1KluNxVaagpuGBajxV-aPLiRTLZuJuCWF': 0.5625,
      '1un9shx6qb1r5hejoMlrJdF-fjmsEvFem': 0.5625,
      '1V8w6gGmiFNtd_4ZN0NkQrvdEaKD89dcf': 1.6,
      '1u0_v1FjOAynwS0cH_vTN-kff2nz-VeX8': 1.7817,
      '1PSD2PvYXoH2tUxoV1K9kdmTpXN1jpQKp': 1.7778,
      '1dD7PDjqshOh_4-w2cLbuiRUyzt3Pn7nY': 1.7778,
      '19hvACWVY5b_ysk50aTTZf5pHGp7xvXT0': 1.7778
    };

    this.initElements();

    // 1. Initialize Sub-Components
    this.carousel = new HighlightCarousel({
      onPlayVideo: (videoId) => this.openTheaterModal(videoId)
    });

    this.modal = new TheaterModal({
      onNavigate: (direction) => this.navigateTheater(direction)
    });

    this.syncService = new SheetSyncService({
      onUpdate: (liveVideos) => this.handleLiveUpdate(liveVideos)
    });

    // 2. Initialize Gallery
    this.carousel.setVideos(this.extractHighlightedVideos(this.videos));
    this.initGallery();
    this.initEventListeners();
    this.updateWaveCounts();
    this.syncService.start();
  }

  initElements() {
    this.videoGrid = document.getElementById('video-grid');
    this.videoSearchInput = document.getElementById('video-search-input');
    this.waveFilters = document.getElementById('wave-filters');
    this.videoCountBadge = document.getElementById('video-count-badge');
    this.emptyState = document.getElementById('empty-state');
  }

  extractHighlightedVideos(videoList) {
    if (!videoList || videoList.length === 0) return [];
    const directHighlighted = videoList.filter(v => v.designation && v.designation.toLowerCase().includes('highlight'));
    if (directHighlighted.length > 0) return directHighlighted;
    const winners = videoList.filter(v => v.designation && v.designation.toLowerCase().includes('winner'));
    if (winners.length > 0) return winners;
    return videoList.slice(0, 5);
  }

  handleLiveUpdate(liveVideos) {
    this.videos = liveVideos;
    this.carousel.setVideos(this.extractHighlightedVideos(liveVideos));
    this.updateWaveCounts();
    this.renderVideoGrid();
  }

  initGallery() {
    this.renderVideoGrid();
  }

  getFilteredVideos() {
    return this.videos.filter(video => {
      const matchesWave = this.activeWave === 'all' || video.wave.toLowerCase() === this.activeWave.toLowerCase();
      const q = this.searchQuery.toLowerCase().trim();
      const matchesSearch = !q || 
        video.title.toLowerCase().includes(q) || 
        video.wave.toLowerCase().includes(q) || 
        video.designation.toLowerCase().includes(q);
      return matchesWave && matchesSearch;
    });
  }

  getBadgeClass(designation) {
    const t = (designation || '').toLowerCase();
    if (t.includes('highlight')) return 'badge-highlight';
    if (t.includes('winner')) return 'badge-winner';
    if (t.includes('runner')) return 'badge-runner-up';
    if (t.includes('approved')) return 'badge-approved';
    return 'badge-general';
  }

  renderVideoGrid() {
    if (!this.videoGrid) return;
    const filtered = this.getFilteredVideos();
    const currentLabel = this.activeWave === 'all' ? 'All Waves' : this.activeWave;

    if (filtered.length === 0) {
      this.videoGrid.innerHTML = '';
      if (this.emptyState) this.emptyState.style.display = 'block';
      if (this.videoCountBadge) this.videoCountBadge.textContent = 'No videos found in ' + currentLabel;
      return;
    }

    if (this.emptyState) this.emptyState.style.display = 'none';
    if (this.videoCountBadge) {
      this.videoCountBadge.textContent = 'Showing ' + filtered.length + ' of ' + this.videos.length + ' videos in ' + currentLabel;
    }

    this.videoGrid.innerHTML = '';

    filtered.forEach((video, index) => {
      const badgeClass = this.getBadgeClass(video.designation);

      const isHighlight = (video.designation || '').toLowerCase().includes('highlight');
      const isWinner = (video.designation || '').toLowerCase().includes('winner');
      const isRunner = (video.designation || '').toLowerCase().includes('runner');
      const showThumbBadge = isHighlight || isWinner || isRunner;
      const thumbBadgeHtml = showThumbBadge ? `
          <div class="thumb-badges">
            <span class="type-pill ${badgeClass}">
              ${isHighlight ? '✨ HIGHLIGHTED' : isWinner ? '🏆 WINNER' : '🥈 RUNNER UP'}
            </span>
          </div>` : '';

      const isPortrait = this.aspectRatioCache[video.driveFileId] && this.aspectRatioCache[video.driveFileId] < 0.95;

      const card = document.createElement('article');
      card.className = 'video-card ' + 
        (isHighlight ? 'card-highlight ' : (isWinner ? 'card-winner ' : (isRunner ? 'card-runner ' : ''))) +
        (isPortrait ? 'is-portrait' : 'is-landscape');
      card.dataset.videoId = video.id;
      card.dataset.index = index;
      card.setAttribute('role', 'button');
      card.setAttribute('tabindex', '0');

      card.innerHTML = `
        <div class="video-thumb-wrap" id="thumb-wrap-${video.id}">
          <img 
            class="video-thumb-img" 
            src="${video.thumbnail}" 
            alt="${video.title}" 
            loading="lazy" 
            onerror="if (!this.dataset.retried) { this.dataset.retried = '1'; this.src = 'https://drive.google.com/thumbnail?id=' + encodeURIComponent('${video.driveFileId}') + '&sz=w800'; } else { this.onerror=null; this.src='https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=800&q=80'; }"
          />

          <!-- Hover Preview Slot -->
          <div class="preview-iframe-slot" id="preview-slot-${video.id}"></div>

          <!-- Centered Play Button Overlay -->
          <div class="video-play-overlay">
            <div class="video-play-btn-circle">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <polygon points="5 3 19 12 5 21 5 3"></polygon>
              </svg>
            </div>
          </div>

          ${thumbBadgeHtml}

          <div class="hover-scrub-bar">
            <div class="hover-scrub-progress"></div>
          </div>
        </div>

        <div class="video-card-body">
          <h3 class="video-title" title="${video.title}">${video.title}</h3>
          <div class="video-meta-row">
            <span class="video-wave-tag">${video.wave}</span>
          </div>
        </div>
      `;

      card.addEventListener('click', () => {
        this.openTheaterModal(video.id);
      });

      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.openTheaterModal(video.id);
        }
      });

      this.setupHoverPreview(card, video);
      this.videoGrid.appendChild(card);
    });
  }

  setupHoverPreview(card, video) {
    let hoverTimeout = null;
    const slot = card.querySelector('.preview-iframe-slot');
    const scrubBar = card.querySelector('.hover-scrub-progress');

    const stopPreview = () => {
      if (hoverTimeout) clearTimeout(hoverTimeout);
      card.classList.remove('is-playing');
      if (slot) slot.innerHTML = '';
      if (scrubBar) {
        scrubBar.style.transition = 'none';
        scrubBar.style.width = '0%';
      }
      if (this.activePreviewCleaner === stopPreview) {
        this.activePreviewCleaner = null;
      }
    };

    const startPreview = () => {
      hoverTimeout = setTimeout(() => {
        if (!slot || slot.querySelector('iframe')) return;
        
        // Clean up any other active preview first (singleton pattern)
        if (this.activePreviewCleaner && this.activePreviewCleaner !== stopPreview) {
          this.activePreviewCleaner();
        }
        this.activePreviewCleaner = stopPreview;

        card.classList.add('is-playing');
        const iframe = document.createElement('iframe');
        iframe.className = 'video-preview-iframe';
        iframe.src = `https://drive.google.com/file/d/${video.driveFileId}/preview`;
        iframe.allow = 'autoplay';
        slot.appendChild(iframe);

        if (scrubBar) {
          scrubBar.style.transition = 'width 8s linear';
          scrubBar.style.width = '100%';
        }
      }, 550);
    };

    card.addEventListener('mouseenter', startPreview);
    card.addEventListener('mouseleave', stopPreview);
  }

  openTheaterModal(videoId) {
    const filtered = this.getFilteredVideos();
    const index = filtered.findIndex(v => v.id === videoId);
    if (index === -1) return;

    this.currentModalIndex = index;
    const video = filtered[index];
    const aspect = this.aspectRatioCache[video.driveFileId] || 1.7778;
    this.modal.open(video, aspect);
  }

  closeTheaterModal() {
    this.modal.close();
  }

  navigateTheater(direction) {
    const filtered = this.getFilteredVideos();
    if (filtered.length === 0) return;
    const newIndex = (this.currentModalIndex + direction + filtered.length) % filtered.length;
    this.openTheaterModal(filtered[newIndex].id);
  }

  updateWaveCounts() {
    const getCount = (waveName) => {
      if (waveName === 'all') return this.videos.length;
      return this.videos.filter(v => v.wave.toLowerCase() === waveName.toLowerCase()).length;
    };

    const waves = ['all', 'Wave 1', 'Wave 2', 'Wave 3', 'Wave 4', 'Wave 5'];
    waves.forEach(w => {
      const btn = document.querySelector('[data-wave="' + w + '"]');
      if (btn) {
        const count = getCount(w);
        const label = w === 'all' ? 'All Videos' : w;
        btn.textContent = label + ' (' + count + ')';
      }
    });
  }

  initEventListeners() {
    if (this.videoSearchInput) {
      this.videoSearchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value;
        this.renderVideoGrid();
      });
    }

    if (this.waveFilters) {
      this.waveFilters.addEventListener('click', (e) => {
        const btn = e.target.closest('.filter-pill');
        if (!btn) return;
        this.waveFilters.querySelectorAll('.filter-pill').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.activeWave = btn.dataset.wave;
        this.renderVideoGrid();
      });
    }
  }
}
