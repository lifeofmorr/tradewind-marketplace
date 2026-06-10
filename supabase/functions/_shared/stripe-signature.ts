// Stripe webhook signature verification (HMAC-SHA256) with replay protection.
//
// Pure module: uses only WebCrypto (available in both Deno and Node ≥18), so
// it is unit-testable from vitest and shared by edge functions. Implements
// the documented Stripe signed-payload scheme:
//
//   signed_payload = `${timestamp}.${raw_body}`
//   Stripe-Signature: t=<unix seconds>,v1=<hex hmac>[,v1=<hex hmac>…]
//
// Stripe may include multiple v1 signatures during secret rolls — a match on
// ANY of them is valid. Events whose timestamp falls outside the tolerance
// window (default 5 minutes, Stripe's own recommendation) are rejected even
// when the signature is valid, which bounds the replay window for a captured
// payload to that tolerance.

export const DEFAULT_TOLERANCE_SECONDS = 300;

export interface VerifyOptions {
  /** Max allowed clock skew between the signed timestamp and now, seconds. */
  toleranceSeconds?: number;
  /** Injectable clock (unix seconds) for tests. Defaults to Date.now()/1000. */
  nowSeconds?: number;
}

export type VerifyFailure =
  | "malformed_header"
  | "invalid_timestamp"
  | "signature_mismatch"
  | "timestamp_outside_tolerance";

export interface VerifyResult {
  ok: boolean;
  reason?: VerifyFailure;
}

export interface ParsedSignatureHeader {
  timestamp: string;
  signatures: string[];
}

export function parseSignatureHeader(header: string): ParsedSignatureHeader | null {
  let timestamp = "";
  const signatures: string[] = [];
  for (const part of header.split(",")) {
    const eq = part.indexOf("=");
    if (eq < 0) continue;
    const k = part.slice(0, eq).trim();
    const v = part.slice(eq + 1).trim();
    if (k === "t" && !timestamp) timestamp = v;
    else if (k === "v1" && v) signatures.push(v);
  }
  if (!timestamp || signatures.length === 0) return null;
  return { timestamp, signatures };
}

async function hmacSha256Hex(secret: string, message: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const mac = await crypto.subtle.sign("HMAC", key, enc.encode(message));
  return Array.from(new Uint8Array(mac)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

export function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let r = 0;
  for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return r === 0;
}

export async function verifyStripeSignature(
  payload: string,
  header: string,
  secret: string,
  opts: VerifyOptions = {},
): Promise<VerifyResult> {
  const parsed = parseSignatureHeader(header);
  if (!parsed) return { ok: false, reason: "malformed_header" };

  const ts = Number(parsed.timestamp);
  if (!Number.isFinite(ts) || ts <= 0) return { ok: false, reason: "invalid_timestamp" };

  const expected = await hmacSha256Hex(secret, `${parsed.timestamp}.${payload}`);
  let matched = false;
  for (const sig of parsed.signatures) {
    if (timingSafeEqual(expected, sig)) matched = true;
  }
  if (!matched) return { ok: false, reason: "signature_mismatch" };

  // Replay protection: a valid signature on a stale (or far-future) timestamp
  // is rejected. Absolute difference, matching stripe-node's behavior.
  const tolerance = opts.toleranceSeconds ?? DEFAULT_TOLERANCE_SECONDS;
  const now = opts.nowSeconds ?? Math.floor(Date.now() / 1000);
  if (Math.abs(now - ts) > tolerance) {
    return { ok: false, reason: "timestamp_outside_tolerance" };
  }

  return { ok: true };
}

/** Build a valid Stripe-Signature header — exported for tests and tooling. */
export async function signPayloadForTest(
  payload: string,
  secret: string,
  timestampSeconds: number,
): Promise<string> {
  const sig = await hmacSha256Hex(secret, `${timestampSeconds}.${payload}`);
  return `t=${timestampSeconds},v1=${sig}`;
}
