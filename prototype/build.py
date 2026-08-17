#!/usr/bin/env python3
"""Build the ASP prototype from data/*.json.

Every page is generated from verified data. Where ASP has not supplied content,
the generator emits an empty state rather than inventing copy.

Usage:  python3 prototype/build.py
Output: prototype/*.html  (open prototype/index.html in a browser)
"""

import json
import os
import html
import shutil

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA = os.path.join(ROOT, "data")
OUT = os.path.join(ROOT, "prototype")


def load(name):
    with open(os.path.join(DATA, name), encoding="utf-8") as f:
        return json.load(f)


FIRM = load("firm.json")
LAWYERS = load("lawyers.json")["lawyers"]
PRACTICES = load("practice-areas.json")["practice_areas"]
AWARDS = load("awards.json")["awards"]
INDUSTRIES = load("industries.json")["industries"]
CATEGORIES = load("insight-categories.json")["insight_categories"]

e = html.escape

NAV = [
    ("About", "about.html"),
    ("People", "people.html"),
    ("Practices", "practices.html"),
    ("Insights", "insights.html"),
    ("Cases", "cases.html"),
    ("Recognition", "recognition.html"),
    ("Careers", "careers.html"),
]

DISCLAIMER = (
    "Submission of information through this website does not create an "
    "attorney-client relationship. Do not submit confidential or privileged "
    "information until such a relationship has been established."
)


def initials(name):
    parts = [p for p in name.split() if p[:1].isalpha()]
    return (parts[0][0] + (parts[-1][0] if len(parts) > 1 else "")).upper()


def head(title, description, page_class=""):
    return f"""<!DOCTYPE html>
<html lang="en" class="{page_class}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{e(title)} — ASP | Arifudin Susanto Partnership</title>
<meta name="description" content="{e(description)}">
<meta name="robots" content="noindex, nofollow">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400&family=IBM+Plex+Mono:wght@400;500&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
<link rel="stylesheet" href="assets/tokens.css">
<link rel="stylesheet" href="assets/main.css">
</head>
<body>
<a class="skip-link" href="#main">Skip to content</a>
"""


def protobar(note):
    return f"""<div class="protobar"><div class="wrap">
<span><b>Prototype</b> — Phase 3 build, not production</span>
<span>{e(note)}</span>
</div></div>
"""


def header(active=""):
    links = "".join(
        f'<a href="{h}"{" aria-current=\"page\"" if h == active else ""}>{e(t)}</a>'
        for t, h in NAV
    )
    drawer_items = "".join(f'<li><a href="{h}">{e(t)}</a></li>' for t, h in NAV)
    return f"""<header class="header">
  <div class="wrap header__inner">
    <a class="header__brand" href="index.html">ASP <small>Est. 2017</small></a>
    <nav class="nav" aria-label="Primary">{links}</nav>
    <div class="header__actions">
      <span class="lang"><a href="#" aria-current="true">EN</a> / <a href="#">ID</a></span>
      <a class="btn btn--gold" href="consultation.html">Discuss your matter</a>
      <button class="menu-toggle" type="button" data-menu-toggle aria-expanded="false" aria-controls="drawer">Menu</button>
    </div>
  </div>
</header>
<div class="drawer" id="drawer" data-drawer aria-hidden="true">
  <div style="display:flex;justify-content:space-between;align-items:center">
    <span class="header__brand">ASP</span>
  </div>
  <ul class="drawer__list">{drawer_items}<li><a href="contact.html">Contact</a></li></ul>
  <div class="drawer__foot">
    <a class="btn btn--gold" href="consultation.html">Discuss your matter</a>
    <span class="lang"><a href="#" aria-current="true">English</a> / <a href="#">Bahasa Indonesia</a></span>
  </div>
</div>
"""


def crumbs(trail):
    parts = []
    for i, (label, href) in enumerate(trail):
        if href and i < len(trail) - 1:
            parts.append(f'<a href="{href}">{e(label)}</a>')
        else:
            parts.append(f"<em style='font-style:normal'>{e(label)}</em>")
    return '<div class="wrap"><nav class="crumbs" aria-label="Breadcrumb">' + "<span>/</span>".join(parts) + "</nav></div>"


def cta_band():
    return f"""<section class="section cta-band">
  <div class="wrap grid grid--aside">
    <div>
      <p class="docket">Legal intake</p>
      <h2>Tell us about the matter.</h2>
      <p>Insolvency moves on statutory clocks. If a petition has been filed against you, or you are weighing one, the earlier the assessment the wider the options.</p>
      <a class="btn btn--gold" href="consultation.html">Discuss your matter <span aria-hidden="true">&rarr;</span></a>
    </div>
    <div class="disclaimer"><p>{e(DISCLAIMER)}</p></div>
  </div>
</section>
"""


def footer():
    practice_links = "".join(
        f'<li><a href="practice-{p["slug"]}.html">{e(p["name_en"])}</a></li>' for p in PRACTICES[:6]
    )
    o = FIRM["office"]
    return f"""<footer class="footer">
  <div class="wrap">
    <div class="footer__grid">
      <div>
        <div class="footer__brand">Arifudin Susanto Partnership</div>
        <p style="color:var(--asp-on-dark-muted);font-size:var(--t-small);max-width:34ch">Advocates, receivers and administrators in bankruptcy. Jakarta, since 2017.</p>
      </div>
      <div>
        <h4>Practices</h4>
        <ul>{practice_links}<li><a href="practices.html">All practices</a></li></ul>
      </div>
      <div>
        <h4>Firm</h4>
        <ul>
          <li><a href="about.html">About</a></li>
          <li><a href="people.html">People</a></li>
          <li><a href="recognition.html">Recognition</a></li>
          <li><a href="insights.html">Insights</a></li>
          <li><a href="careers.html">Careers</a></li>
        </ul>
      </div>
      <div>
        <h4>Contact</h4>
        <ul>
          <li>{e(o["name"])}<br>{e(o["street"])}<br>{e(o["district"])}<br>{e(o["city"])} {e(o["postal_code"])}</li>
          <li><a href="tel:{o["phone"].replace(" ", "")}">{e(o["phone"])}</a></li>
          <li><a href="mailto:{e(o["email"])}">{e(o["email"])}</a></li>
        </ul>
      </div>
    </div>
    <div class="footer__legal">
      <span>&copy; <span data-year>2026</span> Arifudin Susanto Partnership. All rights reserved.</span>
      <ul>
        <li><a href="#">Privacy policy</a></li>
        <li><a href="#">Terms</a></li>
        <li><a href="#">Legal disclaimer</a></li>
        <li><a href="#">Cookie policy</a></li>
      </ul>
    </div>
  </div>
</footer>
<script src="assets/app.js"></script>
</body>
</html>
"""


