"use client";

import { useEffect, useRef, useCallback } from "react";

const SELECTOR = [
  "h1", "h2", "h3", "h4", "h5",
  "p", "a", "li", "label", "td", "th", "button",
  "strong", "em", "code", "blockquote",
  ".prose-custom p", ".prose-custom li",
  ".prose-custom h2", ".prose-custom h3",
  ".prose-custom td", ".prose-custom th",
  ".prose-custom code", ".prose-custom blockquote",
  ".prose-custom strong", ".prose-custom em",
].join(", ");
const REPEL_RADIUS = 90;
const REPEL_STRENGTH = 20;
const RETURN_SPEED = 0.1;

interface TrackedElement {
  el: HTMLElement;
  currentX: number;
  currentY: number;
}

export function MagneticMode() {
  const mouseRef = useRef({ x: -9999, y: -9999 });
  const trackedRef = useRef<TrackedElement[]>([]);
  const rafRef = useRef<number>(0);

  const animate = useCallback(() => {
    const mouse = mouseRef.current;
    const tracked = trackedRef.current;

    const vh = window.innerHeight;
    for (const t of tracked) {
      const rect = t.el.getBoundingClientRect();
      if (rect.bottom < -200 || rect.top > vh + 200) {
        if (t.currentX !== 0 || t.currentY !== 0) {
          t.currentX = 0; t.currentY = 0;
          t.el.style.transform = "";
        }
        continue;
      }
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;

      const dx = cx - mouse.x;
      const dy = cy - mouse.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      let targetX = 0;
      let targetY = 0;

      if (dist < REPEL_RADIUS && dist > 0) {
        const force = (1 - dist / REPEL_RADIUS) ** 2 * REPEL_STRENGTH;
        targetX = (dx / dist) * force;
        targetY = (dy / dist) * force;
      }

      t.currentX += (targetX - t.currentX) * RETURN_SPEED;
      t.currentY += (targetY - t.currentY) * RETURN_SPEED;

      if (Math.abs(t.currentX) < 0.1 && Math.abs(t.currentY) < 0.1) {
        t.currentX = 0;
        t.currentY = 0;
        if (targetX === 0 && targetY === 0) {
          t.el.style.transform = "";
          continue;
        }
      }

      t.el.style.transform = `translate(${t.currentX}px, ${t.currentY}px)`;
    }

    rafRef.current = requestAnimationFrame(animate);
  }, []);

  useEffect(() => {
    function gatherElements() {
      for (const t of trackedRef.current) {
        t.el.style.transform = "";
        t.el.style.willChange = "";
      }

      const all = Array.from(document.querySelectorAll<HTMLElement>(SELECTOR))
        .filter((el) => {
          if (el.closest("nav")) return false;
          const rect = el.getBoundingClientRect();
          if (rect.width === 0 || rect.height === 0) return false;
          const hasBlockChild = el.querySelector("p, h2, h3, h4, li, blockquote, td");
          return !hasBlockChild;
        });

      trackedRef.current = all.map((el) => {
        el.style.willChange = "transform";
        return { el, currentX: 0, currentY: 0 };
      });
    }

    function onMouseMove(e: MouseEvent) {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    }

    function onMouseLeave() {
      mouseRef.current = { x: -9999, y: -9999 };
    }

    gatherElements();
    window.addEventListener("mousemove", onMouseMove, { passive: true });
    document.addEventListener("mouseleave", onMouseLeave);
    rafRef.current = requestAnimationFrame(animate);

    const observer = new MutationObserver(() => {
      setTimeout(gatherElements, 100);
    });
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      cancelAnimationFrame(rafRef.current);
      for (const t of trackedRef.current) {
        t.el.style.transform = "";
        t.el.style.willChange = "";
      }
      trackedRef.current = [];
      window.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseleave", onMouseLeave);
      observer.disconnect();
    };
  }, [animate]);

  return null;
}
