"use client";

import { useState } from "react";

// Chip UI ported from app.js's [data-filter-group] behaviour. There is
// nothing to filter yet (no articles, no cleared matters — see
// docs/content-requests.md items 6–7), so this only manages the pressed
// state today; wire it to a real collection when one exists.
export function FilterChips({ options }: { options: { slug: string; label: string }[] }) {
  const [active, setActive] = useState("all");
  return (
    <div className="filters" aria-label="Filter by category">
      <button
        className="chip"
        type="button"
        aria-pressed={active === "all"}
        onClick={() => setActive("all")}
      >
        All
      </button>
      {options.map((o) => (
        <button
          key={o.slug}
          className="chip"
          type="button"
          aria-pressed={active === o.slug}
          onClick={() => setActive(o.slug)}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
