"use client";

import { useEffect, useRef, useState, useCallback } from "react";

interface MagneticItem {
  text: string;
  color: string;
  baseX: number;
  baseY: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
}

interface MagneticTextProps {
  items: { text: string; color: string }[];
}

export function MagneticText({ items }: MagneticTextProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<MagneticItem[]>([]);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const rafRef = useRef<number>(0);
  const [dims, setDims] = useState({ w: 800, h: 200 });

  // Initialize particles with positions
  useEffect(() => {
    if (!containerRef.current) return;
    const w = containerRef.current.offsetWidth;
    const h = containerRef.current.offsetHeight;
    setDims({ w, h });

    const particles: MagneticItem[] = items.map((item, i) => {
      const cols = Math.ceil(Math.sqrt(items.length * (w / h)));
      const rows = Math.ceil(items.length / cols);
      const col = i % cols;
      const row = Math.floor(i / cols);
      const cellW = w / cols;
      const cellH = h / rows;
      const baseX = cellW * (col + 0.5);
      const baseY = cellH * (row + 0.5);

      return {
        text: item.text,
        color: item.color,
        baseX,
        baseY,
        x: baseX,
        y: baseY,
        vx: 0,
        vy: 0,
        size: Math.max(13, Math.min(16, w / 55)),
      };
    });

    particlesRef.current = particles;
  }, [items]);

  // Animation loop
  const animate = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { w, h } = { w: canvas.width / 2, h: canvas.height / 2 };
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const mouse = mouseRef.current;
    const repelRadius = 120;
    const repelStrength = 8;
    const returnStrength = 0.04;
    const friction = 0.88;

    for (const p of particlesRef.current) {
      // Mouse repulsion
      const dx = p.x - mouse.x;
      const dy = p.y - mouse.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < repelRadius && dist > 0) {
        const force = (1 - dist / repelRadius) * repelStrength;
        p.vx += (dx / dist) * force;
        p.vy += (dy / dist) * force;
      }

      // Spring back to base position
      p.vx += (p.baseX - p.x) * returnStrength;
      p.vy += (p.baseY - p.y) * returnStrength;

      // Friction
      p.vx *= friction;
      p.vy *= friction;

      // Update position
      p.x += p.vx;
      p.y += p.vy;

      // Keep in bounds
      p.x = Math.max(40, Math.min(w - 40, p.x));
      p.y = Math.max(20, Math.min(h - 20, p.y));

      // Calculate displacement for visual effects
      const displacement = Math.sqrt(
        (p.x - p.baseX) ** 2 + (p.y - p.baseY) ** 2
      );
      const alpha = Math.max(0.4, 1 - displacement / 150);
      const scale = 1 + displacement * 0.002;

      // Draw
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.font = `bold ${p.size * scale}px Satoshi, Pretendard Variable, sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      // Glow
      if (displacement > 5) {
        ctx.shadowColor = p.color;
        ctx.shadowBlur = displacement * 0.3;
      }

      ctx.fillStyle = p.color;
      ctx.fillText(p.text, p.x * 2, p.y * 2);
      ctx.restore();
    }

    rafRef.current = requestAnimationFrame(animate);
  }, []);

  useEffect(() => {
    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [animate]);

  // Resize
  useEffect(() => {
    function onResize() {
      if (!containerRef.current) return;
      const w = containerRef.current.offsetWidth;
      const h = containerRef.current.offsetHeight;
      setDims({ w, h });

      // Recompute base positions
      const cols = Math.ceil(Math.sqrt(items.length * (w / h)));
      const rows = Math.ceil(items.length / cols);
      particlesRef.current.forEach((p, i) => {
        const col = i % cols;
        const row = Math.floor(i / cols);
        p.baseX = (w / cols) * (col + 0.5);
        p.baseY = (h / rows) * (row + 0.5);
        p.size = Math.max(13, Math.min(16, w / 55));
      });
    }
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [items]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full"
      onMouseMove={(e) => {
        const rect = containerRef.current?.getBoundingClientRect();
        if (!rect) return;
        mouseRef.current = {
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        };
      }}
      onMouseLeave={() => {
        mouseRef.current = { x: -1000, y: -1000 };
      }}
    >
      <canvas
        ref={canvasRef}
        width={dims.w * 2}
        height={dims.h * 2}
        style={{ width: dims.w, height: dims.h }}
        className="pointer-events-none"
      />
    </div>
  );
}
