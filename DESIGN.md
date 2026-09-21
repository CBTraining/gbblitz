# Googlebook Launch Blitz — Design System & Visual Specification

`DESIGN.md` serves as the authoritative source of truth for all UI, color schemes, typography, layout geometry, and interaction patterns across the Googlebook Launch Blitz application. All future components, features, and modifications must strictly conform to the specifications outlined in this document.

---

## 1. Core Color System

The interface utilizes a cinematic, deep dark-mode aesthetic inspired by the Google Hardware and Gemini visual identities.

### 1.1 Canvas & Surface Hierarchy
| Token | Value | Role / Usage |
| :--- | :--- | :--- |
| `--bg-black` | `#000000` | Deepest root canvas backdrop |
| `--bg-surface` | `#161a1e` | Main Window Color (video cards, carousel wrapper, modal player) |
| `--bg-surface-inner` | `#292c34` | Inner Window Color (filter pills, input containers) |
| `--bg-surface-secondary` | `#323d4e` | Secondary interactive states and hover fills |
| `--bg-surface-elevated` | `#1e2329` | Floating tooltips, dropdowns, and overlays |

### 1.2 Primary Accent Colors
| Token | Hex | Role |
| :--- | :--- | :--- |
| `--accent-blue` | `#3186ff` | Primary Google Blue accent, links, active glow |
| `--accent-green` | `#0ebc5f` | Google Green, approval badges, verified state |
| `--accent-yellow` | `#ffcc00` | Google Yellow, winners, star highlights |
| `--accent-red` | `#ff4641` | Google Red, runner-up, live alerts |

### 1.3 Borders & Dividers
| Token | Value | Role |
| :--- | :--- | :--- |
| `--border-subtle` | `rgba(255, 255, 255, 0.08)` | Default subtle card borders |
| `--border-medium` | `rgba(255, 255, 255, 0.14)` | Hover borders, active separators |
| `--border-active` | `rgba(49, 134, 255, 0.50)` | Focused inputs, selected filters |

---

## 2. Gradient Palettes & Badge Specifications

### 2.1 Wave Badges & Pills
- **Text Color**: Always pure white (`#ffffff`).
- **Pill Shape**: Fully rounded (`border-radius: var(--radius-pill);` / `9999px`).
- **Border**: None (`border: none;`).
- **Shadow**: Ambient color glow matching the leading gradient tone.

| Wave Tag | Gradient Definition | Text Color | Glow Shadow |
| :--- | :--- | :--- | :--- |
| **Wave 1** | `linear-gradient(90deg, #3387ff 0%, #a9a8ff 100%)` | `#ffffff` | `0 2px 8px rgba(51, 135, 255, 0.35)` |
| **Wave 2** | `linear-gradient(90deg, #ea4335 0%, #ff63a0 100%)` | `#ffffff` | `0 2px 8px rgba(234, 67, 53, 0.35)` |
| **Wave 3** | `linear-gradient(90deg, #f9ab00 0%, #ffb5e8 100%)` | `#ffffff` | `0 2px 8px rgba(249, 171, 0, 0.35)` |
| **Wave 4** | `linear-gradient(90deg, #34a853 0%, #78c9ff 100%)` | `#ffffff` | `0 2px 8px rgba(52, 168, 83, 0.35)` |
| **Wave 5** | `linear-gradient(90deg, #a142f4 0%, #64afff 100%)` | `#ffffff` | `0 2px 8px rgba(161, 66, 244, 0.35)` |

### 2.2 Brand & Multi-Color Gradients
- **`--googlebook-gradient`**: `linear-gradient(90deg, #3186ff 0%, #0ebc5f 33%, #ffcc00 66%, #ff4641 100%)`
- **`--googlebook-border-glow`**: `linear-gradient(135deg, #3186ff 0%, #0ebc5f 38%, #ffcc00 70%, #ff4641 100%)`
- **`--grad-workspace`**: `linear-gradient(135deg, #64afff 0%, #34a853 50%, #fff549 100%)`

---

## 3. Layout Geometry & Radius Guidelines

All windows and cards adhere strictly to the established design geometry:
- **Card Windows**: `25px` (`--radius-card`) — Main video cards, carousel wrapper, search box container, theater modal player.
- **Inner Windows**: `16px` (`--radius-inner`) — Sub-containers, inner widgets, mobile cards.
- **Pills & Badges**: `9999px` (`--radius-pill`) — Wave tags, status pills, filter buttons.
- **Small Controls**: `8px` (`--radius-sm`) — Micro buttons, volume sliders, control icons.

### 3.1 Media Aspect Ratios
- **Gallery Video Cards**: Uniform **3:2** (`aspect-ratio: 3 / 2;`), matching the Highlighted Videos carousel showcase for balanced proportions across landscape and portrait media (`object-fit: cover; object-position: center 25%;`).
- **Highlighted Videos Carousel Showcase**: Uniform **3:2** (`aspect-ratio: 3 / 2;`), content fills by width and height (`object-fit: cover; object-position: center 25%;`) to naturally host both landscape and portrait submissions.
- **Theater Modal Player**: 16:9 desktop container with adaptive dynamic ratio expansion for portrait vertical videos.

---

## 4. Typography Rules

- **Primary Font**: `Google Sans`, `-apple-system`, `BlinkMacSystemFont`, `sans-serif`.
- **Monospace Font**: `Space Grotesk`, `monospace` (used for timestamps, counters, and technical tags).

### 4.1 Card Title Uniformity
- **Line Height**: `1.35`.
- **Reserved Height**: `min-height: 2.7em;` (exactly 2 lines of text).
- **Line Clamping**: `-webkit-line-clamp: 2;` (with ellipsis for overflow).
- **Alignment**: Guarantees that 1-line and 2-line cards in the grid have identical vertical heights and perfectly aligned bottom badges.

---

## 5. Animation & Motion Design

All animations use fluid, non-springy, natural deceleration curves:

### 5.1 Card Scroll Entrance
- **Initial State**: `opacity: 0; transform: scale(0.92); pointer-events: none;`
- **Revealed State**: `opacity: 1; transform: scale(1); pointer-events: auto;`
- **Timing**: `0.42s cubic-bezier(0.2, 0.8, 0.2, 1)` (smooth, zero bounce/spring).
- **Trigger**: `IntersectionObserver` with `-25px` bottom margin.

### 5.2 Card Hover Interaction
- **Lift**: `translateY(-5px) scale(1)`.
- **Perimeter Glow**: Dual-tone gradient glow:
  ```css
  box-shadow: 
    0 20px 45px -10px rgba(0, 0, 0, 0.95),
    -4px -2px 28px -4px rgba(49, 134, 255, 0.35),
    4px 6px 32px -4px rgba(255, 70, 65, 0.35);
  border-color: rgba(49, 134, 255, 0.55);
  ```

### 5.3 Reduced Motion
All animations strictly respect `@media (prefers-reduced-motion: reduce)` by immediately rendering at full opacity without scale or transform shifts.

---

## 6. How to Extend This Document
When introducing new features, badges, or color combinations:
1. Document the exact HEX / RGB color values and gradients in this file.
2. Maintain the 25px / 16px / 9999px geometry system.
3. Ensure text contrast meets WCAG AA standards (e.g. white text `#ffffff` on solid saturated gradient pills).
