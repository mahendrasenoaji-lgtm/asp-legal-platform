import type { Metadata } from "next";
import { StatusBar } from "../../components/StatusBar";
import { Breadcrumbs } from "../../components/Breadcrumbs";
import { IntakeForm } from "../../components/IntakeForm";
import { FIRM } from "../../lib/data";

export const metadata: Metadata = {
  title: "Discuss your matter",
  description: "Legal intake form for Arifudin Susanto Partnership.",
};

export default function ConsultationPage() {
  return (
    <>
      <StatusBar note="Form validates client-side; nothing is submitted" />
      <main id="main">
        <Breadcrumbs trail={[["Home", "/"], ["Legal intake", null]]} />
        <section className="section">
          <div className="wrap grid grid--aside">
            <div>
              <p className="docket">Legal intake</p>
              <h1>Discuss your matter.</h1>
              <p className="lead">
                The more precise the description, the faster the firm can tell you whether it can
                act and how quickly it needs to.
              </p>
              <IntakeForm />
            </div>
            <aside>
              <h4>What happens next</h4>
              <dl className="facts">
                <div>
                  <dt>Acknowledgement</dt>
                  <dd>Within one business day.</dd>
                </div>
                <div>
                  <dt>Conflict check</dt>
                  <dd>Run before any substantive discussion.</dd>
                </div>
                <div>
                  <dt>Engagement</dt>
                  <dd>Nothing is advice until the firm has confirmed it can act and terms are agreed.</dd>
                </div>
              </dl>
              <h4 style={{ marginTop: "var(--s-7)" }}>Prefer to call</h4>
              <p>
                <a className="link-underline" href={`tel:${FIRM.office.phone.replace(/\s/g, "")}`}>
                  {FIRM.office.phone}
                </a>
              </p>
            </aside>
          </div>
        </section>
      </main>
    </>
  );
}
