/**
 * GBblitz - Desktop Hover Video Preview Manager
 * Manages the inline hover preview iframe lifecycle, delay timer, scrub progress bar,
 * and ensures only a single preview streams at any given time (singleton pattern).
 * Version: 5.56.0
 */

export class HoverPreviewManager {
  constructor(options = {}) {
    this.delayMs = options.delayMs || 120;
    this.activeCleaner = null;
    this.pendingTimeout = null;
    this.lastTouchTime = 0;

    // Track touch interactions to differentiate finger taps from true mouse hovers
    if (typeof window !== 'undefined') {
      window.addEventListener('touchstart', () => {
        this.lastTouchTime = Date.now();
      }, { passive: true });
    }
  }

  /**
   * Backward-compatible stub: hover previews are handled adaptively via touch event tracking.
   * @returns {boolean}
   */
  static isTouchDevice() {
    return false;
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
   * Works on all desktop/laptop mice and trackpads.
   * Suppresses synthetic mouse events caused by mobile touch taps.
   * @param {HTMLElement} card 
   * @param {Object} video 
   */
  attach(card, video) {
    if (!card) return;

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
      // If user recently tapped the screen with a finger, ignore synthetic mouseenter
      if (Date.now() - this.lastTouchTime < 800) {
        return;
      }

      if (hoverTimeout) clearTimeout(hoverTimeout);
      hoverTimeout = setTimeout(() => {
        this.pendingTimeout = null;
        if (!slot || slot.querySelector('iframe')) return;
        if (Date.now() - this.lastTouchTime < 800) return;

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
