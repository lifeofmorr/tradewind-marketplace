import { describe, it, expect } from "vitest";
import {
  generateFallbackMessage,
  resolveVertical,
  SUPPORTED_VERTICALS,
  type Vertical,
} from "@/lib/outreach/fallbackMessageGenerator";
import { BANNED_PHRASES, checkMessageQuality } from "@/lib/outreach/messageQuality";

const OPT_OUT_LINE =
  "If this is not relevant, no worries — just tell me and I will not follow up.";

const SAMPLE_LEAD = {
  company: "Bayside Marine",
  contact_name: "Sarah Lopez",
  contact_role: "Owner",
  vertical: "boat_dealer",
  location: "Tampa, FL",
  website: "bayside.com",
  personalization_angle: null as string | null,
  pain_point: null as string | null,
  recommended_offer: null as string | null,
};

describe("fallbackMessageGenerator — supported verticals", () => {
  it("exports the 12 documented verticals", () => {
    const expected: Vertical[] = [
      "boat_dealer",
      "yacht_broker",
      "auto_dealer",
      "exotic_dealer",
      "classic_dealer",
      "aircraft_broker",
      "marine_surveyor",
      "transport",
      "lender",
      "insurance",
      "escrow_title",
      "ap_mechanic",
    ];
    expect(SUPPORTED_VERTICALS.length).toBe(12);
    for (const v of expected) {
      expect(SUPPORTED_VERTICALS).toContain(v);
    }
  });
});

describe("fallbackMessageGenerator — every vertical produces a usable message", () => {
  for (const vertical of SUPPORTED_VERTICALS) {
    it(`vertical=${vertical} returns a complete email`, () => {
      const out = generateFallbackMessage(
        { ...SAMPLE_LEAD, vertical },
        "email",
      );
      expect(out.generation_source).toBe("fallback_template");
      expect(out.subject.length).toBeGreaterThan(0);
      expect(out.body.length).toBeGreaterThan(80);
      expect(out.cta.length).toBeGreaterThan(0);
      expect(out.personalization_note.length).toBeGreaterThan(0);
      expect(out.body).toContain(OPT_OUT_LINE);
      expect(out.body).toMatch(/—\s*Don/);
    });
  }
});

describe("fallbackMessageGenerator — banned phrases are never present", () => {
  for (const vertical of SUPPORTED_VERTICALS) {
    it(`vertical=${vertical} body contains zero banned phrases`, () => {
      const out = generateFallbackMessage(
        { ...SAMPLE_LEAD, vertical },
        "email",
      );
      const lower = out.body.toLowerCase();
      for (const phrase of BANNED_PHRASES) {
        expect(
          lower.includes(phrase),
          `vertical=${vertical} body contained banned phrase: "${phrase}"`,
        ).toBe(false);
      }
    });
  }
});

describe("fallbackMessageGenerator — opt-out line is always present", () => {
  for (const vertical of SUPPORTED_VERTICALS) {
    it(`vertical=${vertical} (email) includes the opt-out line verbatim`, () => {
      const out = generateFallbackMessage(
        { ...SAMPLE_LEAD, vertical },
        "email",
      );
      expect(out.body).toContain(OPT_OUT_LINE);
    });
    it(`vertical=${vertical} (linkedin) includes the opt-out line verbatim`, () => {
      const out = generateFallbackMessage(
        { ...SAMPLE_LEAD, vertical },
        "linkedin",
      );
      expect(out.body).toContain(OPT_OUT_LINE);
    });
    it(`vertical=${vertical} (instagram) includes the opt-out line verbatim`, () => {
      const out = generateFallbackMessage(
        { ...SAMPLE_LEAD, vertical },
        "instagram",
      );
      expect(out.body).toContain(OPT_OUT_LINE);
    });
  }
});

