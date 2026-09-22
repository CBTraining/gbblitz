/**
 * GBBlitz - Video Card Component
 * Creates and renders individual video card elements for the gallery grid.
 * Version: 5.45.0
 */

/**
 * Creates an article element representing a video card.
 *
 * @param {Object} video - Video data object.
 * @param {number} index - Index in filtered list.
 * @param {Object} options - Configuration options.
 * @param {boolean} [options.isPortrait=false] - Whether video thumbnail is portrait.
 * @param {Function} [options.onPlay] - Callback when card is clicked or triggered via keyboard.
 * @param {Function} [options.onRatioDetected] - Callback when image ratio is loaded: (ratio, isPortrait) => void.
 * @returns {HTMLElement} - The created `<article class="video-card">` element.
 */
export function createVideoCard(video, index, { isPortrait = false, onPlay, onRatioDetected } = {}) {
  const isHighlight = (video.designation || '').trim().toLowerCase().includes('highlight');
  const thumbBadgeHtml = isHighlight ? `
      <div class="thumb-badges">
        <span class="type-pill badge-highlight">
          ✨ HIGHLIGHTED
        </span>
      </div>` : '';

  const card = document.createElement('article');
  card.className = 'video-card ' + 
    (isHighlight ? 'card-highlight ' : '') +
    (isPortrait ? 'is-portrait' : 'is-landscape');
  card.dataset.videoId = video.id;
  card.dataset.index = index;
  card.setAttribute('role', 'button');
  card.setAttribute('tabindex', '0');

  card.innerHTML = `
    <div class="video-thumb-wrap" id="thumb-wrap-${video.id}">
      <img 
        class="video-thumb-img" 
        src="${video.thumbnail}" 
        alt="${video.title}" 
        loading="lazy" 
        onerror="if (!this.dataset.retried) { this.dataset.retried = '1'; this.src = 'https://drive.google.com/thumbnail?id=' + encodeURIComponent('${video.driveFileId}') + '&sz=w800'; } else { this.onerror=null; this.src='https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=800&q=80'; }"
      />

      <!-- Hover Preview Slot -->
      <div class="preview-iframe-slot" id="preview-slot-${video.id}"></div>

      <!-- Centered Play Button Overlay -->
      <div class="video-play-overlay">
        <div class="video-play-btn-circle">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <polygon points="5 3 19 12 5 21 5 3"></polygon>
          </svg>
        </div>
      </div>

      ${thumbBadgeHtml}

      <div class="hover-scrub-bar">
        <div class="hover-scrub-progress"></div>
      </div>
    </div>

    <div class="video-card-body">
      <h3 class="video-title" title="${video.title}">${video.title}</h3>
      <div class="video-meta-row">
        <span class="video-wave-tag" data-wave="${video.wave}" style="background: linear-gradient(90deg, #3387ff 0%, #a9a8ff 100%) !important; color: #ffffff !important; border: none !important; font-weight: 700 !important; box-shadow: 0 2px 10px rgba(51, 135, 255, 0.4) !important;">${(video.wave || '').toUpperCase()}</span>
      </div>
    </div>
  `;

  if (typeof onPlay === 'function') {
    card.addEventListener('click', () => {
      onPlay(video.id);
    });

    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onPlay(video.id);
      }
    });
  }

  // Dynamic aspect ratio detection from loaded thumbnail
  const thumbImg = card.querySelector('.video-thumb-img');
  if (thumbImg) {
    const detect = () => {
      if (thumbImg.naturalWidth && thumbImg.naturalHeight) {
        const ratio = thumbImg.naturalWidth / thumbImg.naturalHeight;
        const isPort = isPortrait || card.classList.contains('is-portrait') || ratio < 0.95;
        card.classList.toggle('is-portrait', isPort);
        card.classList.toggle('is-landscape', !isPort);
        if (typeof onRatioDetected === 'function') {
          onRatioDetected(ratio, isPort);
        }
      }
    };
    if (thumbImg.complete && thumbImg.naturalWidth) {
      detect();
    } else {
      thumbImg.addEventListener('load', detect, { once: true });
    }
  }

  return card;
}