def page(filename, title, description, body, active="", note="Content marked ‘awaiting ASP’ is deliberately empty"):
    content = head(title, description) + protobar(note) + header(active) + body + footer()
    with open(os.path.join(OUT, filename), "w", encoding="utf-8") as f:
        f.write(content)
    return filename


def empty_state(heading, body, tag="Awaiting content from ASP", action=None):
    act = f'<a class="link-arrow" href="{action[1]}">{e(action[0])} <span aria-hidden="true">&rarr;</span></a>' if action else ""
    return f"""<div class="empty">
  <span class="empty__tag">{e(tag)}</span>
  <h3>{e(heading)}</h3>
  <p>{e(body)}</p>
  {act}
</div>"""


# ---------------------------------------------------------------- homepage ---

def build_home():
    m = FIRM["claimed_metrics"]
    flagship = [p for p in PRACTICES if p["tier"] == "flagship"]
    others = [p for p in PRACTICES if p["tier"] != "flagship"]

    practice_cards = "".join(
        f"""<a class="card card--practice{' card--flagship' if p['tier']=='flagship' else ''}" href="practice-{p['slug']}.html" data-reveal>
      <span class="card__mark">{e(p['name_id'])}</span>
      <h3>{e(p['name_en'])}</h3>
      <p>{e(p['tier'].replace('-', ' ').title())} practice</p>
      <span class="card__foot link-arrow">Overview <span aria-hidden="true">&rarr;</span></span>
    </a>"""
        for p in flagship + others
    )

    steps = [
        ("Filing", "Petition lodged", "Commercial Court registers the petition and sets the first hearing.", "statutory"),
        ("Day 20", "PKPU granted", "Court must rule within 20 days. Sementara runs 45 days from the ruling.", "statutory"),
        ("Day 45", "Claims verified", "Administrator verifies claims; the debtor tables a composition plan.", "key"),
        ("Day 45+", "Creditors vote", "Approval needs the statutory majorities of both secured and unsecured classes.", "key"),
        ("Day 270", "Outer limit", "PKPU Tetap cannot exceed 270 days from the sementara ruling.", "statutory"),
        ("Outcome", "Homologasi or bankruptcy", "Ratification binds all creditors. Rejection converts the matter to bankruptcy.", "key"),
    ]
    track = "".join(
        f"""<div class="proceeding__step" data-state="{s[3]}">
        <span class="proceeding__day">{e(s[0])}</span>
        <span class="proceeding__label">{e(s[1])}</span>
        <p class="proceeding__note">{e(s[2])}</p>
      </div>"""
        for s in steps
    )

    people_cards = "".join(
        f"""<a class="person" href="lawyer-{l['slug']}.html" data-reveal>
      <span class="person__frame"><span class="person__initials">{initials(l['name'])}</span></span>
      <span class="person__name">{e(l['name'])}, {e(l['honorifics'])}</span>
      <span class="person__role">{e(l['position'])}</span>
    </a>"""
        for l in LAWYERS[:4]
    )

    awards_rows = "".join(
        f"""<a class="award" href="award-{a['slug']}.html">
      <span class="award__year">{a['year']}</span>
      <span><span class="award__title">{e(a['title'])}</span><span class="award__org">{e(a['organization'])}</span></span>
    </a>"""
        for a in AWARDS[:5]
    )

    body = f"""<main id="main">
<section class="hero">
  <div class="wrap hero__inner">
    <p class="docket reveal">Jakarta · Commercial Court practice</p>
    <h1 class="reveal">Strategic counsel.<br>Complex matters.<em>Trusted outcomes.</em></h1>
    <p class="hero__sub reveal">Arifudin Susanto Partnership advises on bankruptcy, PKPU, debt restructuring, litigation, arbitration and complex commercial matters in Indonesia — as counsel to debtors and creditors, and as court-appointed receiver.</p>
    <div class="hero__cta reveal">
      <a class="btn btn--gold" href="practices.html">Explore our practices <span aria-hidden="true">&rarr;</span></a>
      <a class="btn btn--ghost" href="consultation.html">Discuss your matter</a>
    </div>
  </div>
</section>

<section class="trustbar">
  <div class="wrap trustbar__grid">
    <div class="trustbar__item"><span class="trustbar__num">{m['practice_areas']}</span><span class="trustbar__label">Practice areas</span></div>
    <div class="trustbar__item"><span class="trustbar__num">{m['fee_earners']}</span><span class="trustbar__label">Fee earners <sup style="color:var(--accent-text)">*</sup></span></div>
    <div class="trustbar__item"><span class="trustbar__num">{m['clients']}</span><span class="trustbar__label">Clients served</span></div>
    <div class="trustbar__item"><span class="trustbar__num">2017</span><span class="trustbar__label">Established</span></div>
  </div>
  <div class="wrap"><p style="font-size:var(--t-caption);color:var(--fg-muted);padding-bottom:var(--s-5)"><span style="color:var(--accent-text)">*</span> Unverified: the People page currently lists 23 professionals. Reconcile before launch — see docs/content-requests.md, item 2.</p></div>
</section>

<section class="section">
  <div class="wrap grid grid--editorial">
    <div data-reveal>
      <p class="docket">The firm</p>
      <h2>Built for complex matters.</h2>
    </div>
    <div data-reveal>
      <p class="lead">ASP was founded on 3 May 2017 by Muhamad Arifudin and Herlin Susanto to handle insolvency work that most firms treat as an occasional file.</p>
      <p>The firm acts in bankruptcy and PKPU proceedings in three distinct capacities — court-appointed receiver, administrator, and counsel to debtors or creditors — across manufacturing, aviation, shipping, oil and gas, plantations, property, cooperatives and state-owned enterprises.</p>
      <p>Its work is guided by three stated values: visionary, integrity, professional.</p>
      <a class="link-arrow" href="about.html">Discover ASP <span aria-hidden="true">&rarr;</span></a>
    </div>
  </div>
</section>

<section class="section">
  <div class="wrap">
    <div class="section-head section-head__row" data-reveal>
      <div><p class="docket">Our practices</p><h2>Twelve practices, one centre of gravity.</h2></div>
      <a class="link-arrow" href="practices.html">All practices <span aria-hidden="true">&rarr;</span></a>
    </div>
    <div class="grid grid--3">{practice_cards}</div>
  </div>
</section>

<section class="section section--forest">
  <div class="wrap">
    <div class="section-head" data-reveal>
      <p class="docket">Featured practice</p>
      <h2>Bankruptcy, PKPU &amp; restructuring.</h2>
      <p class="lead">A PKPU runs on a statutory clock. Every option narrows as the days pass, which is why the first week matters more than the last.</p>
    </div>
    <div class="proceeding" data-reveal>
      <div class="proceeding__track">{track}</div>
      <p class="muted" style="font-size:var(--t-caption);margin-top:var(--s-5)">Periods reflect the statutory framework of Law No. 37 of 2004 on Bankruptcy and Suspension of Debt Payment Obligations. Timelines in a specific matter depend on the court and the facts.</p>
    </div>
    <div class="grid grid--3" style="margin-top:var(--s-8)">
      <a class="card" href="practice-bankruptcy.html"><h3>Bankruptcy</h3><p>Petitions, defence, estate administration and asset realisation.</p><span class="card__foot link-arrow">Overview <span aria-hidden="true">&rarr;</span></span></a>
      <a class="card" href="practice-pkpu.html"><h3>PKPU</h3><p>Composition plans, claim verification, creditor negotiation and voting.</p><span class="card__foot link-arrow">Overview <span aria-hidden="true">&rarr;</span></span></a>
      <a class="card" href="practice-debt-restructuring.html"><h3>Debt restructuring</h3><p>Out-of-court workouts, standstills, security and refinancing.</p><span class="card__foot link-arrow">Overview <span aria-hidden="true">&rarr;</span></span></a>
    </div>
  </div>
</section>

<section class="section">
  <div class="wrap">
    <div class="section-head section-head__row" data-reveal>
      <div><p class="docket">People</p><h2>The people behind the practice.</h2></div>
      <a class="link-arrow" href="people.html">All {len(LAWYERS)} professionals <span aria-hidden="true">&rarr;</span></a>
    </div>
    <div class="grid grid--4">{people_cards}</div>
  </div>
</section>

<section class="section">
  <div class="wrap grid grid--aside">
    <div data-reveal>
      <p class="docket">Recognition</p>
      <h2>Recognised for excellence.</h2>
      <div style="margin-top:var(--s-6)">{awards_rows}</div>
      <a class="link-arrow" href="recognition.html" style="margin-top:var(--s-5)">All {len(AWARDS)} recognitions <span aria-hidden="true">&rarr;</span></a>
    </div>
    <div data-reveal>
      <p class="muted" style="font-size:var(--t-small)">Every recognition on this site links to the awarding organisation's own published listing. Nothing is self-declared.</p>
    </div>
  </div>
</section>

<section class="section">
  <div class="wrap grid grid--2">
    <div data-reveal>
      <p class="docket">ASP Insights</p>
      <h2>Legal updates and case analysis.</h2>
      {empty_state("No articles published yet",
                   "The editorial pipeline is built and the categories are set. Publication begins once the first legal updates clear review.",
                   action=("See what is needed", "insights.html"))}
    </div>
    <div data-reveal>
      <p class="docket">Case intelligence</p>
      <h2>Selected matters, on the public record.</h2>
      {empty_state("No matters published yet",
                   "Only matters that are already public record and cleared by the firm will appear here. Nothing is published from client files.",
                   action=("How the register works", "cases.html"))}
    </div>
  </div>
</section>

{cta_band()}
</main>
"""
    return page("index.html", "Strategic counsel for complex matters",
                "Arifudin Susanto Partnership advises on bankruptcy, PKPU, restructuring, litigation and arbitration in Indonesia.",
                body, note="Metrics shown as claimed by ASP; one is flagged")


