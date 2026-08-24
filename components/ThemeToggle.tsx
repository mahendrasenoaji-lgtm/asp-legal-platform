"use client";

import { useEffect, useState } from "react";
import { applyTheme, getAppliedTheme, type Theme } from "../lib/theme";

/** Light/Dark text toggle. Reads the theme the inline boot script already
 * applied (see app/layout.tsx), so there's nothing to guess on mount.
 * `tabIndex` is forwarded to both buttons — MobileDrawer sets it to -1 while
 * closed, matching the focus-trap pattern the rest of the drawer uses. */
export function ThemeToggle({ tabIndex }: { tabIndex?: number }) {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    setTheme(getAppliedTheme());
  }, []);

  function set(next: Theme) {
    applyTheme(next);
    setTheme(next);
  }

  return (
    <span className="toggle-pair" aria-label="Theme">
      <button type="button" tabIndex={tabIndex} aria-current={theme === "light"} onClick={() => set("light")}>
        Light
      </button>
      <span aria-hidden="true">/</span>
      <button type="button" tabIndex={tabIndex} aria-current={theme === "dark"} onClick={() => set("dark")}>
        Dark
      </button>
    </span>
  );
}
