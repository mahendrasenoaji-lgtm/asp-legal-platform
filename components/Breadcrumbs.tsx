import Link from "next/link";

export function Breadcrumbs({ trail }: { trail: [string, string | null][] }) {
  return (
    <div className="wrap">
      <nav className="crumbs" aria-label="Breadcrumb">
        {trail.map(([label, href], i) => (
          <span key={label}>
            {i > 0 && <span aria-hidden="true">/</span>}
            {href && i < trail.length - 1 ? (
              <Link href={href}>{label}</Link>
            ) : (
              <em style={{ fontStyle: "normal" }}>{label}</em>
            )}
          </span>
        ))}
      </nav>
    </div>
  );
}
