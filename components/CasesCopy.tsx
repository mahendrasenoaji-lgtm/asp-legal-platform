"use client";

import { useLang } from "./LanguageProvider";

export function CasesHead() {
  const { t } = useLang();
  return (
    <>
      <p className="docket">{t.cases.kicker}</p>
      <h1>{t.cases.title}</h1>
      <p className="lead">{t.cases.intro}</p>
    </>
  );
}

export function CasesEmpty() {
  const { t } = useLang();
  return (
    <div className="empty">
      <span className="empty__tag">Empty state — by design</span>
      <h3>{t.cases.emptyTitle}</h3>
      <p>{t.cases.emptyBody}</p>
    </div>
  );
}
