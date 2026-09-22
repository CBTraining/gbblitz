/**
 * GBblitz - Desktop Hover Video Preview Manager
 * Manages the inline hover preview iframe lifecycle, delay timer, scrub progress bar,
 * and ensures only a single preview streams at any given time (singleton pattern).
 * Version: 5.46.0
 */

export class HoverPreviewManager {
  constructor(options = {}) {
    this.delayMs = options.delayMs || 120;
    this.activeCleaner = null;
  }

  /**
   * Stops and clears any currently active video preview
   */
  stopActive() {
    if (this.activeCleaner) {
      this.activeCleaner();
      this.activeCleaner = null;
    }
  }

  /**
   * Attaches hover preview listeners to a video card or slide
   * @param {HTMLElement} card 
   * @param {Object} video 
   */
  attach(card, video) {
    let hoverTimeout = null;
    const slot = card.querySelector('.preview-iframe-slot');
    const scrubBar = card.querySelector('.hover-scrub-progress');

    const stopPreview = () => {
      if (hoverTimeout) {
        clearTimeout(hoverTimeout);
        hoverTimeout = null;
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
      hoverTimeout = setTimeout(() => {
        if (!slot || slot.querySelector('iframe')) return;

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
    };

    card.addEventListener('mouseenter', startPreview);
    card.addEventListener('mouseleave', stopPreview);
  }
}
