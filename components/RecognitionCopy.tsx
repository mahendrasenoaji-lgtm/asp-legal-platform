"use client";

import { useLang } from "./LanguageProvider";

export function RecognitionHead({ count }: { count: number }) {
  const { t } = useLang();
  return (
    <>
      <p className="docket">{t.recognition.kicker}</p>
      <h1>
        {count} {t.recognition.title.replace(/^\d+\s*/, "")}
      </h1>
      <p className="lead">{t.recognition.intro}</p>
    </>
  );
}
