/**
 * GBblitz - Scroll Logo & Vignette Manager
 * Drives header blur vignette, logo scale-down on scroll, and hero narrative fade/exit.
 */
export class ScrollLogoManager {
  constructor() {
    this.brandLink = document.getElementById('brand-logo');
    this.blurBackdrop = document.getElementById('header-blur-backdrop');
    this.latticeCanvas = document.getElementById('lattice-canvas');
    this.heroStage = document.getElementById('hero-intro-stage');
    this.albumSection = document.querySelector('.album-section');
    this.narrativeCol = document.querySelector('.hero-narrative-col');
    this.carouselCol = document.querySelector('.hero-carousel-col');
    
    this.initialScale = 1.0;   // crisp 1:1 pixel fidelity at 190px hero size
    this.finalScale = 0.274;   // docked scale to ~52px height
    this.scrollDistance = 380; // scroll px to fully dock
    this.dockedOffsetY = 10;   // push down 10px when small to center within top black bar
    this.ticking = false;

    if (!this.brandLink || !this.heroStage) return;

    this.updateDimensions();
    window.addEventListener('resize', () => this.updateDimensions(), { passive: true });
    window.addEventListener('orientationchange', () => setTimeout(() => this.updateDimensions(), 150), { passive: true });
    window.addEventListener('scroll', () => this.requestScrollUpdate(), { passive: true });

    const logoImg = this.brandLink.querySelector('.brand-logo-img');
    if (logoImg && !logoImg.complete) {
      logoImg.addEventListener('load', () => this.updateDimensions(), { once: true });
    }

    // Smooth scroll to top on brand click
    this.brandLink.addEventListener('click', (e) => {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    this.onScroll();
  }

  updateDimensions() {
    const heroHeight = this.heroStage.clientHeight || 400;
    const targetCenterY = heroHeight * 0.48; // center of hero stage in un-scrolled page
    
    // Logo element dimensions
    const logoImg = this.brandLink.querySelector('.brand-logo-img');
    const baseLogoHeight = logoImg ? (logoImg.clientHeight || 152) : 152;
    const headerContainer = document.getElementById('header-container');
    const paddingTop = headerContainer ? parseFloat(getComputedStyle(headerContainer).paddingTop) || 10 : 10;

    // Because .brand has transform-origin: center top,
    // in unscaled hero state (scale=1.0), the logo's center is at: paddingTop + (baseLogoHeight / 2).
    // In docked state (scale=finalScale), the logo's top is at paddingTop, and its height is baseLogoHeight * finalScale.
    const unscaledCenterY = paddingTop + (baseLogoHeight / 2);
    this.initialTranslateY = targetCenterY - unscaledCenterY;
    
    // Responsive scale & scroll distance
    if (window.innerWidth < 640) {
      this.initialScale = 1.0;
      this.finalScale = 0.42;   // ~37px docked
      this.scrollDistance = 200;
    } else if (window.innerWidth < 1024) {
      this.initialScale = 1.0;
      this.finalScale = 0.35;   // ~45px docked
      this.scrollDistance = 250;
    } else {
      this.initialScale = 1.0;
      this.finalScale = 0.335;  // ~51px docked
      this.scrollDistance = 300;
    }

    this.onScroll();
  }

  requestScrollUpdate() {
    if (!this.ticking) {
      requestAnimationFrame(() => {
        this.onScroll();
        this.ticking = false;
      });
      this.ticking = true;
    }
  }

  onScroll() {
    const scrollY = window.scrollY || window.pageYOffset || 0;
    const rawProgress = scrollY / this.scrollDistance;
    const progress = Math.min(1, Math.max(0, rawProgress));

    // 1. Logo Scale & Translation
    const currentScale = this.initialScale - progress * (this.initialScale - this.finalScale);
    const currentTranslateY = this.initialTranslateY * (1 - progress) + (this.dockedOffsetY * progress);

    this.brandLink.style.transform = `translate3d(0, ${currentTranslateY.toFixed(2)}px, 0) scale(${currentScale.toFixed(3)})`;

    // 2. Lattice Canvas Opacity & Parallax
    if (this.latticeCanvas) {
      const latticeOpacity = Math.max(0, 1 - progress * 1.15);
      this.latticeCanvas.style.opacity = latticeOpacity.toFixed(3);
      this.latticeCanvas.style.transform = `translate3d(0, ${-(scrollY * 0.25).toFixed(1)}px, 0)`;

      if (window.latticeEngine) {
        window.latticeEngine.setRunning(progress < 1.0);
      }
    }

    // 3. Header Blur & Darken Backdrop Vignette
    if (this.blurBackdrop) {
      const backdropOpacity = Math.min(1, Math.max(0, progress / 0.7));
      this.blurBackdrop.style.opacity = backdropOpacity.toFixed(3);
    }

    // 4. Hero Text & Highlight Video Dynamic Exit Animation
    // Shifting to the next area happens later: the narrative text and highlighted video
    // stay fully visible and readable throughout the initial scroll, only beginning to
    // drift and fade once the user scrolls well past the hero section into the video gallery.
    if (this.albumSection && this.narrativeCol && this.carouselCol) {
      const albumTop = this.albumSection.offsetTop || 520;
      const albumHeight = this.albumSection.offsetHeight || 450;
      
      // Delay start: content stays 100% visible and unshifted until album top is within 120px of top (or scrolled 480px+)
      const exitStart = Math.max(380, albumTop - 120);
      // Completes smoothly over an extended 360px scroll range
      const exitDistance = Math.max(280, albumHeight * 0.75);
      const exitEnd = exitStart + exitDistance;

      const isStacked = window.innerWidth < 1050;

      if (scrollY <= exitStart) {
        // Pristine, full visibility
        this.narrativeCol.style.opacity = '1';
        this.narrativeCol.style.transform = 'translate3d(0, 0, 0)';
        this.carouselCol.style.opacity = '1';
        this.carouselCol.style.transform = 'translate3d(0, 0, 0)';
      } else if (scrollY >= exitEnd) {
        // Fully dispersed
        this.narrativeCol.style.opacity = '0';
        this.narrativeCol.style.transform = isStacked ? 'translate3d(0, -25px, 0)' : 'translate3d(-100px, 0, 0)';
        this.carouselCol.style.opacity = '0';
        this.carouselCol.style.transform = isStacked ? 'translate3d(0, -25px, 0)' : 'translate3d(100px, 0, 0)';
      } else {
        const exitProgress = (scrollY - exitStart) / exitDistance;
        // Smooth ease curve: gradual start so disappearance doesn't feel abrupt
        const ease = exitProgress * exitProgress;
        const opacity = Math.max(0, 1 - exitProgress * 1.05);
        
        this.narrativeCol.style.opacity = opacity.toFixed(3);
        this.carouselCol.style.opacity = opacity.toFixed(3);

        if (isStacked) {
          // On mobile & tablets: vertical fade only — strictly avoid horizontal shifts that cause mobile page scroll
          const shiftY = (-25 * ease).toFixed(1);
          this.narrativeCol.style.transform = `translate3d(0, ${shiftY}px, 0)`;
          this.carouselCol.style.transform = `translate3d(0, ${shiftY}px, 0)`;
        } else {
          // Desktop wide screen: horizontal dispersal
          const shiftDistance = 90 * ease;
          this.narrativeCol.style.transform = `translate3d(${-shiftDistance.toFixed(1)}px, 0, 0)`;
          this.carouselCol.style.transform = `translate3d(${shiftDistance.toFixed(1)}px, 0, 0)`;
        }
      }
    }
  }
}
