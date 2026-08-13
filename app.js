/**
 * GBblitz - Dark Mode Video Gallery & Cycling Photo Showcase
 * Handles carousel autoplay, hover-to-play video thumbnails, theater player modal,
 * and Google Drive folder parsing/integration.
 */

// =============================================================================
// 1. Initial State & Data Store
// =============================================================================

const DEFAULT_DRIVE_FOLDER_ID = '18x3yVSkUv8jiAAeRnQ8CgeOBkzgiVx6uufIjG6rVmSYbzu75VALwxyi5ra19LFmg_5F2NxFA';
const DEFAULT_DRIVE_FOLDER_URL = `https://drive.google.com/drive/folders/${DEFAULT_DRIVE_FOLDER_ID}?usp=sharing`;

// Placeholder Slides for Top Photo Album
const ALBUM_SLIDES = [
  {
    id: 1,
    tag: 'Cinematic Stills',
    title: 'Neon Odyssey: Cyber Metropolises',
    description: 'High-contrast nocturnal horizons and electric city aesthetics.',
    image: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1600&q=80'
  },
  {
    id: 2,
    tag: 'Nature Expeditions',
    title: 'Alpine Horizons & Nordic Fjords',
    description: 'Breathtaking 8K landscape frames captured across sub-zero terrains.',
    image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1600&q=80'
  },
  {
    id: 3,
    tag: 'Urban Architecture',
    title: 'Monolithic Geometry & Modernity',
    description: 'Sculptural architectural profiles against golden hour twilight.',
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1600&q=80'
  },
  {
    id: 4,
    tag: 'Deep Cosmos',
    title: 'Solar Winds & Nebular Drift',
    description: 'Long-exposure celestial captures from high-altitude observatories.',
    image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1600&q=80'
  }
];

// Rich Video Collection (Includes Google Drive integration items and high-res video samples)
const INITIAL_VIDEOS = [
  {
    id: 'vid-drive-1',
    driveFolderId: DEFAULT_DRIVE_FOLDER_ID,
    driveFileId: '18x3yVSkUv8jiAAeRnQ8CgeOBkzgiVx6uufIjG6rVmSYbzu75VALwxyi5ra19LFmg_5F2NxFA',
    title: 'Drive Showcase: Hyper-lapse Cyber Highway',
    category: 'drive',
    duration: '0:24',
    thumbnail: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=800&q=80',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    driveUrl: DEFAULT_DRIVE_FOLDER_URL,
    description: 'Synced from Google Drive Folder. Fast-paced light trails through midnight downtown corridors.'
  },
  {
    id: 'vid-drive-2',
    driveFolderId: DEFAULT_DRIVE_FOLDER_ID,
    driveFileId: '1A2B3C4D5E6F7G8H9I0J-demo2',
    title: 'Drive Reel: Volcanic Dawn Ascent',
    category: 'drive',
    duration: '0:30',
    thumbnail: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    driveUrl: DEFAULT_DRIVE_FOLDER_URL,
    description: 'Cinematic 4K drone sweep across misty peaks and volcanic ridges.'
  },
  {
    id: 'vid-cinematic-1',
    title: 'Oceanic Surge: Deep Pacific Waves',
    category: 'cinematic',
    duration: '0:15',
    thumbnail: 'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?auto=format&fit=crop&w=800&q=80',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
    driveUrl: DEFAULT_DRIVE_FOLDER_URL,
    description: 'High frame-rate slow motion study of shoreline breaker dynamics.'
  },
  {
    id: 'vid-nature-1',
    title: 'Boreal Aurora & Starlight Expedition',
    category: 'nature',
    duration: '0:28',
    thumbnail: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?auto=format&fit=crop&w=800&q=80',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4',
    driveUrl: DEFAULT_DRIVE_FOLDER_URL,
    description: 'Night sky time-lapse tracking geomagnetic auroral ribbons.'
  },
  {
    id: 'vid-cinematic-2',
    title: 'Urban Geometry: Concrete & Glass',
    category: 'cinematic',
    duration: '0:18',
    thumbnail: 'https://images.unsplash.com/photo-1477959858617-67f30bc75b82?auto=format&fit=crop&w=800&q=80',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
    driveUrl: DEFAULT_DRIVE_FOLDER_URL,
    description: 'Sleek architectural perspectives capturing reflections and industrial design.'
  },
  {
    id: 'vid-nature-2',
    title: 'Canyon Mist & Desert Solitude',
    category: 'nature',
    duration: '0:22',
    thumbnail: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=800&q=80',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',
    driveUrl: DEFAULT_DRIVE_FOLDER_URL,
    description: 'Early sunrise illuminating red sandstone monuments and expansive skies.'
  }
];

