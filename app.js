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
// Pre-populated with currently usable videos so the gallery renders instantly,
// even offline, via file:///, or before the live Google Sheet sync completes.
const PRELOADED_VIDEOS = [
  {
    id: 'drive-1KluNxVaagpuGBajxV-aPLiRTLZuJuCWF',
    driveFileId: '1KluNxVaagpuGBajxV-aPLiRTLZuJuCWF',
    title: 'Gemini Magic: From Smart Home Hacks to Creative Canvas Art',
    designation: 'Approved',
    type: 'Approved',
    wave: 'Wave 1',
    category: 'Wave 1',
    duration: 'HD',
    thumbnail: 'https://lh3.googleusercontent.com/d/1KluNxVaagpuGBajxV-aPLiRTLZuJuCWF=s800',
    videoUrl: 'https://drive.google.com/file/d/1KluNxVaagpuGBajxV-aPLiRTLZuJuCWF/preview',
    streamUrl: 'https://drive.google.com/uc?export=download&id=1KluNxVaagpuGBajxV-aPLiRTLZuJuCWF',
    driveUrl: 'https://drive.google.com/file/d/1KluNxVaagpuGBajxV-aPLiRTLZuJuCWF/view',
    description: 'Wave 1'
  },
  {
    id: 'drive-1u0_v1FjOAynwS0cH_vTN-kff2nz-VeX8',
    driveFileId: '1u0_v1FjOAynwS0cH_vTN-kff2nz-VeX8',
    title: 'Unlocking Creative Brilliance with Gemini: From Smart Living to Masterpieces',
    designation: 'Approved',
    type: 'Approved',
    wave: 'Wave 1',
    category: 'Wave 1',
    duration: 'HD',
    thumbnail: 'https://lh3.googleusercontent.com/d/1u0_v1FjOAynwS0cH_vTN-kff2nz-VeX8=s800',
    videoUrl: 'https://drive.google.com/file/d/1u0_v1FjOAynwS0cH_vTN-kff2nz-VeX8/preview',
    streamUrl: 'https://drive.google.com/uc?export=download&id=1u0_v1FjOAynwS0cH_vTN-kff2nz-VeX8',
    driveUrl: 'https://drive.google.com/file/d/1u0_v1FjOAynwS0cH_vTN-kff2nz-VeX8/view',
    description: 'Wave 1'
  },
  {
    id: 'drive-1un9shx6qb1r5hejoMlrJdF-fjmsEvFem',
    driveFileId: '1un9shx6qb1r5hejoMlrJdF-fjmsEvFem',
    title: 'Unlocking Creativity: Exploring Google Gemini in Action',
    designation: 'Approved',
    type: 'Approved',
    wave: 'Wave 1',
    category: 'Wave 1',
    duration: 'HD',
    thumbnail: 'https://lh3.googleusercontent.com/d/1un9shx6qb1r5hejoMlrJdF-fjmsEvFem=s800',
    videoUrl: 'https://drive.google.com/file/d/1un9shx6qb1r5hejoMlrJdF-fjmsEvFem/preview',
    streamUrl: 'https://drive.google.com/uc?export=download&id=1un9shx6qb1r5hejoMlrJdF-fjmsEvFem',
    driveUrl: 'https://drive.google.com/file/d/1un9shx6qb1r5hejoMlrJdF-fjmsEvFem/view',
    description: 'Wave 1'
  },
  {
    id: 'drive-1PSD2PvYXoH2tUxoV1K9kdmTpXN1jpQKp',
    driveFileId: '1PSD2PvYXoH2tUxoV1K9kdmTpXN1jpQKp',
    title: 'Unleashing the Magic: How Google Gemini Transforms Daily Tasks into Works of Art',
    designation: 'Approved',
    type: 'Approved',
    wave: 'Wave 1',
    category: 'Wave 1',
    duration: 'HD',
    thumbnail: 'https://lh3.googleusercontent.com/d/1PSD2PvYXoH2tUxoV1K9kdmTpXN1jpQKp=s800',
    videoUrl: 'https://drive.google.com/file/d/1PSD2PvYXoH2tUxoV1K9kdmTpXN1jpQKp/preview',
    streamUrl: 'https://drive.google.com/uc?export=download&id=1PSD2PvYXoH2tUxoV1K9kdmTpXN1jpQKp',
    driveUrl: 'https://drive.google.com/file/d/1PSD2PvYXoH2tUxoV1K9kdmTpXN1jpQKp/view',
    description: 'Wave 1'
  },
  {
    id: 'drive-1dD7PDjqshOh_4-w2cLbuiRUyzt3Pn7nY',
    driveFileId: '1dD7PDjqshOh_4-w2cLbuiRUyzt3Pn7nY',
    title: 'Unleashing Gemini: From Backyard Barbecues to Creative Masterpieces',
    designation: 'Highlighted',
    type: 'Highlighted',
    wave: 'Wave 1',
    category: 'Wave 1',
    duration: 'HD',
    thumbnail: 'https://lh3.googleusercontent.com/d/1dD7PDjqshOh_4-w2cLbuiRUyzt3Pn7nY=s800',
    videoUrl: 'https://drive.google.com/file/d/1dD7PDjqshOh_4-w2cLbuiRUyzt3Pn7nY/preview',
    streamUrl: 'https://drive.google.com/uc?export=download&id=1dD7PDjqshOh_4-w2cLbuiRUyzt3Pn7nY',
    driveUrl: 'https://drive.google.com/file/d/1dD7PDjqshOh_4-w2cLbuiRUyzt3Pn7nY/view',
    description: 'Wave 1 • Highlighted'
  },
  {
    id: 'drive-1V8w6gGmiFNtd_4ZN0NkQrvdEaKD89dcf',
    driveFileId: '1V8w6gGmiFNtd_4ZN0NkQrvdEaKD89dcf',
    title: 'Unlocking Tomorrow: How Google Gemini Redefines Everyday Magic',
    designation: 'Highlighted',
    type: 'Highlighted',
    wave: 'Wave 1',
    category: 'Wave 1',
    duration: 'HD',
    thumbnail: 'https://lh3.googleusercontent.com/d/1V8w6gGmiFNtd_4ZN0NkQrvdEaKD89dcf=s800',
    videoUrl: 'https://drive.google.com/file/d/1V8w6gGmiFNtd_4ZN0NkQrvdEaKD89dcf/preview',
    streamUrl: 'https://drive.google.com/uc?export=download&id=1V8w6gGmiFNtd_4ZN0NkQrvdEaKD89dcf',
    driveUrl: 'https://drive.google.com/file/d/1V8w6gGmiFNtd_4ZN0NkQrvdEaKD89dcf/view',
    description: 'Wave 1 • Highlighted'
  },
  {
    id: 'drive-19hvACWVY5b_ysk50aTTZf5pHGp7xvXT0',
    driveFileId: '19hvACWVY5b_ysk50aTTZf5pHGp7xvXT0',
    title: 'Gemini in Action: From Canvas Masterpieces to Smart Life Hacks',
    designation: 'Highlighted',
    type: 'Highlighted',
    wave: 'Wave 1',
    category: 'Wave 1',
    duration: 'HD',
    thumbnail: 'https://lh3.googleusercontent.com/d/19hvACWVY5b_ysk50aTTZf5pHGp7xvXT0=s800',
    videoUrl: 'https://drive.google.com/file/d/19hvACWVY5b_ysk50aTTZf5pHGp7xvXT0/preview',
    streamUrl: 'https://drive.google.com/uc?export=download&id=19hvACWVY5b_ysk50aTTZf5pHGp7xvXT0',
    driveUrl: 'https://drive.google.com/file/d/19hvACWVY5b_ysk50aTTZf5pHGp7xvXT0/view',
    description: 'Wave 1 • Highlighted'
  }
];

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
      '1KluNxVaagpuGBajxV-aPLiRTLZuJuCWF': 0.5625,
      '1un9shx6qb1r5hejoMlrJdF-fjmsEvFem': 0.5625,
      '1V8w6gGmiFNtd_4ZN0NkQrvdEaKD89dcf': 1.6,
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
      try {
        const desig = (video.designation || '').toLowerCase();
      const badgeClass = this.getBadgeClass(video.designation);
      const isHighlight = desig.includes('highlight');
      const isWinner = desig.includes('winner');
      const isRunner = desig.includes('runner');
      const showThumbBadge = isHighlight || isWinner || isRunner;
      const thumbBadgeHtml = showThumbBadge ? `
          <div class="thumb-badges">
            <span class="type-pill ${badgeClass}">
              ${isHighlight ? '✨ ' : (isWinner ? '🏆 ' : (isRunner ? '🥈 ' : ''))}${video.designation.toUpperCase()}
            </span>
          </div>` : '';

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

          <!-- Preview Frame Container for Hover-to-Play -->
          <div class="preview-iframe-slot"></div>

          ${thumbBadgeHtml}

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
      if (!this.aspectRatioCache) {
        this.aspectRatioCache = {
          '1KluNxVaagpuGBajxV-aPLiRTLZuJuCWF': 0.5625,
          '1u0_v1FjOAynwS0cH_vTN-kff2nz-VeX8': 1.7778,
          '1un9shx6qb1r5hejoMlrJdF-fjmsEvFem': 0.5625,
          '1PSD2PvYXoH2tUxoV1K9kdmTpXN1jpQKp': 1.7778,
          '1dD7PDjqshOh_4-w2cLbuiRUyzt3Pn7nY': 1.7778,
          '1V8w6gGmiFNtd_4ZN0NkQrvdEaKD89dcf': 1.7778,
          '19hvACWVY5b_ysk50aTTZf5pHGp7xvXT0': 1.7778
        };
      }

      const applyAspect = (ratio) => {
        const isPortrait = ratio < 0.95;
        video.isPortrait = isPortrait;
        video.aspectRatio = ratio;
        card.classList.toggle('is-portrait', isPortrait);
        card.classList.toggle('is-landscape', !isPortrait);
        const clamped = Math.max(ratio, 9 / 16);
        card.style.setProperty('--content-aspect', clamped.toFixed(4));
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
      } catch (cardErr) {
        console.error('Error rendering card for video', video.id, cardErr);
      }
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
        slot.appendChild(iframe);
      }

      if (scrubBar) {
        scrubBar.style.transition = 'width 8s linear';
        scrubBar.style.width = '100%';
      }
    };

    const stopHoverPreview = () => {
      card.classList.remove('is-playing');
      if (slot) {
        slot.innerHTML = '';
      }
      if (scrubBar) {
        scrubBar.style.transition = 'none';
        scrubBar.style.width = '0%';
      }
    };

    card.addEventListener('mouseenter', () => {
      hoverTimer = setTimeout(startHoverPreview, 120);
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

    const isApprovedDesig = (video.designation || '').toLowerCase().includes('approved');
    const displayDesig = isApprovedDesig ? 'Featured Video' : video.designation;
    this.modalDesc.textContent = video.wave + (displayDesig ? ' • ' + displayDesig : '') + ' • Google Drive Full Playback';
    this.modalCategoryBadge.textContent = (video.wave + (isApprovedDesig ? '' : ' • ' + video.designation)).toUpperCase();
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

    // Determine exact Orientation & Aspect Ratio
    const activeCard = this.videoGrid ? this.videoGrid.querySelector(`[data-id="${video.id}"]`) : null;
    const cachedAspect = (this.aspectRatioCache && this.aspectRatioCache[video.driveFileId]) || video.aspectRatio;
    
    // Check if portrait: ratio < 0.95 or card has is-portrait class
    const isPort = video.isPortrait || 
                   (activeCard && activeCard.classList.contains('is-portrait')) || 
                   (cachedAspect && cachedAspect < 0.95);

    const theaterCard = this.theaterModal.querySelector('.theater-card');
    const mediaContainer = this.theaterPlayerContainer;

    // Dynamically shape the theater modal window to fit the video orientation
    if (isPort) {
      const portAspect = cachedAspect ? Math.max(cachedAspect, 0.52) : 9 / 16;
      theaterCard.classList.add('is-portrait');
      theaterCard.classList.remove('is-landscape');
      theaterCard.style.maxWidth = `min(440px, calc((84vh - 130px) * ${portAspect}))`;
      mediaContainer.style.aspectRatio = `${portAspect}`;
    } else {
      const landAspect = cachedAspect ? Math.min(cachedAspect, 2.35) : 16 / 9;
      theaterCard.classList.remove('is-portrait');
      theaterCard.classList.add('is-landscape');
      theaterCard.style.maxWidth = `min(92vw, calc((84vh - 130px) * ${landAspect}))`;
      mediaContainer.style.aspectRatio = `${landAspect}`;
    }

    // Clear and render player frame with explicit autoplay
    this.theaterPlayerContainer.innerHTML = '';

    // Set poster as seamless backdrop while Google Drive player initializes
    if (video.thumbnail) {
      this.theaterPlayerContainer.style.backgroundImage = `url('${video.thumbnail}')`;
      this.theaterPlayerContainer.style.backgroundSize = isPort ? 'contain' : 'cover';
      this.theaterPlayerContainer.style.backgroundPosition = 'center center';
      this.theaterPlayerContainer.style.backgroundRepeat = 'no-repeat';
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
    this.theaterPlayerContainer.style.backgroundImage = '';
    const theaterCard = this.theaterModal.querySelector('.theater-card');
    if (theaterCard) {
      theaterCard.style.maxWidth = '';
      theaterCard.classList.remove('is-portrait', 'is-landscape');
    }
    this.theaterPlayerContainer.style.aspectRatio = '';
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

/* =============================================================================
 * 7. Interactive 3D Starry Sky Space Theme (Launch Blitz)
 * ============================================================================= */
class StarrySkyBackground {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');

    this.stars = [];
    this.meteors = [];
    this.dustParticles = [];
    this.mouseTrail = [];

    // Google brand colors for speckled cosmic accent stars & subtle nebulae
    this.googleColors = [
      { r: 66,  g: 133, b: 244, hex: '#4285f4' }, // Google Blue
      { r: 120, g: 201, b: 255, hex: '#78c9ff' }, // Light Blue
      { r: 234, g: 67,  b: 53,  hex: '#ea4335' }, // Google Red
      { r: 255, g: 112, b: 162, hex: '#ff70a2' }, // Soft Coral/Pink
      { r: 251, g: 188, b: 4,   hex: '#fbbc04' }, // Google Yellow
      { r: 255, g: 220, b: 110, hex: '#ffdc6e' }, // Warm Star Gold
      { r: 52,  g: 168, b: 83,  hex: '#34a853' }, // Google Green
      { r: 129, g: 201, b: 149, hex: '#81c995' }, // Soft Emerald
      { r: 161, g: 66,  b: 244, hex: '#a142f4' }, // Google Purple
      { r: 197, g: 138, b: 249, hex: '#c58af9' }  // Lavender
    ];

    this.mouse = { x: -9999, y: -9999, hover: false, speed: 0 };
    this.rotX = 0;
    this.rotY = 0;
    this.targetRotX = 0;
    this.targetRotY = 0;
    this.fov = 680;
    this.isRunning = true;

    this.init();
  }

  init() {
    this.resize();
    window.addEventListener('resize', () => {
      this.resize();
      this.generateStars();
      this.generateDust();
    }, { passive: true });

    // Interactive mouse tracking: 3D parallax tilt & stardust trail
    let prevMouseX = 0;
    let prevMouseY = 0;
    window.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const relX = e.clientX - (rect.left + rect.width / 2);
      const relY = e.clientY - (rect.top + rect.height / 2);
      this.targetRotY = relX * 0.00032;
      this.targetRotX = -relY * 0.00022;

      const canvasX = e.clientX - rect.left;
      const canvasY = e.clientY - rect.top;
      const distMoved = Math.hypot(canvasX - prevMouseX, canvasY - prevMouseY);
      this.mouse.speed = Math.min(distMoved, 30);
      prevMouseX = canvasX;
      prevMouseY = canvasY;

      this.mouse.x = canvasX;
      this.mouse.y = canvasY;
      this.mouse.hover = true;

      // Stardust particle emission on cursor motion
      if (this.mouse.speed > 2.5 && Math.random() < 0.65) {
        const color = Math.random() < 0.35 
          ? this.googleColors[Math.floor(Math.random() * this.googleColors.length)]
          : { r: 255, g: 255, b: 255 };
        this.mouseTrail.push({
          x: this.mouse.x + (Math.random() - 0.5) * 16,
          y: this.mouse.y + (Math.random() - 0.5) * 16,
          vx: (Math.random() - 0.5) * 0.8,
          vy: (Math.random() - 0.5) * 0.8 - 0.35,
          size: Math.random() * 2.2 + 0.9,
          alpha: 0.85,
          decay: 0.018 + Math.random() * 0.018,
          color: color
        });
      }
    }, { passive: true });

    window.addEventListener('mouseleave', () => {
      this.targetRotX = 0;
      this.targetRotY = 0;
      this.mouse.hover = false;
      this.mouse.x = -9999;
      this.mouse.y = -9999;
    });

    this.generateStars();
    this.generateDust();
    this.animate();
  }

  resize() {
    this.width = this.canvas.clientWidth;
    this.height = this.canvas.clientHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.canvas.width = this.width * dpr;
    this.canvas.height = this.height * dpr;
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.scale(dpr, dpr);
  }

  generateStars() {
    this.stars = [];
    const count = 300;
    const spreadX = Math.max(this.width * 1.35, 1700);
    const spreadY = Math.max(this.height * 1.45, 1100);
    const depth = 920;

    for (let i = 0; i < count; i++) {
      // Mostly white stars (~82%), with Google brand colors speckled in (~18%)
      const isGoogleAccent = Math.random() < 0.18;
      let color;
      if (isGoogleAccent) {
        color = this.googleColors[Math.floor(Math.random() * this.googleColors.length)];
      } else {
        const warmth = Math.random();
        if (warmth > 0.85) {
          color = { r: 240, g: 245, b: 255 }; // Diamond ice white
        } else if (warmth > 0.70) {
          color = { r: 255, g: 248, b: 235 }; // Warm stellar white
        } else {
          color = { r: 255, g: 255, b: 255 }; // Pure brilliant white
        }
      }

      // Prominent stars with 4-point celestial diffraction spikes
      const hasDiffractionSpike = isGoogleAccent ? (Math.random() < 0.25) : (Math.random() < 0.08);

      this.stars.push({
        origX: (Math.random() - 0.5) * spreadX,
        origY: (Math.random() - 0.5) * spreadY,
        origZ: (Math.random() - 0.5) * depth,
        x: 0, y: 0, z: 0,
        x2d: 0, y2d: 0, scale: 0,
        baseRadius: Math.random() * 1.6 + 0.8,
        color: color,
        isGoogleAccent: isGoogleAccent,
        hasSpike: hasDiffractionSpike,
        twinkleSpeed: 0.0016 + Math.random() * 0.0035,
        twinklePhase: Math.random() * Math.PI * 2,
        dispX: 0,
        dispY: 0,
        vx: 0,
        vy: 0
      });
    }
  }

  generateDust() {
    this.dustParticles = [];
    for (let i = 0; i < 50; i++) {
      this.dustParticles.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        vx: (Math.random() - 0.5) * 0.22,
        vy: (Math.random() - 0.5) * 0.18 - 0.06,
        radius: Math.random() * 2.2 + 0.8,
        alpha: Math.random() * 0.35 + 0.1,
        color: Math.random() < 0.35
          ? this.googleColors[Math.floor(Math.random() * this.googleColors.length)]
          : { r: 255, g: 255, b: 255 }
      });
    }
  }

  spawnMeteor() {
    const startX = Math.random() * (this.width * 0.8) + this.width * 0.1;
    const startY = Math.random() * (this.height * 0.4);
    const length = Math.random() * 95 + 75;
    const speed = Math.random() * 9 + 13;
    const angle = Math.PI / 4 + (Math.random() - 0.5) * 0.35;
    const color = Math.random() < 0.45 
      ? this.googleColors[Math.floor(Math.random() * this.googleColors.length)]
      : { r: 255, g: 255, b: 255 };

    this.meteors.push({
      x: startX,
      y: startY,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      length: length,
      opacity: 1.0,
      decay: 0.022 + Math.random() * 0.015,
      color: color
    });
  }

  project(now) {
    const cx = this.width / 2;
    const cy = this.height / 2;

    const cosX = Math.cos(this.rotX);
    const sinX = Math.sin(this.rotX);
    const cosY = Math.cos(this.rotY);
    const sinY = Math.sin(this.rotY);

    for (let i = 0; i < this.stars.length; i++) {
      const s = this.stars[i];

      // Smooth space drift forward (launch journey through cosmos)
      s.origZ -= 0.28;
      if (s.origZ < -this.fov + 40) {
        s.origZ += 880;
      }

      // 3D rotation from parallax
      const x1 = s.origX * cosY - s.origZ * sinY;
      const z1 = s.origZ * cosY + s.origX * sinY;
      const y2 = s.origY * cosX - z1 * sinX;
      const z2 = z1 * cosX + s.origY * sinX;

      s.x = x1;
      s.y = y2;
      s.z = z2;

      const f = this.fov / (this.fov + z2);
      s.scale = f;

      s.x2d = cx + x1 * f + s.dispX;
      s.y2d = cy + y2 * f + s.dispY;

      // Interactive mouse repulsion/gravitational wave
      if (this.mouse.hover) {
        const dx = s.x2d - this.mouse.x;
        const dy = s.y2d - this.mouse.y;
        const dist = Math.hypot(dx, dy);
        const maxInteractDist = 135;

        if (dist < maxInteractDist && dist > 1) {
          const force = (1 - dist / maxInteractDist) * 3.6;
          s.vx += (dx / dist) * force;
          s.vy += (dy / dist) * force;
        }
      }

      // Spring damping return
      s.vx += -s.dispX * 0.08;
      s.vy += -s.dispY * 0.08;
      s.vx *= 0.88;
      s.vy *= 0.88;
      s.dispX += s.vx;
      s.dispY += s.vy;
    }
  }

  render(now) {
    this.ctx.clearRect(0, 0, this.width, this.height);

    // 1. Soft deep-space cosmic nebulae (Google Blue & Google Purple hints)
    const bgGrad1 = this.ctx.createRadialGradient(
      this.width * 0.32, this.height * 0.45, 0,
      this.width * 0.32, this.height * 0.45, this.width * 0.45
    );
    bgGrad1.addColorStop(0, 'rgba(66, 133, 244, 0.065)');
    bgGrad1.addColorStop(1, 'transparent');
    this.ctx.fillStyle = bgGrad1;
    this.ctx.fillRect(0, 0, this.width, this.height);

    const bgGrad2 = this.ctx.createRadialGradient(
      this.width * 0.72, this.height * 0.55, 0,
      this.width * 0.72, this.height * 0.55, this.width * 0.38
    );
    bgGrad2.addColorStop(0, 'rgba(161, 66, 244, 0.045)');
    bgGrad2.addColorStop(1, 'transparent');
    this.ctx.fillStyle = bgGrad2;
    this.ctx.fillRect(0, 0, this.width, this.height);

    // 2. Cosmic Dust Motes
    for (let i = 0; i < this.dustParticles.length; i++) {
      const d = this.dustParticles[i];
      d.x += d.vx;
      d.y += d.vy;
      if (d.x < 0) d.x = this.width;
      if (d.x > this.width) d.x = 0;
      if (d.y < 0) d.y = this.height;
      if (d.y > this.height) d.y = 0;

      this.ctx.beginPath();
      this.ctx.arc(d.x, d.y, d.radius, 0, Math.PI * 2);
      this.ctx.fillStyle = `rgba(${d.color.r}, ${d.color.g}, ${d.color.b}, ${d.alpha})`;
      this.ctx.fill();
    }

    // -------------------------------------------------------------
    // 4. Interactive Constellation Lines Near Mouse
    // -------------------------------------------------------------
    if (this.mouse.hover) {
      this.ctx.beginPath();
      let connectCount = 0;
      for (let i = 0; i < this.stars.length && connectCount < 10; i++) {
        const s = this.stars[i];
        const dist = Math.hypot(s.x2d - this.mouse.x, s.y2d - this.mouse.y);
        if (dist < 115) {
          const alpha = (1 - dist / 115) * 0.28;
          this.ctx.moveTo(this.mouse.x, this.mouse.y);
          this.ctx.lineTo(s.x2d, s.y2d);
          this.ctx.strokeStyle = `rgba(${s.color.r}, ${s.color.g}, ${s.color.b}, ${alpha})`;
          this.ctx.lineWidth = 0.8;
          this.ctx.stroke();
          connectCount++;
        }
      }
    }

    // -------------------------------------------------------------
    // 5. Interactive Stardust Trail
    // -------------------------------------------------------------
    for (let i = this.mouseTrail.length - 1; i >= 0; i--) {
      const p = this.mouseTrail[i];
      p.x += p.vx;
      p.y += p.vy;
      p.alpha -= p.decay;
      if (p.alpha <= 0) {
        this.mouseTrail.splice(i, 1);
        continue;
      }
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.size * p.alpha, 0, Math.PI * 2);
      this.ctx.fillStyle = `rgba(${p.color.r}, ${p.color.g}, ${p.color.b}, ${p.alpha})`;
      this.ctx.fill();
    }

    // -------------------------------------------------------------
    // 6. 3D Stars: mostly crisp white with speckled Google colors
    // -------------------------------------------------------------
    for (let i = 0; i < this.stars.length; i++) {
      const s = this.stars[i];
      if (s.scale <= 0) continue;

      const twinkle = 0.65 + 0.35 * Math.sin(now * s.twinkleSpeed + s.twinklePhase);
      const rad = Math.max(0.6, s.baseRadius * s.scale);
      const baseAlpha = Math.min(1.0, Math.max(0.2, (s.scale - 0.35) * 1.8));
      const finalAlpha = baseAlpha * twinkle;

      const c = s.color;

      // Soft star halo
      if (s.isGoogleAccent || s.scale > 0.9) {
        const haloSize = rad * (s.isGoogleAccent ? 3.4 : 2.4);
        const haloGrad = this.ctx.createRadialGradient(s.x2d, s.y2d, 0, s.x2d, s.y2d, haloSize);
        haloGrad.addColorStop(0, `rgba(${c.r}, ${c.g}, ${c.b}, ${finalAlpha * 0.7})`);
        haloGrad.addColorStop(1, `rgba(${c.r}, ${c.g}, ${c.b}, 0)`);
        this.ctx.beginPath();
        this.ctx.arc(s.x2d, s.y2d, haloSize, 0, Math.PI * 2);
        this.ctx.fillStyle = haloGrad;
        this.ctx.fill();
      }

      // 4-point celestial diffraction spike on prominent stars
      if (s.hasSpike && s.scale > 0.75) {
        const spikeLen = rad * 4.5 * twinkle;
        this.ctx.beginPath();
        this.ctx.moveTo(s.x2d - spikeLen, s.y2d);
        this.ctx.lineTo(s.x2d + spikeLen, s.y2d);
        this.ctx.moveTo(s.x2d, s.y2d - spikeLen);
        this.ctx.lineTo(s.x2d, s.y2d + spikeLen);
        this.ctx.strokeStyle = `rgba(${c.r}, ${c.g}, ${c.b}, ${finalAlpha * 0.45})`;
        this.ctx.lineWidth = 0.9;
        this.ctx.stroke();
      }

      // Star core
      this.ctx.beginPath();
      this.ctx.arc(s.x2d, s.y2d, rad, 0, Math.PI * 2);
      this.ctx.fillStyle = `rgba(${c.r}, ${c.g}, ${c.b}, ${finalAlpha})`;
      this.ctx.fill();
    }

    // -------------------------------------------------------------
    // 6. Shooting Stars / Meteors
    // -------------------------------------------------------------
    for (let m = this.meteors.length - 1; m >= 0; m--) {
      const meteor = this.meteors[m];
      meteor.x += meteor.vx;
      meteor.y += meteor.vy;
      meteor.opacity -= meteor.decay;

      if (meteor.opacity <= 0 || meteor.x > this.width + 100 || meteor.y > this.height + 100) {
        this.meteors.splice(m, 1);
        continue;
      }

      const tailX = meteor.x - (meteor.vx / Math.hypot(meteor.vx, meteor.vy)) * meteor.length;
      const tailY = meteor.y - (meteor.vy / Math.hypot(meteor.vx, meteor.vy)) * meteor.length;

      const meteorGrad = this.ctx.createLinearGradient(tailX, tailY, meteor.x, meteor.y);
      meteorGrad.addColorStop(0, 'rgba(255, 255, 255, 0)');
      meteorGrad.addColorStop(0.7, `rgba(${meteor.color.r}, ${meteor.color.g}, ${meteor.color.b}, ${meteor.opacity * 0.5})`);
      meteorGrad.addColorStop(1, `rgba(255, 255, 255, ${meteor.opacity})`);

      this.ctx.beginPath();
      this.ctx.moveTo(tailX, tailY);
      this.ctx.lineTo(meteor.x, meteor.y);
      this.ctx.strokeStyle = meteorGrad;
      this.ctx.lineWidth = 1.8;
      this.ctx.stroke();

      this.ctx.beginPath();
      this.ctx.arc(meteor.x, meteor.y, 2.2, 0, Math.PI * 2);
      this.ctx.fillStyle = `rgba(255, 255, 255, ${meteor.opacity})`;
      this.ctx.fill();
    }

    if (Math.random() < 0.008 && this.meteors.length < 2) {
      this.spawnMeteor();
    }
  }

  animate() {
    if (!this.isRunning) return;

    const now = performance.now();

    this.rotX += (this.targetRotX - this.rotX) * 0.05;
    this.rotY += (this.targetRotY - this.rotY) * 0.05;

    this.project(now);
    this.render(now);

    requestAnimationFrame(() => this.animate());
  }

  setRunning(running) {
    if (this.isRunning === running) return;
    this.isRunning = running;
    if (running) {
      this.animate();
    }
  }
}

