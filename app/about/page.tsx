import type { Metadata } from "next";
import { StatusBar } from "../../components/StatusBar";
import { Breadcrumbs } from "../../components/Breadcrumbs";
import { EmptyState } from "../../components/EmptyState";
import { CtaBand } from "../../components/CtaBand";
import { Reveal } from "../../components/Reveal";
import { getIndustries } from "../../lib/data";

export const metadata: Metadata = {
  title: "About the firm",
  description: "ASP is an Indonesian law firm concentrated on bankruptcy, PKPU and restructuring.",
};

const VALUES: [string, string][] = [
  ["Visionary", "Anticipating how the legal landscape moves, so a strategy holds up beyond the current hearing."],
  ["Integrity", "Candid advice, transparent process, and the client's interest ahead of the firm's."],
  ["Professional", "Expert knowledge applied with precision, and communicated on time."],
];

export default async function AboutPage() {
  const INDUSTRIES = await getIndustries();
  return (
    <>
      <StatusBar note="Phase 1 deliverable" />
      <main id="main">
        <Breadcrumbs trail={[["Home", "/"], ["About", null]]} />
        <section className="section">
          <div className="wrap pagehead">
            <p className="docket">About the firm</p>
            <h1>A practice organised around insolvency.</h1>
            <p className="lead">
              Founded 3 May 2017 by Muhamad Arifudin and Herlin Susanto. Advocates, receivers and
              administrators in bankruptcy.
            </p>
          </div>
        </section>

        <section className="section">
          <div className="wrap grid grid--editorial">
            <div>
              <p className="docket">The firm</p>
            </div>
            <div className="prose">
              <p>
                ASP handles commercial disputes with a primary concentration in bankruptcy,
                liquidation and PKPU. The firm&rsquo;s lawyers act in three capacities that are
                usually split across different firms: as court-appointed receiver, as
                administrator, and as counsel to debtors or creditors.
              </p>
              <p>
                That combination is deliberate. Sitting on both sides of the same statutory
                process, over years rather than files, is what produces judgment about how a
                Commercial Court will actually treat a claim, a security interest or a composition
                plan.
              </p>
              <p>
                Matters have involved individual debtors, national private companies, publicly
                listed companies and state-owned enterprises.
              </p>
              <EmptyState
                heading="Firm narrative pending review"
                body="This section reflects only what the firm has already published. A fuller account of the firm's history and approach is with ASP for drafting."
              />
            </div>
          </div>
        </section>

        <section className="section">
          <div className="wrap">
            <Reveal as="div" className="section-head">
              <p className="docket">Vision &amp; values</p>
              <h2>Three commitments, stated plainly.</h2>
            </Reveal>
            <div className="grid grid--3">
              {VALUES.map(([title, body]) => (
                <div className="card" key={title}>
                  <span className="card__mark" />
                  <h3>{title}</h3>
                  <p>{body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="section section--dark">
          <div className="wrap grid grid--editorial">
            <Reveal>
              <p className="docket">Sectors</p>
              <h2>Where the work has been.</h2>
              <p className="muted">
                Sixteen sectors drawn from matters the firm has already described publicly.
              </p>
            </Reveal>
            <Reveal>
              <ul
                style={{
                  columns: 2,
                  columnGap: "var(--s-7)",
                  listStyle: "none",
                  padding: 0,
                  margin: 0,
                  fontSize: "var(--t-small)",
                  lineHeight: 2.2,
                }}
              >
                {INDUSTRIES.map((i) => (
                  <li key={i.slug}>{i.name_en}</li>
                ))}
              </ul>
            </Reveal>
          </div>
        </section>
        <CtaBand />
      </main>
    </>
  );
}
