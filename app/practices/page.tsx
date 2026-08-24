import type { Metadata } from "next";
import { StatusBar } from "../../components/StatusBar";
import { Breadcrumbs } from "../../components/Breadcrumbs";
import { CtaBand } from "../../components/CtaBand";
import { PracticeCard } from "../../components/PracticeCard";
import { PracticesGroupLabel, PracticesHead } from "../../components/PracticesCopy";
import { getPractices } from "../../lib/data";

export const metadata: Metadata = {
  title: "Practices",
  description: "Practice areas of Arifudin Susanto Partnership.",
};

const GROUPS: Array<"flagship" | "dispute" | "corporate"> = ["flagship", "dispute", "corporate"];

export default async function PracticesPage() {
  const PRACTICES = await getPractices();
  return (
    <>
      <StatusBar note="Overviews pending for all 12 practices" />
      <main id="main">
        <Breadcrumbs trail={[["Home", "/"], ["Practices", null]]} />
        <section className="section">
          <div className="wrap pagehead">
            <PracticesHead />
            <p className="muted" style={{ fontSize: "var(--t-small)" }}>
              A Corporate Legal Services practice appears in the brief but not on the firm&rsquo;s
              current site. It has not been added — see decision D-04 and content request 5.
            </p>
          </div>
        </section>

        {GROUPS.map((tier) => {
          const items = PRACTICES.filter((p) => p.tier === tier);
          return (
            <section className="section" key={tier}>
              <div className="wrap">
                <div className="section-head">
                  <PracticesGroupLabel tier={tier} count={items.length} />
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
