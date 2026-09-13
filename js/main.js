/**
 * GBblitz - Application Entry Point (ES Module)
 * Orchestrates modular components cleanly on DOMContentLoaded.
 */

import { VideoGalleryApp } from './components/video-gallery.js?v=5.6.0';
import { StarrySkyBackground } from './components/starry-sky.js?v=5.6.0';
import { ScrollLogoManager } from './components/scroll-logo.js?v=5.6.0';
import { MagicPointerManager } from './components/magic-pointer.js?v=5.6.0';

document.addEventListener('DOMContentLoaded', () => {
  window.app = new VideoGalleryApp();
  window.latticeEngine = new StarrySkyBackground('lattice-canvas');
  window.scrollLogoManager = new ScrollLogoManager();
  window.magicPointerManager = new MagicPointerManager();
});
