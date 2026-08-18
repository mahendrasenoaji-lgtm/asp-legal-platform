import type { Metadata } from "next";
import { StatusBar } from "../../components/StatusBar";
import { Breadcrumbs } from "../../components/Breadcrumbs";
import { EmptyState } from "../../components/EmptyState";
import { CtaBand } from "../../components/CtaBand";
import { FilterChips } from "../../components/FilterChips";
import { CATEGORIES } from "../../lib/data";

export const metadata: Metadata = {
  title: "Insights",
  description: "Legal updates, case analysis and publications from ASP.",
};

export default function InsightsPage() {
  return (
    <>
      <StatusBar note="Empty by design — see docs/editorial-calendar.md" />
      <main id="main">
        <Breadcrumbs trail={[["Home", "/"], ["Insights", null]]} />
        <section className="section">
          <div className="wrap pagehead">
            <p className="docket">ASP Insights</p>
            <h1>Legal updates and case analysis.</h1>
            <p className="lead">
              Nine categories, an editorial workflow with legal review, and no published articles
              yet.
            </p>
          </div>
        </section>
        <section className="section">
          <div className="wrap">
            <FilterChips
              options={CATEGORIES.map((c) => ({ slug: c.slug, label: c.name_en }))}
            />
            <EmptyState
              heading="Nothing published yet"
              body="The previous site carried three WordPress demo posts and categories for fashion and music. Those are gone. Real articles start here, each with a named author, a reviewer, and a publication date."
              tag="Empty state — by design"
            />
            <div className="grid grid--3" style={{ marginTop: "var(--s-7)" }}>
              <div className="card">
                <p className="docket docket--plain">Workflow</p>
                <h3>Draft → legal review</h3>
                <p>Written by a named lawyer, reviewed by a second before anything is scheduled.</p>
              </div>
              <div className="card">
                <p className="docket docket--plain">Attribution</p>
                <h3>Named authors only</h3>
                <p>Every article carries an author who works at the firm. No house byline.</p>
              </div>
              <div className="card">
                <p className="docket docket--plain">Dates</p>
                <h3>Published and updated</h3>
                <p>Both dates shown. Legal updates go stale, and hiding that helps nobody.</p>
              </div>
            </div>
          </div>
        </section>
        <CtaBand />
      </main>
    </>
  );
}
