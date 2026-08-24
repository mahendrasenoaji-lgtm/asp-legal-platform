"use client";

import { useLang } from "./LanguageProvider";

export function ContactHead() {
  const { t } = useLang();
  return (
    <>
      <p className="docket">{t.contact.kicker}</p>
      <h1>{t.contact.title}</h1>
    </>
  );
}

export function ContactCta() {
  const { t } = useLang();
  return (
    <a className="btn btn--primary" href="/consultation" style={{ marginTop: "var(--s-6)" }}>
      {t.nav.cta}
    </a>
  );
}
