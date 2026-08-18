import type { Metadata } from "next";
import { StatusBar } from "../../components/StatusBar";
import { Breadcrumbs } from "../../components/Breadcrumbs";
import { EmptyState } from "../../components/EmptyState";
import { CtaBand } from "../../components/CtaBand";
import { contrast } from "../../lib/contrast";

export const metadata: Metadata = {
  title: "Design system",
  description: "ASP design tokens, contrast results and component states.",
};

const PALETTE: [string, string, string][] = [
  ["Charcoal", "#111315", "Primary surface, hero, footer"],
  ["Forest deep", "#0F2119", "Featured practice, CTA band"],
  ["Forest", "#16352B", "Primary buttons, focus ring"],
  ["Gold", "#B89B5E", "Accent: rules, marks, CTA fill"],
  ["Gold deep", "#6E5A2C", "Gold as text on light surfaces"],
  ["Ivory", "#F7F5EF", "Page background"],
  ["White", "#FFFFFF", "Cards, inputs"],
  ["Ink", "#1C1C1C", "Body text"],
];

const PAIRS: [string, string, string, string][] = [
  ["Ink on ivory", "#1C1C1C", "#F7F5EF", "Body text"],
  ["Ink muted on ivory", "#5B5F62", "#F7F5EF", "Secondary text"],
  ["Gold on ivory", "#B89B5E", "#F7F5EF", "Text — expected to fail"],
  ["Gold deep on ivory", "#6E5A2C", "#F7F5EF", "Accent text"],
  ["On-dark on charcoal", "#EDEAE1", "#111315", "Body on dark"],
  ["Gold on charcoal", "#B89B5E", "#111315", "Accent on dark"],
  ["On-dark muted on charcoal", "#A9AEA8", "#111315", "Secondary on dark"],
  ["White on forest", "#FFFFFF", "#16352B", "Primary button"],
  ["Charcoal on gold", "#111315", "#B89B5E", "Gold button"],
];

const SPECIMENS: [string, string, React.CSSProperties, string][] = [
  [
    "Display",
    "Cormorant Garamond 500 / clamp 2.75–5.75rem",
    { fontFamily: "var(--font-display)", fontSize: "var(--t-display)", lineHeight: "var(--lh-tight)", letterSpacing: "var(--ls-display)" },
    "Strategic counsel.",
  ],
  ["H2", "Cormorant Garamond 500", { fontFamily: "var(--font-display)", fontSize: "var(--t-h2)" }, "Built for complex matters"],
  [
    "Lead",
    "Inter 400 / 1.5",
    { fontFamily: "var(--font-body)", fontSize: "var(--t-lead)", lineHeight: "var(--lh-lead)" },
    "A PKPU runs on a statutory clock.",
  ],
  [
    "Body",
    "Inter 400 / 1.68",
    { fontFamily: "var(--font-body)", fontSize: "var(--t-body)", lineHeight: "var(--lh-body)" },
    "The firm acts as receiver, as administrator, and as counsel to debtors and creditors.",
  ],
  [
    "Docket",
    "IBM Plex Mono 400 / 0.14em",
    {
      fontFamily: "var(--font-docket)",
      fontSize: "var(--t-docket)",
      letterSpacing: "var(--ls-docket)",
      textTransform: "uppercase",
      color: "var(--accent-text)",
    },
    "Commercial Court Jakarta",
  ],
];

