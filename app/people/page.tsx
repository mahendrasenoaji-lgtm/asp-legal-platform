import type { Metadata } from "next";
import { StatusBar } from "../../components/StatusBar";
import { Breadcrumbs } from "../../components/Breadcrumbs";
import { CtaBand } from "../../components/CtaBand";
import { PersonCard } from "../../components/PersonCard";
import { LAWYERS } from "../../lib/data";

export const metadata: Metadata = {
  title: "People",
  description: "The lawyers of Arifudin Susanto Partnership.",
};

const TIERS: [string, string, (l: (typeof LAWYERS)[number]) => boolean][] = [
  ["partner", "Partners", (l) => l.tier.includes("partner")],
  ["leader", "Leadership", (l) => l.tier === "leader"],
  ["associate", "Associates", (l) => l.tier === "associate"],
];

export default function PeoplePage() {
  return (
    <>
      <StatusBar note="23 of 23 professionals listed; 21 biographies pending" />
      <main id="main">
        <Breadcrumbs trail={[["Home", "/"], ["People", null]]} />
        <section className="section">
          <div className="wrap pagehead">
            <p className="docket">People</p>
            <h1>{LAWYERS.length} professionals.</h1>
            <p className="lead">
              Photography and biographies are pending. Names, honorifics and tiers are taken from
              the firm&rsquo;s published team page.
            </p>
            <p className="muted" style={{ fontSize: "var(--t-small)" }}>
              Tier naming is unresolved: the current site uses &ldquo;Leaders&rdquo;, the brief
              specifies &ldquo;Counsel&rdquo;. Shown here under a neutral label until ASP decides.
            </p>
          </div>
        </section>

        {TIERS.map(([key, label, filter]) => {
          const group = LAWYERS.filter(filter);
          return (
            <section className="section" key={key}>
              <div className="wrap">
                <div className="section-head section-head__row">
                  <div>
                    <p className="docket">{label}</p>
                    <h2>
                      {group.length} {label.toLowerCase()}
                    </h2>
                  </div>
                </div>
                <div className="grid grid--4">
                  {group.map((l) => (
                    <PersonCard key={l.slug} lawyer={l} />
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
