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
    const isApproved = (video.designation || '').toLowerCase().includes('approved');
    const badgeText = (!video.designation || isApproved) ? video.wave : `${video.wave} • ${video.designation}`;
    if (this.desc) this.desc.textContent = badgeText;
    if (this.categoryBadge) this.categoryBadge.textContent = badgeText.toUpperCase();
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
      this.playerContainer.style.backgroundImage = '';
      this.playerContainer.style.aspectRatio = '';
    }
    const theaterCard = this.modal.querySelector('.theater-card');
    if (theaterCard) {
      theaterCard.style.maxWidth = '';
      theaterCard.classList.remove('is-portrait', 'is-landscape');
    }
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

    // 1. Google Drive Player Iframe (beneath overlay)
    const iframe = document.createElement('iframe');
    iframe.className = 'theater-iframe-element theater-player';
    const baseUrl = video.videoUrl || `https://drive.google.com/file/d/${video.driveFileId}/preview`;
    const sep = baseUrl.includes('?') ? '&' : '?';
    iframe.src = baseUrl + sep + 'autoplay=1';
    iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen';
    iframe.allowFullscreen = true;
    iframe.setAttribute('loading', 'eager');
    mediaContainer.appendChild(iframe);

    // 2. Seamless Poster Overlay with Frosted Glass Loader (Prevents Jarring Flash to Black)
    const posterOverlay = document.createElement('div');
    posterOverlay.className = 'theater-poster-overlay';

    if (video.thumbnail) {
      const posterImg = document.createElement('img');
      posterImg.className = 'theater-poster-img';
      posterImg.src = video.thumbnail;
      posterImg.alt = video.title || '';
      posterImg.onerror = () => {
        posterImg.src = `https://drive.google.com/thumbnail?id=${encodeURIComponent(video.driveFileId)}&sz=w1200`;
      };
      posterOverlay.appendChild(posterImg);
    }

    const loaderWrap = document.createElement('div');
    loaderWrap.className = 'theater-loader-wrap';
    loaderWrap.innerHTML = `
      <div class="theater-loader-spinner">
        <div class="spinner-ring"></div>
      </div>
      <span class="theater-loader-text">Loading presentation...</span>
    `;
    posterOverlay.appendChild(loaderWrap);
    mediaContainer.appendChild(posterOverlay);

    // 3. Transparent interaction shield for smooth custom cursor tracking
    const shield = document.createElement('div');
    shield.className = 'theater-video-shield';
    mediaContainer.appendChild(shield);

    // 4. Smooth Crossfade Transition: Dissolve poster overlay once video player initializes
    let hasLoaded = false;
    const triggerDissolve = () => {
      if (hasLoaded) return;
      hasLoaded = true;
      // Allow Google Drive player 550ms to buffer and render its initial video frame
      setTimeout(() => {
        posterOverlay.classList.add('is-hidden');
        setTimeout(() => {
          if (posterOverlay.parentNode) {
            posterOverlay.remove();
          }
        }, 600);
      }, 550);
    };

    iframe.addEventListener('load', triggerDissolve);
    setTimeout(triggerDissolve, 3200); // Safety fallback timeout
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
