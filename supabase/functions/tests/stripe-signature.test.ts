// @vitest-environment node
import { describe, it, expect } from "vitest";
import {
  verifyStripeSignature,
  parseSignatureHeader,
  timingSafeEqual,
  signPayloadForTest,
  DEFAULT_TOLERANCE_SECONDS,
} from "../_shared/stripe-signature.ts";

const SECRET = "whsec_test_secret_for_unit_tests";
const PAYLOAD = JSON.stringify({ id: "evt_1", type: "checkout.session.completed", data: { object: {} } });
const NOW = 1_750_000_000; // fixed clock — tests never depend on wall time

describe("parseSignatureHeader", () => {
  it("parses timestamp and a single v1 signature", () => {
    const parsed = parseSignatureHeader("t=12345,v1=abc123");
    expect(parsed).toEqual({ timestamp: "12345", signatures: ["abc123"] });
  });

  it("collects multiple v1 signatures (secret roll)", () => {
    const parsed = parseSignatureHeader("t=12345,v1=first,v1=second");
    expect(parsed?.signatures).toEqual(["first", "second"]);
  });

  it("ignores unknown schemes like v0", () => {
    const parsed = parseSignatureHeader("t=12345,v0=legacy,v1=real");
    expect(parsed?.signatures).toEqual(["real"]);
  });

  it("rejects headers missing t or v1", () => {
    expect(parseSignatureHeader("v1=abc")).toBeNull();
    expect(parseSignatureHeader("t=123")).toBeNull();
    expect(parseSignatureHeader("")).toBeNull();
    expect(parseSignatureHeader("garbage")).toBeNull();
  });
});

describe("timingSafeEqual", () => {
  it("matches equal strings and rejects unequal ones", () => {
    expect(timingSafeEqual("abc", "abc")).toBe(true);
    expect(timingSafeEqual("abc", "abd")).toBe(false);
    expect(timingSafeEqual("abc", "abcd")).toBe(false);
  });
});

describe("verifyStripeSignature", () => {
  it("accepts a correctly signed, fresh payload", async () => {
    const header = await signPayloadForTest(PAYLOAD, SECRET, NOW);
    const r = await verifyStripeSignature(PAYLOAD, header, SECRET, { nowSeconds: NOW });
    expect(r).toEqual({ ok: true });
  });

  it("rejects a signature made with the wrong secret", async () => {
    const header = await signPayloadForTest(PAYLOAD, "whsec_wrong", NOW);
    const r = await verifyStripeSignature(PAYLOAD, header, SECRET, { nowSeconds: NOW });
    expect(r).toEqual({ ok: false, reason: "signature_mismatch" });
  });

  it("rejects a tampered payload", async () => {
    const header = await signPayloadForTest(PAYLOAD, SECRET, NOW);
    const tampered = PAYLOAD.replace("evt_1", "evt_2");
    const r = await verifyStripeSignature(tampered, header, SECRET, { nowSeconds: NOW });
    expect(r).toEqual({ ok: false, reason: "signature_mismatch" });
  });

  it("rejects a malformed header", async () => {
    const r = await verifyStripeSignature(PAYLOAD, "not-a-stripe-header", SECRET, { nowSeconds: NOW });
    expect(r).toEqual({ ok: false, reason: "malformed_header" });
  });

  it("rejects a non-numeric timestamp", async () => {
    const r = await verifyStripeSignature(PAYLOAD, "t=yesterday,v1=deadbeef", SECRET, { nowSeconds: NOW });
    expect(r).toEqual({ ok: false, reason: "invalid_timestamp" });
  });

  // The replay-protection contract: a captured request with a VALID signature
  // must stop working once it is older than the tolerance window.
  it("rejects a validly signed payload older than the 5-minute tolerance (replay)", async () => {
    const signedAt = NOW - (DEFAULT_TOLERANCE_SECONDS + 1);
    const header = await signPayloadForTest(PAYLOAD, SECRET, signedAt);
    const r = await verifyStripeSignature(PAYLOAD, header, SECRET, { nowSeconds: NOW });
    expect(r).toEqual({ ok: false, reason: "timestamp_outside_tolerance" });
  });

  it("rejects a validly signed payload from the far future", async () => {
    const header = await signPayloadForTest(PAYLOAD, SECRET, NOW + DEFAULT_TOLERANCE_SECONDS + 60);
    const r = await verifyStripeSignature(PAYLOAD, header, SECRET, { nowSeconds: NOW });
    expect(r).toEqual({ ok: false, reason: "timestamp_outside_tolerance" });
  });

  it("accepts a payload exactly at the tolerance boundary", async () => {
    const header = await signPayloadForTest(PAYLOAD, SECRET, NOW - DEFAULT_TOLERANCE_SECONDS);
    const r = await verifyStripeSignature(PAYLOAD, header, SECRET, { nowSeconds: NOW });
    expect(r).toEqual({ ok: true });
  });

  it("honors a custom tolerance", async () => {
    const header = await signPayloadForTest(PAYLOAD, SECRET, NOW - 30);
    const tight = await verifyStripeSignature(PAYLOAD, header, SECRET, { nowSeconds: NOW, toleranceSeconds: 10 });
    expect(tight.ok).toBe(false);
    const loose = await verifyStripeSignature(PAYLOAD, header, SECRET, { nowSeconds: NOW, toleranceSeconds: 60 });
    expect(loose.ok).toBe(true);
  });

  it("accepts when any one of multiple v1 signatures matches", async () => {
    const good = await signPayloadForTest(PAYLOAD, SECRET, NOW);
    const sig = good.split("v1=")[1];
    const header = `t=${NOW},v1=${"0".repeat(sig.length)},v1=${sig}`;
    const r = await verifyStripeSignature(PAYLOAD, header, SECRET, { nowSeconds: NOW });
    expect(r).toEqual({ ok: true });
  });
});
