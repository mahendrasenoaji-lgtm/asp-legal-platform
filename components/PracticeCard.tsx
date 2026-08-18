import Link from "next/link";
import type { Practice } from "../lib/types";

export function PracticeCard({ practice }: { practice: Practice }) {
  const flagship = practice.tier === "flagship";
  return (
    <Link
      className={`card card--practice${flagship ? " card--flagship" : ""}`}
      href={`/practices/${practice.slug}`}
    >
      <span className="card__mark">{practice.name_id}</span>
      <h3>{practice.name_en}</h3>
      <p>{practice.tier.replace("-", " ")} practice</p>
      <span className="card__foot link-arrow">
        Overview <span aria-hidden="true">&rarr;</span>
      </span>
    </Link>
  );
}
