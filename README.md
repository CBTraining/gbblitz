# Googlebook Launch Blitz Video Gallery

A responsive cinematic dark-mode video showcase web application featuring Wave 1–5 community submissions, live Google Sheet synchronization, an interactive 3D starry canvas backdrop, a 3D top highlighted video carousel, desktop hover-play video previews, and an expanded theater modal player.

---

## 📁 Architecture & File Sitemap

```text
├── index.html                 # Main entry point: semantic HTML, resource preconnections & cache buster
├── styles.css                 # Consolidated stylesheet manifest & bundling reference
├── favicon.svg                # Vector SVG site favicon
├── CNAME                      # Custom domain configuration (googlebookblitz.com)
│
├── css/                       # Modular Component Stylesheets (Parallel Fetch, Zero @import Waterfall)
│   ├── variables.css          # Theme tokens: Google palette, elevations, radii, transitions
│   ├── base.css               # Typography (Google Sans @font-face), resets, background gradients
│   ├── header.css             # Frosted navigation header & Googlebook responsive logo
│   ├── hero.css               # Hero section, headlines, solid badges & stat chips
│   ├── carousel.css           # Top 3D highlighted showcase carousel & controls
│   ├── gallery.css            # Filter pills, search bar, video grid cards & badges
│   ├── modal.css              # Theater modal player, aspect container, controls & footer
│   ├── magic-pointer.css      # Desktop cursor easter egg styling & sparkle animations
│   └── responsive.css         # Mobile and tablet viewport media queries
│
├── js/                        # Modular JavaScript Architecture (Native ES Modules)
│   ├── main.js                # App bootstrap: initializes components on DOMContentLoaded
│   ├── config.js              # Central constants: Google Sheet IDs and CSV export endpoints
│   ├── data/
│   │   ├── preloaded-videos.js # 138-video offline dataset (compressed tuple array, 80% smaller)
│   │   └── aspect-ratios.js    # Known video aspect ratio overrides (portrait vs widescreen)
│   ├── services/
│   │   ├── sheet-service.js    # Pure RFC-compliant CSV parser & designation validator
│   │   └── live-sync.js        # Background Google Sheet polling, tab-visibility cooldowns, cache
│   └── components/
│       ├── video-gallery.js    # Gallery controller: wave filtering, live search & card grid
│       ├── carousel.js         # Top 3D rotating showcase carousel & autoplay engine
│       ├── theater-modal.js    # Theater modal player, fullscreen mode, keyboard navigation
│       ├── hover-preview.js    # Desktop video card hover preview manager & progress scrub
│       ├── scroll-logo.js      # Sticky header logo transition & dynamic backdrop blur
│       ├── starry-sky.js       # 3D interactive particle lattice canvas & constellation physics
│       └── magic-pointer.js    # Desktop rapid-wiggle cursor easter egg & sparkle trail
│
├── Graphic Assets/            # Logos, icons, and cursor assets
├── Fonts/                     # Google Sans typography font files
└── archive/                   # Archived legacy scripts and raw scratch data dumps
```

---

## ✨ Key Features

- **Instant Zero-Latency Render**:
  - Automatically loads 138 validated Wave 1–5 videos from an optimized offline dataset, rendering immediately even before network sync.
- **Live Google Sheet Background Sync**:
  - Automatically polls the live Google Sheet for new approvals or updates with signature-based diffing, tab-visibility pausing, and `localStorage` caching.
- **Dynamic Orientation & Aspect Ratio Handling**:
  - Automatic detection of vertical (9:16 portrait) and widescreen (16:9 landscape) videos with dedicated aspect containers so videos fill the screen without black bars or distortion.
- **Desktop Hover Previews**:
  - 550ms hover delay initiates a silent inline preview with an 8-second scrub progress bar; automatically stops when moving away or opening theater mode.
- **Full Theater Modal Player**:
  - Keyboard hotkeys (`Esc` to close, `←` / `→` to navigate), direct Google Drive shortcuts, and full viewport autoplay compliance.
- **Mobile-First Responsive Layout**:
  - Strict horizontal clip prevention, touch-friendly tap targets, and disabled coarse-pointer cursor overrides for phone ergonomics.

---

## 🚀 Getting Started

Open `index.html` in any modern web browser or serve via any static file server:

```bash
# Using Python
python -m http.server 8000

# Using Node.js npx serve
npx serve .
```

Open `http://localhost:8000` to view the website.
