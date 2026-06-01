"use client";

import { useEffect, useRef } from "react";

export function CosmicBackground() {
  const backgroundRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = backgroundRef.current;
    if (!element) return;

    function handlePointerMove(event: PointerEvent) {
      if (!element) return;

      const x = (event.clientX / window.innerWidth - 0.5).toFixed(3);
      const y = (event.clientY / window.innerHeight - 0.5).toFixed(3);
      element.style.setProperty("--mx", x);
      element.style.setProperty("--my", y);
    }

    window.addEventListener("pointermove", handlePointerMove, { passive: true });

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
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
