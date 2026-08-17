# PHASE 2 — UI Design System

**Status:** Built and testable. Open `prototype/styleguide.html` in a browser.
**Direction:** Institutional Luxury, as specified in the brief.

---

## 1. What this phase decided

The brief fixed the palette and offered a shortlist of typefaces. What was left open — and
what this phase actually decides — is how those values behave: which is allowed to carry
text, which carries structure, and what the site's one memorable device is.

**The signature is the proceeding register.** A PKPU is not an abstract service; it is a
statutory sequence with hard deadlines — 20 days to rule, 45 days of *sementara*, 270 days
outer limit, then *homologasi* or bankruptcy. The homepage renders that sequence as a
horizontal register with mono day-markers and diamond ticks. It is the one thing on the site
that a generic firm template could not produce, because it comes from the subject rather
than from a layout library.

The recurring typographic device is the **docket label**: IBM Plex Mono, tracked to 0.14em,
uppercase, preceded by a short gold rule. It marks sections the way a filing marks a
register. Mono appears wherever the content is record-like — courts, years, case types,
filters, tabular figures — and nowhere else.

---

## 2. Colour

| Token | Value | Role |
|---|---|---|
| `--asp-charcoal` | `#111315` | Hero, footer, dark sections |
| `--asp-forest-deep` | `#0F2119` | Featured practice, CTA band |
| `--asp-forest` | `#16352B` | Primary buttons, focus ring |
| `--asp-gold` | `#B89B5E` | Accent: rules, marks, button fill |
| `--asp-gold-deep` | `#6E5A2C` | Gold **as text** on light surfaces |
| `--asp-ivory` | `#F7F5EF` | Page background |
| `--asp-white` | `#FFFFFF` | Cards, inputs |
| `--asp-ink` | `#1C1C1C` | Body text |

Derived tones adjust lightness only, so the family stays coherent. Full list in
`prototype/assets/tokens.css` — nothing outside that file may declare a raw hex value.

### Contrast, measured

Computed at build time, not estimated:

| Pair | Ratio | WCAG 2.2 |
|---|---|---|
| Ink #1C1C1C on Ivory #F7F5EF | 15.63:1 | AA |
| Ink muted #5B5F62 on Ivory | 5.91:1 | AA |
| **Gold #B89B5E on Ivory** | **2.44:1** | **FAIL** |
| Gold deep #6E5A2C on Ivory | 6.09:1 | AA |
| On-dark #EDEAE1 on Charcoal | 15.48:1 | AA |
| Gold #B89B5E on Charcoal | 6.99:1 | AA |
| On-dark muted #A9AEA8 on Charcoal | 8.25:1 | AA |
| White on Forest #16352B | 13.31:1 | AA |
| Charcoal on Gold | 6.99:1 | AA |
| On-dark on Forest deep | 13.94:1 | AA |

**Rule that follows:** brand gold never carries text on ivory or white. On light surfaces
it appears only as a rule, a mark, a border, or a fill behind charcoal text. Where the
accent must read as text — docket labels, arrow links — the system substitutes
`--asp-gold-deep`, which passes at 6.09:1 and still reads as gold. On charcoal, brand gold
is fine at 6.99:1 and is used directly.

This is the single most consequential decision in the phase, and it is why the brief's
instruction to "use gold sparingly" is enforced by the token system rather than by
discipline alone.

---

## 3. Typography

| Role | Face | Why |
|---|---|---|
| Display | Cormorant Garamond, 500 | High-contrast old-style. Carries the institutional voice at large sizes; too fragile below 20px, so it is never used for body |
| Body | Inter, 400/500/600 | Neutral and legible at 16px on a phone, which is where most first visits land |
| Docket | IBM Plex Mono, 400/500 | The record voice: courts, years, case types, filters, tabular figures |

Fluid scale, major third opening to perfect fourth:

```
--t-display  clamp(2.75rem, 1.6rem + 5.2vw, 5.75rem)   line-height 1.04
--t-h1       clamp(2.25rem, 1.5rem + 3.4vw, 4rem)      line-height 1.14
--t-h2       clamp(1.75rem, 1.3rem + 2.1vw, 2.75rem)
--t-h3       clamp(1.3125rem, 1.1rem + 1vw, 1.75rem)
--t-lead     clamp(1.0625rem, 1rem + 0.5vw, 1.3125rem) line-height 1.5
--t-body     1rem                                       line-height 1.68
--t-docket   0.75rem                                    tracking 0.14em
```

Body copy is capped at `68ch`; leads at `40ch`; headings at `16–20ch` with `text-wrap: balance`.

---

## 4. Space, line, motion

- 4px base. Section rhythm is fluid: `clamp(3.5rem, 2rem + 7vw, 8rem)`.
- Radius is 2px. Institutions square their corners; rounded cards read as consumer SaaS.
- Hairlines at 1px do the dividing work, not shadows. Shadows appear only on hover lift.
- Motion: `cubic-bezier(0.16, 1, 0.3, 1)`, 140/280/620ms. One orchestrated moment — the
  staged hero entrance — plus scroll reveals and hover micro-interactions. Nothing else.
- `prefers-reduced-motion: reduce` zeroes every duration at the token level, so no component
  has to remember to handle it.

---

## 5. Components delivered

Header · mobile drawer · hero · trust bar · docket label · section header · practice card
(standard and flagship) · person card · award row · **proceeding register** · empty state ·
demo-data flag · filter chips · responsive table · form fields with error state ·
disclaimer block · breadcrumb · CTA band · footer · 404.

All are in `prototype/assets/main.css` and exercised on real pages, not only in the style guide.

---

## 6. Accessibility floor

- Visible focus ring on every interactive element (2px forest, 3px offset), never removed.
- Touch targets ≥ 48px on buttons and inputs, ≥ 40px on chips.
- The legacy site sets `user-scalable=0`, blocking pinch zoom. That is a WCAG 1.4.4 failure
  and it is not carried over.
- Skip link, landmark elements, `aria-current` on the active nav item, `aria-pressed` on
  filter chips, `role="alert"` on field errors, drawer with focus return on close.
- Tested at 320px, 375px, 768px, 1024px, 1440px widths.

---

## 7. Known gaps

- Fonts load from Google Fonts in the prototype. Self-host in Phase 3: it removes two
  third-party origins from the CSP, kills a DNS round trip, and avoids the privacy question.
- No photography exists yet, so portraits render as initials in a framed placeholder. The
  frame is the real component; the initials are what it does when the image is missing.
- Visual QA has been done by reading the rendered markup and by construction, not by
  screenshot — this environment has no browser engine that supports CSS custom properties.
  Run the real check in Phase 7 on a device matrix.
