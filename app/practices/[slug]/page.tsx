import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { StatusBar } from "../../../components/StatusBar";
import { Breadcrumbs } from "../../../components/Breadcrumbs";
import { EmptyState } from "../../../components/EmptyState";
import { CtaBand } from "../../../components/CtaBand";
import { PRACTICES, getPractice } from "../../../lib/data";

export function generateStaticParams() {
  return PRACTICES.map((p) => ({ slug: p.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const practice = getPractice(params.slug);
  if (!practice) return {};
  return { title: practice.name_en, description: `${practice.name_en} practice at ASP.` };
}

export default function PracticePage({ params }: { params: { slug: string } }) {
  const practice = getPractice(params.slug);
  if (!practice) notFound();

  const related = PRACTICES.filter((x) => x.tier === practice.tier && x.slug !== practice.slug).slice(0, 3);

  return (
    <>
      <StatusBar note="Practice overview pending — content request 3" />
      <main id="main">
        <Breadcrumbs trail={[["Home", "/"], ["Practices", "/practices"], [practice.name_en, null]]} />
        <section className="section">
          <div className="wrap pagehead">
            <p className="docket">{practice.name_id}</p>
            <h1>{practice.name_en}</h1>
            <p className="muted" style={{ fontSize: "var(--t-small)" }}>
              Legacy grouping: {practice.legacy_group}
            </p>
          </div>
        </section>
        <section className="section">
          <div className="wrap grid grid--aside">
            <div>
              <EmptyState
                heading="Practice overview pending"
                body="ASP has not yet supplied a description for this practice. Writing one here would mean inventing capabilities, so the page holds its structure and waits. Required: 300–600 words, key capabilities, typical mandates, and the lawyers who lead the practice."
              />
              <h2 style={{ marginTop: "var(--s-8)" }}>Related practices</h2>
              <div className="grid grid--3">
                {related.map((r) => (
                  <Link className="card" href={`/practices/${r.slug}`} key={r.slug}>
                    <h3>{r.name_en}</h3>
                    <span className="card__foot link-arrow">
                      Overview <span aria-hidden="true">&rarr;</span>
                    </span>
                  </Link>
                ))}
              </div>
            </div>
            <aside>
              <h4>On this practice</h4>
              <dl className="facts">
                <div>
                  <dt>Lead lawyers</dt>
                  <dd className="muted">Awaiting ASP</dd>
                </div>
                <div>
                  <dt>Related insights</dt>
                  <dd className="muted">None published</dd>
                </div>
                <div>
                  <dt>Selected matters</dt>
                  <dd className="muted">None cleared</dd>
                </div>
              </dl>
              <a className="btn btn--primary" href="/consultation" style={{ marginTop: "var(--s-5)" }}>
                Discuss a matter
              </a>
            </aside>
          </div>
        </section>
        <CtaBand />
      </main>
    </>
  );
}
