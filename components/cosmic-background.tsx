"use client";

import { useEffect, useRef } from "react";

export function CosmicBackground() {
  const backgroundRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<number | null>(null);
  const targetRef = useRef({ x: 0, y: 0 });
  const currentRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const element = backgroundRef.current;
    if (!element) return;
    const backgroundElement = element;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const coarsePointer = window.matchMedia("(pointer: coarse)");

    if (reducedMotion.matches || coarsePointer.matches) return;

    function applyParallax() {
      frameRef.current = null;
      const current = currentRef.current;
      const target = targetRef.current;

      current.x += (target.x - current.x) * 0.16;
      current.y += (target.y - current.y) * 0.16;

      backgroundElement.style.setProperty("--mx", current.x.toFixed(3));
      backgroundElement.style.setProperty("--my", current.y.toFixed(3));

      if (Math.abs(target.x - current.x) > 0.002 || Math.abs(target.y - current.y) > 0.002) {
        frameRef.current = window.requestAnimationFrame(applyParallax);
      }
    }

    function requestParallaxFrame() {
      if (frameRef.current === null) {
        frameRef.current = window.requestAnimationFrame(applyParallax);
      }
    }

    function handlePointerMove(event: PointerEvent) {
      targetRef.current = {
        x: clamp(event.clientX / window.innerWidth - 0.5, -0.5, 0.5),
        y: clamp(event.clientY / window.innerHeight - 0.5, -0.5, 0.5),
      };
      requestParallaxFrame();
    }

    function resetParallax() {
      targetRef.current = { x: 0, y: 0 };
      requestParallaxFrame();
    }

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("pointerleave", resetParallax);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerleave", resetParallax);
      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current);
      }
    };
  }, []);

  return (
    <div
      aria-hidden
      className="astra-cockpit-background pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-slate-950"
      ref={backgroundRef}
    >
      <div className="astra-nebula-layer" />
      <div className="astra-star-layer astra-star-layer-far" />
      <div className="astra-star-layer astra-star-layer-mid" />
      <div className="astra-star-layer astra-star-layer-near" />
      <div className="astra-orbital-grid astra-grid-layer" />
      <div className="astra-warp-lane astra-warp-lane-a" />
      <div className="astra-warp-lane astra-warp-lane-b" />
      <div className="astra-cockpit-window" />
      <div className="astra-cockpit-hud astra-cockpit-hud-left" />
      <div className="astra-cockpit-hud astra-cockpit-hud-right" />
      <div className="astra-cockpit-console" />
      <div className="astra-cockpit-vignette" />
    </div>
  );
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}
