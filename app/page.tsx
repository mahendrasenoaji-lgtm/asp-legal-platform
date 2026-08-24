import Image from "next/image";
import Link from "next/link";
import { StatusBar } from "../components/StatusBar";
import { Reveal } from "../components/Reveal";
import { EmptyState } from "../components/EmptyState";
import { CtaBand } from "../components/CtaBand";
import { PersonCard } from "../components/PersonCard";
import { AwardRow } from "../components/AwardRow";
import {
  HomeAboutBody,
  HomeAboutHead,
  HomeContactStrip,
  HomeCopy,
  HomeGroupLabel,
  HomeInsightsTeaser,
  HomePracticesHead,
  HomeStatLabel,
} from "../components/HomeCopy";
import { getAwards, getCategories, getFirm, getLawyers, getPractices } from "../lib/data";

const GROUP_ORDER: Array<"flagship" | "dispute" | "corporate"> = ["flagship", "dispute", "corporate"];

export default async function HomePage() {
  const [LAWYERS, PRACTICES, AWARDS, FIRM, CATEGORIES] = await Promise.all([
    getLawyers(),
    getPractices(),
    getAwards(),
    getFirm(),
    getCategories(),
  ]);
  const foundedYear = new Date(FIRM.founded).getUTCFullYear();
  const groups = GROUP_ORDER.map((tier) => ({
    tier,
    items: PRACTICES.filter((p) => p.tier === tier),
  })).filter((g) => g.items.length > 0);

  return (
    <>
      <StatusBar note="Redesign build — Classical direction, not yet client-approved" />
      <main id="main">
        <section className="hero">
          {/* Real photo of the firm's founders (touched up in ChatGPT, per
              the client), from the redesign handoff. Decorative here — the
              heading carries the meaning, hence alt="". next/image (fill +
              priority) instead of a plain <img>: the source file alone was
              1.8MB PNG and, served unoptimized, took the homepage's
              Lighthouse performance score from 91 to as low as 57 in a
              real post-redesign run — this is the fix, not a stylistic
              choice. Next re-encodes to AVIF/WebP and serves it sized to
              the viewport automatically. */}
          <Image
            className="hero__img"
            src="/images/founders.jpg"
            alt=""
            fill
            priority
            sizes="100vw"
          />
          <div className="hero__scrim" aria-hidden="true" />
          <div className="wrap hero__inner">
            <HomeCopy />
          </div>
        </section>

        <div className="wrap">
          <div className="statcard">
            <div className="statcard__item">
              <span className="statcard__num">{foundedYear}</span>
              <HomeStatLabel k="founded" />
            </div>
            <div className="statcard__item">
              <span className="statcard__num">{LAWYERS.length}</span>
              <HomeStatLabel k="people" />
            </div>
            <div className="statcard__item">
              <span className="statcard__num">{PRACTICES.length}</span>
              <HomeStatLabel k="practiceAreas" />
            </div>
            <div className="statcard__item">
              <span className="statcard__num">{AWARDS.length}</span>
              <HomeStatLabel k="recognitions" />
            </div>
          </div>
        </div>

        <div className="wrap"><hr className="hr" /></div>

        <section className="section section--tight">
          <div className="wrap">
            <Reveal as="div" className="section-head section-head__row">
              <HomePracticesHead />
            </Reveal>
            <div className="grid grid--3">
              {groups.map((g) => (
                <div key={g.tier}>
                  <HomeGroupLabel tier={g.tier} />
                  {g.items.map((p) => (
                    <p
                      key={p.slug}
                      style={{
                        borderTop: "var(--hairline) solid var(--rule)",
                        paddingTop: "var(--s-3)",
                        marginBottom: "var(--s-3)",
                      }}
                    >
                      {p.name_en}
                    </p>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="wrap"><hr className="hr" /></div>

        <section className="section section--tight">
          <div className="wrap grid grid--editorial">
            <Reveal>
              <HomeAboutHead />
            </Reveal>
            <Reveal>
              <HomeAboutBody />
            </Reveal>
          </div>
        </section>

        <div className="wrap"><hr className="hr" /></div>

        <section className="section section--tight">
          <div className="wrap">
            <Reveal>
              <HomeInsightsTeaser categories={CATEGORIES} />
            </Reveal>
          </div>
        </section>

        <div className="wrap"><hr className="hr" /></div>

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

        <section className="section section--tight">
          <div className="wrap">
            <HomeContactStrip office={FIRM.office} />
          </div>
        </section>
      </main>
    </>
  );
}
