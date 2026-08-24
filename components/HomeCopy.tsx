"use client";

import Link from "next/link";
import type { Firm, InsightCategory } from "../lib/types";
import { useLang } from "./LanguageProvider";

/** Hero eyebrow/h1/sub/CTAs. Buttons use --on-photo variants since the hero
 * always sits over a photo, regardless of the active light/dark theme. */
export function HomeCopy() {
  const { t } = useLang();
  return (
    <>
      <p className="docket reveal">{t.hero.kicker}</p>
      <h1 className="reveal">Arifudin Susanto Partnership</h1>
      <p className="hero__sub reveal">{t.hero.sub}</p>
      <div className="hero__cta reveal">
        <Link className="btn btn--gold btn--on-photo" href="/consultation">
          {t.hero.cta1} <span aria-hidden="true">&rarr;</span>
        </Link>
        <Link className="btn btn--ghost btn--on-photo" href="/practices">
          {t.hero.cta2}
        </Link>
      </div>
    </>
  );
}

export function HomeStatLabel({ k }: { k: "founded" | "people" | "practiceAreas" | "recognitions" }) {
  const { t } = useLang();
  return <span className="statcard__label">{t.statsLabels[k]}</span>;
}

export function HomePracticesHead() {
  const { t } = useLang();
  return (
    <>
      <div>
        <p className="docket">{t.practices.kicker}</p>
        <h2>{t.practices.title}</h2>
      </div>
      <Link className="link-arrow" href="/practices">
        {t.practices.seeAll} <span aria-hidden="true">&rarr;</span>
      </Link>
    </>
  );
}

export function HomeGroupLabel({ tier }: { tier: "flagship" | "dispute" | "corporate" }) {
  const { t } = useLang();
  return <h3 style={{ fontSize: "var(--t-h4)", marginBottom: "var(--s-3)" }}>{t.practiceGroupLabel[tier]}</h3>;
}

export function HomeAboutHead() {
  const { t } = useLang();
  return (
    <>
      <p className="docket">{t.about.kicker}</p>
      <h2>{t.about.title}</h2>
    </>
  );
}

export function HomeAboutBody() {
  const { t } = useLang();
  return (
    <>
      <p className="lead">{t.about.body1}</p>
      <p>{t.about.body2}</p>
      <Link className="link-arrow" href="/about">
        {t.about.more} <span aria-hidden="true">&rarr;</span>
      </Link>
    </>
  );
}

export function HomeInsightsTeaser({ categories }: { categories: InsightCategory[] }) {
  const { lang, t } = useLang();
  return (
    <>
      <p className="docket">{t.insights.kicker}</p>
      <h2>{t.insights.title}</h2>
      <p className="muted">{t.insights.note}</p>
      <div className="filters" style={{ marginTop: "var(--s-5)" }}>
        {categories.map((c) => (
          <span key={c.slug} className="tag-outline">
            {lang === "id" ? c.name_id : c.name_en}
          </span>
        ))}
      </div>
    </>
  );
}

export function HomeContactStrip({ office }: { office: Firm["office"] }) {
  return (
    <div className="grid grid--3">
      <p>
        {office.name}
        <br />
        {office.street}
        <br />
        {office.district}
        <br />
        {office.city} {office.postal_code}
      </p>
      <p>
        <a href={`tel:${office.phone.replace(/\s/g, "")}`}>{office.phone}</a>
      </p>
      <p>
        <a href={`mailto:${office.email}`}>{office.email}</a>
      </p>
    </div>
  );
}
