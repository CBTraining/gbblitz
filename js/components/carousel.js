/**
 * GBblitz - Highlighted Video Carousel Component
 * Manages highlighted video slide cycling, auto-advance progress, touch gestures, and navigation.
 */

import { isUsableDesignation } from '../services/sheet-service.js?v=5.60.0';
import { HoverPreviewManager } from './hover-preview.js?v=5.60.0';

export class HighlightCarousel {
  constructor(options = {}) {
    this.wrapper = document.getElementById(options.wrapperId || 'photo-carousel');
    this.track = document.getElementById(options.trackId || 'carousel-track');
    this.indicators = document.getElementById(options.indicatorsId || 'carousel-indicators');
    this.prevBtn = document.getElementById(options.prevBtnId || 'carousel-prev-btn');
    this.nextBtn = document.getElementById(options.nextBtnId || 'carousel-next-btn');
    this.progressFill = document.getElementById(options.progressFillId || 'carousel-progress-fill');
    this.onPlayVideo = options.onPlayVideo || (() => {});
    this.hoverPreviewManager = options.hoverPreviewManager || null;
    this.aspectRatioCache = options.aspectRatioCache || {};

    this.videos = [];
    this.currentIndex = 0;
    this.duration = options.duration || 5500;
    this.timer = null;
    this.progressInterval = null;
    this.progressStartTime = 0;

    this.initEvents();
  }

  setVideos(videos) {
    this.videos = (videos || []).filter(v => {
      const d = (v.designation || '').trim().toLowerCase().replace(/[!.,]/g, '');
      return d === 'highlighted' || d === 'highlight';
    });
    this.render();
  }

  render() {
    if (!this.track) return;
    this.stopAutoplay();
    this.track.innerHTML = '';
    if (this.indicators) this.indicators.innerHTML = '';

    const headerTitle = document.getElementById('carousel-header-title');
    if (this.videos.length === 0) {
      if (this.wrapper) this.wrapper.style.display = 'none';
      if (headerTitle) headerTitle.style.display = 'none';
      return;
    }

    if (this.wrapper) this.wrapper.style.display = '';
    if (headerTitle) headerTitle.style.display = '';

    this.videos.forEach((video, index) => {
      const isApproved = (video.designation || '').toLowerCase().includes('approved');
      const desigPart = (!video.designation || isApproved) ? '' : ` • ${video.designation}`;
      const isPortrait = video.isPortrait || (this.aspectRatioCache[video.driveFileId] && this.aspectRatioCache[video.driveFileId] < 0.95);
      const li = document.createElement('li');
      li.className = 'carousel-slide ' + (index === 0 ? 'active ' : '') + (isPortrait ? 'is-portrait' : 'is-landscape');
      li.style.cursor = 'pointer';
      li.setAttribute('role', 'button');
      li.setAttribute('tabindex', '0');
      li.setAttribute('aria-label', `Play highlighted video: ${video.title}`);

      const cat = video.category || video.wave || 'Sentiment';
      const isTeachBack = cat.toLowerCase().includes('teach');
      const catLabel = isTeachBack ? 'TEACH-BACK' : 'SENTIMENT';
      const catStyle = isTeachBack
        ? 'background: linear-gradient(90deg, #0ebc5f 0%, #78c9ff 100%) !important; color: #ffffff !important; border: none !important; font-weight: 700 !important; box-shadow: 0 2px 10px rgba(14, 188, 95, 0.4) !important;'
        : 'background: linear-gradient(90deg, #3387ff 0%, #a9a8ff 100%) !important; color: #ffffff !important; border: none !important; font-weight: 700 !important; box-shadow: 0 2px 10px rgba(51, 135, 255, 0.4) !important;';

      li.innerHTML = `
        <img 
          class="carousel-img" 
          src="${video.thumbnail}" 
          alt="${video.title}" 
          loading="${index === 0 ? 'eager' : 'lazy'}" 
        />
        <div class="preview-iframe-slot" id="carousel-preview-slot-${video.id}"></div>
        <div class="carousel-overlay">
          <div class="carousel-caption">
            <div class="carousel-badge-row">
              <span class="carousel-wave-badge carousel-category-badge" data-category="${isTeachBack ? 'Teach-back' : 'Sentiment'}" data-wave="${isTeachBack ? 'Teach-back' : 'Sentiment'}" style="${catStyle}">${catLabel}</span>
            </div>
            <h3 class="carousel-slide-title">${video.title}</h3>
            <p class="carousel-slide-desc">${isTeachBack ? 'Teach-back' : 'Sentiment'}${desigPart} • Featured Presentation</p>
            
            <button class="btn btn-primary carousel-play-btn" data-video-id="${video.id}">
              <svg viewBox="0 0 24 24" fill="currentColor" class="btn-icon">
                <polygon points="5 3 19 12 5 21 5 3"></polygon>
              </svg>
              <span>Watch Video</span>
            </button>
          </div>
        </div>
      `;

      // Click on entire slide / thumbnail opens video player
      li.addEventListener('click', (e) => {
        if (e.target.closest('.carousel-nav') || e.target.closest('.carousel-indicators')) return;
        if (this.hoverPreviewManager) this.hoverPreviewManager.stopActive();
        this.onPlayVideo(video.id);
      });

      li.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          if (this.hoverPreviewManager) this.hoverPreviewManager.stopActive();
          this.onPlayVideo(video.id);
        }
      });