/* =============================================================================
 * 8. Scroll-linked Logo Shrink, Dock, and Frosted Blur Controller
 * ============================================================================= */
class ScrollLogoManager {
  constructor() {
    this.brandLink = document.getElementById('brand-logo');
    this.blurBackdrop = document.getElementById('header-blur-backdrop');
    this.latticeCanvas = document.getElementById('lattice-canvas');
    this.heroStage = document.getElementById('hero-intro-stage');
    this.albumSection = document.querySelector('.album-section');
    this.narrativeCol = document.querySelector('.hero-narrative-col');
    this.carouselCol = document.querySelector('.hero-carousel-col');
    
    this.initialScale = 3.8;   // ~4x logo in initial hero state
    this.finalScale = 1.0;     // standard docked size
    this.scrollDistance = 380; // scroll px to fully dock
    this.ticking = false;

    if (!this.brandLink || !this.heroStage) return;

    this.updateDimensions();
    window.addEventListener('resize', () => this.updateDimensions(), { passive: true });
    window.addEventListener('scroll', () => this.requestScrollUpdate(), { passive: true });

    // Smooth scroll to top on brand click
    this.brandLink.addEventListener('click', (e) => {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    this.onScroll();
  }

  updateDimensions() {
    const heroHeight = this.heroStage.clientHeight || 500;
    const targetCenterY = heroHeight * 0.48; // center of hero stage
    const dockedCenterY = 38;                // docked header center
    this.initialTranslateY = targetCenterY - dockedCenterY;
    
    // Responsive scale & scroll distance
    if (window.innerWidth < 640) {
      this.initialScale = 2.3;
      this.scrollDistance = 260;
    } else if (window.innerWidth < 1024) {
      this.initialScale = 3.0;
      this.scrollDistance = 320;
    } else {
      this.initialScale = 3.8;
      this.scrollDistance = 380;
    }

    this.onScroll();
  }

  requestScrollUpdate() {
    if (!this.ticking) {
      requestAnimationFrame(() => {
        this.onScroll();
        this.ticking = false;
      });
      this.ticking = true;
    }
  }

  onScroll() {
    const scrollY = window.scrollY || window.pageYOffset || 0;
    const rawProgress = scrollY / this.scrollDistance;
    const progress = Math.min(1, Math.max(0, rawProgress));

    // 1. Logo Scale & Translation
    const currentScale = this.initialScale - progress * (this.initialScale - this.finalScale);
    const currentTranslateY = this.initialTranslateY * (1 - progress);

    this.brandLink.style.transform = `translate3d(0, ${currentTranslateY.toFixed(2)}px, 0) scale(${currentScale.toFixed(3)})`;

    // 2. Lattice Canvas Opacity & Parallax
    if (this.latticeCanvas) {
      const latticeOpacity = Math.max(0, 1 - progress * 1.15);
      this.latticeCanvas.style.opacity = latticeOpacity.toFixed(3);
      this.latticeCanvas.style.transform = `translate3d(0, ${-(scrollY * 0.25).toFixed(1)}px, 0)`;

      if (window.latticeEngine) {
        window.latticeEngine.setRunning(progress < 1.0);
      }
    }

    // 3. Header Blur & Darken Backdrop Vignette
    if (this.blurBackdrop) {
      const backdropOpacity = Math.min(1, Math.max(0, (progress - 0.2) / 0.8));
      this.blurBackdrop.style.opacity = backdropOpacity.toFixed(3);
    }

    // 4. Hero Text & Highlight Video Dynamic Exit Animation
    // As the user scrolls past the hero section, the left narrative drifts left and fades,
    // and the right carousel highlight drifts right and fades.
    if (this.albumSection && this.narrativeCol && this.carouselCol) {
      const albumTop = this.albumSection.offsetTop || 520;
      const albumHeight = this.albumSection.offsetHeight || 450;
      // Start exit transition once user starts scrolling down into the album area
      const exitStart = Math.max(0, albumTop - window.innerHeight * 0.55);
      const exitEnd = albumTop + albumHeight * 0.65;
      const exitDistance = Math.max(1, exitEnd - exitStart);

      if (scrollY <= exitStart) {
        // Pristine, full visibility
        this.narrativeCol.style.opacity = '1';
        this.narrativeCol.style.transform = 'translate3d(0, 0, 0)';
        this.carouselCol.style.opacity = '1';
        this.carouselCol.style.transform = 'translate3d(0, 0, 0)';
      } else if (scrollY >= exitEnd) {
        // Fully dispersed
        this.narrativeCol.style.opacity = '0';
        this.narrativeCol.style.transform = 'translate3d(-100px, 0, 0)';
        this.carouselCol.style.opacity = '0';
        this.carouselCol.style.transform = 'translate3d(100px, 0, 0)';
      } else {
        const exitProgress = (scrollY - exitStart) / exitDistance;
        // Smooth ease-in curve for natural drift feel
        const ease = exitProgress * exitProgress;
        const opacity = Math.max(0, 1 - exitProgress * 1.08);
        const shiftDistance = 100 * ease;

        this.narrativeCol.style.opacity = opacity.toFixed(3);
        this.narrativeCol.style.transform = `translate3d(${-shiftDistance.toFixed(1)}px, 0, 0)`;

        this.carouselCol.style.opacity = opacity.toFixed(3);
        this.carouselCol.style.transform = `translate3d(${shiftDistance.toFixed(1)}px, 0, 0)`;
      }
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.app = new VideoGalleryApp();
  window.latticeEngine = new StarrySkyBackground('lattice-canvas');
  window.scrollLogoManager = new ScrollLogoManager();
});
