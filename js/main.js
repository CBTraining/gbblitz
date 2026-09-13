/**
 * GBblitz - Application Entry Point (ES Module)
 * Orchestrates modular components cleanly on DOMContentLoaded.
 */

import { VideoGalleryApp } from './components/video-gallery.js?v=5.16.0';
import { StarrySkyBackground } from './components/starry-sky.js?v=5.16.0';
import { ScrollLogoManager } from './components/scroll-logo.js?v=5.16.0';

document.addEventListener('DOMContentLoaded', () => {
  window.app = new VideoGalleryApp();
  window.latticeEngine = new StarrySkyBackground('lattice-canvas');
  window.scrollLogoManager = new ScrollLogoManager();

  // Efficiency optimization: dynamically load magic pointer easter egg only on fine-pointer desktop devices
  if (!window.matchMedia('(pointer: coarse)').matches && window.innerWidth > 768) {
    import('./components/magic-pointer.js?v=5.16.0').then(({ MagicPointerManager }) => {
      window.magicPointerManager = new MagicPointerManager();
    }).catch(() => {});
  }
});
