/**
 * GBblitz - Highlighted Video Carousel Component
 * Manages highlighted video slide cycling, auto-advance progress, touch gestures, and navigation.
 */

export class HighlightCarousel {
  constructor(options = {}) {
    this.wrapper = document.getElementById(options.wrapperId || 'photo-carousel');
    this.track = document.getElementById(options.trackId || 'carousel-track');
    this.indicators = document.getElementById(options.indicatorsId || 'carousel-indicators');
    this.prevBtn = document.getElementById(options.prevBtnId || 'carousel-prev-btn');
    this.nextBtn = document.getElementById(options.nextBtnId || 'carousel-next-btn');
    this.progressFill = document.getElementById(options.progressFillId || 'carousel-progress-fill');
    this.onPlayVideo = options.onPlayVideo || (() => {});

    this.videos = [];
    this.currentIndex = 0;
    this.duration = options.duration || 5500;
    this.timer = null;
    this.progressInterval = null;
    this.progressStartTime = 0;

    this.initEvents();
  }

  setVideos(videos) {
    this.videos = videos || [];
    this.render();
  }

  render() {
    if (!this.track || !this.indicators) return;
    this.stopAutoplay();
    this.track.innerHTML = '';
    this.indicators.innerHTML = '';

    if (this.videos.length === 0) {
      if (this.wrapper) this.wrapper.style.display = 'none';
      return;
    }

    if (this.wrapper) this.wrapper.style.display = '';

    this.videos.forEach((video, index) => {
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

      const playBtn = li.querySelector('.carousel-play-btn');
      if (playBtn) {
        playBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          this.onPlayVideo(video.id);
        });
      }

      this.track.appendChild(li);

      const dot = document.createElement('button');
      dot.className = 'carousel-dot ' + (index === 0 ? 'active' : '');
      dot.setAttribute('aria-label', 'Go to highlighted video ' + (index + 1));
      dot.addEventListener('click', () => {
        this.goToSlide(index);
      });
      this.indicators.appendChild(dot);
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
