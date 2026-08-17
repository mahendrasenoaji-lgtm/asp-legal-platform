// Security headers for the ASP platform (Phase 6).
// Wire into next.config.js `headers()`, and mirror at the edge (Cloudflare) so
// the policy survives a misconfigured application deploy.

const isDev = process.env.NODE_ENV !== 'production';

// Nonce-based CSP. The nonce is generated per request in middleware and passed
// to next/script — no 'unsafe-inline' in production.
const csp = (nonce) => [
  `default-src 'self'`,
  `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${isDev ? " 'unsafe-eval'" : ''}`,
  `style-src 'self' 'nonce-${nonce}' https://fonts.googleapis.com`,
  `font-src 'self' https://fonts.gstatic.com`,
  // Self-hosting the fonts removes both remote origins above. Decide in Phase 3.
  `img-src 'self' data: blob: https://cdn.asplawyer.co.id`,
  `media-src 'self'`,
  `connect-src 'self' https://cdn.asplawyer.co.id`,
  `frame-src 'self' https://www.google.com`,   // maps embed, consent-gated
  `frame-ancestors 'none'`,
  `form-action 'self'`,
  `base-uri 'self'`,
  `object-src 'none'`,
  `upgrade-insecure-requests`,
].join('; ');

const headers = (nonce) => [
  { key: 'Content-Security-Policy', value: csp(nonce) },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=(), interest-cohort=()' },
  { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
  { key: 'Cross-Origin-Resource-Policy', value: 'same-site' },
  { key: 'X-DNS-Prefetch-Control', value: 'off' },
];

// Upload constraints for the legal intake form.
const upload = {
  maxBytes: 10 * 1024 * 1024,
  allowedMime: ['application/pdf',
                'application/msword',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  allowedExt: ['.pdf', '.doc', '.docx'],
  // Validate the magic bytes, not the declared MIME type or the extension.
  sniffMagicBytes: true,
  // Store outside the web root, in a private bucket, under a generated key.
  storage: { bucket: process.env.S3_BUCKET_INTAKE, publicRead: false, serverSideEncryption: 'AES256' },
  // Nothing is readable by the application until the scanner marks it clean.
  scanner: 'clamav',
  quarantineOnFail: true,
  // Signed URLs only, short lived, issued to authenticated staff.
  signedUrlTtlSeconds: 300,
};

const rateLimits = {
  '/api/intake':  { windowSeconds: 3600, max: 5,   by: 'ip+email' },
  '/api/search':  { windowSeconds: 60,   max: 30,  by: 'ip' },
  '/api/*':       { windowSeconds: 60,   max: 100, by: 'ip' },
  '/admin/login': { windowSeconds: 900,  max: 5,   by: 'ip+account', lockoutSeconds: 900 },
};

module.exports = { csp, headers, upload, rateLimits };
