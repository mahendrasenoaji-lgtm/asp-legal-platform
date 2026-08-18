import { SITE_READY } from "../lib/data";

// Ports .protobar from the static prototype. Stays visible until SITE_READY
// flips — see docs/06-security.md §6 and docs/07-qa.md §8: nothing here may
// be called production-ready before Phases 6 and 7 close against real
// infrastructure.
export function StatusBar({ note }: { note: string }) {
  if (SITE_READY) return null;
  return (
    <div className="protobar">
      <div className="wrap">
        <span>
          <b>Phase 3 build</b> — Next.js port, not production
        </span>
        <span>{note}</span>
      </div>
    </div>
  );
}
