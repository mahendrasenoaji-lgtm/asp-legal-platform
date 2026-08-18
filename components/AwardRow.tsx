import Link from "next/link";
import type { Award } from "../lib/types";

export function AwardRow({ award }: { award: Award }) {
  return (
    <Link className="award" href={`/recognition/${award.slug}`}>
      <span className="award__year">{award.year}</span>
      <span>
        <span className="award__title">{award.title}</span>
        <span className="award__org">{award.organization}</span>
      </span>
    </Link>
  );
}
