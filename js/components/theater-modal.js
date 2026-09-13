/**
 * GBblitz - Expanded Theater Modal Player Component
 * Handles auto-playing Google Drive video modal playback, controls, fullscreen, and keyboard navigation.
 */

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

    this.initEvents();
  }

  isOpen() {
    return this.modal && this.modal.classList.contains('active');
  }

  open(video, aspect = 1.7778) {
    if (!this.modal || !video) return;

    if (this.title) this.title.textContent = video.title;
    if (this.desc) this.desc.textContent = video.wave + ' • ' + video.designation;
    if (this.categoryBadge) this.categoryBadge.textContent = (video.wave + ' • ' + video.designation).toUpperCase();
    if (this.driveLink) this.driveLink.href = video.driveUrl || `https://drive.google.com/file/d/${video.driveFileId}/view`;

    const footerDriveBtn = document.getElementById('modal-footer-drive-btn');
    if (footerDriveBtn) footerDriveBtn.href = video.driveUrl || `https://drive.google.com/file/d/${video.driveFileId}/view`;

    this.renderPlayer(video, aspect);

    this.modal.classList.add('active');
    this.modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  close() {
    if (!this.modal) return;
    this.modal.classList.remove('active');
    this.modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (this.playerContainer) {
      this.playerContainer.innerHTML = '';
    }
    this.onClose();
  }

  renderPlayer(video, aspect = 1.7778) {
    if (!this.playerContainer) return;
    this.playerContainer.innerHTML = '';

    const iframe = document.createElement('iframe');
    iframe.className = 'theater-player';
    iframe.src = `https://drive.google.com/file/d/${video.driveFileId}/preview`;
    iframe.allow = 'autoplay; fullscreen';
    iframe.allowFullscreen = true;
    iframe.setAttribute('loading', 'eager');

    if (aspect && aspect < 1.0) {
      this.playerContainer.classList.add('is-portrait');
    } else {
      this.playerContainer.classList.remove('is-portrait');
    }

    this.playerContainer.appendChild(iframe);
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
