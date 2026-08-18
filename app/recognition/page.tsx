import type { Metadata } from "next";
import { StatusBar } from "../../components/StatusBar";
import { Breadcrumbs } from "../../components/Breadcrumbs";
import { CtaBand } from "../../components/CtaBand";
import { AwardRow } from "../../components/AwardRow";
import { getAwards } from "../../lib/data";

export const metadata: Metadata = {
  title: "Recognition",
  description: "Awards and rankings received by ASP.",
};

export default async function RecognitionPage() {
  const AWARDS = await getAwards();
  return (
    <>
      <StatusBar note="Every entry links to the awarding organisation's own listing" />
      <main id="main">
        <Breadcrumbs trail={[["Home", "/"], ["Recognition", null]]} />
        <section className="section">
          <div className="wrap pagehead">
            <p className="docket">Recognition</p>
            <h1>{AWARDS.length} recognitions, 2022–2026.</h1>
            <p className="lead">Each entry links to the awarding organisation&rsquo;s published listing.</p>
          </div>
        </section>
        <section className="section">
          <div className="wrap">
            {AWARDS.map((a) => (
              <AwardRow key={a.slug} award={a} />
            ))}
          </div>
        </section>
        <CtaBand />
      </main>
    </>
  );
}
