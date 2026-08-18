import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { StatusBar } from "../../../components/StatusBar";
import { Breadcrumbs } from "../../../components/Breadcrumbs";
import { EmptyState } from "../../../components/EmptyState";
import { CtaBand } from "../../../components/CtaBand";
import { AWARDS, getAward } from "../../../lib/data";

export function generateStaticParams() {
  return AWARDS.map((a) => ({ slug: a.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const award = getAward(params.slug);
  if (!award) return {};
  return {
    title: award.title,
    description: `${award.title} — ${award.organization}, ${award.year}.`,
  };
}

export default function AwardPage({ params }: { params: { slug: string } }) {
  const award = getAward(params.slug);
  if (!award) notFound();

  return (
    <>
      <StatusBar note="Award narrative pending" />
      <main id="main">
        <Breadcrumbs
          trail={[["Home", "/"], ["Recognition", "/recognition"], [String(award.year), null]]}
        />
        <section className="section">
          <div className="wrap grid grid--aside">
            <div>
              <p className="docket">
                {award.year} · {award.organization}
              </p>
              <h1>{award.title}</h1>
              <EmptyState
                heading="Award narrative pending"
                body="The certificate image, the associated lawyers and the firm's own account of the matter behind this recognition are with ASP."
              />
            </div>
            <aside>
              <dl className="facts">
                <div>
                  <dt>Year</dt>
                  <dd className="num">{award.year}</dd>
                </div>
                <div>
                  <dt>Organisation</dt>
                  <dd>{award.organization}</dd>
                </div>
                <div>
                  <dt>Source</dt>
                  <dd>
                    <a className="link-underline" href={award.source_url} rel="noopener nofollow">
                      Published listing
                    </a>
                  </dd>
                </div>
                <div>
                  <dt>Associated lawyers</dt>
                  <dd className="muted">Awaiting ASP</dd>
                </div>
              </dl>
            </aside>
          </div>
        </section>
        <CtaBand />
      </main>
    </>
  );
}
