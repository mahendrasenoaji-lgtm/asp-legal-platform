"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { DEFAULT_LANG, DICT, LANG_STORAGE_KEY, type Lang } from "../lib/i18n";

interface LanguageContextValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (typeof DICT)[Lang];
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

/**
 * Client-side only — no new route, no server round-trip (see PROGRESS.md /
 * CLAUDE.md on why an /id route tree isn't being added yet). Renders the
 * English dictionary on first paint and swaps to the visitor's stored
 * preference once mounted; a brief flash of English before that is
 * acceptable for a copy toggle in a way it isn't for the theme (dark→light
 * flash is jarring, EN→ID text swap is not, and there's no dependency on
 * `prefers-*` to check synchronously the way theme has).
 */
export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(DEFAULT_LANG);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(LANG_STORAGE_KEY);
      if (stored === "en" || stored === "id") setLangState(stored);
    } catch {
      /* private mode / storage disabled — default language stands */
    }
  }, []);

  function setLang(next: Lang) {
    setLangState(next);
    try {
      localStorage.setItem(LANG_STORAGE_KEY, next);
    } catch {
      /* not persisted this session, still applies */
    }
  }

  return (
    <LanguageContext.Provider value={{ lang, setLang, t: DICT[lang] }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLang(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLang() must be used within <LanguageProvider>");
  return ctx;
}
