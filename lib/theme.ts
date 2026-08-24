export type Theme = "light" | "dark";

export const THEME_STORAGE_KEY = "asp-theme";

/**
 * Runs inline in <head>, before any CSS paints, so the first frame already
 * has the right `data-theme` attribute — no flash of the wrong theme on
 * load or reload. Identical on every route, so it lands in
 * lib/csp-hashes.generated.ts's shared CSP_COMMON_SCRIPT_HASHES bucket
 * automatically (see scripts/generate-csp-hashes.mjs) with no changes
 * needed there or in middleware.ts.
 */
export const THEME_BOOT_SCRIPT = `(function(){try{var k="${THEME_STORAGE_KEY}";var t=localStorage.getItem(k);if(t!=="light"&&t!=="dark"){t=window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";}document.documentElement.setAttribute("data-theme",t);}catch(e){}})();`;

export function applyTheme(theme: Theme) {
  document.documentElement.setAttribute("data-theme", theme);
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    /* private mode / storage disabled — theme still applies for this load */
  }
}

export function getAppliedTheme(): Theme {
  return document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
}