# ------------------------------------------------------------------- about ---

def build_about():
    values = [
        ("Visionary", "Anticipating how the legal landscape moves, so a strategy holds up beyond the current hearing."),
        ("Integrity", "Candid advice, transparent process, and the client's interest ahead of the firm's."),
        ("Professional", "Expert knowledge applied with precision, and communicated on time."),
    ]
    vcards = "".join(
        f'<div class="card" data-reveal><span class="card__mark"></span><h3>{e(v[0])}</h3><p>{e(v[1])}</p></div>'
        for v in values
    )
    ind = "".join(f'<li>{e(i["name_en"])}</li>' for i in INDUSTRIES)
    body = f"""<main id="main">
{crumbs([("Home", "index.html"), ("About", None)])}
<section class="section">
  <div class="wrap pagehead">
    <p class="docket">About the firm</p>
    <h1>A practice organised around insolvency.</h1>
    <p class="lead">Founded 3 May 2017 by Muhamad Arifudin and Herlin Susanto. Advocates, receivers and administrators in bankruptcy.</p>
  </div>
</section>

<section class="section">
  <div class="wrap grid grid--editorial">
    <div><p class="docket">The firm</p></div>
    <div class="prose">
      <p>ASP handles commercial disputes with a primary concentration in bankruptcy, liquidation and PKPU. The firm's lawyers act in three capacities that are usually split across different firms: as court-appointed receiver, as administrator, and as counsel to debtors or creditors.</p>
      <p>That combination is deliberate. Sitting on both sides of the same statutory process, over years rather than files, is what produces judgment about how a Commercial Court will actually treat a claim, a security interest or a composition plan.</p>
      <p>Matters have involved individual debtors, national private companies, publicly listed companies and state-owned enterprises.</p>
      {empty_state("Firm narrative pending review", "This section reflects only what the firm has already published. A fuller account of the firm's history and approach is with ASP for drafting.")}
    </div>
  </div>
</section>

<section class="section">
  <div class="wrap">
    <div class="section-head" data-reveal><p class="docket">Vision &amp; values</p><h2>Three commitments, stated plainly.</h2></div>
    <div class="grid grid--3">{vcards}</div>
  </div>
</section>

<section class="section section--dark">
  <div class="wrap grid grid--editorial">
    <div data-reveal><p class="docket">Sectors</p><h2>Where the work has been.</h2><p class="muted">Sixteen sectors drawn from matters the firm has already described publicly.</p></div>
    <div data-reveal><ul style="columns:2;column-gap:var(--s-7);list-style:none;padding:0;margin:0;font-size:var(--t-small);line-height:2.2">{ind}</ul></div>
  </div>
</section>
{cta_band()}
</main>
"""
    return page("about.html", "About the firm", "ASP is an Indonesian law firm concentrated on bankruptcy, PKPU and restructuring.", body, "about.html")


