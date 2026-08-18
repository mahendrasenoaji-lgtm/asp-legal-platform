import type { Metadata } from "next";
import { StatusBar } from "../../components/StatusBar";
import { Breadcrumbs } from "../../components/Breadcrumbs";
import { CtaBand } from "../../components/CtaBand";
import { PracticeCard } from "../../components/PracticeCard";
import { PRACTICES } from "../../lib/data";
import type { Practice } from "../../lib/types";

export const metadata: Metadata = {
  title: "Practices",
  description: "Practice areas of Arifudin Susanto Partnership.",
};

const GROUPS: [Practice["tier"], string][] = [
  ["flagship", "Insolvency & restructuring"],
  ["dispute", "Disputes"],
  ["corporate", "Corporate & regulatory"],
];

export default function PracticesPage() {
  return (
    <>
      <StatusBar note="Overviews pending for all 12 practices" />
      <main id="main">
        <Breadcrumbs trail={[["Home", "/"], ["Practices", null]]} />
        <section className="section">
          <div className="wrap pagehead">
            <p className="docket">Practices</p>
            <h1>Twelve practices.</h1>
            <p className="lead">
              Ten as published by the firm, with bankruptcy, PKPU and restructuring separated into
              distinct pages because they answer distinct questions.
            </p>
            <p className="muted" style={{ fontSize: "var(--t-small)" }}>
              A Corporate Legal Services practice appears in the brief but not on the firm&rsquo;s
              current site. It has not been added — see decision D-04 and content request 5.
            </p>
          </div>
        </section>

        {GROUPS.map(([tier, label]) => {
          const items = PRACTICES.filter((p) => p.tier === tier);
          return (
            <section className="section" key={tier}>
              <div className="wrap">
                <div className="section-head">
                  <p className="docket">{label}</p>
                  <h2>{items.length} practices</h2>
                </div>
                <div className="grid grid--3">
                  {items.map((p) => (
                    <PracticeCard key={p.slug} practice={p} />
                  ))}
                </div>
              </div>
            </section>
          );
        })}
        <CtaBand />
      </main>
    </>
  );
}
