"use client";

import type { InsightCategory } from "../lib/types";
import { useLang } from "./LanguageProvider";

export function InsightsHead() {
  const { t } = useLang();
  return (
    <>
      <p className="docket">{t.insights.kicker}</p>
      <h1>{t.insights.title}</h1>
      <p className="lead">{t.insights.intro}</p>
    </>
  );
}

export function InsightsCategoryTags({ categories }: { categories: InsightCategory[] }) {
  const { lang } = useLang();
  return (
    <div className="filters">
      {categories.map((c) => (
        <span key={c.slug} className="tag-outline">
          {lang === "id" ? c.name_id : c.name_en}
        </span>
      ))}
    </div>
  );
}

export function InsightsEmpty() {
  const { t } = useLang();
  return (
    <div className="empty">
      <span className="empty__tag">Empty state — by design</span>
      <h3>{t.insights.emptyTitle}</h3>
      <p>{t.insights.emptyBody}</p>
    </div>
  );
}

export function InsightsWorkflow() {
  const { t } = useLang();
  return (
    <div className="grid grid--3" style={{ marginTop: "var(--s-7)" }}>
      {t.insights.workflow.map((w) => (
        <div className="card" key={w.title}>
          <p className="docket docket--plain">{w.kicker}</p>
          <h3>{w.title}</h3>
          <p>{w.body}</p>
        </div>
      ))}
    </div>
  );
}