class VideoGalleryApp {
  constructor() {
    this.driveFolderId = localStorage.getItem('gbblitz_drive_folder_id') || DEFAULT_DRIVE_FOLDER_ID;
    this.driveApiKey = localStorage.getItem('gbblitz_drive_api_key') || '';
    
    // Load videos from local storage or fallback to initial
    const storedVideos = localStorage.getItem('gbblitz_videos');
    this.videos = storedVideos ? JSON.parse(storedVideos) : INITIAL_VIDEOS;
    
    this.activeCategory = 'all';
    this.searchQuery = '';
    this.currentModalIndex = -1;
    this.currentSlideIndex = 0;
    this.carouselTimer = null;
    this.carouselDuration = 5000; // 5 seconds per slide
    this.progressInterval = null;
    this.progressStartTime = 0;

    this.initElements();
    this.initCarousel();
    this.initGallery();
    this.initModals();
    this.initEventListeners();
    this.updateDriveDisplay();
  }

  // ===========================================================================
  // DOM Elements Initialization
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
    this.categoryFilters = document.getElementById('category-filters');
    this.videoCountBadge = document.getElementById('video-count-badge');
    this.emptyState = document.getElementById('empty-state');
    this.activeFolderDisplay = document.getElementById('active-folder-display');

    // Theater Modal Elements
    this.theaterModal = document.getElementById('theater-modal');
    this.modalTitle = document.getElementById('modal-title');
    this.modalDesc = document.getElementById('modal-desc');
    this.modalCategoryBadge = document.getElementById('modal-category-badge');
    this.modalDriveLink = document.getElementById('modal-drive-link');
    this.theaterPlayerContainer = document.getElementById('theater-player-container');
    this.modalCloseBtn = document.getElementById('modal-close-btn');
    this.modalPrevBtn = document.getElementById('modal-prev-btn');
    this.modalNextBtn = document.getElementById('modal-next-btn');
    this.modalFullscreenBtn = document.getElementById('modal-fullscreen-btn');