# ------------------------------------------------------------------ people ---

def build_people():
    tiers = [
        ("partner", "Partners", [l for l in LAWYERS if "partner" in l["tier"]]),
        ("leader", "Leadership", [l for l in LAWYERS if l["tier"] == "leader"]),
        ("associate", "Associates", [l for l in LAWYERS if l["tier"] == "associate"]),
    ]
    sections = ""
    for key, label, group in tiers:
        cards = "".join(
            f"""<a class="person" href="lawyer-{l['slug']}.html" data-reveal>
        <span class="person__frame"><span class="person__initials">{initials(l['name'])}</span></span>
        <span class="person__name">{e(l['name'])}, {e(l['honorifics'])}</span>
        <span class="person__role">{e(l['position'])}</span>
      </a>"""
            for l in group
        )
        sections += f"""<section class="section">
  <div class="wrap">
    <div class="section-head section-head__row"><div><p class="docket">{e(label)}</p><h2>{len(group)} {e(label.lower())}</h2></div></div>
    <div class="grid grid--4">{cards}</div>
  </div>
</section>"""

    body = f"""<main id="main">
{crumbs([("Home", "index.html"), ("People", None)])}
<section class="section">
  <div class="wrap pagehead">
    <p class="docket">People</p>
    <h1>{len(LAWYERS)} professionals.</h1>
    <p class="lead">Photography and biographies are pending. Names, honorifics and tiers are taken from the firm's published team page.</p>
    <p class="muted" style="font-size:var(--t-small)">Tier naming is unresolved: the current site uses “Leaders”, the brief specifies “Counsel”. Shown here under a neutral label until ASP decides.</p>
  </div>
</section>
{sections}
{cta_band()}
</main>
"""
    return page("people.html", "People", "The lawyers of Arifudin Susanto Partnership.", body, "people.html")


BIO_SUMMARY = {
    "muhamad-arifudin": (
        "Lawyer and court-appointed bankruptcy receiver, and managing partner of the firm. "
        "More than fifteen years of practice in bankruptcy and debt restructuring, across energy, "
        "oil and gas, aviation, plantations and palm oil processing, investment companies, cooperatives, "
        "property, warehousing, tobacco, manufacturing, textiles, herbal medicine production, shipping, "
        "mobile dealerships and individual debtor matters. Has acted for state-owned enterprises both as "
        "court-appointed receiver and as counsel."
    ),
    "herlin-susanto": (
        "Co-founder and partner. Law degree from Universitas Gadjah Mada and a master's in law from "
        "Universitas Sriwijaya. More than fifteen years in bankruptcy, PKPU, litigation and arbitration, "
        "representing national companies in business disputes and corporate restructuring. Serves as "
        "treasurer of the honorary board of the Indonesian Association of Curators and Administrators (AKPI) "
        "for the 2025–2028 term."
    ),
}


def build_lawyers():
    files = []
    for l in LAWYERS:
        bio = BIO_SUMMARY.get(l["slug"])
        if bio:
            bio_block = f"""<p class="lead">{e(bio)}</p>
      <p class="muted" style="font-size:var(--t-caption)">Summarised from the firm's published profile. Pending ASP review before launch.</p>"""
        else:
            bio_block = empty_state(
                "Biography pending",
                "ASP has not yet supplied a biography, practice areas, education, admissions or languages for this profile. "
                "Nothing has been written on the lawyer's behalf.",
            )
        curator = '<div><dt>Capacity</dt><dd>Court-appointed receiver (curator)</dd></div>' if l["is_curator"] else ""
        body = f"""<main id="main">
{crumbs([("Home", "index.html"), ("People", "people.html"), (l["name"], None)])}
<section class="section">
  <div class="wrap grid grid--editorial">
    <div>
      <span class="person__frame" style="max-width:22rem"><span class="person__initials">{initials(l['name'])}</span></span>
      <p class="muted" style="font-size:var(--t-caption);margin-top:var(--s-3)">Portrait pending — see content request 9.</p>
    </div>
    <div>
      <p class="docket">{e(l['position'])}</p>
      <h1 style="margin-bottom:var(--s-5)">{e(l['name'])}, {e(l['honorifics'])}</h1>
      {bio_block}
      <dl class="facts" style="margin-top:var(--s-7)">
        <div><dt>Position</dt><dd>{e(l['position'])}</dd></div>
        {curator}
        <div><dt>Practice areas</dt><dd class="muted">Awaiting ASP</dd></div>
        <div><dt>Education</dt><dd class="muted">{"Universitas Gadjah Mada; Universitas Sriwijaya (LL.M.)" if l["slug"]=="herlin-susanto" else "Awaiting ASP"}</dd></div>
        <div><dt>Languages</dt><dd class="muted">Awaiting ASP</dd></div>
        <div><dt>Contact</dt><dd><a class="link-underline" href="mailto:{e(FIRM['office']['email'])}">{e(FIRM['office']['email'])}</a></dd></div>
      </dl>
      <a class="btn btn--primary" href="consultation.html" style="margin-top:var(--s-6)">Enquire about a matter</a>
    </div>
  </div>
</section>
{cta_band()}
</main>
"""
        files.append(page(f"lawyer-{l['slug']}.html", l["name"], f"{l['name']} — {l['position']} at ASP.", body, "people.html"))
    return files


# --------------------------------------------------------------- practices ---