      const playBtn = li.querySelector('.carousel-play-btn');
      if (playBtn) {
        playBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          if (this.hoverPreviewManager) this.hoverPreviewManager.stopActive();
          this.onPlayVideo(video.id);
        });
      }

      if (this.hoverPreviewManager) {
        this.hoverPreviewManager.attach(li, video);
      }

      const cImg = li.querySelector('.carousel-img');
      if (cImg) {
        let step = 0;
        cImg.addEventListener('error', () => {
          step++;
          if (step === 1) {
            cImg.src = `https://lh3.googleusercontent.com/u/0/d/${encodeURIComponent(video.driveFileId)}=s1600`;
          } else if (step === 2) {
            cImg.src = `https://lh3.googleusercontent.com/d/${encodeURIComponent(video.driveFileId)}=w1600`;
          } else if (step === 3) {
            cImg.src = `https://drive.google.com/thumbnail?authuser=0&sz=w1600&id=${encodeURIComponent(video.driveFileId)}`;
          } else {
            cImg.src = 'Graphic%20Assets/video-placeholder.svg';
          }
        });

        const detect = () => {
          if (cImg.naturalWidth && cImg.naturalHeight) {
            const ratio = cImg.naturalWidth / cImg.naturalHeight;
            const isPort = isPortrait || li.classList.contains('is-portrait') || ratio < 0.95;
            li.classList.toggle('is-portrait', isPort);
            li.classList.toggle('is-landscape', !isPort);
            video.thumbnail = cImg.src;
            if (this.aspectRatioCache) {
              this.aspectRatioCache[video.driveFileId] = ratio;
            }
          }
        };
        if (cImg.complete && cImg.naturalWidth) {
          detect();
        }
        cImg.addEventListener('load', detect);
      }

      this.track.appendChild(li);
    });

    this.currentIndex = 0;
    this.goToSlide(0);
  }

  goToSlide(index) {
    const total = this.videos.length;
    if (total === 0) return;
    this.currentIndex = (index + total) % total;
    if (this.track) {
      this.track.style.transform = 'translateX(-' + (this.currentIndex * 100) + '%)';
      const slides = this.track.querySelectorAll('.carousel-slide');
      slides.forEach((slide, idx) => {
        slide.classList.toggle('active', idx === this.currentIndex);
      });
    }

    if (this.indicators) {
      const dots = this.indicators.querySelectorAll('.carousel-dot');
      dots.forEach((dot, idx) => {
        dot.classList.toggle('active', idx === this.currentIndex);
      });
    }

    this.startAutoplay();
  }

  nextSlide() {
    this.goToSlide(this.currentIndex + 1);
  }

  prevSlide() {
    this.goToSlide(this.currentIndex - 1);
  }

  startAutoplay() {
    this.stopAutoplay();
    if (this.videos.length <= 1) return;

    this.progressStartTime = Date.now();
    this.animateProgressBar();

    this.timer = setInterval(() => {
      this.nextSlide();
    }, this.duration);
  }

  stopAutoplay() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    if (this.progressInterval) {
      cancelAnimationFrame(this.progressInterval);
      this.progressInterval = null;
    }
  }

  animateProgressBar() {
    const update = () => {
      const elapsed = Date.now() - this.progressStartTime;
      const percentage = Math.min((elapsed / this.duration) * 100, 100);
      if (this.progressFill) {
        this.progressFill.style.width = percentage + '%';
      }
      if (percentage < 100 && this.timer) {
        this.progressInterval = requestAnimationFrame(update);
      }
    };
    this.progressInterval = requestAnimationFrame(update);
  }

  initEvents() {
    if (this.prevBtn) this.prevBtn.addEventListener('click', () => this.prevSlide());
    if (this.nextBtn) this.nextBtn.addEventListener('click', () => this.nextSlide());
    if (this.wrapper) {
      this.wrapper.addEventListener('mouseenter', () => this.stopAutoplay());
      this.wrapper.addEventListener('mouseleave', () => this.startAutoplay());

      // Touch swipe gestures for mobile viewports
      let touchStartX = 0;
      let touchStartY = 0;
      let touchEndX = 0;
      let touchEndY = 0;
      let isSwiping = false;

      this.wrapper.addEventListener('touchstart', (e) => {
        if (!e.touches || e.touches.length === 0) return;
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
        touchEndX = touchStartX;
        touchEndY = touchStartY;
        isSwiping = true;
        this.stopAutoplay();
      }, { passive: true });

      this.wrapper.addEventListener('touchmove', (e) => {
        if (!isSwiping || !e.touches || e.touches.length === 0) return;
        touchEndX = e.touches[0].clientX;
        touchEndY = e.touches[0].clientY;
      }, { passive: true });

      this.wrapper.addEventListener('touchend', () => {
        if (!isSwiping) return;
        isSwiping = false;
        const diffX = touchEndX - touchStartX;
        const diffY = touchEndY - touchStartY;

        // Trigger slide transition when horizontal swipe exceeds 35px and is dominant axis
        if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 35) {
          if (diffX < 0) {
            this.nextSlide();
          } else {
            this.prevSlide();
          }
        } else {
          this.startAutoplay();
        }
      }, { passive: true });
    }
  }
}
