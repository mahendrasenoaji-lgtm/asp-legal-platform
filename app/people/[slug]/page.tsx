import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { StatusBar } from "../../../components/StatusBar";
import { Breadcrumbs } from "../../../components/Breadcrumbs";
import { EmptyState } from "../../../components/EmptyState";
import { CtaBand } from "../../../components/CtaBand";
import { getFirm, getLawyer, getLawyers, initials } from "../../../lib/data";

export async function generateStaticParams() {
  const lawyers = await getLawyers();
  return lawyers.map((l) => ({ slug: l.slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const lawyer = await getLawyer(params.slug);
  if (!lawyer) return {};
  return {
    title: lawyer.name,
    description: `${lawyer.name} — ${lawyer.position} at ASP.`,
  };
}

export default async function LawyerPage({ params }: { params: { slug: string } }) {
  const lawyer = await getLawyer(params.slug);
  if (!lawyer) notFound();

  const FIRM = await getFirm();
  const bio = lawyer.bio_full;

  return (
    <>
      <StatusBar note={bio ? "Biography summarised from the firm's published profile" : "Biography pending — see content request 1"} />
      <main id="main">
        <Breadcrumbs trail={[["Home", "/"], ["People", "/people"], [lawyer.name, null]]} />
        <section className="section">
          <div className="wrap grid grid--editorial">
            <div>
              <span className="person__frame" style={{ maxWidth: "22rem" }}>
                <span className="person__initials">{initials(lawyer.name)}</span>
              </span>
              <p className="muted" style={{ fontSize: "var(--t-caption)", marginTop: "var(--s-3)" }}>
                Portrait pending — see content request 9.
              </p>
            </div>
            <div>
              <p className="docket">{lawyer.position}</p>
              <h1 style={{ marginBottom: "var(--s-5)" }}>
                {lawyer.name}, {lawyer.honorifics}
              </h1>
              {bio ? (
                <>
                  <p className="lead">{bio}</p>
                  <p className="muted" style={{ fontSize: "var(--t-caption)" }}>
                    Summarised from the firm&rsquo;s published profile. Pending ASP review before
                    launch.
                  </p>
                </>
              ) : (
                <EmptyState
                  heading="Biography pending"
                  body="ASP has not yet supplied a biography, practice areas, education, admissions or languages for this profile. Nothing has been written on the lawyer's behalf."
                />
              )}
              <dl className="facts" style={{ marginTop: "var(--s-7)" }}>
                <div>
                  <dt>Position</dt>
                  <dd>{lawyer.position}</dd>
                </div>
                {lawyer.is_curator && (
                  <div>
                    <dt>Capacity</dt>
                    <dd>Court-appointed receiver (curator)</dd>
                  </div>
                )}
                <div>
                  <dt>Practice areas</dt>
                  <dd className="muted">Awaiting ASP</dd>
                </div>
                <div>
                  <dt>Education</dt>
                  <dd className="muted">
                    {lawyer.education.length > 0 ? lawyer.education.join("; ") : "Awaiting ASP"}
                  </dd>
                </div>
                <div>
                  <dt>Languages</dt>
                  <dd className="muted">
                    {lawyer.languages.length > 0 ? lawyer.languages.join("; ") : "Awaiting ASP"}
                  </dd>
                </div>
                <div>
                  <dt>Contact</dt>
                  <dd>
                    <a className="link-underline" href={`mailto:${FIRM.office.email}`}>
                      {FIRM.office.email}
                    </a>
                  </dd>
                </div>
              </dl>
              <a className="btn btn--primary" href="/consultation" style={{ marginTop: "var(--s-6)" }}>
                Enquire about a matter
              </a>
            </div>
          </div>
        </section>
        <CtaBand />
      </main>
    </>
  );
}
