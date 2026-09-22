/**
 * GBblitz - Video Gallery Application
 * Coordinates highlighted carousel, video grid, wave filters, live search, and theater modal.
 */

import { PRELOADED_VIDEOS } from '../data/preloaded-videos.js?v=5.44.0';
import { KNOWN_ASPECT_RATIOS } from '../data/aspect-ratios.js?v=5.44.0';
import { HighlightCarousel } from './carousel.js?v=5.44.0';
import { TheaterModal } from './theater-modal.js?v=5.44.0';
import { HoverPreviewManager } from './hover-preview.js?v=5.44.0';
import { createVideoCard } from './video-card.js?v=5.44.0';
import { SheetSyncService } from '../services/live-sync.js?v=5.44.0';
import { isUsableDesignation } from '../services/sheet-service.js?v=5.44.0';

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
    this.hoverPreviewManager = new HoverPreviewManager({ delayMs: 120 });
    this.cardRevealObserver = null;

    this.initElements();

    // 1. Initialize Sub-Components
    this.carousel = new HighlightCarousel({
      onPlayVideo: (videoId) => this.openTheaterModal(videoId),
      hoverPreviewManager: this.hoverPreviewManager,
      aspectRatioCache: this.aspectRatioCache
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
    return videoList.filter(v => {
      const d = (v.designation || '').trim().toLowerCase().replace(/[!.,]/g, '');
      return d === 'highlighted' || d === 'highlight';
    });
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
    const t = (designation || '').trim().toLowerCase().replace(/[!.,]/g, '');
    if (t === 'highlighted' || t === 'highlight') return 'badge-highlight';
    if (t === 'approved') return 'badge-approved';
    return 'badge-general';
  }

  renderVideoGrid() {
    if (!this.videoGrid) return;
    if (this.hoverPreviewManager) this.hoverPreviewManager.stopActive();
    const filtered = this.getFilteredVideos();
    const currentLabel = this.activeWave === 'all' ? 'All Waves' : this.activeWave;

    if (filtered.length === 0) {
      this.videoGrid.innerHTML = '';
      if (this.emptyState) {
        this.emptyState.style.display = 'block';
        const p = this.emptyState.querySelector('p');
        if (p) {
          p.textContent = this.videos.length === 0 
            ? 'Awaiting approved video submissions from the Google Sheet.' 
            : 'Try adjusting your search terms or selecting another wave.';
        }
      }
      if (this.videoCountBadge) {
        this.videoCountBadge.textContent = this.videos.length === 0 
          ? '0 videos approved' 
          : 'No videos found in ' + currentLabel;
      }
      return;
    }

    if (this.emptyState) this.emptyState.style.display = 'none';
    if (this.videoCountBadge) {
      this.videoCountBadge.textContent = 'Showing ' + filtered.length + ' of ' + this.videos.length + ' videos in ' + currentLabel;
    }

    this.videoGrid.innerHTML = '';
    const fragment = document.createDocumentFragment();
    const isTouch = window.matchMedia('(pointer: coarse)').matches;

    if (this.cardRevealObserver) {
      this.cardRevealObserver.disconnect();
    }

    if ('IntersectionObserver' in window) {
      this.cardRevealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-revealed');
            this.cardRevealObserver.unobserve(entry.target);
          }
        });
      }, {
        root: null,
        rootMargin: '0px 0px -25px 0px',
        threshold: 0.04
      });
    }

    filtered.forEach((video, index) => {
      const isPortrait = this.aspectRatioCache[video.driveFileId] && this.aspectRatioCache[video.driveFileId] < 0.95;

      const card = createVideoCard(video, index, {
        isPortrait,
        onPlay: (id) => this.openTheaterModal(id),
        onRatioDetected: (ratio, isPort) => {
          this.aspectRatioCache[video.driveFileId] = ratio;
          video.isPortrait = isPort;
          video.aspectRatio = ratio;
        }
      });

      if (this.hoverPreviewManager) {
        this.hoverPreviewManager.attach(card, video);
      }

      if (this.cardRevealObserver) {
        this.cardRevealObserver.observe(card);
      } else {
        card.classList.add('is-revealed');
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
    if (!this.waveFilters) return;
    const getCount = (waveName) => {
      if (waveName === 'all') return this.videos.length;
      return this.videos.filter(v => v.wave && v.wave.toLowerCase() === waveName.toLowerCase()).length;
    };

    const waves = ['all', 'Wave 1', 'Wave 2', 'Wave 3', 'Wave 4', 'Wave 5'];
    waves.forEach(w => {
      const btn = this.waveFilters.querySelector('.filter-pill[data-wave="' + w + '"]');
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
      const style = getComputedStyle(document.documentElement);
      const dockedHeight = parseFloat(style.getPropertyValue('--docked-header-height')) || (window.innerWidth <= 640 ? 76 : 94);
      const isStuck = rect.top <= (dockedHeight + 2);
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