def build_practices():
    files = []
    groups = [("flagship", "Insolvency &amp; restructuring"), ("dispute", "Disputes"), ("corporate", "Corporate &amp; regulatory")]
    sections = ""
    for key, label in groups:
        items = [p for p in PRACTICES if p["tier"] == key]
        cards = "".join(
            f"""<a class="card card--practice{' card--flagship' if key=='flagship' else ''}" href="practice-{p['slug']}.html" data-reveal>
        <span class="card__mark">{e(p['name_id'])}</span>
        <h3>{e(p['name_en'])}</h3>
        <span class="card__foot link-arrow">Overview <span aria-hidden="true">&rarr;</span></span>
      </a>"""
            for p in items
        )
        sections += f"""<section class="section">
  <div class="wrap">
    <div class="section-head"><p class="docket">{label}</p><h2>{len(items)} practices</h2></div>
    <div class="grid grid--3">{cards}</div>
  </div>
</section>"""

    body = f"""<main id="main">
{crumbs([("Home", "index.html"), ("Practices", None)])}
<section class="section">
  <div class="wrap pagehead">
    <p class="docket">Practices</p>
    <h1>Twelve practices.</h1>
    <p class="lead">Ten as published by the firm, with bankruptcy, PKPU and restructuring separated into distinct pages because they answer distinct questions.</p>
    <p class="muted" style="font-size:var(--t-small)">A Corporate Legal Services practice appears in the brief but not on the firm's current site. It has not been added — see decision D-04 and content request 5.</p>
  </div>
</section>
{sections}
{cta_band()}
</main>
"""
    files.append(page("practices.html", "Practices", "Practice areas of Arifudin Susanto Partnership.", body, "practices.html"))

    for p in PRACTICES:
        related = [x for x in PRACTICES if x["tier"] == p["tier"] and x["slug"] != p["slug"]][:3]
        rel = "".join(
            f'<a class="card" href="practice-{r["slug"]}.html"><h3>{e(r["name_en"])}</h3><span class="card__foot link-arrow">Overview <span aria-hidden="true">&rarr;</span></span></a>'
            for r in related
        )
        body = f"""<main id="main">
{crumbs([("Home", "index.html"), ("Practices", "practices.html"), (p["name_en"], None)])}
<section class="section">
  <div class="wrap pagehead">
    <p class="docket">{e(p['name_id'])}</p>
    <h1>{e(p['name_en'])}</h1>
    <p class="muted" style="font-size:var(--t-small)">Legacy grouping: {e(p['legacy_group'])}</p>
  </div>
</section>
<section class="section">
  <div class="wrap grid grid--aside">
    <div>
      {empty_state("Practice overview pending",
                   "ASP has not yet supplied a description for this practice. Writing one here would mean inventing capabilities, so the page holds its structure and waits. Required: 300–600 words, key capabilities, typical mandates, and the lawyers who lead the practice.")}
      <h2 style="margin-top:var(--s-8)">Related practices</h2>
      <div class="grid grid--3">{rel}</div>
    </div>
    <aside>
      <h4>On this practice</h4>
      <dl class="facts">
        <div><dt>Lead lawyers</dt><dd class="muted">Awaiting ASP</dd></div>
        <div><dt>Related insights</dt><dd class="muted">None published</dd></div>
        <div><dt>Selected matters</dt><dd class="muted">None cleared</dd></div>
      </dl>
      <a class="btn btn--primary" href="consultation.html" style="margin-top:var(--s-5)">Discuss a matter</a>
    </aside>
  </div>
</section>
{cta_band()}
</main>
"""
        files.append(page(f"practice-{p['slug']}.html", p["name_en"], f"{p['name_en']} practice at ASP.", body, "practices.html"))
    return files


# ------------------------------------------------------- recognition/awards ---

def build_recognition():
    files = []
    rows = "".join(
        f"""<a class="award" href="award-{a['slug']}.html">
      <span class="award__year">{a['year']}</span>
      <span><span class="award__title">{e(a['title'])}</span><span class="award__org">{e(a['organization'])}</span></span>
    </a>"""
        for a in AWARDS
    )
    body = f"""<main id="main">
{crumbs([("Home", "index.html"), ("Recognition", None)])}
<section class="section">
  <div class="wrap pagehead">
    <p class="docket">Recognition</p>
    <h1>{len(AWARDS)} recognitions, 2022–2026.</h1>
    <p class="lead">Each entry links to the awarding organisation's published listing.</p>
  </div>
</section>
<section class="section"><div class="wrap">{rows}</div></section>
{cta_band()}
</main>
"""
    files.append(page("recognition.html", "Recognition", "Awards and rankings received by ASP.", body, "recognition.html"))

    for a in AWARDS:
        body = f"""<main id="main">
{crumbs([("Home", "index.html"), ("Recognition", "recognition.html"), (str(a["year"]), None)])}
<section class="section">
  <div class="wrap grid grid--aside">
    <div>
      <p class="docket">{a['year']} · {e(a['organization'])}</p>
      <h1>{e(a['title'])}</h1>
      {empty_state("Award narrative pending", "The certificate image, the associated lawyers and the firm's own account of the matter behind this recognition are with ASP.")}
    </div>
    <aside>
      <dl class="facts">
        <div><dt>Year</dt><dd class="num">{a['year']}</dd></div>
        <div><dt>Organisation</dt><dd>{e(a['organization'])}</dd></div>
        <div><dt>Source</dt><dd><a class="link-underline" href="{e(a['source_url'])}" rel="noopener nofollow">Published listing</a></dd></div>
        <div><dt>Associated lawyers</dt><dd class="muted">Awaiting ASP</dd></div>
      </dl>
    </aside>
  </div>
</section>
{cta_band()}
</main>
"""
        files.append(page(f"award-{a['slug']}.html", a["title"], f"{a['title']} — {a['organization']}, {a['year']}.", body, "recognition.html"))
    return files


# ---------------------------------------------------------------- insights ---

