import Link from "next/link";
import { StatusBar } from "../components/StatusBar";
import { Reveal } from "../components/Reveal";
import { EmptyState } from "../components/EmptyState";
import { CtaBand } from "../components/CtaBand";
import { PersonCard } from "../components/PersonCard";
import { AwardRow } from "../components/AwardRow";
import { PracticeCard } from "../components/PracticeCard";
import { AWARDS, FIRM, LAWYERS, PRACTICES } from "../lib/data";

const STEPS: [string, string, string, "statutory" | "key"][] = [
  ["Filing", "Petition lodged", "Commercial Court registers the petition and sets the first hearing.", "statutory"],
  ["Day 20", "PKPU granted", "Court must rule within 20 days. Sementara runs 45 days from the ruling.", "statutory"],
  ["Day 45", "Claims verified", "Administrator verifies claims; the debtor tables a composition plan.", "key"],
  ["Day 45+", "Creditors vote", "Approval needs the statutory majorities of both secured and unsecured classes.", "key"],
  ["Day 270", "Outer limit", "PKPU Tetap cannot exceed 270 days from the sementara ruling.", "statutory"],
  ["Outcome", "Homologasi or bankruptcy", "Ratification binds all creditors. Rejection converts the matter to bankruptcy.", "key"],
];

export default function HomePage() {
  const m = FIRM.claimed_metrics;
  const flagship = PRACTICES.filter((p) => p.tier === "flagship");
  const others = PRACTICES.filter((p) => p.tier !== "flagship");

  return (
    <>
      <StatusBar note="Metrics shown as claimed by ASP; one is flagged" />
      <main id="main">
        <section className="hero">
          <div className="wrap hero__inner">
            <p className="docket reveal">Jakarta · Commercial Court practice</p>
            <h1 className="reveal">
              Strategic counsel.
              <br />
              Complex matters.
              <em>Trusted outcomes.</em>
            </h1>
            <p className="hero__sub reveal">
              Arifudin Susanto Partnership advises on bankruptcy, PKPU, debt restructuring,
              litigation, arbitration and complex commercial matters in Indonesia — as counsel to
              debtors and creditors, and as court-appointed receiver.
            </p>
            <div className="hero__cta reveal">
              <Link className="btn btn--gold" href="/practices">
                Explore our practices <span aria-hidden="true">&rarr;</span>
              </Link>
              <Link className="btn btn--ghost" href="/consultation">
                Discuss your matter
              </Link>
            </div>
          </div>
        </section>

        <section className="trustbar">
          <div className="wrap trustbar__grid">
            <div className="trustbar__item">
              <span className="trustbar__num">{m.practice_areas}</span>
              <span className="trustbar__label">Practice areas</span>
            </div>
            <div className="trustbar__item">
              <span className="trustbar__num">{m.fee_earners}</span>
              <span className="trustbar__label">
                Fee earners <sup style={{ color: "var(--accent-text)" }}>*</sup>
              </span>
            </div>
            <div className="trustbar__item">
              <span className="trustbar__num">{m.clients}</span>
              <span className="trustbar__label">Clients served</span>
            </div>
            <div className="trustbar__item">
              <span className="trustbar__num">2017</span>
              <span className="trustbar__label">Established</span>
            </div>
          </div>
          <div className="wrap">
            <p
              style={{
                fontSize: "var(--t-caption)",
                color: "var(--fg-muted)",
                paddingBottom: "var(--s-5)",
              }}
            >
              <span style={{ color: "var(--accent-text)" }}>*</span> Unverified: the People page
              currently lists {LAWYERS.length} professionals. Reconcile before launch — see
              docs/content-requests.md, item 2.
            </p>
          </div>
        </section>

        <section className="section">
          <div className="wrap grid grid--editorial">
            <Reveal>
              <p className="docket">The firm</p>
              <h2>Built for complex matters.</h2>
            </Reveal>
            <Reveal>
              <p className="lead">
                ASP was founded on 3 May 2017 by Muhamad Arifudin and Herlin Susanto to handle
                insolvency work that most firms treat as an occasional file.
              </p>
              <p>
                The firm acts in bankruptcy and PKPU proceedings in three distinct capacities —
                court-appointed receiver, administrator, and counsel to debtors or creditors —
                across manufacturing, aviation, shipping, oil and gas, plantations, property,
                cooperatives and state-owned enterprises.
              </p>
              <p>Its work is guided by three stated values: visionary, integrity, professional.</p>
              <Link className="link-arrow" href="/about">
                Discover ASP <span aria-hidden="true">&rarr;</span>
              </Link>
            </Reveal>
          </div>
        </section>

        <section className="section">
          <div className="wrap">
            <Reveal as="div" className="section-head section-head__row">
              <div>
                <p className="docket">Our practices</p>
                <h2>Twelve practices, one centre of gravity.</h2>
              </div>
              <Link className="link-arrow" href="/practices">
                All practices <span aria-hidden="true">&rarr;</span>
              </Link>
            </Reveal>
            <div className="grid grid--3">
              {[...flagship, ...others].map((p) => (
                <PracticeCard key={p.slug} practice={p} />
              ))}
            </div>
          </div>
        </section>

        <section className="section section--forest">
          <div className="wrap">
            <Reveal as="div" className="section-head">
              <p className="docket">Featured practice</p>
              <h2>Bankruptcy, PKPU &amp; restructuring.</h2>
              <p className="lead">
                A PKPU runs on a statutory clock. Every option narrows as the days pass, which is
                why the first week matters more than the last.
              </p>
            </Reveal>
            <Reveal as="div" className="proceeding">
              <div className="proceeding__track">
                {STEPS.map((s) => (
                  <div className="proceeding__step" data-state={s[3]} key={s[0]}>
                    <span className="proceeding__day">{s[0]}</span>
                    <span className="proceeding__label">{s[1]}</span>
                    <p className="proceeding__note">{s[2]}</p>
                  </div>
                ))}
              </div>
              <p className="muted" style={{ fontSize: "var(--t-caption)", marginTop: "var(--s-5)" }}>
                Periods reflect the statutory framework of Law No. 37 of 2004 on Bankruptcy and
                Suspension of Debt Payment Obligations. Timelines in a specific matter depend on
                the court and the facts.
              </p>
            </Reveal>
            <div className="grid grid--3" style={{ marginTop: "var(--s-8)" }}>
              <Link className="card" href="/practices/bankruptcy">
                <h3>Bankruptcy</h3>
                <p>Petitions, defence, estate administration and asset realisation.</p>
                <span className="card__foot link-arrow">
                  Overview <span aria-hidden="true">&rarr;</span>
                </span>
              </Link>
              <Link className="card" href="/practices/pkpu">
                <h3>PKPU</h3>
                <p>Composition plans, claim verification, creditor negotiation and voting.</p>
                <span className="card__foot link-arrow">
                  Overview <span aria-hidden="true">&rarr;</span>
                </span>
              </Link>
              <Link className="card" href="/practices/debt-restructuring">
                <h3>Debt restructuring</h3>
                <p>Out-of-court workouts, standstills, security and refinancing.</p>
                <span className="card__foot link-arrow">
                  Overview <span aria-hidden="true">&rarr;</span>
                </span>
              </Link>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="wrap">
            <Reveal as="div" className="section-head section-head__row">
              <div>
                <p className="docket">People</p>
                <h2>The people behind the practice.</h2>
              </div>
              <Link className="link-arrow" href="/people">
                All {LAWYERS.length} professionals <span aria-hidden="true">&rarr;</span>
              </Link>
            </Reveal>
            <div className="grid grid--4">
              {LAWYERS.slice(0, 4).map((l) => (
                <PersonCard key={l.slug} lawyer={l} />
              ))}
            </div>
          </div>
        </section>

        <section className="section">
          <div className="wrap grid grid--aside">
            <Reveal>
              <p className="docket">Recognition</p>
              <h2>Recognised for excellence.</h2>
              <div style={{ marginTop: "var(--s-6)" }}>
                {AWARDS.slice(0, 5).map((a) => (
                  <AwardRow key={a.slug} award={a} />
                ))}
              </div>
              <Link className="link-arrow" href="/recognition" style={{ marginTop: "var(--s-5)" }}>
                All {AWARDS.length} recognitions <span aria-hidden="true">&rarr;</span>
              </Link>
            </Reveal>
            <Reveal>
              <p className="muted" style={{ fontSize: "var(--t-small)" }}>
                Every recognition on this site links to the awarding organisation&rsquo;s own
                published listing. Nothing is self-declared.
              </p>
            </Reveal>
          </div>
        </section>

        <section className="section">
          <div className="wrap grid grid--2">
            <Reveal>
              <p className="docket">ASP Insights</p>
              <h2>Legal updates and case analysis.</h2>
              <EmptyState
                heading="No articles published yet"
                body="The editorial pipeline is built and the categories are set. Publication begins once the first legal updates clear review."
                action={["See what is needed", "/insights"]}
              />
            </Reveal>
            <Reveal>
              <p className="docket">Case intelligence</p>
              <h2>Selected matters, on the public record.</h2>
              <EmptyState
                heading="No matters published yet"
                body="Only matters that are already public record and cleared by the firm will appear here. Nothing is published from client files."
                action={["How the register works", "/cases"]}
              />
            </Reveal>
          </div>
        </section>

        <CtaBand />
      </main>
    </>
  );
}
