/**
 * GBblitz - Magic Pointer Easter Egg Manager
 * Detects 1-second rapid mouse wiggles to transform the cursor into Graphic Assets/magicpointer.png.
 */
export class MagicPointerManager {
  constructor() {
    this.pointer = document.getElementById('magic-pointer');
    if (!this.pointer) return;

    // Do not run on touch-only devices
    if (window.matchMedia('(pointer: coarse)').matches) return;

    this.isActive = false;
    this.isVisible = false;
    this.mouseX = -100;
    this.mouseY = -100;

    // Exact hotspot measured from Graphic Assets/magicpointer.png
    // Arrow tip: x = 26.58%, y = 24.36%
    this.POINTER_WIDTH = 44;
    this.POINTER_HEIGHT = 47;
    this.HOTSPOT_X = this.POINTER_WIDTH * 0.2658;
    this.HOTSPOT_Y = this.POINTER_HEIGHT * 0.2436;

    // Wiggle detection variables
    this.lastX = 0;
    this.lastY = 0;
    this.lastTime = 0;
    this.currentDir = 0; // +1 right, -1 left, +2 down, -2 up
    this.lastReversalTime = 0;
    this.wiggleStartTime = 0;
    this.reversals = 0;
    this.cooldownUntil = 0;
    this.REQUIRED_DURATION = 950; // ~1 second
    this.MIN_REVERSALS = 4;

    // Sparkle palette (Google Workspace gradients)
    this.sparkleColors = ['#1a73e8', '#A9A8FF', '#ea4335', '#FF63A0', '#f9ab00', '#34a853', '#78C9FF', '#a142f4', '#64AFFF'];
    this.lastSparkleX = 0;
    this.lastSparkleY = 0;
    this.isClicking = false;
    this.rafPending = false;

    this.initEvents();
  }

  updatePosition(x, y) {
    this.mouseX = x;
    this.mouseY = y;
    if (!this.isActive) return;

    if (!this.rafPending) {
      this.rafPending = true;
      requestAnimationFrame(() => {
        this.rafPending = false;
        this.renderPosition();
      });
    }

    // Sparkle trail on movement
    const dist = Math.hypot(x - this.lastSparkleX, y - this.lastSparkleY);
    if (dist > 38 && Math.random() < 0.45) {
      this.lastSparkleX = x;
      this.lastSparkleY = y;
      this.spawnTrailSparkle(x, y);
    }
  }

  renderPosition() {
    if (!this.isActive) return;
    const posX = this.mouseX - this.HOTSPOT_X;
    const posY = this.mouseY - this.HOTSPOT_Y;
    const clickScale = this.isClicking ? ' scale(0.88) rotate(-4deg)' : '';

    this.pointer.style.setProperty('--mp-x', posX + 'px');
    this.pointer.style.setProperty('--mp-y', posY + 'px');
    this.pointer.style.transform = `translate3d(${posX.toFixed(1)}px, ${posY.toFixed(1)}px, 0)${clickScale}`;
  }

  setMagicPointer(active) {
    this.isActive = active;
    if (this.isActive) {
      document.body.classList.add('magic-pointer-active');
      this.pointer.classList.add('pointer-visible');
      this.isVisible = true;
      this.updatePosition(this.mouseX, this.mouseY);
      this.spawnActivationBurst(this.mouseX, this.mouseY);
      this.playChime(true);
    } else {
      document.body.classList.remove('magic-pointer-active');
      this.pointer.classList.remove('pointer-visible', 'pointer-hovering', 'pointer-clicking');
      this.isVisible = false;
      this.playChime(false);
    }
  }