def build_insights():
    chips = "".join(
        f'<button class="chip" type="button" data-value="{c["slug"]}">{e(c["name_en"])}</button>' for c in CATEGORIES
    )
    body = f"""<main id="main">
{crumbs([("Home", "index.html"), ("Insights", None)])}
<section class="section">
  <div class="wrap pagehead">
    <p class="docket">ASP Insights</p>
    <h1>Legal updates and case analysis.</h1>
    <p class="lead">Nine categories, an editorial workflow with legal review, and no published articles yet.</p>
  </div>
</section>
<section class="section">
  <div class="wrap">
    <div class="filters" data-filter-group="insight" aria-label="Filter by category">
      <button class="chip" type="button" data-value="all" aria-pressed="true">All</button>{chips}
    </div>
    {empty_state("Nothing published yet",
                 "The previous site carried three WordPress demo posts and categories for fashion and music. Those are gone. Real articles start here, each with a named author, a reviewer, and a publication date.",
                 tag="Empty state — by design")}
    <div class="grid grid--3" style="margin-top:var(--s-7)">
      <div class="card"><p class="docket docket--plain">Workflow</p><h3>Draft → legal review</h3><p>Written by a named lawyer, reviewed by a second before anything is scheduled.</p></div>
      <div class="card"><p class="docket docket--plain">Attribution</p><h3>Named authors only</h3><p>Every article carries an author who works at the firm. No house byline.</p></div>
      <div class="card"><p class="docket docket--plain">Dates</p><h3>Published and updated</h3><p>Both dates shown. Legal updates go stale, and hiding that helps nobody.</p></div>
    </div>
  </div>
</section>
{cta_band()}
</main>
"""
    return page("insights.html", "Insights", "Legal updates, case analysis and publications from ASP.", body, "insights.html")


# ------------------------------------------------------------------- cases ---

def build_cases():
    demo = [
        ("PKPU", "Commercial Court Jakarta", 2026, "Manufacturing", "Administrator", "Completed"),
        ("Bankruptcy", "Commercial Court Surabaya", 2025, "Shipping", "Counsel to creditor", "Completed"),
        ("Bankruptcy", "Commercial Court Jakarta", 2025, "Property", "Receiver", "Ongoing"),
    ]
    rows = "".join(
        f"""<tr>
      <td data-label="Type">{e(d[0])}</td>
      <td data-label="Court">{e(d[1])}</td>
      <td data-label="Year" class="num">{d[2]}</td>
      <td data-label="Industry">{e(d[3])}</td>
      <td data-label="Role">{e(d[4])}</td>
      <td data-label="Status">{e(d[5])}</td>
    </tr>"""
        for d in demo
    )
    body = f"""<main id="main">
{crumbs([("Home", "index.html"), ("Cases", None)])}
<section class="section">
  <div class="wrap pagehead">
    <p class="docket">Case intelligence</p>
    <h1>Selected matters on the public record.</h1>
    <p class="lead">A filterable register of matters that are already public and cleared for publication by the firm.</p>
    <p><span class="demo-flag">Demo data</span></p>
  </div>
</section>
<section class="section">
  <div class="wrap">
    <div class="disclaimer" style="margin-bottom:var(--s-6)">
      <p>The three rows below are structural placeholders showing how the register renders. They are not ASP matters. No party is named, and nothing here is drawn from a client file. The register stays empty in production until ASP supplies matters that are on the public record and clears each one.</p>
    </div>
    <table class="table">
      <thead><tr><th>Type</th><th>Court</th><th>Year</th><th>Industry</th><th>Role</th><th>Status</th></tr></thead>
      <tbody>{rows}</tbody>
    </table>
    <div style="margin-top:var(--s-7)">
      {empty_state("Production state", "With no cleared matters, this page renders the filters, an explanation of what the register is for, and a route to the intake form. It does not render placeholder rows.", tag="How this behaves at launch")}
    </div>
  </div>
</section>
{cta_band()}
</main>
"""
    return page("cases.html", "Case intelligence", "Public-record matters handled by ASP.", body, "cases.html",
                note="This page carries labelled demo rows")


# ---------------------------------------------------------------- intake -----

def build_intake():
    matter_types = ["Bankruptcy", "PKPU", "Debt restructuring", "Commercial dispute", "Litigation",
                    "Arbitration", "Corporate", "Employment", "Other"]
    roles = ["Company", "Director", "Shareholder", "Creditor", "Debtor", "Investor", "Individual", "Other"]
    urgency = ["A petition has already been filed", "Within days", "Within weeks", "Planning ahead"]
    opts = lambda xs: "".join(f'<option>{e(x)}</option>' for x in xs)

    body = f"""<main id="main">
{crumbs([("Home", "index.html"), ("Legal intake", None)])}
<section class="section">
  <div class="wrap grid grid--aside">
    <div>
      <p class="docket">Legal intake</p>
      <h1>Discuss your matter.</h1>
      <p class="lead">The more precise the description, the faster the firm can tell you whether it can act and how quickly it needs to.</p>

      <form class="form" data-intake novalidate style="margin-top:var(--s-7)">
        <fieldset class="fieldset">
          <div class="grid grid--2">
            <div class="field">
              <label for="name">Full name <span class="req">*</span></label>
              <input id="name" name="name" type="text" required autocomplete="name">
              <span class="field__error" role="alert"></span>
            </div>
            <div class="field">
              <label for="company">Company</label>
              <input id="company" name="company" type="text" autocomplete="organization">
            </div>
            <div class="field">
              <label for="position">Position</label>
              <input id="position" name="position" type="text" autocomplete="organization-title">
            </div>
            <div class="field">
              <label for="email">Email <span class="req">*</span></label>
              <input id="email" name="email" type="email" required autocomplete="email" data-error="Enter an email address we can reply to.">
              <span class="field__error" role="alert"></span>
            </div>
            <div class="field">
              <label for="phone">Phone</label>
              <input id="phone" name="phone" type="tel" autocomplete="tel">
            </div>
            <div class="field">
              <label for="matter">Matter type <span class="req">*</span></label>
              <select id="matter" name="matter" required><option value="">Select</option>{opts(matter_types)}</select>
              <span class="field__error" role="alert"></span>
            </div>
            <div class="field">
              <label for="role">Your role</label>
              <select id="role" name="role"><option value="">Select</option>{opts(roles)}</select>
            </div>
            <div class="field">
              <label for="urgency">Timing</label>
              <select id="urgency" name="urgency"><option value="">Select</option>{opts(urgency)}</select>
            </div>
          </div>
          <div class="field">
            <label for="description">Brief description <span class="req">*</span></label>
            <textarea id="description" name="description" required></textarea>
            <span class="hint">Outline the situation and the parties' positions. Leave out anything privileged or confidential.</span>
            <span class="field__error" role="alert"></span>
          </div>
          <div class="field">
            <label for="file">Supporting document</label>
            <input id="file" name="file" type="file" accept=".pdf,.doc,.docx">
            <span class="hint">PDF or Word, up to 10 MB. Files are scanned for malware and encrypted in transit.</span>
          </div>
        </fieldset>
        <div class="disclaimer"><p>{e(DISCLAIMER)}</p></div>
        <div>
          <button class="btn btn--gold" type="submit">Send enquiry</button>
          <p data-intake-note hidden style="margin-top:var(--s-4);font-size:var(--t-small);color:var(--fg-muted)"></p>
        </div>
      </form>
    </div>
    <aside>
      <h4>What happens next</h4>
      <dl class="facts">
        <div><dt>Acknowledgement</dt><dd>Within one business day.</dd></div>
        <div><dt>Conflict check</dt><dd>Run before any substantive discussion.</dd></div>
        <div><dt>Engagement</dt><dd>Nothing is advice until the firm has confirmed it can act and terms are agreed.</dd></div>
      </dl>
      <h4 style="margin-top:var(--s-7)">Prefer to call</h4>
      <p><a class="link-underline" href="tel:{FIRM['office']['phone'].replace(' ', '')}">{e(FIRM['office']['phone'])}</a></p>
    </aside>
  </div>
</section>
</main>
"""
    return page("consultation.html", "Discuss your matter", "Legal intake form for Arifudin Susanto Partnership.", body,
                note="Form validates client-side; nothing is submitted")


