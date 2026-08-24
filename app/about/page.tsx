import type { Metadata } from "next";
import { StatusBar } from "../../components/StatusBar";
import { Breadcrumbs } from "../../components/Breadcrumbs";
import { EmptyState } from "../../components/EmptyState";
import { CtaBand } from "../../components/CtaBand";
import { Reveal } from "../../components/Reveal";
import { AboutBody, AboutBody3, AboutHead, AboutSectors, AboutValues } from "../../components/AboutCopy";
import { getIndustries } from "../../lib/data";

export const metadata: Metadata = {
  title: "About the firm",
  description: "ASP is an Indonesian law firm concentrated on bankruptcy, PKPU and restructuring.",
};

export default async function AboutPage() {
  const INDUSTRIES = await getIndustries();
  return (
    <>
      <StatusBar note="Phase 1 deliverable" />
      <main id="main">
        <Breadcrumbs trail={[["Home", "/"], ["About", null]]} />
        <section className="section">
          <div className="wrap pagehead">
            <AboutHead />
          </div>
        </section>

        <section className="section">
          <div className="wrap grid grid--editorial">
            <div>
              <AboutBody />
            </div>
            <div className="prose">
              {/* Not in the redesign's bilingual dictionary (lib/i18n.ts) —
                  pre-existing app copy, shown in English regardless of the
                  language toggle rather than guessing an ID translation. */}
              <p>
                That combination is deliberate. Sitting on both sides of the same statutory
                process, over years rather than files, is what produces judgment about how a
                Commercial Court will actually treat a claim, a security interest or a composition
                plan.
              </p>
              <AboutBody3 />
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
              <AboutValues />
            </Reveal>
          </div>
        </section>

        <section className="section section--surface">
          <div className="wrap grid grid--editorial">
            <Reveal>
              <AboutSectors industries={INDUSTRIES} />
            </Reveal>
          </div>
        </section>
        <CtaBand />
      </main>
    </>
  );
}
