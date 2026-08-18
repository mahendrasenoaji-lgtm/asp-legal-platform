import Link from "next/link";

export function EmptyState({
  heading,
  body,
  tag = "Awaiting content from ASP",
  action,
}: {
  heading: string;
  body: string;
  tag?: string;
  action?: [string, string];
}) {
  return (
    <div className="empty">
      <span className="empty__tag">{tag}</span>
      <h3>{heading}</h3>
      <p>{body}</p>
      {action && (
        <Link className="link-arrow" href={action[1]}>
          {action[0]} <span aria-hidden="true">&rarr;</span>
        </Link>
      )}
    </div>
  );
}
