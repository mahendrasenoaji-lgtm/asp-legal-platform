"use client";

import Link from "next/link";
import { DISCLAIMER } from "../lib/constants";
import { useLang } from "./LanguageProvider";

export function CtaBand() {
  const { t } = useLang();
  return (
    <section className="section cta-band">
      <div className="wrap grid grid--aside">
        <div>
          <h2>{t.cta.title}</h2>
          <p>{t.cta.sub}</p>
          <Link className="btn btn--gold" href="/consultation">
            {t.cta.button} <span aria-hidden="true">&rarr;</span>
          </Link>
        </div>
        <div className="disclaimer">
          <p>{DISCLAIMER}</p>
        </div>
      </div>
    </section>
  );
}
