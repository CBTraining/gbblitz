/**
 * GBblitz - Video Gallery Application
 * Coordinates highlighted carousel, video grid, wave filters, live search, and theater modal.
 */

import { PRELOADED_VIDEOS } from '../data/preloaded-videos.js?v=5.18.0';
import { KNOWN_ASPECT_RATIOS } from '../data/aspect-ratios.js?v=5.18.0';
import { HighlightCarousel } from './carousel.js?v=5.18.0';
import { TheaterModal } from './theater-modal.js?v=5.18.0';
import { HoverPreviewManager } from './hover-preview.js?v=5.18.0';
import { SheetSyncService } from '../services/live-sync.js?v=5.18.0';
import { isUsableDesignation } from '../services/sheet-service.js?v=5.18.0';

export class VideoGalleryApp {
  constructor() {
    const cached = SheetSyncService.getCachedVideos();
    const rawVideos = (cached && cached.length > 0) ? cached : PRELOADED_VIDEOS;
    this.videos = rawVideos.filter(v => isUsableDesignation(v.designation));
    this.activeWave = 'all';
    this.searchQuery = '';
    this.currentModalIndex = -1;

    // Calibrated aspect ratios dictionary & desktop hover preview manager
    this.aspectRatioCache = { ...KNOWN_ASPECT_RATIOS };
    this.hoverPreviewManager = new HoverPreviewManager({ delayMs: 550 });

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
    this.stickyHeader = document.getElementById('gallery-sticky-header');
    this.stickySentinel = document.getElementById('gallery-sticky-sentinel');
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
    this.videos = (liveVideos || []).filter(v => isUsableDesignation(v.designation));
    this.carousel.setVideos(this.extractHighlightedVideos(this.videos));
    this.updateWaveCounts();
    this.renderVideoGrid();
  }

  initGallery() {
    this.renderVideoGrid();
    this.initStickyHeader();
  }

  getFilteredVideos() {
    return this.videos.filter(video => {
      if (!isUsableDesignation(video.designation)) return false;
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
    if (this.hoverPreviewManager) this.hoverPreviewManager.stopActive();
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
    const fragment = document.createDocumentFragment();
    const isTouch = window.matchMedia('(pointer: coarse)').matches;

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

      // Dynamic aspect ratio detection from loaded thumbnail
      const thumbImg = card.querySelector('.video-thumb-img');
      if (thumbImg) {
        const detect = () => {
          if (thumbImg.naturalWidth && thumbImg.naturalHeight) {
            const ratio = thumbImg.naturalWidth / thumbImg.naturalHeight;
            const isPort = ratio < 0.95;
            this.aspectRatioCache[video.driveFileId] = ratio;
            video.isPortrait = isPort;
            video.aspectRatio = ratio;
            card.classList.toggle('is-portrait', isPort);
            card.classList.toggle('is-landscape', !isPort);
          }
        };
        if (thumbImg.complete && thumbImg.naturalWidth) {
          detect();
        } else {
          thumbImg.addEventListener('load', detect, { once: true });
        }
      }

      if (!isTouch && this.hoverPreviewManager) {
        this.hoverPreviewManager.attach(card, video);
      }
      fragment.appendChild(card);
    });

    this.videoGrid.appendChild(fragment);
  }

  openTheaterModal(videoId) {
    if (this.hoverPreviewManager) this.hoverPreviewManager.stopActive();
    const filtered = this.getFilteredVideos();
    const index = filtered.findIndex(v => v.id === videoId);
    if (index === -1) return;

    this.currentModalIndex = index;
    const video = filtered[index];
    let aspect = this.aspectRatioCache[video.driveFileId];
    if (!aspect) {
      const card = this.videoGrid.querySelector(`[data-video-id="${video.id}"]`);
      const thumb = card ? card.querySelector('.video-thumb-img') : null;
      if (thumb && thumb.naturalWidth && thumb.naturalHeight) {
        aspect = thumb.naturalWidth / thumb.naturalHeight;
        this.aspectRatioCache[video.driveFileId] = aspect;
      }
    }
    this.modal.open(video, aspect || 1.7778);
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

  initStickyHeader() {
    if (!this.stickyHeader || !this.stickySentinel) return;

    const updateStuck = () => {
      const rect = this.stickySentinel.getBoundingClientRect();
      const threshold = window.innerWidth <= 640 ? 66 : 74;
      const isStuck = rect.top <= threshold;
      this.stickyHeader.classList.toggle('is-stuck', isStuck);
    };

    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(() => {
        updateStuck();
      }, {
        threshold: [0, 1]
      });
      observer.observe(this.stickySentinel);
    }

    window.addEventListener('scroll', updateStuck, { passive: true });
    window.addEventListener('resize', updateStuck, { passive: true });
    updateStuck();
  }
}
