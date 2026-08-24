"use client";

import { useLang } from "./LanguageProvider";

/** EN/ID text toggle — replaces the previous non-functional `href="#"` stub.
 * `tabIndex` is forwarded to both buttons — MobileDrawer sets it to -1 while
 * closed, matching the focus-trap pattern the rest of the drawer uses. */
export function LanguageToggle({ tabIndex }: { tabIndex?: number }) {
  const { lang, setLang } = useLang();

  return (
    <span className="toggle-pair" aria-label="Language">
      <button type="button" tabIndex={tabIndex} aria-current={lang === "en"} onClick={() => setLang("en")}>
        EN
      </button>
      <span aria-hidden="true">/</span>
      <button type="button" tabIndex={tabIndex} aria-current={lang === "id"} onClick={() => setLang("id")}>
        ID
      </button>
    </span>
  );
}
