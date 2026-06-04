"use client";

import { useEffect, useRef, useState, type ComponentProps, type ReactElement } from "react";
import { ResponsiveContainer } from "recharts";

type SafeResponsiveContainerProps = Omit<ComponentProps<typeof ResponsiveContainer>, "height" | "width"> & {
  children: ReactElement;
};

export function SafeResponsiveContainer({ children, minHeight = 1, minWidth = 1, ...props }: SafeResponsiveContainerProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const target = element;

    function updateReadyState() {
      const rect = target.getBoundingClientRect();
      setReady(rect.width > 0 && rect.height > 0);
    }

    updateReadyState();
    const observer = new ResizeObserver(updateReadyState);
    observer.observe(target);

    return () => observer.disconnect();
  }, []);

  return (
    <div className="h-full min-h-[1px] w-full min-w-[1px]" ref={ref}>
      {ready ? (
        <ResponsiveContainer height="100%" minHeight={minHeight} minWidth={minWidth} width="100%" {...props}>
          {children}
        </ResponsiveContainer>
      ) : null}
    </div>
  );
}