export default function StyleguidePage() {
  return (
    <>
      <StatusBar note="Phase 2 deliverable" />
      <main id="main">
        <Breadcrumbs trail={[["Home", "/"], ["Design system", null]]} />
        <section className="section">
          <div className="wrap pagehead">
            <p className="docket">Phase 2</p>
            <h1>Design system.</h1>
            <p className="lead">
              Tokens, type scale, contrast results and component states. Everything the frontend
              is allowed to use.
            </p>
          </div>
        </section>

        <section className="section">
          <div className="wrap">
            <div className="section-head">
              <p className="docket">Colour</p>
              <h2>Eight values, one accent used sparingly.</h2>
            </div>
            <div className="grid grid--4">
              {PALETTE.map(([name, hex, use]) => (
                <div className="swatch" key={name}>
                  <div className="swatch__chip" style={{ background: hex }} />
                  <div className="swatch__meta">
                    <b>{name}</b>
                    {hex}
                    <br />
                    <span className="muted">{use}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="section">
          <div className="wrap">
            <div className="section-head">
              <p className="docket">Contrast</p>
              <h2>Measured, not assumed.</h2>
              <p>
                Computed at build time. Gold on ivory fails for text, which is why gold is
                restricted to rules, marks and fills, and why a darker gold exists for accent text.
              </p>
            </div>
            <table className="table">
              <thead>
                <tr>
                  <th>Pair</th>
                  <th>Ratio</th>
                  <th>WCAG</th>
                  <th>Use</th>
                </tr>
              </thead>
              <tbody>
                {PAIRS.map(([label, fg, bg, use]) => {
                  const ratio = contrast(fg, bg);
                  const aa = ratio >= 4.5;
                  const aaLarge = ratio >= 3.0;
                  const verdict = aa ? "AA" : aaLarge ? "AA large only" : "fail";
                  return (
                    <tr key={label}>
                      <td data-label="Pair">
                        <span
                          style={{
                            display: "inline-block",
                            width: "1.5rem",
                            height: "1.5rem",
                            background: bg,
                            border: "1px solid var(--rule)",
                            verticalAlign: "middle",
                          }}
                        />{" "}
                        {label}
                      </td>
                      <td data-label="Ratio" className="num">
                        {ratio.toFixed(2)}:1
                      </td>
                      <td data-label="Verdict" className={aa ? "pass" : "fail"}>
                        {verdict}
                      </td>
                      <td data-label="Use">{use}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        <section className="section">
          <div className="wrap">
            <div className="section-head">
              <p className="docket">Typography</p>
              <h2>Display, body, docket.</h2>
              <p>
                Cormorant Garamond carries the voice, Inter carries the reading, IBM Plex Mono
                carries the record — case numbers, courts, years, filters.
              </p>
            </div>
            {SPECIMENS.map(([name, spec, style, text]) => (
              <div className="specimen" key={name}>
                <div className="specimen__meta">
                  {name} · {spec}
                </div>
                <div style={style}>{text}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="section">
          <div className="wrap">
            <div className="section-head">
              <p className="docket">Components</p>
              <h2>States.</h2>
            </div>
            <div className="grid grid--2">
              <div>
                <p className="eyebrow">Buttons</p>
                <p style={{ display: "flex", gap: "var(--s-3)", flexWrap: "wrap", marginTop: "var(--s-4)" }}>
                  <a className="btn btn--gold" href="#">
                    Primary action
                  </a>
                  <a className="btn btn--primary" href="#">
                    Secondary
                  </a>
                  <a className="btn btn--ghost" href="#">
                    Ghost
                  </a>
                </p>
                <p className="eyebrow" style={{ marginTop: "var(--s-6)" }}>
                  Chips
                </p>
                <div className="filters" style={{ marginTop: "var(--s-4)" }}>
                  <button className="chip" type="button" aria-pressed="true">
                    Selected
                  </button>
                  <button className="chip" type="button">
                    Default
                  </button>
                </div>
              </div>
              <div>
                <p className="eyebrow">Field states</p>
                <div className="form" style={{ marginTop: "var(--s-4)" }}>
                  <div className="field">
                    <label htmlFor="sg1">Default</label>
                    <input id="sg1" type="text" placeholder="Placeholder" />
                  </div>
                  <div className="field field--error">
                    <label htmlFor="sg2">Error</label>
                    <input id="sg2" type="text" aria-invalid="true" />
                    <span className="field__error">Enter an email address we can reply to.</span>
                  </div>
                </div>
              </div>
            </div>
            <div style={{ marginTop: "var(--s-7)" }}>
              <EmptyState
                heading="Empty state"
                body="Used wherever ASP content is outstanding. It says what is missing and who owns it, rather than filling the gap with invented copy."
                tag="Pattern"
              />
            </div>
          </div>
        </section>
        <CtaBand />
      </main>
    </>
  );
}
