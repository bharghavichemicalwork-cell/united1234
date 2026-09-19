/**
 * United SSD Chem - Interactive Chemical Molecule & Particle Canvas
 * Simulates molecular lattice bonds, Brownian motion, and chemical effervescence.
 */

(function () {
  'use strict';

  const canvas = document.getElementById('moleculeCanvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let width = (canvas.width = canvas.offsetWidth || canvas.parentElement?.offsetWidth || window.innerWidth);
  let height = (canvas.height = canvas.offsetHeight || canvas.parentElement?.offsetHeight || window.innerHeight);

  const particles = [];
  const bubbles = [];
  const particleCount = Math.min(Math.floor((width * height) / 12000), 75);
  const bubbleCount = 24;
  const connectionDistance = 140;
  const mouseRadius = 180;

  const mouse = {
    x: -9999,
    y: -9999,
    active: false
  };

  class Particle {
    constructor() {
      this.reset();
      this.x = Math.random() * width;
      this.y = Math.random() * height;
    }

    reset() {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.vx = (Math.random() - 0.5) * 0.9;
      this.vy = (Math.random() - 0.5) * 0.9;
      this.radius = Math.random() * 2.5 + 2;
      this.colorType = Math.random() > 0.4 ? 'orange' : 'navy';
      this.pulse = Math.random() * Math.PI * 2;
      this.pulseSpeed = 0.03 + Math.random() * 0.02;
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;
      this.pulse += this.pulseSpeed;

      // Bounce off walls gently
      if (this.x < 0 || this.x > width) this.vx *= -1;
      if (this.y < 0 || this.y > height) this.vy *= -1;

      // Mouse repulsion & interaction
      if (mouse.active) {
        const dx = this.x - mouse.x;
        const dy = this.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < mouseRadius && dist > 0) {
          const force = (mouseRadius - dist) / mouseRadius;
          this.x += (dx / dist) * force * 3.5;
          this.y += (dy / dist) * force * 3.5;
        }
      }
    }

    draw() {
      ctx.save();
      const currentRadius = this.radius + Math.sin(this.pulse) * 0.6;
      ctx.beginPath();
      ctx.arc(this.x, this.y, currentRadius, 0, Math.PI * 2);

      if (this.colorType === 'orange') {
        ctx.fillStyle = '#FF7300';
        ctx.shadowColor = '#FF8C00';
        ctx.shadowBlur = 8;
      } else {
        ctx.fillStyle = '#38BDF8';
        ctx.shadowColor = '#0284C7';
        ctx.shadowBlur = 6;
      }

      ctx.fill();
      ctx.restore();
    }
  }

  class EffervescentBubble {
    constructor() {
      this.reset();
    }

    reset() {
      this.x = Math.random() * width;
      this.y = height + Math.random() * 50;
      this.vy = -(0.5 + Math.random() * 1.2);
      this.vx = (Math.random() - 0.5) * 0.4;
      this.radius = Math.random() * 4 + 1.5;
      this.opacity = 0.15 + Math.random() * 0.35;
      this.wobble = Math.random() * Math.PI * 2;
    }

    update() {
      this.y += this.vy;
      this.wobble += 0.04;
      this.x += Math.sin(this.wobble) * 0.5;

      if (this.y < -20) {
        this.reset();
      }
    }

    draw() {
      ctx.save();
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(255, 140, 0, ${this.opacity})`;
      ctx.lineWidth = 1.2;
      ctx.stroke();

      // Highlight sheen
      ctx.beginPath();
      ctx.arc(this.x - this.radius * 0.3, this.y - this.radius * 0.3, this.radius * 0.3, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity * 0.8})`;
      ctx.fill();
      ctx.restore();
    }
  }

  // Populate particles and bubbles
  for (let i = 0; i < particleCount; i++) {
    particles.push(new Particle());
  }
  for (let i = 0; i < bubbleCount; i++) {
    bubbles.push(new EffervescentBubble());
  }

  function drawConnections() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const p1 = particles[i];
        const p2 = particles[j];
        const dx = p1.x - p2.x;
        const dy = p1.y - p2.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < connectionDistance) {
          const alpha = (1 - dist / connectionDistance) * 0.35;
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.strokeStyle = `rgba(255, 115, 0, ${alpha})`;
          ctx.lineWidth = 1.1;
          ctx.stroke();
        }
      }

      // Connect to mouse if near
      if (mouse.active) {
        const mdx = particles[i].x - mouse.x;
        const mdy = particles[i].y - mouse.y;
        const mdist = Math.sqrt(mdx * mdx + mdy * mdy);
        if (mdist < 130) {
          const mAlpha = (1 - mdist / 130) * 0.6;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.strokeStyle = `rgba(251, 191, 36, ${mAlpha})`;
          ctx.lineWidth = 1.4;
          ctx.stroke();
        }
      }
    }
  }

  let animationFrameId;
  function animate() {
    ctx.clearRect(0, 0, width, height);

    // Draw bubbles
    bubbles.forEach((b) => {
      b.update();
      b.draw();
    });

    // Draw connections and particles
    drawConnections();
    particles.forEach((p) => {
      p.update();
      p.draw();
    });

    animationFrameId = requestAnimationFrame(animate);
  }

  // Handle resizing
  function handleResize() {
    width = canvas.width = canvas.offsetWidth || canvas.parentElement?.offsetWidth || window.innerWidth;
    height = canvas.height = canvas.offsetHeight || canvas.parentElement?.offsetHeight || window.innerHeight;
  }

  window.addEventListener('resize', handleResize);

  // Mouse events
  canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
    mouse.active = true;
  });

  canvas.addEventListener('mouseleave', () => {
    mouse.active = false;
  });

  // Touch support for mobile devices
  canvas.addEventListener('touchmove', (e) => {
    if (e.touches.length > 0) {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.touches[0].clientX - rect.left;
      mouse.y = e.touches[0].clientY - rect.top;
      mouse.active = true;
    }
  }, { passive: true });

  canvas.addEventListener('touchend', () => {
    mouse.active = false;
  });

  // Start animation
  animate();
})();
