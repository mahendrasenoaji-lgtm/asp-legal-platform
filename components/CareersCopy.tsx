"use client";

import { useLang } from "./LanguageProvider";

export function CareersHead() {
  const { t } = useLang();
  return (
    <>
      <p className="docket">{t.careers.kicker}</p>
      <h1>{t.careers.title}</h1>
      <p className="lead">{t.careers.intro}</p>
    </>
  );
}

export function CareersOpen({ email }: { email: string }) {
  const { t } = useLang();
  return (
    <div className="empty">
      <span className="empty__tag">Awaiting content from ASP</span>
      <h3>{t.careers.openTitle}</h3>
      <p>{t.careers.openBody}</p>
      <a className="btn btn--gold" href={`mailto:${email}`}>
        {t.careers.cta}
      </a>
    </div>
  );
}

export function CareersIntern() {
  const { t } = useLang();
  return (
    <div className="empty">
      <span className="empty__tag">Awaiting content from ASP</span>
      <h3>{t.careers.internTitle}</h3>
      <p>{t.careers.internBody}</p>
    </div>
  );
}
