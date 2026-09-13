/**
 * GBblitz - 3D Interactive Starry Sky Space Theme
 * Responsive canvas rendering particle lattice, pointer interaction, and celestial stars.
 */
export class StarrySkyBackground {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');

    this.stars = [];
    this.meteors = [];
    this.dustParticles = [];
    this.mouseTrail = [];

    // Google brand colors for speckled cosmic accent stars & subtle nebulae
    this.googleColors = [
      { r: 66,  g: 133, b: 244, hex: '#4285f4' }, // Google Blue
      { r: 120, g: 201, b: 255, hex: '#78c9ff' }, // Light Blue
      { r: 234, g: 67,  b: 53,  hex: '#ea4335' }, // Google Red
      { r: 255, g: 112, b: 162, hex: '#ff70a2' }, // Soft Coral/Pink
      { r: 251, g: 188, b: 4,   hex: '#fbbc04' }, // Google Yellow
      { r: 255, g: 220, b: 110, hex: '#ffdc6e' }, // Warm Star Gold
      { r: 52,  g: 168, b: 83,  hex: '#34a853' }, // Google Green
      { r: 129, g: 201, b: 149, hex: '#81c995' }, // Soft Emerald
      { r: 161, g: 66,  b: 244, hex: '#a142f4' }, // Google Purple
      { r: 197, g: 138, b: 249, hex: '#c58af9' }  // Lavender
    ];

    this.mouse = { x: -9999, y: -9999, hover: false, speed: 0 };
    this.rotX = 0;
    this.rotY = 0;
    this.targetRotX = 0;
    this.targetRotY = 0;
    this.fov = 680;
    this.isRunning = true;
    this.startTime = performance.now();
    this.introDuration = 1500;
    this.introMeteorSpawned = false;

