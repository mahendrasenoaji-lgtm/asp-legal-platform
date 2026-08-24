"use client";

import type { Industry } from "../lib/types";
import { useLang } from "./LanguageProvider";

export function AboutHead() {
  const { t } = useLang();
  return (
    <>
      <p className="docket">{t.about.kicker}</p>
      <h1>{t.about.title}</h1>
      <p className="lead">{t.about.body1}</p>
    </>
  );
}

export function AboutBody() {
  const { t } = useLang();
  return (
    <>
      <p className="docket">{t.about.kicker}</p>
      <p>{t.about.body2}</p>
    </>
  );
}

export function AboutBody3() {
  const { t } = useLang();
  return <p>{t.about.body3}</p>;
}

export function AboutValues() {
  const { t } = useLang();
  return (
    <>
      <p className="docket">{t.values.kicker}</p>
      <h2>{t.values.title}</h2>
      <div className="grid grid--3">
        {t.values.items.map((v) => (
          <div className="card" key={v.title}>
            <h3>{v.title}</h3>
            <p>{v.body}</p>
          </div>
        ))}
      </div>
    </>
  );
}

export function AboutSectors({ industries }: { industries: Industry[] }) {
  const { lang, t } = useLang();
  return (
    <>
      <p className="docket">{t.sectors.kicker}</p>
      <h2>{t.sectors.title}</h2>
      <p className="muted">{t.sectors.intro}</p>
      <ul
        style={{
          columns: 2,
          columnGap: "var(--s-7)",
          listStyle: "none",
          padding: 0,
          margin: "var(--s-5) 0 0",
          fontSize: "var(--t-small)",
          lineHeight: 2.2,
        }}
      >
        {industries.map((i) => (
          <li key={i.slug}>{lang === "id" ? i.name_id : i.name_en}</li>
        ))}
      </ul>
    </>
  );
}
