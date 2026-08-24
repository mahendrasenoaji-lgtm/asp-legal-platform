"use client";

import type { Firm, Practice } from "../lib/types";
import { useLang } from "./LanguageProvider";

export function FooterView({ practices, firm }: { practices: Practice[]; firm: Firm }) {
  const { lang, t } = useLang();
  const o = firm.office;
  const year = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="wrap">
        <div className="footer__grid">
          <div>
            <div className="footer__brand">Arifudin Susanto Partnership</div>
            <p style={{ color: "var(--fg-muted)", fontSize: "var(--t-small)", maxWidth: "34ch" }}>
              {t.footer.blurb}
            </p>
          </div>
          <div>
            <p className="footer__label">{t.footer.practicesLabel}</p>
            <ul>
              {practices.slice(0, 6).map((p) => (
                <li key={p.slug}>
                  <a href={`/practices/${p.slug}`}>{lang === "id" ? p.name_id : p.name_en}</a>
                </li>
              ))}
              <li>
                <a href="/practices">{t.footer.allPractices}</a>
              </li>
            </ul>
          </div>
          <div>
            <p className="footer__label">{t.footer.firmLabel}</p>
            <ul>
              <li>
                <a href="/about">{t.nav.about}</a>
              </li>
              <li>
                <a href="/people">{t.nav.people}</a>
              </li>
              <li>
                <a href="/recognition">{t.nav.recognition}</a>
              </li>
              <li>
                <a href="/insights">{t.nav.insights}</a>
              </li>
              <li>
                <a href="/careers">{t.nav.careers}</a>
              </li>
            </ul>
          </div>
          <div>
            <p className="footer__label">{t.footer.contactLabel}</p>
            <ul>
              <li>
                {o.name}
                <br />
                {o.street}
                <br />
                {o.district}
                <br />
                {o.city} {o.postal_code}
              </li>
              <li>
                <a href={`tel:${o.phone.replace(/\s/g, "")}`}>{o.phone}</a>
              </li>
              <li>
                <a href={`mailto:${o.email}`}>{o.email}</a>
              </li>
            </ul>
          </div>
        </div>
        <div className="footer__legal">
          <span>
            &copy; {year} {t.footer.rightsSuffix}
          </span>
          <ul>
            {t.footer.links.map((label) => (
              <li key={label}>
                <a href="#">{label}</a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
