// Signed-cookie password gate — tanpa DB, tanpa dependency eksternal.
// Cookie berisi HMAC-SHA256 dari SESSION_SECRET, jadi tidak bisa dipalsukan.
// Web Crypto API → kompatibel dengan Edge runtime (Vercel middleware).

const COOKIE = "asp_gate_session";
const enc = new TextEncoder();

async function sign(secret: string, value: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(value));
  return btoa(String.fromCharCode(...new Uint8Array(sig)))
    .replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

// Token = "<issuedAt>.<hmac(issuedAt)>"
export async function createToken(secret: string): Promise<string> {
  const issued = Date.now().toString();
  return `${issued}.${await sign(secret, issued)}`;
}

const MAX_AGE_MS = 60 * 60 * 24 * 7 * 1000; // 7 hari

export async function verifyToken(secret: string, token?: string): Promise<boolean> {
  if (!token) return false;
  const [issued, mac] = token.split(".");
  if (!issued || !mac) return false;
  if (Date.now() - Number(issued) > MAX_AGE_MS) return false;
  return (await sign(secret, issued)) === mac;
}

export const COOKIE_NAME = COOKIE;
export const COOKIE_MAX_AGE = MAX_AGE_MS / 1000;
