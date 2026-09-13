/**
 * GBblitz - Application Entry Point (ES Module)
 * Orchestrates modular components cleanly on DOMContentLoaded.
 */

import { VideoGalleryApp } from './components/video-gallery.js';
import { StarrySkyBackground } from './components/starry-sky.js';
import { ScrollLogoManager } from './components/scroll-logo.js';
import { MagicPointerManager } from './components/magic-pointer.js';

document.addEventListener('DOMContentLoaded', () => {
  window.app = new VideoGalleryApp();
  window.latticeEngine = new StarrySkyBackground('lattice-canvas');
  window.scrollLogoManager = new ScrollLogoManager();
  window.magicPointerManager = new MagicPointerManager();
});
