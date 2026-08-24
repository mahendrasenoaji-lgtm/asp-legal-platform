import type { Config } from "tailwindcss";

// Maps the design tokens (app/tokens.css) into Tailwind so utilities and the
// custom properties agree instead of competing, per docs/03-frontend.md §4.
// Component styling itself still lives in app/main.css — Tailwind here is
// for any new layout utility a component needs rather than a full rewrite.
// Updated 2026-08-24 for the "Classical" redesign's token names; kept the
// same alias-to-CSS-var structure so nothing else has to change.
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  corePlugins: {
    // main.css already carries its own reset (box-sizing, body, headings).
    // Tailwind's preflight would fight it rather than agree with it.
    preflight: false,
  },
  theme: {
    extend: {
      colors: {
        bg: "var(--bg)",
        "bg-raised": "var(--bg-raised)",
        fg: "var(--fg)",
        "fg-muted": "var(--fg-muted)",
        accent: "var(--accent)",
        "accent-text": "var(--accent-text)",
        kicker: "var(--kicker)",
        rule: "var(--rule)",
      },
      fontFamily: {
        display: ["var(--font-display)"],
        body: ["var(--font-body)"],
        docket: ["var(--font-docket)"],
      },
      spacing: {
        "s-1": "var(--s-1)",
        "s-2": "var(--s-2)",
        "s-3": "var(--s-3)",
        "s-4": "var(--s-4)",
        "s-5": "var(--s-5)",
        "s-6": "var(--s-6)",
        "s-7": "var(--s-7)",
        "s-8": "var(--s-8)",
      },
    },
  },
  plugins: [],
};

export default config;
