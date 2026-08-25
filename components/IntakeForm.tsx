"use client";

import { FormEvent, useState } from "react";
import { DISCLAIMER } from "../lib/constants";

const MATTER_TYPES = [
  "Bankruptcy",
  "PKPU",
  "Debt restructuring",
  "Commercial dispute",
  "Litigation",
  "Arbitration",
  "Corporate",
  "Employment",
  "Other",
];
const ROLES = ["Company", "Director", "Shareholder", "Creditor", "Debtor", "Investor", "Individual", "Other"];
const URGENCY = ["A petition has already been filed", "Within days", "Within weeks", "Planning ahead"];

// Client-side validation is UX only — app/api/consultation/route.ts
// re-validates everything server-side and never trusts this. Submits to
// the leads table (db/schema.sql) via Vercel Blob for file storage; see
// that route's comments for what's still missing (no malware scan, no
// rate limiting).
export function IntakeForm() {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [note, setNote] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "submitting" | "sent">("idle");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const next: Record<string, string> = {};
    let firstInvalid: HTMLElement | null = null;

    form.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>(
      "[required]",
    ).forEach((input) => {
      const valid = input.checkValidity() && input.value.trim() !== "";
      if (!valid) {
        next[input.name] = input.dataset.error || "This field is required.";
        if (!firstInvalid) firstInvalid = input;
      }
    });

    setErrors(next);
    if (Object.keys(next).length > 0) {
      setNote("Check the highlighted fields.");
      if (firstInvalid) (firstInvalid as HTMLElement).focus();
      return;
    }

    setStatus("submitting");
    setNote(null);
    try {
      const res = await fetch("/api/consultation", {
        method: "POST",
        body: new FormData(form),
      });
      const data = await res.json().catch(() => ({ ok: false }));
      if (!res.ok || !data.ok) {
        setStatus("idle");
        if (data.fields) {
          const fieldErrors: Record<string, string> = {};
          for (const f of data.fields as string[]) fieldErrors[f] = "Please check this field.";
          setErrors(fieldErrors);
        }
        setNote(data.error || "Something went wrong. Please try again.");
        return;
      }
      setStatus("sent");
      setNote("Enquiry sent — we'll be in touch shortly.");
      form.reset();
    } catch {
      setStatus("idle");
      setNote("Network error — please check your connection and try again.");
    }
  }

  const opts = (xs: string[]) => xs.map((x) => <option key={x}>{x}</option>);
  const errField = (name: string) => (errors[name] ? " field--error" : "");

  return (
    <form className="form" noValidate style={{ marginTop: "var(--s-7)" }} onSubmit={handleSubmit}>
      <fieldset className="fieldset" disabled={status === "submitting" || status === "sent"}>
        <div className="grid grid--2">
          <div className={`field${errField("name")}`}>
            <label htmlFor="name">
              Full name <span className="req">*</span>
            </label>
            <input id="name" name="name" type="text" required autoComplete="name" aria-invalid={!!errors.name} />
            <span className="field__error" role="alert">{errors.name}</span>
          </div>
          <div className="field">
            <label htmlFor="company">Company</label>
            <input id="company" name="company" type="text" autoComplete="organization" />
          </div>
          <div className="field">
            <label htmlFor="position">Position</label>
            <input id="position" name="position" type="text" autoComplete="organization-title" />
          </div>
          <div className={`field${errField("email")}`}>
            <label htmlFor="email">
              Email <span className="req">*</span>
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              data-error="Enter an email address we can reply to."
              aria-invalid={!!errors.email}
            />
            <span className="field__error" role="alert">{errors.email}</span>
          </div>
          <div className="field">
            <label htmlFor="phone">Phone</label>
            <input id="phone" name="phone" type="tel" autoComplete="tel" />
          </div>
          <div className={`field${errField("matter")}`}>
            <label htmlFor="matter">
              Matter type <span className="req">*</span>
            </label>
            <select id="matter" name="matter" required aria-invalid={!!errors.matter}>
              <option value="">Select</option>
              {opts(MATTER_TYPES)}
            </select>
            <span className="field__error" role="alert">{errors.matter}</span>
          </div>
          <div className="field">
            <label htmlFor="role">Your role</label>
            <select id="role" name="role">
              <option value="">Select</option>
              {opts(ROLES)}
            </select>
          </div>
          <div className="field">
            <label htmlFor="urgency">Timing</label>
            <select id="urgency" name="urgency">
              <option value="">Select</option>
              {opts(URGENCY)}
            </select>
          </div>
        </div>
        <div className={`field${errField("description")}`}>
          <label htmlFor="description">
            Brief description <span className="req">*</span>
          </label>
          <textarea id="description" name="description" required aria-invalid={!!errors.description} />
          <span className="hint">
            Outline the situation and the parties&rsquo; positions. Leave out anything privileged
            or confidential.
          </span>
          <span className="field__error" role="alert">{errors.description}</span>
        </div>
        <div className="field">
          <label htmlFor="file">Supporting document</label>
          <input id="file" name="file" type="file" accept=".pdf,.doc,.docx" />
          <span className="hint">PDF or Word, up to 10 MB. Encrypted in transit and storage.</span>
        </div>
      </fieldset>
      <div className="disclaimer">
        <p>{DISCLAIMER}</p>
      </div>
      <div>
        <button className="btn btn--gold" type="submit" disabled={status === "submitting"} aria-busy={status === "submitting"}>
          {status === "submitting" ? "Sending…" : "Send enquiry"}
        </button>
        {note && (
          <p
            role="status"
            aria-live="polite"
            style={{ marginTop: "var(--s-4)", fontSize: "var(--t-small)", color: "var(--fg-muted)" }}
          >
            {note}
          </p>
        )}
      </div>
    </form>
  );
}
