import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import crypto from "node:crypto";
import { pool } from "@/lib/db";

// Real backend for /consultation's IntakeForm — Phase 6 item #2. Uses
// Vercel Blob (private access) for file storage instead of the S3+ClamAV
// pipeline the original brief sketched (docs/06-security.md §2): no
// infrastructure to stand up, and `leads.file_scan_status` already models
// "never scanned" honestly via 'pending' rather than pretending a scan ran.
// `leads` itself is not new — db/schema.sql already had the exact shape
// this needs; this route is the first thing that writes to it.
export const runtime = "nodejs"; // needs `pg` + Node's `crypto`, not the Edge runtime

const REQUIRED = ["name", "email", "matter", "description"] as const;
const MAX_FILE_BYTES = 10 * 1024 * 1024;
const ALLOWED_EXT = new Set([".pdf", ".doc", ".docx"]);
const ALLOWED_MIME = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function badRequest(error: string, fields?: string[]) {
  return NextResponse.json({ ok: false, error, fields }, { status: 400 });
}

export async function POST(req: Request) {
  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return badRequest("Could not read the submitted form.");
  }

  const get = (key: string) => (form.get(key) as string | null)?.toString().trim() || "";
  const fields = {
    full_name: get("name"),
    company: get("company") || null,
    position: get("position") || null,
    email: get("email"),
    phone: get("phone") || null,
    matter_type: get("matter"),
    party_role: get("role") || null,
    urgency: get("urgency") || null,
    description: get("description"),
  };

  // Client-side `required` is UX only — re-validate here, never trust it.
  const missing = REQUIRED.filter((name) => {
    const value = { name: fields.full_name, email: fields.email, matter: fields.matter_type, description: fields.description }[name];
    return !value;
  });
  if (fields.email && !EMAIL_RE.test(fields.email)) missing.push("email");
  if (missing.length) return badRequest("Please check the highlighted fields.", missing);

  let file_key: string | null = null;
  let file_scan_status: string | null = null;

  const file = form.get("file");
  if (file instanceof File && file.size > 0) {
    if (file.size > MAX_FILE_BYTES) return badRequest("File exceeds the 10 MB limit.");

    const ext = "." + (file.name.split(".").pop() || "").toLowerCase();
    if (!ALLOWED_EXT.has(ext) || (file.type && !ALLOWED_MIME.has(file.type))) {
      return badRequest("Only PDF or Word documents are accepted.");
    }
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      return NextResponse.json({ ok: false, error: "File upload is not configured." }, { status: 500 });
    }

    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(-120);
    const blob = await put(`consultation-uploads/${crypto.randomUUID()}-${safeName}`, file, {
      access: "private",
      addRandomSuffix: false,
    });
    file_key = blob.pathname; // schema note: object storage key, never a public URL
    // No malware-scanning pipeline exists (ClamAV/S3 was explicitly out of
    // scope). 'pending' means exactly what it says: stored, never scanned —
    // do not read this as "scan in progress". See PROGRESS.md.
    file_scan_status = "pending";
  }

  const ipHeader = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "";
  const ip = ipHeader.split(",")[0]?.trim() || null;
  const ip_hash = ip ? crypto.createHash("sha256").update(ip).digest("hex") : null;
  const source_page = get("source_page") || "/consultation";

  try {
    await pool.query(
      `INSERT INTO leads
         (full_name, company, position, email, phone, matter_type, party_role, urgency,
          description, file_key, file_scan_status, source_page, ip_hash)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)`,
      [
        fields.full_name,
        fields.company,
        fields.position,
        fields.email,
        fields.phone,
        fields.matter_type,
        fields.party_role,
        fields.urgency,
        fields.description,
        file_key,
        file_scan_status,
        source_page,
        ip_hash,
      ],
    );
  } catch (err) {
    console.error("consultation lead insert failed", err);
    return NextResponse.json(
      { ok: false, error: "Could not save your enquiry. Please try again or email us directly." },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}
