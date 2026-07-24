"use client";

import { useEffect, useRef, useState } from "react";

import {
  appearanceStorageKey,
  defaultAppearanceSettings,
} from "@/components/astra/settings/settings-utils";
import { appearanceSettingsSchema } from "@/lib/validations/settings";

type LayerKey = "grid" | "warpA" | "warpB" | "window" | "hudLeft" | "hudRight" | "console";

type LayerSpec = {
  mx: number;
  my: number;
  render: (x: number, y: number) => string;
};

// Per-layer parallax multipliers, moved out of CSS so each frame writes a
// plain `transform` directly on the elements that move instead of mutating
// a shared custom property (`--mx`/`--my`) that every layer's stylesheet
// rule had to re-resolve via `calc()` on every mouse-driven frame.
const LAYER_CONFIG: Record<LayerKey, LayerSpec> = {
  grid: { mx: -18, my: -14, render: (x, y) => `translate(${x}px, ${y}px)` },
  warpA: { mx: -36, my: -16, render: (x, y) => `translate(${x}px, ${y}px)` },
  warpB: { mx: -36, my: -16, render: (x, y) => `translate(${x}px, ${y}px)` },
  window: { mx: 18, my: 12, render: (x, y) => `translate(${x}px, ${y}px)` },
  hudLeft: { mx: 28, my: 18, render: (x, y) => `translate(${x}px, ${y}px)` },
  hudRight: { mx: 28, my: 18, render: (x, y) => `translate(${x}px, ${y}px)` },
  console: { mx: 38, my: 18, render: (x, y) => `translate(calc(-50% + ${x}px), ${y}px)` },
};

export function CosmicBackground() {
  const layerRefs = useRef<Partial<Record<LayerKey, HTMLDivElement | null>>>({});
  const frameRef = useRef<number | null>(null);
  const targetRef = useRef({ x: 0, y: 0 });
  const currentRef = useRef({ x: 0, y: 0 });
  const [minimalDark, setMinimalDark] = useState(false);
  const [parallaxAllowed, setParallaxAllowed] = useState(true);

  // Read the user's saved Appearance preferences (Settings > Appearance).
  // "Minimal dark" skips the animated layers entirely; "Low" motion keeps
  // them but disables the pointer-driven parallax. Both are real fallbacks
  // for anyone still seeing background-driven flicker on their GPU/browser.
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(appearanceStorageKey);
      const parsed = raw ? appearanceSettingsSchema.safeParse(JSON.parse(raw)) : null;
      const settings = parsed?.success ? parsed.data : defaultAppearanceSettings;
      setMinimalDark(settings.backgroundStyle === "minimal-dark");
      setParallaxAllowed(settings.motionLevel !== "low");
    } catch {
      // Fall back to defaults (full starfield, parallax on) on any read/parse failure.
    }
  }, []);

  useEffect(() => {
    if (minimalDark || !parallaxAllowed) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const coarsePointer = window.matchMedia("(pointer: coarse)");
    if (reducedMotion.matches || coarsePointer.matches) return;

    function applyParallax() {
      frameRef.current = null;
      const current = currentRef.current;
      const target = targetRef.current;

      current.x += (target.x - current.x) * 0.16;
      current.y += (target.y - current.y) * 0.16;

      for (const key of Object.keys(LAYER_CONFIG) as LayerKey[]) {
        const node = layerRefs.current[key];
        if (!node) continue;
        const { mx, my, render } = LAYER_CONFIG[key];
        node.style.transform = render(current.x * mx, current.y * my);
      }

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
  }, [minimalDark, parallaxAllowed]);

  function setLayerRef(key: LayerKey) {
    return (node: HTMLDivElement | null) => {
      layerRefs.current[key] = node;
    };
  }

  return (
    <div
      aria-hidden
      className="astra-cockpit-background pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-slate-950"
    >
      {minimalDark ? (
        <div className="astra-cockpit-vignette" />
      ) : (
        <>
          <div className="astra-star-layer astra-star-layer-far" />
          <div className="astra-star-layer astra-star-layer-mid" />
          <div className="astra-star-layer astra-star-layer-near" />
          <div className="astra-orbital-grid astra-grid-layer" ref={setLayerRef("grid")} />
          <div className="astra-warp-lane astra-warp-lane-a" ref={setLayerRef("warpA")} />
          <div className="astra-warp-lane astra-warp-lane-b" ref={setLayerRef("warpB")} />
          <div className="astra-cockpit-window" ref={setLayerRef("window")} />
          <div className="astra-cockpit-hud astra-cockpit-hud-left" ref={setLayerRef("hudLeft")} />
          <div className="astra-cockpit-hud astra-cockpit-hud-right" ref={setLayerRef("hudRight")} />
          <div className="astra-cockpit-console" ref={setLayerRef("console")} />
          <div className="astra-cockpit-vignette" />
        </>
      )}
    </div>
  );
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}