describe("fallbackMessageGenerator — channels behave correctly", () => {
  it("email has a non-empty subject", () => {
    const out = generateFallbackMessage(SAMPLE_LEAD, "email");
    expect(out.subject.length).toBeGreaterThan(0);
  });
  it("linkedin has no subject", () => {
    const out = generateFallbackMessage(SAMPLE_LEAD, "linkedin");
    expect(out.subject).toBe("");
  });
  it("instagram has no subject and is shorter than email", () => {
    const email = generateFallbackMessage(SAMPLE_LEAD, "email");
    const ig = generateFallbackMessage(SAMPLE_LEAD, "instagram");
    expect(ig.subject).toBe("");
    expect(ig.body.length).toBeLessThan(email.body.length);
  });
});

describe("fallbackMessageGenerator — personalization interpolation", () => {
  it("uses the lead's personalization_angle verbatim when provided", () => {
    const angle =
      "Saw your Grady-White Freedom 285 listing — the cabin photos are missing.";
    const out = generateFallbackMessage(
      { ...SAMPLE_LEAD, personalization_angle: angle },
      "email",
    );
    expect(out.body).toContain(angle);
    expect(out.personalization_note.toLowerCase()).toContain("personalization angle");
  });

  it("falls back to a generic-but-specific observation when no angle is provided", () => {
    const out = generateFallbackMessage(SAMPLE_LEAD, "email");
    expect(out.body).toContain("Bayside Marine");
  });

  it("addresses the recipient by first name when present", () => {
    const out = generateFallbackMessage(SAMPLE_LEAD, "email");
    expect(out.body.startsWith("Hey Sarah —")).toBe(true);
  });

  it("falls back to 'team' when no contact name is provided", () => {
    const out = generateFallbackMessage(
      { ...SAMPLE_LEAD, contact_name: null },
      "email",
    );
    expect(out.body.startsWith("Hey team —")).toBe(true);
  });
});

describe("fallbackMessageGenerator — quality check passes", () => {
  for (const vertical of SUPPORTED_VERTICALS) {
    it(`vertical=${vertical} email passes checkMessageQuality (no buzzwords / has CTA / has opt-out)`, () => {
      const out = generateFallbackMessage(
        { ...SAMPLE_LEAD, vertical },
        "email",
      );
      const q = checkMessageQuality(out.body);
      expect(q.issues, `vertical=${vertical} issues: ${q.issues.join("; ")}`).toEqual([]);
      expect(q.passed).toBe(true);
      expect(q.ai_tone_risk_score).toBeLessThan(20);
    });
  }
});

describe("resolveVertical — alias handling", () => {
  it("resolves direct keys", () => {
    expect(resolveVertical("aircraft_broker").vertical).toBe("aircraft_broker");
  });
  it("resolves space-separated aliases", () => {
    expect(resolveVertical("marine surveyor").vertical).toBe("marine_surveyor");
    expect(resolveVertical("yacht broker").vertical).toBe("yacht_broker");
  });
  it("resolves common shorthand", () => {
    expect(resolveVertical("escrow").vertical).toBe("escrow_title");
    expect(resolveVertical("finance").vertical).toBe("lender");
    expect(resolveVertical("a&p").vertical).toBe("ap_mechanic");
  });
  it("returns matched=false for unknown verticals", () => {
    const r = resolveVertical("unicorn breeder");
    expect(r.matched).toBe(false);
    expect(r.vertical).toBe("boat_dealer");
  });
  it("personalization_note explains the fallback when vertical is unknown", () => {
    const out = generateFallbackMessage(
      { ...SAMPLE_LEAD, vertical: "unicorn breeder" },
      "email",
    );
    expect(out.personalization_note.toLowerCase()).toContain("not recognised");
  });
});

describe("fallbackMessageGenerator — banned-phrase scrubbing on lead input", () => {
  it("scrubs a banned phrase that leaks in via personalization_angle", () => {
    const out = generateFallbackMessage(
      {
        ...SAMPLE_LEAD,
        personalization_angle: "Your synergy with the local market is cutting-edge.",
      },
      "email",
    );
    const lower = out.body.toLowerCase();
    expect(lower).not.toContain("synergy");
    expect(lower).not.toContain("cutting-edge");
    expect(lower).not.toContain("cutting edge");
  });
});
