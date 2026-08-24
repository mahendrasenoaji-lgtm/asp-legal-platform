import { getFirm, getPractices } from "../lib/data";
import { FooterView } from "./FooterView";

// Server component: fetches real firm/practice data, then hands it to the
// client FooterView, which is the piece that needs useLang() for the EN/ID
// toggle. Keeping the fetch on the server side avoids a client-side
// waterfall and keeps lib/db.ts (pg) out of the client bundle.
export async function Footer() {
  const [practices, firm] = await Promise.all([getPractices(), getFirm()]);
  return <FooterView practices={practices} firm={firm} />;
}
