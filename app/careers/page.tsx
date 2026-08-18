import type { Metadata } from "next";
import { StatusBar } from "../../components/StatusBar";
import { Breadcrumbs } from "../../components/Breadcrumbs";
import { EmptyState } from "../../components/EmptyState";
import { CtaBand } from "../../components/CtaBand";

export const metadata: Metadata = {
  title: "Careers",
  description: "Careers at Arifudin Susanto Partnership.",
};

export default function CareersPage() {
  return (
    <>
      <StatusBar note="No vacancies published yet" />
      <main id="main">
        <Breadcrumbs trail={[["Home", "/"], ["Careers", null]]} />
        <section className="section">
          <div className="wrap pagehead">
            <p className="docket">Careers</p>
            <h1>Build your career with ASP.</h1>
            <p className="lead">
              Insolvency practice rewards people who can hold a statutory deadline and a
              commercial negotiation in the same week.
            </p>
          </div>
        </section>
        <section className="section">
          <div className="wrap grid grid--2">
            <EmptyState
              heading="Open positions"
              body="No vacancies published. When ASP supplies roles, each gets its own page with responsibilities, requirements and an application route."
            />
            <EmptyState
              heading="Internship programme"
              body="Programme description, eligibility and intake dates pending from ASP."
            />
          </div>
        </section>
        <CtaBand />
      </main>
    </>
  );
}
