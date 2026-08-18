import Link from "next/link";
import { initials } from "../lib/data";
import type { Lawyer } from "../lib/types";

export function PersonCard({ lawyer }: { lawyer: Lawyer }) {
  return (
    <Link className="person" href={`/people/${lawyer.slug}`}>
      <span className="person__frame">
        <span className="person__initials">{initials(lawyer.name)}</span>
      </span>
      <span className="person__name">
        {lawyer.name}, {lawyer.honorifics}
      </span>
      <span className="person__role">{lawyer.position}</span>
    </Link>
  );
}