    this.init();
  }

  init() {
    this.resize();
    window.addEventListener('resize', () => {
      this.resize();
      this.generateStars();
      this.generateDust();
    }, { passive: true });

    // Interactive mouse tracking: 3D parallax tilt & stardust trail
    let prevMouseX = 0;
    let prevMouseY = 0;
    window.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const relX = e.clientX - (rect.left + rect.width / 2);
      const relY = e.clientY - (rect.top + rect.height / 2);
      this.targetRotY = relX * 0.00032;
      this.targetRotX = -relY * 0.00022;

      const canvasX = e.clientX - rect.left;
      const canvasY = e.clientY - rect.top;
      const distMoved = Math.hypot(canvasX - prevMouseX, canvasY - prevMouseY);
      this.mouse.speed = Math.min(distMoved, 30);
      prevMouseX = canvasX;
      prevMouseY = canvasY;

      this.mouse.x = canvasX;
      this.mouse.y = canvasY;
      this.mouse.hover = true;

      // Stardust particle emission on cursor motion (desktop only)
      if (window.innerWidth >= 768 && this.mouse.speed > 2.5 && Math.random() < 0.65) {
        const color = Math.random() < 0.35 
          ? this.googleColors[Math.floor(Math.random() * this.googleColors.length)]
          : { r: 255, g: 255, b: 255 };
        this.mouseTrail.push({
          x: this.mouse.x + (Math.random() - 0.5) * 16,
          y: this.mouse.y + (Math.random() - 0.5) * 16,
          vx: (Math.random() - 0.5) * 0.8,
          vy: (Math.random() - 0.5) * 0.8 - 0.35,
          size: Math.random() * 2.2 + 0.9,
          alpha: 0.85,
          decay: 0.018 + Math.random() * 0.018,
          color: color
        });
      }
    }, { passive: true });

    window.addEventListener('mouseleave', () => {
      this.targetRotX = 0;
      this.targetRotY = 0;
      this.mouse.hover = false;
      this.mouse.x = -9999;
      this.mouse.y = -9999;
    });

    this.generateStars();
    this.generateDust();

    // Hardware & battery efficiency: Pause canvas loop when offscreen or tab hidden
    if ('IntersectionObserver' in window) {
      this.observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          this.setRunning(entry.isIntersecting && !document.hidden);
        });
      }, { rootMargin: '120px' });
      this.observer.observe(this.canvas);
    }

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.setRunning(false);
      } else {
        const rect = this.canvas.getBoundingClientRect();
        const inView = rect.bottom > 0 && rect.top < window.innerHeight;
        this.setRunning(inView);
      }
    });

    this.animate();
  }

  resize() {
    this.width = this.canvas.clientWidth;
    this.height = this.canvas.clientHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.canvas.width = this.width * dpr;
    this.canvas.height = this.height * dpr;
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.scale(dpr, dpr);
  }

  generateStars() {
    this.stars = [];
    const isMobile = window.innerWidth < 768;
    const count = isMobile ? 120 : 300;
    const spreadX = Math.max(this.width * (isMobile ? 1.15 : 1.35), isMobile ? 800 : 1700);
    const spreadY = Math.max(this.height * (isMobile ? 1.25 : 1.45), isMobile ? 600 : 1100);
    const depth = isMobile ? 600 : 920;

    for (let i = 0; i < count; i++) {
      // Mostly white stars (~82%), with Google brand colors speckled in (~18%)
      const isGoogleAccent = Math.random() < 0.18;
      let color;
      if (isGoogleAccent) {
        color = this.googleColors[Math.floor(Math.random() * this.googleColors.length)];
      } else {
        const warmth = Math.random();
        if (warmth > 0.85) {
          color = { r: 240, g: 245, b: 255 }; // Diamond ice white
        } else if (warmth > 0.70) {
          color = { r: 255, g: 248, b: 235 }; // Warm stellar white
        } else {
          color = { r: 255, g: 255, b: 255 }; // Pure brilliant white
        }
      }

      // Prominent stars with 4-point celestial diffraction spikes
      const hasDiffractionSpike = isGoogleAccent ? (Math.random() < 0.25) : (Math.random() < 0.08);

      this.stars.push({
        origX: (Math.random() - 0.5) * spreadX,
        origY: (Math.random() - 0.5) * spreadY,
        origZ: (Math.random() - 0.5) * depth,
        x: 0, y: 0, z: 0,
        x2d: 0, y2d: 0, scale: 0,
        baseRadius: Math.random() * 1.6 + 0.8,
        color: color,
        isGoogleAccent: isGoogleAccent,
        hasSpike: hasDiffractionSpike,
        twinkleSpeed: 0.0016 + Math.random() * 0.0035,
        twinklePhase: Math.random() * Math.PI * 2,
        dispX: 0,
        dispY: 0,
        vx: 0,
        vy: 0
      });
    }
  }

  generateDust() {
    this.dustParticles = [];
    const count = window.innerWidth < 768 ? 18 : 50;
    for (let i = 0; i < count; i++) {
      this.dustParticles.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        vx: (Math.random() - 0.5) * 0.22,
        vy: (Math.random() - 0.5) * 0.18 - 0.06,
        radius: Math.random() * 2.2 + 0.8,
        alpha: Math.random() * 0.35 + 0.1,
        color: Math.random() < 0.35
          ? this.googleColors[Math.floor(Math.random() * this.googleColors.length)]
          : { r: 255, g: 255, b: 255 }
      });
    }
  }

  spawnMeteor() {
    const startX = Math.random() * (this.width * 0.8) + this.width * 0.1;
    const startY = Math.random() * (this.height * 0.4);
    const length = Math.random() * 95 + 75;
    const speed = Math.random() * 9 + 13;
    const angle = Math.PI / 4 + (Math.random() - 0.5) * 0.35;
    const color = Math.random() < 0.45 
      ? this.googleColors[Math.floor(Math.random() * this.googleColors.length)]
      : { r: 255, g: 255, b: 255 };

    this.meteors.push({
      x: startX,
      y: startY,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      length: length,
      opacity: 1.0,
      decay: 0.022 + Math.random() * 0.015,
      color: color
    });
  }

  project(now) {
    const cx = this.width / 2;
    const cy = this.height / 2;

    const cosX = Math.cos(this.rotX);
    const sinX = Math.sin(this.rotX);
    const cosY = Math.cos(this.rotY);
    const sinY = Math.sin(this.rotY);

    const elapsed = now - this.startTime;
    const rawIntro = Math.min(1, elapsed / this.introDuration);
    const introEase = 1 - Math.pow(1 - rawIntro, 3);
    const introScale = 0.65 + 0.35 * introEase;

    for (let i = 0; i < this.stars.length; i++) {
      const s = this.stars[i];

      // Smooth space drift forward (launch journey through cosmos)
      s.origZ -= 0.28;
      if (s.origZ < -this.fov + 40) {
        s.origZ += 880;
      }

      // 3D rotation from parallax
      const x1 = s.origX * cosY - s.origZ * sinY;
      const z1 = s.origZ * cosY + s.origX * sinY;
      const y2 = s.origY * cosX - z1 * sinX;
      const z2 = z1 * cosX + s.origY * sinX;

      s.x = x1;
      s.y = y2;
      s.z = z2;

      const f = this.fov / (this.fov + z2);
      s.scale = f;

      s.x2d = cx + (x1 * f + s.dispX) * introScale;
      s.y2d = cy + (y2 * f + s.dispY) * introScale;

      // Interactive mouse repulsion/gravitational wave
      if (this.mouse.hover) {
        const dx = s.x2d - this.mouse.x;
        const dy = s.y2d - this.mouse.y;
        const dist = Math.hypot(dx, dy);
        const maxInteractDist = 135;

        if (dist < maxInteractDist && dist > 1) {
          const force = (1 - dist / maxInteractDist) * 3.6;
          s.vx += (dx / dist) * force;
          s.vy += (dy / dist) * force;
        }
      }

      // Spring damping return
      s.vx += -s.dispX * 0.08;
      s.vy += -s.dispY * 0.08;
      s.vx *= 0.88;
      s.vy *= 0.88;
      s.dispX += s.vx;
      s.dispY += s.vy;
    }
  }

  render(now) {
    this.ctx.clearRect(0, 0, this.width, this.height);

    const elapsed = now - this.startTime;
    const rawIntro = Math.min(1, elapsed / this.introDuration);
    const introEase = 1 - Math.pow(1 - rawIntro, 3);
    const introScale = 0.65 + 0.35 * introEase;

    // Trigger introductory shooting star as title comes into focus
    if (elapsed > 450 && !this.introMeteorSpawned) {
      this.spawnMeteor();
      this.introMeteorSpawned = true;
    }

    // 1. Soft deep-space cosmic nebulae (Google Blue & Google Purple hints)
    const nebulaAlpha1 = (0.075 * introEase).toFixed(4);
    const nebulaAlpha2 = (0.055 * introEase).toFixed(4);

    const bgGrad1 = this.ctx.createRadialGradient(
      this.width * 0.32, this.height * 0.45, 0,
      this.width * 0.32, this.height * 0.45, this.width * 0.45 * introScale
    );
    bgGrad1.addColorStop(0, `rgba(66, 133, 244, ${nebulaAlpha1})`);
    bgGrad1.addColorStop(1, 'transparent');
    this.ctx.fillStyle = bgGrad1;
    this.ctx.fillRect(0, 0, this.width, this.height);

    const bgGrad2 = this.ctx.createRadialGradient(
      this.width * 0.72, this.height * 0.55, 0,
      this.width * 0.72, this.height * 0.55, this.width * 0.38 * introScale
    );
    bgGrad2.addColorStop(0, `rgba(161, 66, 244, ${nebulaAlpha2})`);
    bgGrad2.addColorStop(1, 'transparent');
    this.ctx.fillStyle = bgGrad2;
    this.ctx.fillRect(0, 0, this.width, this.height);

    // 2. Cosmic Dust Motes
    for (let i = 0; i < this.dustParticles.length; i++) {
      const d = this.dustParticles[i];
      d.x += d.vx;
      d.y += d.vy;
      if (d.x < 0) d.x = this.width;
      if (d.x > this.width) d.x = 0;
      if (d.y < 0) d.y = this.height;
      if (d.y > this.height) d.y = 0;

      this.ctx.beginPath();
      this.ctx.arc(d.x, d.y, d.radius, 0, Math.PI * 2);
      this.ctx.fillStyle = `rgba(${d.color.r}, ${d.color.g}, ${d.color.b}, ${(d.alpha * introEase).toFixed(3)})`;
      this.ctx.fill();
    }

    // -------------------------------------------------------------
    // 4. Interactive Constellation Lines Near Mouse
    // -------------------------------------------------------------
    if (this.mouse.hover) {
      this.ctx.beginPath();
      let connectCount = 0;
      for (let i = 0; i < this.stars.length && connectCount < 10; i++) {
        const s = this.stars[i];
        const dist = Math.hypot(s.x2d - this.mouse.x, s.y2d - this.mouse.y);
        if (dist < 115) {
          const alpha = (1 - dist / 115) * 0.28;
          this.ctx.moveTo(this.mouse.x, this.mouse.y);
          this.ctx.lineTo(s.x2d, s.y2d);
          this.ctx.strokeStyle = `rgba(${s.color.r}, ${s.color.g}, ${s.color.b}, ${alpha})`;
          this.ctx.lineWidth = 0.8;
          this.ctx.stroke();
          connectCount++;
        }
      }
    }

    // -------------------------------------------------------------
    // 5. Interactive Stardust Trail
    // -------------------------------------------------------------
    for (let i = this.mouseTrail.length - 1; i >= 0; i--) {
      const p = this.mouseTrail[i];
      p.x += p.vx;
      p.y += p.vy;
      p.alpha -= p.decay;
      if (p.alpha <= 0) {
        this.mouseTrail.splice(i, 1);
        continue;
      }
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.size * p.alpha, 0, Math.PI * 2);
      this.ctx.fillStyle = `rgba(${p.color.r}, ${p.color.g}, ${p.color.b}, ${p.alpha})`;
      this.ctx.fill();
    }

    // -------------------------------------------------------------
    // 6. 3D Stars: mostly crisp white with speckled Google colors
    // -------------------------------------------------------------
    for (let i = 0; i < this.stars.length; i++) {
      const s = this.stars[i];
      if (s.scale <= 0) continue;

      const twinkle = 0.65 + 0.35 * Math.sin(now * s.twinkleSpeed + s.twinklePhase);
      const rad = Math.max(0.6, s.baseRadius * s.scale);
      const baseAlpha = Math.min(1.0, Math.max(0.2, (s.scale - 0.35) * 1.8));
      const finalAlpha = baseAlpha * twinkle * introEase;

      const c = s.color;

      // Soft star halo
      if (s.isGoogleAccent || s.scale > 0.9) {
        const haloSize = rad * (s.isGoogleAccent ? 3.4 : 2.4);
        const haloGrad = this.ctx.createRadialGradient(s.x2d, s.y2d, 0, s.x2d, s.y2d, haloSize);
        haloGrad.addColorStop(0, `rgba(${c.r}, ${c.g}, ${c.b}, ${finalAlpha * 0.7})`);
        haloGrad.addColorStop(1, `rgba(${c.r}, ${c.g}, ${c.b}, 0)`);
        this.ctx.beginPath();
        this.ctx.arc(s.x2d, s.y2d, haloSize, 0, Math.PI * 2);
        this.ctx.fillStyle = haloGrad;
        this.ctx.fill();
      }

      // 4-point celestial diffraction spike on prominent stars
      if (s.hasSpike && s.scale > 0.75) {
        const spikeLen = rad * 4.5 * twinkle;
        this.ctx.beginPath();
        this.ctx.moveTo(s.x2d - spikeLen, s.y2d);
        this.ctx.lineTo(s.x2d + spikeLen, s.y2d);
        this.ctx.moveTo(s.x2d, s.y2d - spikeLen);
        this.ctx.lineTo(s.x2d, s.y2d + spikeLen);
        this.ctx.strokeStyle = `rgba(${c.r}, ${c.g}, ${c.b}, ${finalAlpha * 0.45})`;
        this.ctx.lineWidth = 0.9;
        this.ctx.stroke();
      }

      // Star core
      this.ctx.beginPath();
      this.ctx.arc(s.x2d, s.y2d, rad, 0, Math.PI * 2);
      this.ctx.fillStyle = `rgba(${c.r}, ${c.g}, ${c.b}, ${finalAlpha})`;
      this.ctx.fill();
    }

    // -------------------------------------------------------------
    // 6. Shooting Stars / Meteors
    // -------------------------------------------------------------
    for (let m = this.meteors.length - 1; m >= 0; m--) {
      const meteor = this.meteors[m];
      meteor.x += meteor.vx;
      meteor.y += meteor.vy;
      meteor.opacity -= meteor.decay;

      if (meteor.opacity <= 0 || meteor.x > this.width + 100 || meteor.y > this.height + 100) {
        this.meteors.splice(m, 1);
        continue;
      }

      const tailX = meteor.x - (meteor.vx / Math.hypot(meteor.vx, meteor.vy)) * meteor.length;
      const tailY = meteor.y - (meteor.vy / Math.hypot(meteor.vx, meteor.vy)) * meteor.length;

      const meteorGrad = this.ctx.createLinearGradient(tailX, tailY, meteor.x, meteor.y);
      meteorGrad.addColorStop(0, 'rgba(255, 255, 255, 0)');
      meteorGrad.addColorStop(0.7, `rgba(${meteor.color.r}, ${meteor.color.g}, ${meteor.color.b}, ${meteor.opacity * 0.5})`);
      meteorGrad.addColorStop(1, `rgba(255, 255, 255, ${meteor.opacity})`);

      this.ctx.beginPath();
      this.ctx.moveTo(tailX, tailY);
      this.ctx.lineTo(meteor.x, meteor.y);
      this.ctx.strokeStyle = meteorGrad;
      this.ctx.lineWidth = 1.8;
      this.ctx.stroke();

      this.ctx.beginPath();
      this.ctx.arc(meteor.x, meteor.y, 2.2, 0, Math.PI * 2);
      this.ctx.fillStyle = `rgba(255, 255, 255, ${meteor.opacity})`;
      this.ctx.fill();
    }

    if (Math.random() < 0.008 && this.meteors.length < 2) {
      this.spawnMeteor();
    }
  }

  animate() {
    if (!this.isRunning) return;

    const now = performance.now();

    this.rotX += (this.targetRotX - this.rotX) * 0.05;
    this.rotY += (this.targetRotY - this.rotY) * 0.05;

    this.project(now);
    this.render(now);

    requestAnimationFrame(() => this.animate());
  }

  setRunning(running) {
    if (this.isRunning === running) return;
    this.isRunning = running;
    if (running) {
      this.animate();
    }
  }
}
