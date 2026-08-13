# GBblitz - Dark Mode Video Gallery & Cycling Photo Showcase

A responsive dark mode video gallery web application featuring glowing hover-play video thumbnails, an auto-cycling top photo album carousel, an expanded theater player modal, and Google Drive folder integration.

![GBblitz Dark Mode Gallery](https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1200&q=80)

---

## ✨ Features

- **Cycling Photo Album Showcase**:
  - Auto-advancing visual photo album with progress bar.
  - Interactive navigation arrows, indicator pills, and auto-pause on cursor hover.
- **Glowing Hover-Play Video Cards**:
  - Rounded cards with neon luminous glow shadows on hover.
  - Interactive hover video auto-preview with muted video streaming and live progress bar.
- **Theater Player Modal (Expanded View)**:
  - Click any video card to launch the theater view.
  - Next/Previous controls, fullscreen mode, and direct Google Drive links.
- **Google Drive Integration**:
  - Connected to the Google Drive folder: `18x3yVSkUv8jiAAeRnQ8CgeOBkzgiVx6uufIjG6rVmSYbzu75VALwxyi5ra19LFmg_5F2NxFA`.
  - Built-in Drive folder URL parser and optional Google Drive API v3 sync.
  - Support for direct iframe previews (`/preview`) and quick link additions.
- **Category Filter & Instant Search**:
  - Filter videos by Google Drive, Cinematic, Nature & City, or search titles in real time.
- **Dark Mode Aesthetic**:
  - Deep black backdrops (`#060709`), glassmorphism navigation, ambient luminous backdrops, and modern typography.

---

## 🚀 Getting Started

Simply open `index.html` in any modern web browser or serve via any static file server:

```bash
# Using Python
python -m http.server 8000

# Using Node.js npx serve
npx serve .
```

Open `http://localhost:8000` to view the website.

---

## 🛠️ Tech Stack

- **HTML5**: Semantic tags, accessible attributes, and responsive layout.
- **Vanilla CSS**: Custom properties, dark theme styling, glassmorphism, glowing hover states, and fluid grids.
- **Vanilla JavaScript (ES6+)**: Responsive carousel controller, hover video playback engine, modal management, and Google Drive URL parsing.
