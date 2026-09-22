/**
 * GBblitz - Desktop Hover Video Preview Manager
 * Manages the inline hover preview iframe lifecycle, delay timer, scrub progress bar,
 * and ensures only a single preview streams at any given time (singleton pattern).
 * Version: 5.51.0
 */

export class HoverPreviewManager {
  constructor(options = {}) {
    this.delayMs = options.delayMs || 120;
    this.activeCleaner = null;
    this.pendingTimeout = null;
  }

  /**
   * Detects whether the user is on a touch / coarse pointer / mobile device.
   * Inline hover previews are strictly disabled on touch devices to prevent
   * dual audio/video streams when opening the theater modal.
   * @returns {boolean}
   */
  static isTouchDevice() {
    if (typeof window === 'undefined') return false;
    return (
      (window.matchMedia && window.matchMedia('(pointer: coarse)').matches) ||
      (window.matchMedia && window.matchMedia('(hover: none)').matches) ||
      ('ontouchstart' in window) ||
      (navigator.maxTouchPoints > 0) ||
      (window.innerWidth <= 768)
    );
  }

  /**
   * Stops and clears any currently active or pending video preview
   */
  stopActive() {
    if (this.pendingTimeout) {
      clearTimeout(this.pendingTimeout);
      this.pendingTimeout = null;
    }
    if (this.activeCleaner) {
      this.activeCleaner();
      this.activeCleaner = null;
    }
  }

  /**
   * Attaches hover preview listeners to a video card or slide.
   * Completely bypasses attachment on mobile / touch / pointer: coarse devices.
   * @param {HTMLElement} card 
   * @param {Object} video 
   */
  attach(card, video) {
    if (!card || HoverPreviewManager.isTouchDevice()) {
      return;
    }

    let hoverTimeout = null;
    const slot = card.querySelector('.preview-iframe-slot');
    const scrubBar = card.querySelector('.hover-scrub-progress');

    const stopPreview = () => {
      if (hoverTimeout) {
        clearTimeout(hoverTimeout);
        hoverTimeout = null;
      }
      if (this.pendingTimeout === hoverTimeout) {
        this.pendingTimeout = null;
      }
      card.classList.remove('is-playing');
      if (slot) slot.innerHTML = '';
      if (scrubBar) {
        scrubBar.style.transition = 'none';
        scrubBar.style.width = '0%';
      }
      if (this.activeCleaner === stopPreview) {
        this.activeCleaner = null;
      }
    };

    const startPreview = () => {
      // Re-check touch condition at event time
      if (HoverPreviewManager.isTouchDevice()) return;

      if (hoverTimeout) clearTimeout(hoverTimeout);
      hoverTimeout = setTimeout(() => {
        this.pendingTimeout = null;
        if (!slot || slot.querySelector('iframe')) return;
        if (HoverPreviewManager.isTouchDevice()) return;

        // Clean up any other active preview first (singleton pattern)
        if (this.activeCleaner && this.activeCleaner !== stopPreview) {
          this.activeCleaner();
        }
        this.activeCleaner = stopPreview;

        card.classList.add('is-playing');
        const iframe = document.createElement('iframe');
        iframe.className = 'video-preview-iframe';
        const baseUrl = video.videoUrl || `https://drive.google.com/file/d/${video.driveFileId}/preview`;
        const sep = baseUrl.includes('?') ? '&' : '?';
        iframe.src = baseUrl + sep + 'autoplay=1&mute=1';
        iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen';
        iframe.setAttribute('allowfullscreen', 'true');
        iframe.loading = 'eager';
        slot.appendChild(iframe);

        if (scrubBar) {
          scrubBar.style.transition = 'width 8s linear';
          scrubBar.style.width = '100%';
        }
      }, this.delayMs);
      this.pendingTimeout = hoverTimeout;
    };

    card.addEventListener('mouseenter', startPreview);
    card.addEventListener('mouseleave', stopPreview);
    card.addEventListener('click', stopPreview);
  }
}
