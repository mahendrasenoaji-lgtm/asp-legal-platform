import type { Metadata } from "next";
import { StatusBar } from "../../components/StatusBar";
import { Breadcrumbs } from "../../components/Breadcrumbs";
import { EmptyState } from "../../components/EmptyState";
import { ContactCta, ContactHead } from "../../components/ContactCopy";
import { getFirm } from "../../lib/data";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contact Arifudin Susanto Partnership, Jakarta.",
};

export default async function ContactPage() {
  const FIRM = await getFirm();
  const o = FIRM.office;
  return (
    <>
      <StatusBar note="Office hours, LinkedIn and map pending" />
      <main id="main">
        <Breadcrumbs trail={[["Home", "/"], ["Contact", null]]} />
        <section className="section">
          <div className="wrap grid grid--aside">
            <div>
              <ContactHead />
              <dl className="facts" style={{ marginTop: "var(--s-6)" }}>
                <div>
                  <dt>Address</dt>
                  <dd>
                    {o.name}
                    <br />
                    {o.street}
                    <br />
                    {o.district}
                    <br />
                    {o.city} {o.postal_code}
                  </dd>
                </div>
                <div>
                  <dt>Telephone</dt>
                  <dd>
                    <a className="link-underline" href={`tel:${o.phone.replace(/\s/g, "")}`}>
                      {o.phone}
                    </a>
                  </dd>
                </div>
                <div>
                  <dt>Email</dt>
                  <dd>
                    <a className="link-underline" href={`mailto:${o.email}`}>
                      {o.email}
                    </a>
                  </dd>
                </div>
                <div>
                  <dt>Office hours</dt>
                  <dd className="muted">Awaiting ASP</dd>
                </div>
                <div>
                  <dt>LinkedIn</dt>
                  <dd className="muted">Awaiting ASP</dd>
                </div>
              </dl>
              <ContactCta />
            </div>
            <aside>
              <EmptyState
                heading="Map pending"
                body="Embedding a map needs the office coordinates and a decision on loading Google Maps only after cookie consent."
                tag="Awaiting ASP + Phase 6"
              />
            </aside>
          </div>
        </section>
      </main>
    </>
  );
}
