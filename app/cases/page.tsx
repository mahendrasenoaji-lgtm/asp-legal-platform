import type { Metadata } from "next";
import { StatusBar } from "../../components/StatusBar";
import { Breadcrumbs } from "../../components/Breadcrumbs";
import { CtaBand } from "../../components/CtaBand";
import { CasesEmpty, CasesHead } from "../../components/CasesCopy";

export const metadata: Metadata = {
  title: "Case intelligence",
  description: "Public-record matters handled by ASP.",
};

// Redesign handoff's Cases screen renders no demo/placeholder rows at all —
// just the register's real empty state — so the previous DEMO DATA table
// (structural placeholders only, per docs/content-requests.md item 6) is
// dropped here in favour of matching that: this is exactly how the page
// behaves in production once ASP has cleared zero matters, which is also
// exactly its current state.
export default function CasesPage() {
  return (
    <>
      <StatusBar note="Empty by design — no matters cleared for publication yet" />
      <main id="main">
        <Breadcrumbs trail={[["Home", "/"], ["Cases", null]]} />
        <section className="section">
          <div className="wrap pagehead">
            <CasesHead />
          </div>
        </section>
        <section className="section">
          <div className="wrap">
            <CasesEmpty />
          </div>
        </section>
        <CtaBand />
      </main>
    </>
  );
}
