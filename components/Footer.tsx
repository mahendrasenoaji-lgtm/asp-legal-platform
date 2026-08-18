import { getFirm, getPractices } from "../lib/data";

export async function Footer() {
  const [PRACTICES, FIRM] = await Promise.all([getPractices(), getFirm()]);
  const o = FIRM.office;
  const year = new Date().getFullYear();
  return (
    <footer className="footer">
      <div className="wrap">
        <div className="footer__grid">
          <div>
            <div className="footer__brand">Arifudin Susanto Partnership</div>
            <p
              style={{
                color: "var(--asp-on-dark-muted)",
                fontSize: "var(--t-small)",
                maxWidth: "34ch",
              }}
            >
              Advocates, receivers and administrators in bankruptcy. Jakarta, since 2017.
            </p>
          </div>
          <div>
            <p className="footer__label">Practices</p>
            <ul>
              {PRACTICES.slice(0, 6).map((p) => (
                <li key={p.slug}>
                  <a href={`/practices/${p.slug}`}>{p.name_en}</a>
                </li>
              ))}
              <li>
                <a href="/practices">All practices</a>
              </li>
            </ul>
          </div>
          <div>
            <p className="footer__label">Firm</p>
            <ul>
              <li>
                <a href="/about">About</a>
              </li>
              <li>
                <a href="/people">People</a>
              </li>
              <li>
                <a href="/recognition">Recognition</a>
              </li>
              <li>
                <a href="/insights">Insights</a>
              </li>
              <li>
                <a href="/careers">Careers</a>
              </li>
            </ul>
          </div>
          <div>
            <p className="footer__label">Contact</p>
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
            &copy; {year} Arifudin Susanto Partnership. All rights reserved.
          </span>
          <ul>
            <li>
              <a href="#">Privacy policy</a>
            </li>
            <li>
              <a href="#">Terms</a>
            </li>
            <li>
              <a href="#">Legal disclaimer</a>
            </li>
            <li>
              <a href="#">Cookie policy</a>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
