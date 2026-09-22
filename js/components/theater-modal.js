/**
 * GBblitz - Expanded Theater Modal Player Component
 * Handles auto-playing Google Drive video modal playback, controls, fullscreen, and keyboard navigation.
 */

import { isUsableDesignation } from '../services/sheet-service.js?v=5.56.0';

export class TheaterModal {
  constructor(options = {}) {
    this.modal = document.getElementById(options.modalId || 'theater-modal');
    this.title = document.getElementById(options.titleId || 'modal-title');
    this.desc = document.getElementById(options.descId || 'modal-desc');
    this.categoryBadge = document.getElementById(options.categoryBadgeId || 'modal-category-badge');
    this.driveLink = document.getElementById(options.driveLinkId || 'modal-drive-link');
    this.playerContainer = document.getElementById(options.playerContainerId || 'theater-player-container');
    this.closeBtn = document.getElementById(options.closeBtnId || 'modal-close-btn');
    this.floatingCloseBtn = document.getElementById(options.floatingCloseBtnId || 'modal-floating-close');
    this.prevBtn = document.getElementById(options.prevBtnId || 'modal-prev-btn');
    this.nextBtn = document.getElementById(options.nextBtnId || 'modal-next-btn');
    this.fullscreenBtn = document.getElementById(options.fullscreenBtnId || 'modal-fullscreen-btn');

    this.onNavigate = options.onNavigate || (() => {});
    this.onClose = options.onClose || (() => {});
    this.closeTimeout = null;

    this.initEvents();
  }

  isOpen() {
    return this.modal && this.modal.classList.contains('active');
  }

  open(video, aspect = 1.7778) {
    if (!this.modal || !video || !isUsableDesignation(video.designation)) return;

    if (this.closeTimeout) {
      clearTimeout(this.closeTimeout);
      this.closeTimeout = null;
    }

    if (this.title) this.title.textContent = video.title;
    const waveText = (video.wave || 'WAVE 1').toUpperCase();
    if (this.categoryBadge) {
      this.categoryBadge.textContent = waveText;
      this.categoryBadge.setAttribute('data-wave', video.wave || 'Wave 1');
      this.categoryBadge.style.cssText = 'background: linear-gradient(90deg, #3387ff 0%, #a9a8ff 100%) !important; color: #ffffff !important; border: none !important; font-weight: 700 !important; box-shadow: 0 2px 10px rgba(51, 135, 255, 0.4) !important;';
    }
    if (this.desc) {
      this.desc.textContent = '';
      this.desc.style.display = 'none';
    }
    if (this.driveLink) this.driveLink.href = video.driveUrl || `https://drive.google.com/file/d/${video.driveFileId}/view`;

    const footerDriveBtn = document.getElementById('modal-footer-drive-btn');
    if (footerDriveBtn) footerDriveBtn.href = video.driveUrl || `https://drive.google.com/file/d/${video.driveFileId}/view`;

    // Activate modal in viewport first so browser grants autoplay permission
    this.modal.classList.add('active');
    this.modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    this.renderPlayer(video, aspect);
  }

  close() {
    if (!this.modal) return;
    this.modal.classList.remove('active');
    this.modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';

    // Stop video playback immediately
    if (this.playerContainer) {
      this.playerContainer.innerHTML = '';
    }

    // Preserve card dimensions & portrait/landscape shape during the 360ms fade-out animation
    // so portrait videos fade out cleanly in place, identically to landscape videos.
    if (this.closeTimeout) {
      clearTimeout(this.closeTimeout);
    }
    this.closeTimeout = setTimeout(() => {
      this.closeTimeout = null;
      if (!this.isOpen()) {
        if (this.playerContainer) {
          this.playerContainer.style.backgroundImage = '';
          this.playerContainer.style.aspectRatio = '';
        }
        const theaterCard = this.modal.querySelector('.theater-card');
        if (theaterCard) {
          theaterCard.style.maxWidth = '';
          theaterCard.classList.remove('is-portrait', 'is-landscape');
        }
      }
    }, 360);

    this.onClose();
  }

  renderPlayer(video, aspect = 1.7778) {
    if (!this.playerContainer) return;
    this.playerContainer.innerHTML = '';

    const theaterCard = this.modal.querySelector('.theater-card');
    const mediaContainer = this.playerContainer;

    const isPort = video.isPortrait || (aspect && aspect < 0.95);

    if (theaterCard) {
      if (isPort) {
        const portAspect = aspect ? Math.max(aspect, 0.52) : 9 / 16;
        theaterCard.classList.add('is-portrait');
        theaterCard.classList.remove('is-landscape');
        theaterCard.style.maxWidth = `min(440px, calc((84vh - 130px) * ${portAspect}))`;
        mediaContainer.style.aspectRatio = `${portAspect}`;
      } else {
        const landAspect = aspect ? Math.min(aspect, 2.35) : 16 / 9;
        theaterCard.classList.remove('is-portrait');
        theaterCard.classList.add('is-landscape');
        theaterCard.style.maxWidth = `min(92vw, calc((84vh - 130px) * ${landAspect}))`;
        mediaContainer.style.aspectRatio = `${landAspect}`;
      }
    }

    // Set poster as seamless backdrop while Google Drive player initializes
    if (video.thumbnail) {
      mediaContainer.style.backgroundImage = `url('${video.thumbnail}')`;
      mediaContainer.style.backgroundSize = isPort ? 'contain' : 'cover';
      mediaContainer.style.backgroundPosition = 'center center';
      mediaContainer.style.backgroundRepeat = 'no-repeat';
    }

    const iframe = document.createElement('iframe');
    iframe.className = 'theater-iframe-element theater-player';
    const baseUrl = video.videoUrl || `https://drive.google.com/file/d/${video.driveFileId}/preview`;
    const sep = baseUrl.includes('?') ? '&' : '?';
    iframe.src = baseUrl + sep + 'autoplay=1';
    iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen';
    iframe.allowFullscreen = true;
    iframe.setAttribute('loading', 'eager');

    mediaContainer.appendChild(iframe);

    // Transparent interaction shield: only on desktop with fine mouse cursor
    if (!window.matchMedia('(pointer: coarse)').matches) {
      const shield = document.createElement('div');
      shield.className = 'theater-video-shield';
      mediaContainer.appendChild(shield);
    }
  }

  toggleFullscreen() {
    if (!document.fullscreenElement) {
      this.playerContainer?.requestFullscreen?.().catch(err => console.log(err));
    } else {
      document.exitFullscreen?.();
    }
  }

  initEvents() {
    if (this.closeBtn) this.closeBtn.addEventListener('click', (e) => { e.stopPropagation(); this.close(); });
    if (this.floatingCloseBtn) this.floatingCloseBtn.addEventListener('click', (e) => { e.stopPropagation(); this.close(); });
    if (this.prevBtn) this.prevBtn.addEventListener('click', (e) => { e.stopPropagation(); this.onNavigate(-1); });
    if (this.nextBtn) this.nextBtn.addEventListener('click', (e) => { e.stopPropagation(); this.onNavigate(1); });
    if (this.fullscreenBtn) this.fullscreenBtn.addEventListener('click', (e) => { e.stopPropagation(); this.toggleFullscreen(); });

    if (this.modal) {
      this.modal.addEventListener('click', (e) => {
        if (e.target === this.modal) this.close();
      });
    }

    window.addEventListener('keydown', (e) => {
      if (!this.isOpen()) return;
      if (e.key === 'Escape') this.close();
      if (e.key === 'ArrowLeft') this.onNavigate(-1);
      if (e.key === 'ArrowRight') this.onNavigate(1);
    });
  }
}
