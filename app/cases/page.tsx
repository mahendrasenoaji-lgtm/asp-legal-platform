import type { Metadata } from "next";
import { StatusBar } from "../../components/StatusBar";
import { Breadcrumbs } from "../../components/Breadcrumbs";
import { EmptyState } from "../../components/EmptyState";
import { CtaBand } from "../../components/CtaBand";

export const metadata: Metadata = {
  title: "Case intelligence",
  description: "Public-record matters handled by ASP.",
};

// Labelled demo rows only — structural placeholders, not ASP matters. See
// docs/content-requests.md item 6: default is to publish nothing until ASP
// clears specific matters that are already on the public record.
const DEMO: [string, string, number, string, string, string][] = [
  ["PKPU", "Commercial Court Jakarta", 2026, "Manufacturing", "Administrator", "Completed"],
  ["Bankruptcy", "Commercial Court Surabaya", 2025, "Shipping", "Counsel to creditor", "Completed"],
  ["Bankruptcy", "Commercial Court Jakarta", 2025, "Property", "Receiver", "Ongoing"],
];

export default function CasesPage() {
  return (
    <>
      <StatusBar note="This page carries labelled demo rows" />
      <main id="main">
        <Breadcrumbs trail={[["Home", "/"], ["Cases", null]]} />
        <section className="section">
          <div className="wrap pagehead">
            <p className="docket">Case intelligence</p>
            <h1>Selected matters on the public record.</h1>
            <p className="lead">
              A filterable register of matters that are already public and cleared for
              publication by the firm.
            </p>
            <p>
              <span className="demo-flag">Demo data</span>
            </p>
          </div>
        </section>
        <section className="section">
          <div className="wrap">
            <div className="disclaimer" style={{ marginBottom: "var(--s-6)" }}>
              <p>
                The three rows below are structural placeholders showing how the register renders.
                They are not ASP matters. No party is named, and nothing here is drawn from a
                client file. The register stays empty in production until ASP supplies matters
                that are on the public record and clears each one.
              </p>
            </div>
            <table className="table">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Court</th>
                  <th>Year</th>
                  <th>Industry</th>
                  <th>Role</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {DEMO.map((d, i) => (
                  <tr key={i}>
                    <td data-label="Type">{d[0]}</td>
                    <td data-label="Court">{d[1]}</td>
                    <td data-label="Year" className="num">
                      {d[2]}
                    </td>
                    <td data-label="Industry">{d[3]}</td>
                    <td data-label="Role">{d[4]}</td>
                    <td data-label="Status">{d[5]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{ marginTop: "var(--s-7)" }}>
              <EmptyState
                heading="Production state"
                body="With no cleared matters, this page renders the filters, an explanation of what the register is for, and a route to the intake form. It does not render placeholder rows."
                tag="How this behaves at launch"
              />
            </div>
          </div>
        </section>
        <CtaBand />
      </main>
    </>
  );
}
