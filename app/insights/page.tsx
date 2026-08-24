import type { Metadata } from "next";
import { StatusBar } from "../../components/StatusBar";
import { Breadcrumbs } from "../../components/Breadcrumbs";
import { CtaBand } from "../../components/CtaBand";
import {
  InsightsCategoryTags,
  InsightsEmpty,
  InsightsHead,
  InsightsWorkflow,
} from "../../components/InsightsCopy";
import { getCategories } from "../../lib/data";

export const metadata: Metadata = {
  title: "Insights",
  description: "Legal updates, case analysis and publications from ASP.",
};

export default async function InsightsPage() {
  const CATEGORIES = await getCategories();
  return (
    <>
      <StatusBar note="Empty by design — see docs/editorial-calendar.md" />
      <main id="main">
        <Breadcrumbs trail={[["Home", "/"], ["Insights", null]]} />
        <section className="section">
          <div className="wrap pagehead">
            <InsightsHead />
          </div>
        </section>
        <section className="section">
          <div className="wrap">
            <InsightsCategoryTags categories={CATEGORIES} />
            <InsightsEmpty />
            <InsightsWorkflow />
          </div>
        </section>
        <CtaBand />
      </main>
    </>
  );
}
