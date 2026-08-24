"use client";

import { useLang } from "./LanguageProvider";

export function PeopleHead({ count }: { count: number }) {
  const { t } = useLang();
  return (
    <>
      <p className="docket">{t.people.kicker}</p>
      <h1>
        {count} {t.people.title.replace(/^\d+\s*/, "")}
      </h1>
      <p className="lead">{t.people.body}</p>
      <p className="muted" style={{ fontSize: "var(--t-small)" }}>
        {t.people.note}
      </p>
    </>
  );
}

export function PeopleGroupLabel({
  tier,
  count,
}: {
  tier: "partner" | "leader" | "associate";
  count: number;
}) {
  const { t } = useLang();
  return (
    <div>
      <p className="docket">{t.people.groupLabel[tier]}</p>
      <h2>
        {count} {t.people.groupLabel[tier].toLowerCase()}
      </h2>
    </div>
  );
}
