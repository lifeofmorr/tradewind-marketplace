import { describe, it, expect } from "vitest";
import { computeTrustScore, profileTrustScore } from "@/lib/trustScore";
import { parseCsv } from "@/lib/csvImport";

describe("trustScore — computeTrustScore", () => {
  it("returns Restricted (score=0) if banned", () => {
    const r = computeTrustScore({ banned: true, verification_level: "tradewind_verified" });
    expect(r.score).toBe(0);
    expect(r.band).toBe("new");
    expect(r.label).toBe("Restricted");
  });

  it("rewards verified level", () => {
    const unverified = computeTrustScore({ verification_level: "unverified" });
    const verified = computeTrustScore({ verification_level: "tradewind_verified" });
    expect(verified.score).toBeGreaterThan(unverified.score);
  });

  it("clamps within 0..100", () => {
    const r = computeTrustScore({
      verification_level: "tradewind_verified",
      buyer_readiness_score: 9_999,
      rating: 5,
      reviewCount: 10_000_000,
      responseScore: 100,
    });
    expect(r.score).toBeLessThanOrEqual(100);
    expect(r.score).toBeGreaterThanOrEqual(0);
  });

  it("returns Building Trust for an empty profile", () => {
    const r = computeTrustScore({});
    expect(r.band).toBe("new");
    expect(r.label).toBe("Building Trust");
  });

  it("escalates band labels by threshold", () => {
    expect(computeTrustScore({ buyer_readiness_score: 0 }).band).toBe("new");
    expect(profileTrustScore({ verification_level: "tradewind_verified", buyer_readiness_score: 50 }).band)
      .not.toBe("new");
  });
});

describe("csvImport — parseCsv", () => {
  it("parses a basic header row plus a data row", () => {
    const { headers, rows } = parseCsv("title,price\nBoat,1000");
    expect(headers).toEqual(["title", "price"]);
    expect(rows).toEqual([["Boat", "1000"]]);
  });

  it("handles quoted fields with embedded commas", () => {
    const { rows } = parseCsv('title,desc\n"Boat","fast, fun, fierce"');
    expect(rows[0]).toEqual(["Boat", "fast, fun, fierce"]);
  });

  it("handles escaped double quotes inside quoted fields", () => {
    const { rows } = parseCsv('a\n"He said ""hi"""');
    expect(rows[0]).toEqual(['He said "hi"']);
  });

  it("handles CRLF line endings", () => {
    const { headers, rows } = parseCsv("a,b\r\n1,2\r\n3,4");
    expect(headers).toEqual(["a", "b"]);
    expect(rows).toEqual([["1", "2"], ["3", "4"]]);
  });

  it("returns empty results for an empty input", () => {
    const { headers, rows } = parseCsv("");
    expect(headers).toEqual([]);
    expect(rows).toEqual([]);
  });
});

// Pure-logic mirror of the webhook idempotency check.
// The real check lives in supabase/functions/stripe-webhook/index.ts and runs
// against the webhook_events table. This test exercises only the dedup
// semantics (set-based) — full integration is out of vitest scope.
describe("webhook idempotency (logic mirror)", () => {
  function shouldProcess(seen: Set<string>, eventId: string): boolean {
    if (seen.has(eventId)) return false;
    seen.add(eventId);
    return true;
  }

  it("processes a new event id", () => {
    const seen = new Set<string>();
    expect(shouldProcess(seen, "evt_1")).toBe(true);
  });

  it("rejects a duplicate event id", () => {
    const seen = new Set<string>(["evt_1"]);
    expect(shouldProcess(seen, "evt_1")).toBe(false);
  });

  it("processes a different event id even on the same session id", () => {
    const seen = new Set<string>(["evt_1"]);
    expect(shouldProcess(seen, "evt_2")).toBe(true);
  });
});
