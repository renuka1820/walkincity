"use client";
import { useEffect, useRef } from "react";

/**
 * WalkInCity's own little mascot: a panda in a scarf.
 * With a mouse, he trots after the cursor and waits beside it.
 * On phones and tablets (no cursor), he walks back and forth along the bottom
 * as you scroll, and takes you back to the top when tapped.
 */
const LAP_PX = 900; // scroll distance for one walk across the screen (touch mode)
const WIDTH = 46;
const HEIGHT = 60;
const LANE_BOTTOM = 6; // matches .buddy-lane { bottom } in globals.css

export function ScrollBuddy() {
  const ref = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const tip = el.querySelector<HTMLElement>(".buddy-tip");
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const hasCursor = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    let raf = 0;
    let idle: ReturnType<typeof setTimeout>;

    const draw = (x: number, y: number, facingRight: boolean) => {
      el.style.transform = `translate(${x}px, ${y}px) scaleX(${facingRight ? 1 : -1})`;
      if (tip) tip.style.transform = `scaleX(${facingRight ? 1 : -1})`;
    };

    // ── Mouse: follow the cursor ────────────────────────────────
    if (hasCursor && !still) {
      const floor = () => window.innerHeight - LANE_BOTTOM; // y of the lane in the viewport
      let x = 12, y = 0;         // current position (y is relative to the lane, negative = up)
      let tx = x, ty = y;        // where he is heading
      let facing = true;
      el.classList.add("following");
      draw(x, y, facing);

      const step = () => {
        const dx = tx - x, dy = ty - y;
        const dist = Math.hypot(dx, dy);
        if (dist < 0.6) {
          raf = 0;
          el.classList.remove("walking");
          return;
        }
        x += dx * 0.12;
        y += dy * 0.12;
        if (Math.abs(dx) > 2) facing = dx > 0;
        const hop = dist > 6 ? -Math.abs(Math.sin(performance.now() / 90)) * 5 : 0;
        el.classList.add("walking");
        draw(x, y + hop, facing);
        raf = requestAnimationFrame(step);
      };
      const onMove = (e: MouseEvent) => {
        // Stand just below and to the right of the pointer, never off-screen.
        tx = Math.min(Math.max(e.clientX + 16, 4), window.innerWidth - WIDTH - 4);
        const bottom = Math.min(e.clientY + 22 + HEIGHT, floor());
        ty = bottom - floor();
        if (!raf) raf = requestAnimationFrame(step);
      };
      window.addEventListener("mousemove", onMove, { passive: true });
      return () => {
        window.removeEventListener("mousemove", onMove);
        cancelAnimationFrame(raf);
      };
    }

    // ── Touch: walk along the bottom as the page scrolls ────────
    let lastY = window.scrollY;
    const place = () => {
      raf = 0;
      const y = window.scrollY;
      const track = Math.max(0, window.innerWidth - WIDTH - 24);
      if (still) {
        el.style.transform = `translate(${track + 12}px, 0)`;
        return;
      }
      const phase = (y / LAP_PX) % 2; // 0→1 walks right, 1→2 walks left
      const t = phase <= 1 ? phase : 2 - phase;
      const facingRight = (phase <= 1) === (y >= lastY);
      const hop = -Math.abs(Math.sin(y / 38)) * 7;
      draw(12 + t * track, hop, facingRight);
      if (y !== lastY) {
        el.classList.add("walking");
        clearTimeout(idle);
        idle = setTimeout(() => el.classList.remove("walking"), 160);
      }
      lastY = y;
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(place); };

    place();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
      clearTimeout(idle);
    };
  }, []);

  return (
    <div className="buddy-lane">
      <button
        ref={ref}
        type="button"
        className="buddy"
        aria-label="Back to top"
        tabIndex={-1}
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      >
        <span className="buddy-tip">Back to top</span>
        <svg viewBox="0 0 46 60" aria-hidden="true">
          {/* legs */}
          <g className="leg leg-a"><rect x="13" y="45" width="8" height="12" rx="4" fill="var(--color-ink)" /></g>
          <g className="leg leg-b"><rect x="25" y="45" width="8" height="12" rx="4" fill="var(--color-ink)" /></g>
          {/* arms + body */}
          <ellipse cx="9.5" cy="40" rx="4.5" ry="7" fill="var(--color-ink)" transform="rotate(18 9.5 40)" />
          <ellipse cx="36.5" cy="40" rx="4.5" ry="7" fill="var(--color-ink)" transform="rotate(-18 36.5 40)" />
          <ellipse cx="23" cy="41" rx="12.5" ry="10.5" fill="#ffffff" stroke="var(--color-ink)" strokeWidth="1.2" />
          {/* ears + head */}
          <circle cx="9" cy="8" r="6" fill="var(--color-ink)" />
          <circle cx="37" cy="8" r="6" fill="var(--color-ink)" />
          <ellipse cx="23" cy="19" rx="16" ry="14.5" fill="#ffffff" stroke="var(--color-ink)" strokeWidth="1.2" />
          {/* eye patches + eyes */}
          <ellipse cx="15.5" cy="18.5" rx="4.6" ry="5.6" fill="var(--color-ink)" transform="rotate(20 15.5 18.5)" />
          <ellipse cx="30.5" cy="18.5" rx="4.6" ry="5.6" fill="var(--color-ink)" transform="rotate(-20 30.5 18.5)" />
          <circle className="eye" cx="16.300" cy="18" r="1.900" fill="#ffffff" />
          <circle className="eye" cx="29.700" cy="18" r="1.900" fill="#ffffff" />
          {/* nose, smile, cheeks */}
          <ellipse cx="23" cy="24" rx="2.4" ry="1.600" fill="var(--color-ink)" />
          <path d="M19.800 27q3.200 2.600 6.400 0" fill="none" stroke="var(--color-ink)" strokeWidth="1.300" strokeLinecap="round" />
          <circle cx="10.500" cy="25" r="2" fill="var(--color-accent)" opacity=".35" />
          <circle cx="35.500" cy="25" r="2" fill="var(--color-accent)" opacity=".35" />
          {/* scarf in the brand colour; the tail shows which way he is facing */}
          <path d="M11.500 31.500q11.500 5 23 0l1 3.800q-12.500 5.200-25 0z" fill="var(--color-amber)" stroke="var(--color-ink)" strokeWidth=".8" />
          <path d="M13 34l-4.500 8 4.800 1 2.700-8z" fill="var(--color-amber)" stroke="var(--color-ink)" strokeWidth=".8" />
        </svg>
      </button>
    </div>
  );
}
