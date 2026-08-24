import type { Metadata } from "next";
import Image from "next/image";
import { StatusBar } from "../../components/StatusBar";
import { Breadcrumbs } from "../../components/Breadcrumbs";
import { CtaBand } from "../../components/CtaBand";
import { PersonCard } from "../../components/PersonCard";
import { PeopleGroupLabel, PeopleHead } from "../../components/PeopleCopy";
import { getLawyers, isLeadershipTier } from "../../lib/data";
import type { Lawyer } from "../../lib/types";

export const metadata: Metadata = {
  title: "People",
  description: "The lawyers of Arifudin Susanto Partnership.",
};

const TIERS: [string, "partner" | "leader" | "associate", (l: Lawyer) => boolean][] = [
  ["partner", "partner", (l) => l.tier.includes("partner")],
  ["leader", "leader", (l) => isLeadershipTier(l.tier)],
  ["associate", "associate", (l) => l.tier === "associate"],
];

export default async function PeoplePage() {
  const LAWYERS = await getLawyers();
  return (
    <>
      <StatusBar note="23 of 23 professionals listed; 21 biographies pending" />
      <main id="main">
        <Breadcrumbs trail={[["Home", "/"], ["People", null]]} />
        <section className="section">
          <div className="wrap pagehead">
            <PeopleHead count={LAWYERS.length} />
            <p className="muted" style={{ fontSize: "var(--t-small)" }}>
              Tier naming is unresolved: the current site uses &ldquo;Leaders&rdquo;, the brief
              specifies &ldquo;Counsel&rdquo;. Shown here under a neutral label until ASP decides.
            </p>
            {/* Redesign handoff's own "plate" treatment — same real founders
                photo as the Home hero (see that page's comment), reused
                here as the group portrait; individual lawyer headshots
                still don't exist (t.people.note already discloses that
                above). */}
            <figure className="plate" style={{ maxWidth: 420, marginTop: "var(--s-6)" }}>
              <Image src="/images/founders.jpg" alt="" width={1023} height={1537} style={{ width: "100%", height: "auto" }} />
            </figure>
          </div>
        </section>

        {TIERS.map(([key, tier, filter]) => {
          const group = LAWYERS.filter(filter);
          return (
            <section className="section" key={key}>
              <div className="wrap">
                <div className="section-head section-head__row">
                  <PeopleGroupLabel tier={tier} count={group.length} />
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
