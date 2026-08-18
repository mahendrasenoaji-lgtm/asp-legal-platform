"use client";

import { useEffect, useRef, useState } from "react";
import type { ElementType, ReactNode } from "react";

// Ports the [data-reveal] IntersectionObserver behaviour from app.js.
// prefers-reduced-motion and no-IntersectionObserver both fall back to
// showing content immediately, same as the prototype.
export function Reveal({
  children,
  as: As = "div",
  className = "",
}: {
  children: ReactNode;
  as?: ElementType;
  className?: string;
}) {
  const ref = useRef<HTMLElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || !("IntersectionObserver" in window)) {
      setInView(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setInView(true);
            io.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.05 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <As ref={ref} data-reveal="" className={inView ? `in ${className}` : className}>
      {children}
    </As>
  );
}
