import Link from "next/link";
import { DISCLAIMER } from "../lib/data";

export function CtaBand() {
  return (
    <section className="section cta-band">
      <div className="wrap grid grid--aside">
        <div>
          <p className="docket">Legal intake</p>
          <h2>Tell us about the matter.</h2>
          <p>
            Insolvency moves on statutory clocks. If a petition has been filed against you, or
            you are weighing one, the earlier the assessment the wider the options.
          </p>
          <Link className="btn btn--gold" href="/consultation">
            Discuss your matter <span aria-hidden="true">&rarr;</span>
          </Link>
        </div>
        <div className="disclaimer">
          <p>{DISCLAIMER}</p>
        </div>
      </div>
    </section>
  );
}