# ---------------------------------------------------------------- contact ----

def build_contact():
    o = FIRM["office"]
    body = f"""<main id="main">
{crumbs([("Home", "index.html"), ("Contact", None)])}
<section class="section">
  <div class="wrap grid grid--aside">
    <div>
      <p class="docket">Contact</p>
      <h1>Jakarta office.</h1>
      <dl class="facts" style="margin-top:var(--s-6)">
        <div><dt>Address</dt><dd>{e(o['name'])}<br>{e(o['street'])}<br>{e(o['district'])}<br>{e(o['city'])} {e(o['postal_code'])}</dd></div>
        <div><dt>Telephone</dt><dd><a class="link-underline" href="tel:{o['phone'].replace(' ', '')}">{e(o['phone'])}</a></dd></div>
        <div><dt>Email</dt><dd><a class="link-underline" href="mailto:{e(o['email'])}">{e(o['email'])}</a></dd></div>
        <div><dt>Office hours</dt><dd class="muted">Awaiting ASP</dd></div>
        <div><dt>LinkedIn</dt><dd class="muted">Awaiting ASP</dd></div>
      </dl>
      <a class="btn btn--primary" href="consultation.html" style="margin-top:var(--s-6)">Request a consultation</a>
    </div>
    <aside>
      {empty_state("Map pending", "Embedding a map needs the office coordinates and a decision on loading Google Maps only after cookie consent.", tag="Awaiting ASP + Phase 6")}
    </aside>
  </div>
</section>
</main>
"""
    return page("contact.html", "Contact", "Contact Arifudin Susanto Partnership, Jakarta.", body, "contact.html")


# ---------------------------------------------------------------- careers ----

def build_careers():
    body = f"""<main id="main">
{crumbs([("Home", "index.html"), ("Careers", None)])}
<section class="section">
  <div class="wrap pagehead">
    <p class="docket">Careers</p>
    <h1>Build your career with ASP.</h1>
    <p class="lead">Insolvency practice rewards people who can hold a statutory deadline and a commercial negotiation in the same week.</p>
  </div>
</section>
<section class="section">
  <div class="wrap grid grid--2">
    {empty_state("Open positions", "No vacancies published. When ASP supplies roles, each gets its own page with responsibilities, requirements and an application route.")}
    {empty_state("Internship programme", "Programme description, eligibility and intake dates pending from ASP.")}
  </div>
</section>
{cta_band()}
</main>
"""
    return page("careers.html", "Careers", "Careers at Arifudin Susanto Partnership.", body, "careers.html")


# ------------------------------------------------------------- style guide ---

def contrast(hex1, hex2):
    def lum(h):
        h = h.lstrip("#")
        c = [int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)]
        c = [x / 12.92 if x <= 0.03928 else ((x + 0.055) / 1.055) ** 2.4 for x in c]
        return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]
    a, b = lum(hex1), lum(hex2)
    hi, lo = max(a, b), min(a, b)
    return (hi + 0.05) / (lo + 0.05)


PALETTE = [
    ("Charcoal", "#111315", "Primary surface, hero, footer"),
    ("Forest deep", "#0F2119", "Featured practice, CTA band"),
    ("Forest", "#16352B", "Primary buttons, focus ring"),
    ("Gold", "#B89B5E", "Accent: rules, marks, CTA fill"),
    ("Gold deep", "#6E5A2C", "Gold as text on light surfaces"),
    ("Ivory", "#F7F5EF", "Page background"),
    ("White", "#FFFFFF", "Cards, inputs"),
    ("Ink", "#1C1C1C", "Body text"),
]

PAIRS = [
    ("Ink on ivory", "#1C1C1C", "#F7F5EF", "Body text"),
    ("Ink muted on ivory", "#5B5F62", "#F7F5EF", "Secondary text"),
    ("Gold on ivory", "#B89B5E", "#F7F5EF", "Text — expected to fail"),
    ("Gold deep on ivory", "#6E5A2C", "#F7F5EF", "Accent text"),
    ("On-dark on charcoal", "#EDEAE1", "#111315", "Body on dark"),
    ("Gold on charcoal", "#B89B5E", "#111315", "Accent on dark"),
    ("On-dark muted on charcoal", "#A9AEA8", "#111315", "Secondary on dark"),
    ("White on forest", "#FFFFFF", "#16352B", "Primary button"),
    ("Charcoal on gold", "#111315", "#B89B5E", "Gold button"),
]