    // Drive Config Elements
    this.driveConfigModal = document.getElementById('drive-config-modal');
    this.openDriveSettingsBtn = document.getElementById('open-drive-settings-btn');
    this.addVideoBtn = document.getElementById('add-video-btn');
    this.configCloseBtn = document.getElementById('config-close-btn');
    this.driveConfigForm = document.getElementById('drive-config-form');
    this.driveFolderInput = document.getElementById('drive-folder-input');
    this.driveApiKeyInput = document.getElementById('drive-api-key-input');
    this.resetDefaultDriveBtn = document.getElementById('reset-default-drive-btn');
    this.quickAddVideoForm = document.getElementById('quick-add-video-form');
  }

  // ===========================================================================
  // 2. Cycling Photo Album Carousel
  // ===========================================================================
  initCarousel() {
    this.carouselTrack.innerHTML = '';
    this.carouselIndicators.innerHTML = '';

    ALBUM_SLIDES.forEach((slide, index) => {
      // Create Slide
      const li = document.createElement('li');
      li.className = `carousel-slide ${index === 0 ? 'active' : ''}`;
      li.innerHTML = `
        <img class="carousel-img" src="${slide.image}" alt="${slide.title}" loading="${index === 0 ? 'eager' : 'lazy'}" />
        <div class="carousel-overlay">
          <div class="carousel-caption">
            <span class="carousel-slide-tag">${slide.tag}</span>
            <h3 class="carousel-slide-title">${slide.title}</h3>
            <p class="carousel-slide-desc">${slide.description}</p>
          </div>
        </div>
      `;
      this.carouselTrack.appendChild(li);

      // Create Indicator Dot
      const dot = document.createElement('button');
      dot.className = `carousel-dot ${index === 0 ? 'active' : ''}`;
      dot.setAttribute('aria-label', `Go to slide ${index + 1}`);
      dot.addEventListener('click', () => this.goToSlide(index));
      this.carouselIndicators.appendChild(dot);
    });

    this.startCarouselAutoplay();
  }

  startCarouselAutoplay() {
    this.stopCarouselAutoplay();
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
        this.carouselProgressFill.style.width = `${percentage}%`;
      }
      if (percentage < 100 && this.carouselTimer) {
        this.progressInterval = requestAnimationFrame(updateProgress);
      }
    };
    this.progressInterval = requestAnimationFrame(updateProgress);
  }

  goToSlide(index) {
    const total = ALBUM_SLIDES.length;
    this.currentSlideIndex = (index + total) % total;
    this.carouselTrack.style.transform = `translateX(-${this.currentSlideIndex * 100}%)`;

    // Update active classes
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
  // 3. Video Gallery & Hover-to-Play Thumbnails
  // ===========================================================================
  initGallery() {
    this.renderVideoGrid();
  }

  getFilteredVideos() {
    return this.videos.filter(video => {
      const matchesCategory = this.activeCategory === 'all' || video.category === this.activeCategory;
      const q = this.searchQuery.toLowerCase().trim();
      const matchesSearch = !q || 
        video.title.toLowerCase().includes(q) || 
        (video.description && video.description.toLowerCase().includes(q)) ||
        (video.category && video.category.toLowerCase().includes(q));
      return matchesCategory && matchesSearch;
    });
  }

  renderVideoGrid() {
    const filtered = this.getFilteredVideos();
    this.videoGrid.innerHTML = '';
    this.videoCountBadge.textContent = `Showing ${filtered.length} ${filtered.length === 1 ? 'video' : 'videos'}`;

    if (filtered.length === 0) {
      this.emptyState.style.display = 'flex';
      return;
    }
    this.emptyState.style.display = 'none';

    filtered.forEach((video) => {
      const card = document.createElement('div');
      card.className = 'video-card';
      card.setAttribute('role', 'button');
      card.setAttribute('tabindex', '0');
      card.setAttribute('aria-label', `Play ${video.title}`);

      card.innerHTML = `
        <div class="video-thumb-wrap">
          <img class="video-thumb-img" src="${video.thumbnail}" alt="${video.title}" loading="lazy" />
          
          <video 
            class="video-preview-player" 
            src="${video.videoUrl}" 
            muted 
            loop 
            playsinline 
            preload="none"
          ></video>

          <div class="thumb-badges">
            <span class="drive-pill">
              <svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor">
                <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z"></path>
              </svg>
              <span>${video.category.toUpperCase()}</span>
            </span>
            <span class="duration-pill">${video.duration || '0:30'}</span>
          </div>

          <div class="hover-play-indicator">
            <span class="pulse-dot"></span>
            <span>Playing Preview</span>
          </div>

          <div class="hover-scrub-bar">
            <div class="hover-scrub-progress"></div>
          </div>
        </div>

        <div class="video-card-body">
          <h3 class="video-title">${video.title}</h3>
          <div class="video-meta-row">
            <span class="video-category-tag">${video.category}</span>
            <span class="video-click-prompt">
              <span>Watch full</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </span>
          </div>
        </div>
      `;

      // Setup Hover-to-Play Video logic
      this.attachHoverPreviewListeners(card);

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

  attachHoverPreviewListeners(card) {
    const videoElem = card.querySelector('.video-preview-player');
    const scrubProgress = card.querySelector('.hover-scrub-progress');
    let playTimeout = null;

    const startPreview = () => {
      card.classList.add('is-playing');
      if (videoElem) {
        videoElem.currentTime = 0;
        const playPromise = videoElem.play();
        if (playPromise !== undefined) {
          playPromise.catch(() => {
            // Auto-play was prevented or video source needs loading
          });
        }
      }
    };

    const stopPreview = () => {
      card.classList.remove('is-playing');
      if (videoElem) {
        videoElem.pause();
        videoElem.currentTime = 0;
      }
      if (scrubProgress) {
        scrubProgress.style.width = '0%';
      }
    };

    // Track scrub bar progression
    if (videoElem && scrubProgress) {
      videoElem.addEventListener('timeupdate', () => {
        if (videoElem.duration) {
          const percent = (videoElem.currentTime / videoElem.duration) * 100;
          scrubProgress.style.width = `${percent}%`;
        }
      });
    }

    card.addEventListener('mouseenter', () => {
      // Small debounce for rapid cursor passing
      playTimeout = setTimeout(startPreview, 80);
    });

    card.addEventListener('mouseleave', () => {
      clearTimeout(playTimeout);
      stopPreview();
    });
  }

  // ===========================================================================
  // 4. Theater Video Modal (Expanded Player)
  // ===========================================================================
  openTheaterModal(videoId) {
    const filtered = this.getFilteredVideos();
    const index = filtered.findIndex(v => v.id === videoId);
    if (index === -1) return;

    this.currentModalIndex = index;
    const video = filtered[index];

    this.modalTitle.textContent = video.title;
    this.modalDesc.textContent = video.description || 'Full playback from connected video stream.';
    this.modalCategoryBadge.textContent = video.category.toUpperCase();
    this.modalDriveLink.href = video.driveUrl || DEFAULT_DRIVE_FOLDER_URL;

    // Render Player Frame
    this.theaterPlayerContainer.innerHTML = '';
    
    // If it's a Google Drive preview or direct stream
    if (video.videoUrl.includes('drive.google.com/file/d/')) {
      const iframe = document.createElement('iframe');
      iframe.className = 'theater-iframe-element';
      iframe.src = video.videoUrl.replace('/view', '/preview');
      iframe.allow = 'autoplay; fullscreen';
      iframe.allowFullscreen = true;
      this.theaterPlayerContainer.appendChild(iframe);
    } else {
      const videoElem = document.createElement('video');
      videoElem.className = 'theater-video-element';
      videoElem.src = video.videoUrl;
      videoElem.controls = true;
      videoElem.autoplay = true;
      videoElem.playsInline = true;
      this.theaterPlayerContainer.appendChild(videoElem);
    }

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
  // 5. Drive Configuration & Custom Additions
  // ===========================================================================
  openConfigModal() {
    this.driveFolderInput.value = this.driveFolderId;
    this.driveApiKeyInput.value = this.driveApiKey;
    this.driveConfigModal.classList.add('active');
    this.driveConfigModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  closeConfigModal() {
    this.driveConfigModal.classList.remove('active');
    this.driveConfigModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  extractDriveFolderId(input) {
    if (!input) return DEFAULT_DRIVE_FOLDER_ID;
    const match = input.match(/folders\/([a-zA-Z0-9_-]+)/);
    return match ? match[1] : input.trim();
  }

  extractDriveFileId(input) {
    const match = input.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
    return match ? match[1] : null;
  }

  updateDriveDisplay() {
    if (this.activeFolderDisplay) {
      this.activeFolderDisplay.textContent = this.driveFolderId;
    }
  }

  saveDriveConfig(folderInput, apiKeyInput) {
    const parsedId = this.extractDriveFolderId(folderInput);
    this.driveFolderId = parsedId;
    this.driveApiKey = apiKeyInput.trim();

    localStorage.setItem('gbblitz_drive_folder_id', this.driveFolderId);
    localStorage.setItem('gbblitz_drive_api_key', this.driveApiKey);

    this.updateDriveDisplay();
    this.closeConfigModal();

    // If API Key is provided, attempt Drive fetch
    if (this.driveApiKey) {
      this.fetchGoogleDriveFolderFiles(this.driveFolderId, this.driveApiKey);
    } else {
      this.renderVideoGrid();
    }
  }

  async fetchGoogleDriveFolderFiles(folderId, apiKey) {
    try {
      const url = `https://www.googleapis.com/drive/v3/files?q='${folderId}'+in+parents+and+mimeType+contains+'video/'&key=${apiKey}&fields=files(id,name,mimeType,thumbnailLink,webContentLink)`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch from Google Drive API');
      const data = await res.json();
      
      if (data.files && data.files.length > 0) {
        const driveVideos = data.files.map(file => ({
          id: `drive-${file.id}`,
          title: file.name.replace(/\.[^/.]+$/, ''),
          category: 'drive',
          duration: 'Drive',
          thumbnail: file.thumbnailLink ? file.thumbnailLink.replace('=s220', '=s800') : 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
          videoUrl: `https://drive.google.com/file/d/${file.id}/preview`,
          driveUrl: `https://drive.google.com/file/d/${file.id}/view`,
          description: 'Loaded dynamically from Google Drive.'
        }));

        this.videos = [...driveVideos, ...this.videos];
        localStorage.setItem('gbblitz_videos', JSON.stringify(this.videos));
        this.renderVideoGrid();
      }
    } catch (e) {
      console.warn('Drive API query:', e.message);
    }
  }

  addCustomVideo(title, url, thumbUrl) {
    const driveFileId = this.extractDriveFileId(url);
    const finalUrl = driveFileId ? `https://drive.google.com/file/d/${driveFileId}/preview` : url;
    const finalThumb = thumbUrl || 'https://images.unsplash.com/photo-1536240478700-b869070f9279?auto=format&fit=crop&w=800&q=80';

    const newVid = {
      id: `custom-${Date.now()}`,
      title: title.trim(),
      category: 'drive',
      duration: 'HD',
      thumbnail: finalThumb,
      videoUrl: finalUrl,
      driveUrl: url,
      description: 'Added via Custom Video Link.'
    };

    this.videos.unshift(newVid);
    localStorage.setItem('gbblitz_videos', JSON.stringify(this.videos));
    this.renderVideoGrid();
    this.closeConfigModal();
  }

  // ===========================================================================
  // 6. Global Event Listeners
  // ===========================================================================
  initEventListeners() {
    // Carousel Controls
    this.carouselNextBtn.addEventListener('click', () => this.nextSlide());
    this.carouselPrevBtn.addEventListener('click', () => this.prevSlide());

    // Pause Carousel on Hover
    this.carouselWrapper.addEventListener('mouseenter', () => this.stopCarouselAutoplay());
    this.carouselWrapper.addEventListener('mouseleave', () => this.startCarouselAutoplay());

    // Search & Filter
    this.videoSearchInput.addEventListener('input', (e) => {
      this.searchQuery = e.target.value;
      this.renderVideoGrid();
    });

    this.categoryFilters.addEventListener('click', (e) => {
      const btn = e.target.closest('.filter-pill');
      if (!btn) return;
      this.categoryFilters.querySelectorAll('.filter-pill').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      this.activeCategory = btn.dataset.category;
      this.renderVideoGrid();
    });

    // Theater Modal Controls
    this.modalCloseBtn.addEventListener('click', () => this.closeTheaterModal());
    this.modalPrevBtn.addEventListener('click', () => this.navigateTheater(-1));
    this.modalNextBtn.addEventListener('click', () => this.navigateTheater(1));
    this.modalFullscreenBtn.addEventListener('click', () => this.toggleFullscreen());
    this.theaterModal.addEventListener('click', (e) => {
      if (e.target === this.theaterModal) this.closeTheaterModal();
    });

    // Config Modal Controls
    this.openDriveSettingsBtn.addEventListener('click', () => this.openConfigModal());
    this.addVideoBtn.addEventListener('click', () => this.openConfigModal());
    this.configCloseBtn.addEventListener('click', () => this.closeConfigModal());
    this.driveConfigModal.addEventListener('click', (e) => {
      if (e.target === this.driveConfigModal) this.closeConfigModal();
    });

    this.resetDefaultDriveBtn.addEventListener('click', () => {
      this.driveFolderInput.value = DEFAULT_DRIVE_FOLDER_URL;
    });

    this.driveConfigForm.addEventListener('submit', (e) => {
      e.preventDefault();
      this.saveDriveConfig(this.driveFolderInput.value, this.driveApiKeyInput.value);
    });

    this.quickAddVideoForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const title = document.getElementById('new-video-title').value;
      const url = document.getElementById('new-video-url').value;
      const thumb = document.getElementById('new-video-thumb').value;
      this.addCustomVideo(title, url, thumb);
      this.quickAddVideoForm.reset();
    });

    // Keyboard navigation
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeTheaterModal();
        this.closeConfigModal();
      }
      if (this.theaterModal.classList.contains('active')) {
        if (e.key === 'ArrowLeft') this.navigateTheater(-1);
        if (e.key === 'ArrowRight') this.navigateTheater(1);
      }
    });
  }
}

// Initialize on DOM Ready
document.addEventListener('DOMContentLoaded', () => {
  window.app = new VideoGalleryApp();
});
