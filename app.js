/**
 * GBblitz - Dark Mode Video Gallery & Showcase
 * Features a Top Video Carousel cycling through videos designated as "Highlighted"
 * Blitz Wave filtering (All, Wave 1, Wave 2, Wave 3, Wave 4, Wave 5)
 * Live auto-sync with Google Sheet
 * Strict designation rule: Videos are ONLY shown if Column C is non-empty AND does not say "Unuseable".
 * Empty designations count as unuseable and are hidden.
 */

// =============================================================================
// 1. Configuration & Data Rules
// =============================================================================

const GOOGLE_SHEET_ID = '1-tUxNTmDerBRmzS7xbG6fiHMn1Ix5e2G4cI_dGFY3RA';
const GOOGLE_SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/' + GOOGLE_SHEET_ID + '/export?format=csv';

// Preloaded Usable Videos:
// Initialized empty because all rows currently undesignated in Column C count as unuseable.
// Videos populate dynamically as soon as an approved designation is entered in the Google Sheet.
const PRELOADED_VIDEOS = [];

/**
 * Determines if a designation from Column C represents an approved/usable video.
 * Rule: Only show if Column C is NOT empty and does NOT contain "Unuseable" (or "Unusable").
 * Empty or whitespace-only cells count as unuseable.
 */
function isUsableDesignation(designation) {
  if (!designation) return false;
  const str = String(designation).trim();
  if (!str) return false;
  const norm = str.toLowerCase().replace(/[^a-z0-9]/g, '');
  if (
    norm.includes('unuseable') ||
    norm.includes('unusable') ||
    norm.includes('notusable') ||
    norm.includes('notuseable')
  ) {
    return false;
  }
  return true;
}