  spawnActivationBurst(x, y) {
    const count = 18;
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 + (Math.random() - 0.5) * 0.35;
      const distance = 35 + Math.random() * 50;
      const color = this.sparkleColors[i % this.sparkleColors.length];
      const size = 5 + Math.random() * 6;

      const spark = document.createElement('div');
      spark.className = 'magic-sparkle';
      spark.style.left = x + 'px';
      spark.style.top = y + 'px';
      spark.style.width = size + 'px';
      spark.style.height = size + 'px';
      spark.style.backgroundColor = color;
      spark.style.boxShadow = `0 0 10px ${color}, 0 0 18px ${color}`;
      spark.style.setProperty('--spark-dx', (Math.cos(angle) * distance).toFixed(1) + 'px');
      spark.style.setProperty('--spark-dy', (Math.sin(angle) * distance).toFixed(1) + 'px');

      document.body.appendChild(spark);
      setTimeout(() => spark.remove(), 700);
    }
  }

  spawnTrailSparkle(x, y) {
    const color = this.sparkleColors[Math.floor(Math.random() * this.sparkleColors.length)];
    const size = 3.5 + Math.random() * 4;
    const spark = document.createElement('div');
    spark.className = 'magic-sparkle';
    spark.style.left = (x + (Math.random() - 0.5) * 6) + 'px';
    spark.style.top = (y + (Math.random() - 0.5) * 6) + 'px';
    spark.style.width = size + 'px';
    spark.style.height = size + 'px';
    spark.style.backgroundColor = color;
    spark.style.boxShadow = `0 0 8px ${color}`;
    spark.style.setProperty('--spark-dx', ((Math.random() - 0.5) * 16) + 'px');
    spark.style.setProperty('--spark-dy', (10 + Math.random() * 16) + 'px');

    document.body.appendChild(spark);
    setTimeout(() => spark.remove(), 600);
  }

  playChime(isEnable) {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      const notes = isEnable ? [523.25, 659.25, 783.99, 1046.50] : [783.99, 523.25];
      const start = ctx.currentTime;
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = freq;
        const noteStart = start + idx * 0.08;
        gain.gain.setValueAtTime(0.04, noteStart);
        gain.gain.exponentialRampToValueAtTime(0.0001, noteStart + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(noteStart);
        osc.stop(noteStart + 0.36);
      });
    } catch (_) {
      // Audio context may be restricted by autoplay policy, fail gracefully
    }
  }

  initEvents() {
    window.addEventListener('mousemove', (e) => {
      const now = performance.now();
      this.updatePosition(e.clientX, e.clientY);

      if (!this.isVisible && this.isActive) {
        this.pointer.classList.add('pointer-visible');
        this.isVisible = true;
      }

      if (now < this.cooldownUntil) {
        this.lastX = e.clientX;
        this.lastY = e.clientY;
        this.lastTime = now;
        return;
      }

      const dx = e.clientX - this.lastX;
      const dy = e.clientY - this.lastY;

      // Determine movement axis and direction
      let dir = 0;
      if (Math.abs(dx) >= Math.abs(dy) && Math.abs(dx) > 8) {
        dir = dx > 0 ? 1 : -1;
      } else if (Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > 8) {
        dir = dy > 0 ? 2 : -2;
      }

      if (dir !== 0) {
        if (dir !== this.currentDir) {
          this.currentDir = dir;
          const timeSinceLast = now - this.lastReversalTime;
          this.lastReversalTime = now;

          if (timeSinceLast < 380 && timeSinceLast > 30) {
            if (this.reversals === 0) {
              this.wiggleStartTime = now;
            }
            this.reversals++;
            const duration = now - this.wiggleStartTime;

            if (duration >= this.REQUIRED_DURATION && this.reversals >= this.MIN_REVERSALS) {
              // 2-second wiggle confirmed: toggle easter egg!
              this.setMagicPointer(!this.isActive);
              this.cooldownUntil = now + 1500;
              this.reversals = 0;
              this.wiggleStartTime = 0;
            }
          } else {
            // Speed dropped or too long between strokes, reset to 1
            this.reversals = 1;
            this.wiggleStartTime = now;
          }
        }
      }

      this.lastX = e.clientX;
      this.lastY = e.clientY;
      this.lastTime = now;
    }, { passive: true });

    // Reset wiggle progress if user pauses
    setInterval(() => {
      const now = performance.now();
      if (now - this.lastReversalTime > 420 && this.reversals > 0) {
        this.reversals = 0;
        this.wiggleStartTime = 0;
      }
    }, 150);

    // Interactive Hover States
    document.addEventListener('mouseover', (e) => {
      if (!this.isActive) return;
      const target = e.target;
      if (target.closest('a, button, input, select, textarea, .filter-pill, .video-card, .carousel-nav, .carousel-indicator, .brand, [role="button"], .clickable')) {
        this.pointer.classList.add('pointer-hovering');
      } else {
        this.pointer.classList.remove('pointer-hovering');
      }
    });

    // Mouse Down / Up tactile micro-press
    document.addEventListener('mousedown', () => {
      if (this.isActive) {
        this.isClicking = true;
        this.pointer.classList.add('pointer-clicking');
        this.renderPosition();
      }
    });

    document.addEventListener('mouseup', () => {
      if (this.isActive) {
        this.isClicking = false;
        this.pointer.classList.remove('pointer-clicking');
        this.renderPosition();
      }
    });

    // Hide pointer when leaving window
    document.addEventListener('mouseleave', () => {
      if (this.isActive) {
        this.pointer.classList.remove('pointer-visible');
        this.isVisible = false;
      }
    });

    document.addEventListener('mouseenter', (e) => {
      if (this.isActive) {
        this.pointer.classList.add('pointer-visible');
        this.isVisible = true;
        this.updatePosition(e.clientX, e.clientY);
      }
    });
  }
}
