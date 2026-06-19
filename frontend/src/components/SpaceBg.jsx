import React, { useEffect, useRef } from "react";

// Deterministic pseudo-random (seeded) for stable initial star positions
function seededRandom(seed) {
  let s = seed;
  return function () {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 4294967296;
  };
}

export default function SpaceBg() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animId;
    let W, H;

    // ── Stars ────────────────────────────────────────────────────────────────
    const STAR_COUNT = 260;
    const rand = seededRandom(42);

    const stars = Array.from({ length: STAR_COUNT }, () => {
      const size = rand() * 1.6 + 0.2;
      return {
        x: rand(),      // fractional 0-1
        y: rand(),
        size,
        speed: (0.005 + rand() * 0.018) * (size * 0.5 + 0.5),
        alpha: 0.3 + rand() * 0.7,
        twinkleSpeed: 0.005 + rand() * 0.015,
        twinkleOffset: rand() * Math.PI * 2,
      };
    });

    // ── Shooting stars ───────────────────────────────────────────────────────
    const SHOOT_MAX = 3;
    const shooters = [];

    function spawnShooter() {
      const angle = (Math.random() * 30 + 10) * (Math.PI / 180);
      return {
        x: Math.random() * W * 1.2 - W * 0.1,
        y: Math.random() * H * 0.4,
        len: 120 + Math.random() * 180,
        speed: 8 + Math.random() * 14,
        angle,
        dx: Math.cos(angle),
        dy: Math.sin(angle),
        alpha: 0,
        phase: "in",  // in | hold | out
        holdTime: 0,
      };
    }

    let shootTimer = 0;
    const SHOOT_INTERVAL = 90; // frames between new shooters

    // ── Nebula / gradient orbs ───────────────────────────────────────────────
    const ORBS = [
      { cx: 0.15, cy: 0.2,  r: 0.28, color: "rgba(239,29,50," },
      { cx: 0.85, cy: 0.6,  r: 0.22, color: "rgba(100,40,200," },
      { cx: 0.5,  cy: 0.85, r: 0.18, color: "rgba(239,29,50," },
    ];

    // ── Resize ───────────────────────────────────────────────────────────────
    function resize() {
      W = canvas.width  = canvas.offsetWidth  * window.devicePixelRatio;
      H = canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    }

    // ── Draw ─────────────────────────────────────────────────────────────────
    let frame = 0;

    function draw() {
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;

      // Clear
      ctx.clearRect(0, 0, W, H);

      // ── Nebula glow orbs ──────────────────────────────────────────────────
      ORBS.forEach(({ cx, cy, r }) => {
        const gx = cx * w;
        const gy = cy * h;
        const gr = r * Math.min(w, h);
        const grad = ctx.createRadialGradient(gx, gy, 0, gx, gy, gr);
        grad.addColorStop(0,   "rgba(239,29,50,0.045)");
        grad.addColorStop(0.5, "rgba(139,9,50,0.025)");
        grad.addColorStop(1,   "rgba(0,0,0,0)");
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(gx, gy, gr, 0, Math.PI * 2);
        ctx.fill();
      });

      // ── Stars ─────────────────────────────────────────────────────────────
      stars.forEach(star => {
        star.x += star.speed / w;
        if (star.x > 1.01) star.x = -0.01;

        const twinkle = 0.55 + 0.45 * Math.sin(frame * star.twinkleSpeed + star.twinkleOffset);
        const alpha = star.alpha * twinkle;

        const sx = star.x * w;
        const sy = star.y * h;

        // Glow halo
        if (star.size > 0.9) {
          const halo = ctx.createRadialGradient(sx, sy, 0, sx, sy, star.size * 3);
          halo.addColorStop(0, `rgba(255,255,255,${alpha * 0.3})`);
          halo.addColorStop(1, "rgba(255,255,255,0)");
          ctx.fillStyle = halo;
          ctx.beginPath();
          ctx.arc(sx, sy, star.size * 3, 0, Math.PI * 2);
          ctx.fill();
        }

        // Star core
        ctx.fillStyle = `rgba(255,255,255,${alpha})`;
        ctx.beginPath();
        ctx.arc(sx, sy, star.size, 0, Math.PI * 2);
        ctx.fill();
      });

      // ── Shooting stars ────────────────────────────────────────────────────
      shootTimer++;
      if (shootTimer >= SHOOT_INTERVAL && shooters.length < SHOOT_MAX) {
        shooters.push(spawnShooter());
        shootTimer = 0;
      }

      for (let i = shooters.length - 1; i >= 0; i--) {
        const s = shooters[i];
        // Fade in
        if (s.phase === "in") {
          s.alpha = Math.min(s.alpha + 0.08, 0.85);
          if (s.alpha >= 0.85) s.phase = "hold";
        }
        // Fade out
        if (s.phase === "out") {
          s.alpha = Math.max(s.alpha - 0.04, 0);
          if (s.alpha <= 0) { shooters.splice(i, 1); continue; }
        }
        // Hold briefly then fade
        if (s.phase === "hold") {
          s.holdTime++;
          if (s.holdTime > 8) s.phase = "out";
        }

        // Move
        s.x += s.dx * s.speed;
        s.y += s.dy * s.speed;

        // Remove if off-screen
        if (s.x > w * 1.1 || s.y > h * 1.1) {
          shooters.splice(i, 1);
          continue;
        }

        // Draw trail
        const tailX = s.x - s.dx * s.len;
        const tailY = s.y - s.dy * s.len;
        const grad = ctx.createLinearGradient(tailX, tailY, s.x, s.y);
        grad.addColorStop(0, `rgba(255,255,255,0)`);
        grad.addColorStop(0.7, `rgba(255,220,220,${s.alpha * 0.4})`);
        grad.addColorStop(1, `rgba(255,255,255,${s.alpha})`);
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(tailX, tailY);
        ctx.lineTo(s.x, s.y);
        ctx.stroke();

        // Bright head
        const headGlow = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, 6);
        headGlow.addColorStop(0, `rgba(255,255,255,${s.alpha})`);
        headGlow.addColorStop(1, "rgba(255,255,255,0)");
        ctx.fillStyle = headGlow;
        ctx.beginPath();
        ctx.arc(s.x, s.y, 6, 0, Math.PI * 2);
        ctx.fill();
      }

      frame++;
      animId = requestAnimationFrame(draw);
    }

    resize();
    draw();

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    return () => {
      cancelAnimationFrame(animId);
      ro.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      style={{
        position: "fixed",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 0,
        opacity: 0.85,
      }}
    />
  );
}
