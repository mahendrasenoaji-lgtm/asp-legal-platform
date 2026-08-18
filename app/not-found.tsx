export default function NotFound() {
  return (
    <main id="main">
      <section className="section">
        <div className="wrap" style={{ maxWidth: "44rem" }}>
          <p className="docket">404</p>
          <h1>That page is not here.</h1>
          <p className="lead">
            The address may have changed in the rebuild. Start from the practices, the people, or
            search.
          </p>
          <p style={{ display: "flex", gap: "var(--s-3)", flexWrap: "wrap", marginTop: "var(--s-6)" }}>
            <a className="btn btn--primary" href="/practices">
              Practices
            </a>
            <a className="btn btn--ghost" href="/people">
              People
            </a>
            <a className="btn btn--ghost" href="/">
              Home
            </a>
          </p>
        </div>
      </section>
    </main>
  );
}