// RFC-compliant CSV Parsing Helper Function
function parseCSV(text) {
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

class VideoGalleryApp {
  constructor() {
    this.videos = PRELOADED_VIDEOS;
    this.highlightedVideos = this.extractHighlightedVideos(this.videos);
    this.activeWave = 'all'; // 'all', 'Wave 1', 'Wave 2', 'Wave 3', 'Wave 4', 'Wave 5'
    this.searchQuery = '';
    this.currentModalIndex = -1;
    this.currentSlideIndex = 0;
    this.carouselTimer = null;
    this.carouselDuration = 5500;
    this.progressInterval = null;
    this.progressStartTime = 0;
    this.lastDataSignature = null;
    this.isSyncing = false;
    this.aspectRatioCache = {
      '1un9shx6qb1r5hejoMlrJdF-fjmsEvFem': 0.5625,
      '1V8w6gGmiFNtd_4ZN0NkQrvdEaKD89dcf': 1.6,
      '1KluNxVaagpuGBajxV-aPLiRTLZuJuCWF': 1.7778,
      '1u0_v1FjOAynwS0cH_vTN-kff2nz-VeX8': 1.7817,
      '1PSD2PvYXoH2tUxoV1K9kdmTpXN1jpQKp': 1.7778,
      '1dD7PDjqshOh_4-w2cLbuiRUyzt3Pn7nY': 1.7778,
      '19hvACWVY5b_ysk50aTTZf5pHGp7xvXT0': 1.7778
    };

    this.initElements();
    this.initCarousel();
    this.initGallery();
    this.initEventListeners();
    this.updateWaveCounts();
    
    // Live-sync with Google Sheet in background & auto-updating interval
    this.initLiveSync();
  }

  extractHighlightedVideos(videoList) {
    if (!videoList || videoList.length === 0) return [];
    const directHighlighted = videoList.filter(v => v.designation && v.designation.toLowerCase().includes('highlight'));
    if (directHighlighted.length > 0) return directHighlighted;
    // Fallback to Winners if no highlighted
    const winners = videoList.filter(v => v.designation && v.designation.toLowerCase().includes('winner'));
    if (winners.length > 0) return winners;
    return videoList.slice(0, 5);
  }

  // ===========================================================================
  // DOM Elements
  // ===========================================================================
  initElements() {
    // Carousel Elements
    this.carouselTrack = document.getElementById('carousel-track');
    this.carouselIndicators = document.getElementById('carousel-indicators');
    this.carouselPrevBtn = document.getElementById('carousel-prev-btn');
    this.carouselNextBtn = document.getElementById('carousel-next-btn');
    this.carouselProgressFill = document.getElementById('carousel-progress-fill');
    this.carouselWrapper = document.getElementById('photo-carousel');

    // Gallery Elements
    this.videoGrid = document.getElementById('video-grid');
    this.videoSearchInput = document.getElementById('video-search-input');
    this.waveFilters = document.getElementById('wave-filters');
    this.videoCountBadge = document.getElementById('video-count-badge');
    this.emptyState = document.getElementById('empty-state');

    // Theater Modal Elements
    this.theaterModal = document.getElementById('theater-modal');
    this.modalTitle = document.getElementById('modal-title');
    this.modalDesc = document.getElementById('modal-desc');
    this.modalCategoryBadge = document.getElementById('modal-category-badge');
    this.modalDriveLink = document.getElementById('modal-drive-link');
    this.theaterPlayerContainer = document.getElementById('theater-player-container');
    this.modalCloseBtn = document.getElementById('modal-close-btn');
    this.modalFloatingClose = document.getElementById('modal-floating-close');
    this.modalPrevBtn = document.getElementById('modal-prev-btn');
    this.modalNextBtn = document.getElementById('modal-next-btn');
    this.modalFullscreenBtn = document.getElementById('modal-fullscreen-btn');
  }

  // ===========================================================================
  // 2. Video Carousel (Highlighted Videos)
  // ===========================================================================
  initCarousel() {
    if (!this.carouselTrack || !this.carouselIndicators) return;
    this.stopCarouselAutoplay();
    this.carouselTrack.innerHTML = '';
    this.carouselIndicators.innerHTML = '';

    if (this.highlightedVideos.length === 0 && this.videos.length > 0) {
      this.highlightedVideos = this.videos.slice(0, 5);
    }

    if (this.highlightedVideos.length === 0) {
      if (this.carouselWrapper) {
        this.carouselWrapper.style.display = 'none';
      }
      return;
    }

    if (this.carouselWrapper) {
      this.carouselWrapper.style.display = '';
    }

    this.highlightedVideos.forEach((video, index) => {
      const li = document.createElement('li');
      li.className = 'carousel-slide ' + (index === 0 ? 'active' : '');
      li.innerHTML = `
        <img 
          class="carousel-img" 
          src="${video.thumbnail}" 
          alt="${video.title}" 
          loading="${index === 0 ? 'eager' : 'lazy'}" 
          onerror="if (!this.dataset.retried) { this.dataset.retried = '1'; this.src = 'https://drive.google.com/thumbnail?id=' + encodeURIComponent('${video.driveFileId}') + '&sz=w1600'; } else { this.onerror=null; this.src='https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=1600&q=80'; }"
        />
        <div class="carousel-overlay">
          <div class="carousel-caption">
            <div class="carousel-badge-row">
              <span class="carousel-slide-tag">✨ HIGHLIGHTED VIDEO</span>
              <span class="carousel-wave-badge">${video.wave.toUpperCase()}</span>
            </div>
            <h3 class="carousel-slide-title">${video.title}</h3>
            <p class="carousel-slide-desc">${video.wave} • ${video.designation} • Featured Presentation</p>
            
            <button class="btn btn-primary carousel-play-btn" data-video-id="${video.id}">
              <svg viewBox="0 0 24 24" fill="currentColor" class="btn-icon">
                <polygon points="5 3 19 12 5 21 5 3"></polygon>
              </svg>
              <span>Watch Video</span>
            </button>
          </div>
        </div>
      `;

      // Play button on carousel slide
      const playBtn = li.querySelector('.carousel-play-btn');
      if (playBtn) {
        playBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          this.openTheaterModal(video.id);
        });
      }

      this.carouselTrack.appendChild(li);

      // Indicator Dot
      const dot = document.createElement('button');
      dot.className = 'carousel-dot ' + (index === 0 ? 'active' : '');
      dot.setAttribute('aria-label', 'Go to highlighted video ' + (index + 1));
      dot.addEventListener('click', () => {
        this.goToSlide(index);
      });
      this.carouselIndicators.appendChild(dot);
    });

    this.currentSlideIndex = 0;
    this.goToSlide(0);
    this.startCarouselAutoplay();
  }

  startCarouselAutoplay() {
    this.stopCarouselAutoplay();
    if (this.highlightedVideos.length <= 1) return;

    this.progressStartTime = Date.now();
    this.animateProgressBar();

    this.carouselTimer = setInterval(() => {
      this.nextSlide();
    }, this.carouselDuration);
  }

  stopCarouselAutoplay() {
    if (this.carouselTimer) {
      clearInterval(this.carouselTimer);
      this.carouselTimer = null;
    }
    if (this.progressInterval) {
      cancelAnimationFrame(this.progressInterval);
      this.progressInterval = null;
    }
  }

  animateProgressBar() {
    const updateProgress = () => {
      const elapsed = Date.now() - this.progressStartTime;
      const percentage = Math.min((elapsed / this.carouselDuration) * 100, 100);
      if (this.carouselProgressFill) {
        this.carouselProgressFill.style.width = percentage + '%';
      }
      if (percentage < 100 && this.carouselTimer) {
        this.progressInterval = requestAnimationFrame(updateProgress);
      }
    };
    this.progressInterval = requestAnimationFrame(updateProgress);
  }

  goToSlide(index) {
    const total = this.highlightedVideos.length;
    if (total === 0) return;
    this.currentSlideIndex = (index + total) % total;
    this.carouselTrack.style.transform = 'translateX(-' + (this.currentSlideIndex * 100) + '%)';

    const slides = this.carouselTrack.querySelectorAll('.carousel-slide');
    slides.forEach((slide, idx) => {
      slide.classList.toggle('active', idx === this.currentSlideIndex);
    });

    const dots = this.carouselIndicators.querySelectorAll('.carousel-dot');
    dots.forEach((dot, idx) => {
      dot.classList.toggle('active', idx === this.currentSlideIndex);
    });

    this.startCarouselAutoplay();
  }

  nextSlide() {
    this.goToSlide(this.currentSlideIndex + 1);
  }

  prevSlide() {
    this.goToSlide(this.currentSlideIndex - 1);
  }

  // ===========================================================================
  // 3. Live Google Sheets Sync & Auto-Update
  // ===========================================================================
  initLiveSync() {
    // Immediate initial sync
    this.syncGoogleSheetData();

    // Auto-update live every 15 seconds
    this.syncPollTimer = setInterval(() => {
      this.syncGoogleSheetData();
    }, 15000);

    // Auto-update immediately when returning to tab or focusing window
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        this.syncGoogleSheetData();
      }
    });

    window.addEventListener('focus', () => {
      this.syncGoogleSheetData();
    });
  }

  async syncGoogleSheetData() {
    if (this.isSyncing) return;
    this.isSyncing = true;

    try {
      // Cache-busting timestamp + no-store headers ensure true live updates when the sheet changes
      const syncUrl = GOOGLE_SHEET_CSV_URL + (GOOGLE_SHEET_CSV_URL.includes('?') ? '&' : '?') + '_t=' + Date.now();
      const response = await fetch(syncUrl, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache'
        }
      });
      if (!response.ok) return;
      const csvText = await response.text();
      
      const rows = parseCSV(csvText);
      if (rows.length < 2) return;

      const liveVideos = [];
      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const title = (row[0] || '').trim();
        const link = (row[1] || '').trim();
        const rawDesignation = (row[2] || '').trim();
        const wave = (row[3] || '').trim() || 'Wave 1';

        // Skip header row
        if (i === 0 && !link.toLowerCase().includes('http')) continue;

        // Skip rows without a link
        if (!link) continue;

        // User Rule: If Column C (Designation) is empty, that counts as unuseable, and don't show!
        // Also if Column C says "Unuseable" (or "Unusable"), don't show!
        if (!isUsableDesignation(rawDesignation)) {
          continue;
        }

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

      // Compare data signature to detect actual changes and avoid unnecessary DOM reflow
      const signature = liveVideos.map(v => `${v.driveFileId}_${v.title}_${v.designation}_${v.wave}`).join('||');
      if (this.lastDataSignature === signature) {
        return; // No changes in sheet data
      }
      this.lastDataSignature = signature;

      this.videos = liveVideos;
      this.highlightedVideos = this.extractHighlightedVideos(liveVideos);
      this.updateWaveCounts();
      this.initCarousel();
      this.renderVideoGrid();
    } catch (e) {
      console.warn('Live Sheet sync note:', e.message);
    } finally {
      this.isSyncing = false;
    }
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

  // ===========================================================================
  // 4. Video Gallery & Filtering by Blitz Wave
  // ===========================================================================
  initGallery() {
    this.renderVideoGrid();
  }

  getBadgeClass(designation) {
    const t = (designation || '').toLowerCase();
    if (t.includes('highlight')) return 'badge-highlight';
    if (t.includes('winner')) return 'badge-winner';
    if (t.includes('runner')) return 'badge-runner-up';
    if (t.includes('approved')) return 'badge-approved';
    return 'badge-general';
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

  renderVideoGrid() {
    const filtered = this.getFilteredVideos();
    this.videoGrid.innerHTML = '';
    const currentLabel = this.activeWave === 'all' ? 'All Waves' : this.activeWave;

    if (this.videos.length === 0) {
      if (this.videoCountBadge) {
        this.videoCountBadge.textContent = 'No videos designated yet';
      }
      if (this.emptyState) {
        this.emptyState.style.display = 'flex';
        const emptyTitle = this.emptyState.querySelector('h3');
        const emptyDesc = this.emptyState.querySelector('p');
        if (emptyTitle) emptyTitle.textContent = 'No usable videos designated yet';
        if (emptyDesc) emptyDesc.textContent = 'Videos marked with an approved designation in Column C will appear here automatically.';
      }
      return;
    }

    if (this.videoCountBadge) {
      this.videoCountBadge.textContent = 'Showing ' + filtered.length + ' of ' + this.videos.length + ' videos in ' + currentLabel;
    }

    if (filtered.length === 0) {
      if (this.emptyState) {
        this.emptyState.style.display = 'flex';
        const emptyTitle = this.emptyState.querySelector('h3');
        const emptyDesc = this.emptyState.querySelector('p');
        if (emptyTitle) emptyTitle.textContent = 'No videos found';
        if (emptyDesc) emptyDesc.textContent = 'Try adjusting your search terms or selecting another wave.';
      }
      return;
    }

    if (this.emptyState) {
      this.emptyState.style.display = 'none';
    }

    filtered.forEach((video) => {
      const badgeClass = this.getBadgeClass(video.designation);
      const isHighlight = video.designation.toLowerCase().includes('highlight');
      const isWinner = video.designation.toLowerCase().includes('winner');
      const isRunner = video.designation.toLowerCase().includes('runner');

      const card = document.createElement('div');
      card.className = 'video-card ' + (isHighlight ? 'card-highlight' : (isWinner ? 'card-winner' : (isRunner ? 'card-runner' : '')));
      card.setAttribute('role', 'button');
      card.setAttribute('tabindex', '0');
      card.setAttribute('data-id', video.id);
      card.setAttribute('aria-label', 'Play ' + video.title);

      card.innerHTML = `
        <div class="video-thumb-wrap">
          <img 
            class="video-thumb-img" 
            src="${video.thumbnail}" 
            alt="${video.title}" 
            loading="lazy" 
            onerror="if (!this.dataset.retried) { this.dataset.retried = '1'; this.src = 'https://drive.google.com/thumbnail?id=' + encodeURIComponent('${video.driveFileId}') + '&sz=w800'; } else { this.onerror=null; this.src='https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=800&q=80'; }"
          />

          <!-- Preview Frame Placeholder Container for Hover-to-Play -->
          <div class="preview-iframe-slot"></div>

          <div class="thumb-badges">
            <span class="type-pill ${badgeClass}">
              ${isHighlight ? '✨ ' : (isWinner ? '🏆 ' : (isRunner ? '🥈 ' : ''))}${video.designation.toUpperCase()}
            </span>
          </div>

          <div class="hover-scrub-bar">
            <div class="hover-scrub-progress"></div>
          </div>
        </div>

        <div class="video-card-body">
          <h3 class="video-title">${video.title}</h3>
          <div class="video-meta-row">
            <span class="video-wave-tag">${video.wave}</span>
            <span class="video-click-prompt">
              <span>Watch</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </span>
          </div>
        </div>
      `;

      // Aspect Ratio Caching & Detection
      if (!this.aspectRatioCache) this.aspectRatioCache = {};

      const applyAspect = (ratio) => {
        const isPortrait = ratio < 0.85;
        video.isPortrait = isPortrait;
        video.aspectRatio = ratio;
        card.classList.toggle('is-portrait', isPortrait);
        card.classList.toggle('is-landscape', !isPortrait);
        card.style.setProperty('--content-aspect', ratio.toFixed(4));
      };

      if (this.aspectRatioCache[video.driveFileId]) {
        applyAspect(this.aspectRatioCache[video.driveFileId]);
      } else {
        const thumbImg = card.querySelector('.video-thumb-img');
        const detect = () => {
          if (thumbImg.naturalWidth && thumbImg.naturalHeight) {
            const ratio = thumbImg.naturalWidth / thumbImg.naturalHeight;
            this.aspectRatioCache[video.driveFileId] = ratio;
            applyAspect(ratio);
          }
        };
        if (thumbImg.complete && thumbImg.naturalWidth) {
          detect();
        } else {
          thumbImg.addEventListener('load', detect);
        }
      }

      // Setup Hover-to-Play
      this.attachHoverPreviewListeners(card, video);

      // Setup Click to Open Theater Modal
      card.addEventListener('click', () => {
        this.openTheaterModal(video.id);
      });

      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.openTheaterModal(video.id);
        }
      });

      this.videoGrid.appendChild(card);
    });
  }

  attachHoverPreviewListeners(card, video) {
    const slot = card.querySelector('.preview-iframe-slot');
    const scrubBar = card.querySelector('.hover-scrub-progress');
    let hoverTimer = null;

    const startHoverPreview = () => {
      card.classList.add('is-playing');
      
      if (slot && !slot.hasChildNodes()) {
        const iframe = document.createElement('iframe');
        iframe.className = 'video-preview-iframe';
        const sep = video.videoUrl.includes('?') ? '&' : '?';
        iframe.src = video.videoUrl + sep + 'autoplay=1&mute=1';
        iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen';
        iframe.loading = 'eager';

        const revealPreview = () => {
          if (card.classList.contains('is-playing')) {
            slot.classList.add('is-loaded');
          }
        };

        iframe.addEventListener('load', revealPreview);
        setTimeout(revealPreview, 700);

        slot.appendChild(iframe);
      }

      if (scrubBar) {
        scrubBar.style.transition = 'width 10s linear';
        scrubBar.style.width = '100%';
      }
    };

    const stopHoverPreview = () => {
      card.classList.remove('is-playing');
      if (slot) {
        slot.classList.remove('is-loaded');
        slot.innerHTML = '';
      }
      if (scrubBar) {
        scrubBar.style.transition = 'none';
        scrubBar.style.width = '0%';
      }
    };

    card.addEventListener('mouseenter', () => {
      hoverTimer = setTimeout(startHoverPreview, 220);
    });

    card.addEventListener('mouseleave', () => {
      clearTimeout(hoverTimer);
      stopHoverPreview();
    });
  }

  // ===========================================================================
  // 5. Theater Video Modal (Expanded Player with Auto-Play)
  // ===========================================================================
  openTheaterModal(videoId) {
    const filtered = this.getFilteredVideos();
    const index = filtered.findIndex(v => v.id === videoId);
    const video = index !== -1 ? filtered[index] : this.videos.find(v => v.id === videoId);
    if (!video) return;

    this.currentModalIndex = index !== -1 ? index : 0;

    this.modalTitle.textContent = video.title;
    this.modalDesc.textContent = video.wave + ' • ' + video.designation + ' • Google Drive Full Playback';
    this.modalCategoryBadge.textContent = (video.wave + ' • ' + video.designation).toUpperCase();
    if (this.modalDriveLink) this.modalDriveLink.href = video.driveUrl;

    const footerDriveBtn = document.getElementById('modal-footer-drive-btn');
    if (footerDriveBtn) footerDriveBtn.href = video.driveUrl;

    const directLink = document.getElementById('modal-drive-direct-link');
    if (directLink) directLink.href = video.driveUrl;

    const playbackNotice = document.getElementById('modal-playback-notice');
    const noticeText = document.getElementById('modal-playback-notice-text');
    const isMov = (video.title && video.title.toLowerCase().includes('.mov')) || 
                  (video.driveUrl && video.driveUrl.toLowerCase().includes('.mov'));
    if (playbackNotice) {
      playbackNotice.style.display = isMov ? 'flex' : 'none';
      if (isMov && noticeText) {
        noticeText.textContent = 'Apple QuickTime (.MOV) video:';
      }
    }

    // Clear and render player frame with explicit autoplay
    this.theaterPlayerContainer.innerHTML = '';
    
    // Check if current video is portrait
    const activeCard = this.videoGrid ? this.videoGrid.querySelector(`[data-id="${video.id}"]`) : null;
    const isPort = video.isPortrait || 
                   (activeCard && activeCard.classList.contains('is-portrait')) || 
                   (this.aspectRatioCache && this.aspectRatioCache[video.driveFileId] < 0.85);
    const theaterCard = this.theaterModal.querySelector('.theater-card');
    if (theaterCard) {
      theaterCard.classList.toggle('is-portrait', !!isPort);
    }

    const iframe = document.createElement('iframe');
    iframe.className = 'theater-iframe-element';
    const sep = video.videoUrl.includes('?') ? '&' : '?';
    iframe.src = video.videoUrl + sep + 'autoplay=1';
    iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen';
    iframe.allowFullscreen = true;
    this.theaterPlayerContainer.appendChild(iframe);

    this.theaterModal.classList.add('active');
    this.theaterModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  closeTheaterModal() {
    this.theaterModal.classList.remove('active');
    this.theaterModal.setAttribute('aria-hidden', 'true');
    this.theaterPlayerContainer.innerHTML = '';
    document.body.style.overflow = '';
  }

  navigateTheater(direction) {
    const filtered = this.getFilteredVideos();
    if (filtered.length === 0) return;
    const newIndex = (this.currentModalIndex + direction + filtered.length) % filtered.length;
    this.openTheaterModal(filtered[newIndex].id);
  }

  toggleFullscreen() {
    if (!document.fullscreenElement) {
      this.theaterPlayerContainer.requestFullscreen?.().catch(err => console.log(err));
    } else {
      document.exitFullscreen?.();
    }
  }

  // ===========================================================================
  // 6. Event Listeners
  // ===========================================================================
  initEventListeners() {
    // Carousel Controls
    if (this.carouselNextBtn) this.carouselNextBtn.addEventListener('click', () => this.nextSlide());
    if (this.carouselPrevBtn) this.carouselPrevBtn.addEventListener('click', () => this.prevSlide());

    if (this.carouselWrapper) {
      this.carouselWrapper.addEventListener('mouseenter', () => this.stopCarouselAutoplay());
      this.carouselWrapper.addEventListener('mouseleave', () => this.startCarouselAutoplay());
    }

    // Search & Wave Filter
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

    // Close Modal Bindings
    if (this.modalCloseBtn) {
      this.modalCloseBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.closeTheaterModal();
      });
    }
    if (this.modalFloatingClose) {
      this.modalFloatingClose.addEventListener('click', (e) => {
        e.stopPropagation();
        this.closeTheaterModal();
      });
    }

    if (this.modalPrevBtn) this.modalPrevBtn.addEventListener('click', (e) => { e.stopPropagation(); this.navigateTheater(-1); });
    if (this.modalNextBtn) this.modalNextBtn.addEventListener('click', (e) => { e.stopPropagation(); this.navigateTheater(1); });
    if (this.modalFullscreenBtn) this.modalFullscreenBtn.addEventListener('click', (e) => { e.stopPropagation(); this.toggleFullscreen(); });
    
    // Close modal on backdrop click
    if (this.theaterModal) {
      this.theaterModal.addEventListener('click', (e) => {
        if (e.target === this.theaterModal) {
          this.closeTheaterModal();
        }
      });
    }

    // Keyboard navigation
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeTheaterModal();
      }
      if (this.theaterModal && this.theaterModal.classList.contains('active')) {
        if (e.key === 'ArrowLeft') this.navigateTheater(-1);
        if (e.key === 'ArrowRight') this.navigateTheater(1);
      }
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.app = new VideoGalleryApp();
});
