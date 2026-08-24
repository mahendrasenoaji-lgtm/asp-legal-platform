import type { Metadata } from "next";
import { StatusBar } from "../../components/StatusBar";
import { Breadcrumbs } from "../../components/Breadcrumbs";
import { CtaBand } from "../../components/CtaBand";
import { CareersHead, CareersIntern, CareersOpen } from "../../components/CareersCopy";
import { getFirm } from "../../lib/data";

export const metadata: Metadata = {
  title: "Careers",
  description: "Careers at Arifudin Susanto Partnership.",
};

export default async function CareersPage() {
  const FIRM = await getFirm();
  return (
    <>
      <StatusBar note="No vacancies published yet" />
      <main id="main">
        <Breadcrumbs trail={[["Home", "/"], ["Careers", null]]} />
        <section className="section">
          <div className="wrap pagehead">
            <CareersHead />
          </div>
        </section>
        <section className="section">
          <div className="wrap grid grid--2">
            <CareersOpen email={FIRM.office.email} />
            <CareersIntern />
          </div>
        </section>
        <CtaBand />
      </main>
    </>
  );
}