def build_styleguide():
    swatches = "".join(
        f"""<div class="swatch"><div class="swatch__chip" style="background:{hexv}"></div>
      <div class="swatch__meta"><b>{e(name)}</b>{hexv}<br><span class="muted">{e(use)}</span></div></div>"""
        for name, hexv, use in PALETTE
    )
    rows = ""
    for label, fg, bg, use in PAIRS:
        ratio = contrast(fg, bg)
        aa = ratio >= 4.5
        aa_large = ratio >= 3.0
        verdict = "AA" if aa else ("AA large only" if aa_large else "fail")
        cls = "pass" if aa else "fail"
        rows += f"""<tr>
      <td data-label="Pair"><span style="display:inline-block;width:1.5rem;height:1.5rem;background:{bg};border:1px solid var(--rule);vertical-align:middle"></span> {e(label)}</td>
      <td data-label="Ratio" class="num">{ratio:.2f}:1</td>
      <td data-label="Verdict" class="{cls}">{verdict}</td>
      <td data-label="Use">{e(use)}</td>
    </tr>"""

    specimens = "".join(
        f"""<div class="specimen">
      <div class="specimen__meta">{e(name)} · {e(spec)}</div>
      <div style="{style}">{e(text)}</div>
    </div>"""
        for name, spec, style, text in [
            ("Display", "Cormorant Garamond 500 / clamp 2.75–5.75rem", "font-family:var(--font-display);font-size:var(--t-display);line-height:var(--lh-tight);letter-spacing:var(--ls-display)", "Strategic counsel."),
            ("H2", "Cormorant Garamond 500", "font-family:var(--font-display);font-size:var(--t-h2)", "Built for complex matters"),
            ("Lead", "Inter 400 / 1.5", "font-family:var(--font-body);font-size:var(--t-lead);line-height:var(--lh-lead)", "A PKPU runs on a statutory clock."),
            ("Body", "Inter 400 / 1.68", "font-family:var(--font-body);font-size:var(--t-body);line-height:var(--lh-body)", "The firm acts as receiver, as administrator, and as counsel to debtors and creditors."),
            ("Docket", "IBM Plex Mono 400 / 0.14em", "font-family:var(--font-docket);font-size:var(--t-docket);letter-spacing:var(--ls-docket);text-transform:uppercase;color:var(--accent-text)", "Commercial Court Jakarta"),
        ]
    )

    body = f"""<main id="main">
{crumbs([("Home", "index.html"), ("Design system", None)])}
<section class="section">
  <div class="wrap pagehead">
    <p class="docket">Phase 2</p>
    <h1>Design system.</h1>
    <p class="lead">Tokens, type scale, contrast results and component states. Everything the frontend is allowed to use.</p>
  </div>
</section>

<section class="section">
  <div class="wrap">
    <div class="section-head"><p class="docket">Colour</p><h2>Eight values, one accent used sparingly.</h2></div>
    <div class="grid grid--4">{swatches}</div>
  </div>
</section>

<section class="section">
  <div class="wrap">
    <div class="section-head"><p class="docket">Contrast</p><h2>Measured, not assumed.</h2>
    <p>Computed at build time. Gold on ivory fails for text, which is why gold is restricted to rules, marks and fills, and why a darker gold exists for accent text.</p></div>
    <table class="table"><thead><tr><th>Pair</th><th>Ratio</th><th>WCAG</th><th>Use</th></tr></thead><tbody>{rows}</tbody></table>
  </div>
</section>

<section class="section">
  <div class="wrap">
    <div class="section-head"><p class="docket">Typography</p><h2>Display, body, docket.</h2>
    <p>Cormorant Garamond carries the voice, Inter carries the reading, IBM Plex Mono carries the record — case numbers, courts, years, filters.</p></div>
    {specimens}
  </div>
</section>

<section class="section">
  <div class="wrap">
    <div class="section-head"><p class="docket">Components</p><h2>States.</h2></div>
    <div class="grid grid--2">
      <div>
        <p class="eyebrow">Buttons</p>
        <p style="display:flex;gap:var(--s-3);flex-wrap:wrap;margin-top:var(--s-4)">
          <a class="btn btn--gold" href="#">Primary action</a>
          <a class="btn btn--primary" href="#">Secondary</a>
          <a class="btn btn--ghost" href="#">Ghost</a>
        </p>
        <p class="eyebrow" style="margin-top:var(--s-6)">Chips</p>
        <div class="filters" style="margin-top:var(--s-4)">
          <button class="chip" type="button" aria-pressed="true">Selected</button>
          <button class="chip" type="button">Default</button>
        </div>
      </div>
      <div>
        <p class="eyebrow">Field states</p>
        <div class="form" style="margin-top:var(--s-4)">
          <div class="field"><label for="sg1">Default</label><input id="sg1" type="text" placeholder="Placeholder"></div>
          <div class="field field--error"><label for="sg2">Error</label><input id="sg2" type="text" aria-invalid="true"><span class="field__error">Enter an email address we can reply to.</span></div>
        </div>
      </div>
    </div>
    <div style="margin-top:var(--s-7)">{empty_state("Empty state", "Used wherever ASP content is outstanding. It says what is missing and who owns it, rather than filling the gap with invented copy.", tag="Pattern")}</div>
  </div>
</section>
{cta_band()}
</main>
"""
    return page("styleguide.html", "Design system", "ASP design tokens, contrast results and component states.", body,
                note="Phase 2 deliverable")


def build_404():
    body = f"""<main id="main">
<section class="section">
  <div class="wrap" style="max-width:44rem">
    <p class="docket">404</p>
    <h1>That page is not here.</h1>
    <p class="lead">The address may have changed in the rebuild. Start from the practices, the people, or search.</p>
    <p style="display:flex;gap:var(--s-3);flex-wrap:wrap;margin-top:var(--s-6)">
      <a class="btn btn--primary" href="practices.html">Practices</a>
      <a class="btn btn--ghost" href="people.html">People</a>
      <a class="btn btn--ghost" href="index.html">Home</a>
    </p>
  </div>
</section>
</main>
"""
    return page("404.html", "Page not found", "Page not found.", body)


def main():
    built = []
    built.append(build_home())
    built.append(build_styleguide())
    built.append(build_about())
    built.append(build_people())
    built += build_lawyers()
    built += build_practices()
    built += build_recognition()
    built.append(build_insights())
    built.append(build_cases())
    built.append(build_intake())
    built.append(build_contact())
    built.append(build_careers())
    built.append(build_404())
    print(f"Built {len(built)} pages into {OUT}")
    for f in sorted(built):
        print("  ", f)


if __name__ == "__main__":
    main()
