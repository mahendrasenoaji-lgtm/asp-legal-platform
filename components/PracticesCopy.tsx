"use client";

import { useLang } from "./LanguageProvider";

export function PracticesHead() {
  const { t } = useLang();
  return (
    <>
      <p className="docket">{t.practices.kicker}</p>
      <h1>{t.practices.title}</h1>
      <p className="lead">{t.practices.intro}</p>
    </>
  );
}

export function PracticesGroupLabel({
  tier,
  count,
}: {
  tier: "flagship" | "dispute" | "corporate";
  count: number;
}) {
  const { t } = useLang();
  return (
    <>
      <p className="docket">{t.practiceGroupLabel[tier]}</p>
      <h2>
        {count} {t.statsLabels.practiceAreas.toLowerCase()}
      </h2>
    </>
  );
}
