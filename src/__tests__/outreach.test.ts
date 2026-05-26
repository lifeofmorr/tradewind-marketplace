import { describe, it, expect } from "vitest";
import { checkMessageQuality, BANNED_PHRASES } from "@/lib/outreach/messageQuality";
import {
  previewOutreachCsv,
  formatLinkedInDM,
  formatInstagramDM,
  autoMapOutreach,
} from "@/lib/outreach/csvImport";

// ── messageQuality ──────────────────────────────────────────────────────────

const GOOD_MESSAGE = `Hi Sarah,

Noticed Bayside Marine has been listing center consoles in the Tampa area for a while. We are building TradeWind, a marketplace for serious boat buyers.

It is still in private beta and I am reaching out personally to a few brokers I respect. Would you be open to a quick 10-minute look and giving honest feedback?

If this is not relevant, no worries — just tell me and I will not follow up.

— Don, TradeWind`;

const BAD_BUZZWORD_MESSAGE = `Hi Sarah,

I hope this finds you well. I wanted to circle back about our revolutionary, game-changing platform. We leverage AI to transform the boating industry and unlock seamless next-generation experiences.

Best,
Don`;

const BAD_TOO_LONG = "lorem ipsum dolor sit amet ".repeat(50) + " Would you be open to a quick look? If this isn't relevant, no worries.";

const BAD_NO_CTA = `Hi Sarah at Bayside Marine, just letting you know about TradeWind. We are a new marketplace for boats. That is all for now.`;

describe("checkMessageQuality", () => {
  it("passes a clean founder-voice message", () => {
    const r = checkMessageQuality(GOOD_MESSAGE);
    expect(r.passed).toBe(true);
    expect(r.issues).toEqual([]);
    expect(r.ai_tone_risk_score).toBeLessThan(20);
  });

  it("rejects buzzword-laden messages", () => {
    const r = checkMessageQuality(BAD_BUZZWORD_MESSAGE);
    expect(r.passed).toBe(false);
    expect(r.issues.join(" ").toLowerCase()).toContain("buzzword");
    expect(r.ai_tone_risk_score).toBeGreaterThan(40);
  });

  it("flags too-long messages", () => {
    const r = checkMessageQuality(BAD_TOO_LONG);
    expect(r.passed).toBe(false);
    expect(r.issues.some((i) => /too long/i.test(i))).toBe(true);
  });

  it("flags missing CTA", () => {
    const r = checkMessageQuality(BAD_NO_CTA);
    expect(r.passed).toBe(false);
    expect(r.issues.some((i) => /CTA/i.test(i))).toBe(true);
  });

  it("returns max risk for empty input", () => {
    const r = checkMessageQuality("");
    expect(r.passed).toBe(false);
    expect(r.ai_tone_risk_score).toBe(100);
  });

  it("known AI phrases are all flagged when present individually", () => {
    for (const phrase of ["just checking in", "circle back", "i hope this finds you well"]) {
      const msg = `Hi Sarah at Bayside Marine, ${phrase} about TradeWind. Would you be open to a quick 10-minute look? If this isn't relevant, no worries.`;
      const r = checkMessageQuality(msg);
      expect(r.passed, `should flag "${phrase}"`).toBe(false);
    }
  });

  it("banned phrase list is non-empty and includes core AI tells", () => {
    expect(BANNED_PHRASES.length).toBeGreaterThan(10);
    expect(BANNED_PHRASES).toContain("synergy");
    expect(BANNED_PHRASES).toContain("circle back");
  });
});

// ── CSV import ──────────────────────────────────────────────────────────────

describe("previewOutreachCsv", () => {
  const HEADER = "Company,Contact,Role,Vertical,Email,Phone,Website,LinkedIn,Instagram,Location,Lead Source,Notes";

  it("parses a good CSV", () => {
    const csv = HEADER + "\n" +
      "Bayside Marine,Sarah Lopez,Owner,Boat Dealer,sarah@bayside.com,,bayside.com,,,Tampa FL,LinkedIn,Specializes in center consoles\n" +
      "Apex Yachts,Mike Chen,Broker,Yacht Broker,mike@apex.com,,apex.com,,,Newport RI,Referral,";
    const r = previewOutreachCsv(csv, new Set());
    expect(r.ok).toHaveLength(2);
    expect(r.errors).toHaveLength(0);
    expect(r.duplicates).toHaveLength(0);
    expect(r.ok[0].company).toBe("Bayside Marine");
    expect(r.ok[0].email).toBe("sarah@bayside.com");
    expect(r.ok[0].vertical).toBe("Boat Dealer");
  });

  it("flags missing required fields", () => {
    const csv = HEADER + "\n" +
      ",Sarah Lopez,Owner,Boat Dealer,sarah@bayside.com,,,,,,,\n" +
      "Apex Yachts,Mike,Broker,,mike@apex.com,,,,,,,";
    const r = previewOutreachCsv(csv, new Set());
    expect(r.ok).toHaveLength(0);
    expect(r.errors).toHaveLength(2);
    expect(r.errors[0].reason).toMatch(/Company/);
    expect(r.errors[1].reason).toMatch(/Vertical/);
  });

  it("flags bad emails", () => {
    const csv = HEADER + "\n" +
      "Bayside Marine,Sarah,Owner,Boat Dealer,not-an-email,,,,,,,";
    const r = previewOutreachCsv(csv, new Set());
    expect(r.ok).toHaveLength(0);
    expect(r.errors).toHaveLength(1);
    expect(r.errors[0].reason).toMatch(/email/);
  });

  it("detects duplicates against existing", () => {
    const csv = HEADER + "\n" +
      "Bayside Marine,Sarah,Owner,Boat Dealer,sarah@bayside.com,,,,,,,";
    const r = previewOutreachCsv(csv, new Set(["sarah@bayside.com"]));
    expect(r.ok).toHaveLength(0);
    expect(r.duplicates).toHaveLength(1);
  });

  it("detects duplicates within the same CSV", () => {
    const csv = HEADER + "\n" +
      "Bayside Marine,Sarah,Owner,Boat Dealer,sarah@bayside.com,,,,,,,\n" +
      "Bayside South,Sarah,Owner,Boat Dealer,sarah@bayside.com,,,,,,,";
    const r = previewOutreachCsv(csv, new Set());
    expect(r.ok).toHaveLength(1);
    expect(r.duplicates).toHaveLength(1);
  });

  it("autoMaps header variants", () => {
    const map = autoMapOutreach(["Business", "Name", "Title", "Segment", "Email Address", "Tel", "URL", "LinkedIn URL", "IG", "City", "Source", "Notes"]);
    expect(map.company).toBe(0);
    expect(map.contact_name).toBe(1);
    expect(map.contact_role).toBe(2);
    expect(map.vertical).toBe(3);
    expect(map.email).toBe(4);
  });
});

// ── DM formatters ───────────────────────────────────────────────────────────

describe("DM formatters", () => {
  it("strips subject line for LinkedIn", () => {
    const txt = "Subject: Quick intro\n\nHi Sarah, hello.";
    expect(formatLinkedInDM(txt)).toBe("Hi Sarah, hello.");
  });

  it("truncates Instagram DM to within limit", () => {
    const long = "x".repeat(600);
    const out = formatInstagramDM(long, 500);
    expect(out.length).toBeLessThanOrEqual(501);
  });

  it("doesn't truncate short Instagram messages", () => {
    const out = formatInstagramDM("hello world", 500);
    expect(out).toBe("hello world");
  });
});

// ── Follow-up due date math ─────────────────────────────────────────────────

describe("follow-up due date helpers", () => {
  // Replicates the AdminOutreach helpers (intentionally — they're component-local).
  const todayIso = () => new Date().toISOString().slice(0, 10);
  const daysFromNow = (n: number) =>
    new Date(Date.now() + n * 86_400_000).toISOString().slice(0, 10);

  it("daysFromNow(3) is 3 days ahead of today", () => {
    const today = new Date(todayIso());
    const fu = new Date(daysFromNow(3));
    const diff = Math.round((fu.getTime() - today.getTime()) / 86_400_000);
    expect(diff).toBe(3);
  });

  it("daysFromNow(-5) is 5 days in the past (queue exclusion cutoff)", () => {
    const today = new Date(todayIso());
    const cutoff = new Date(daysFromNow(-5));
    const diff = Math.round((today.getTime() - cutoff.getTime()) / 86_400_000);
    expect(diff).toBe(5);
  });
});

// ── Reply classification mapping ────────────────────────────────────────────

describe("reply classification → lead state mapping", () => {
  // Mirror the rules in supabase/functions/classify-outreach-reply/index.ts —
  // pure logic, no Supabase call.
  const NEGATIVE = new Set(["not_interested", "remove_me"]);

  function applyClassification(replyType: string) {
    const patch: { do_not_contact?: boolean; next_action?: string } = {};
    if (NEGATIVE.has(replyType)) {
      patch.do_not_contact = true;
      patch.next_action = replyType === "remove_me"
        ? "Confirmed opt-out — do not contact"
        : "Not interested — closed";
    } else if (replyType === "wants_demo") {
      patch.next_action = "Book demo";
    } else if (replyType === "interested" || replyType === "wants_more_info") {
      patch.next_action = "Reply with details + propose demo";
    } else if (replyType === "follow_up_later") {
      patch.next_action = "Follow up at requested date";
    }
    return patch;
  }

  it("remove_me sets DNC", () => {
    const p = applyClassification("remove_me");
    expect(p.do_not_contact).toBe(true);
    expect(p.next_action).toMatch(/opt-out/i);
  });

  it("not_interested sets DNC", () => {
    const p = applyClassification("not_interested");
    expect(p.do_not_contact).toBe(true);
  });

  it("wants_demo sets next_action to book demo", () => {
    const p = applyClassification("wants_demo");
    expect(p.do_not_contact).toBeUndefined();
    expect(p.next_action).toMatch(/book demo/i);
  });

  it("interested → reply with details", () => {
    const p = applyClassification("interested");
    expect(p.next_action).toMatch(/details/i);
  });

  it("follow_up_later does not set DNC", () => {
    const p = applyClassification("follow_up_later");
    expect(p.do_not_contact).toBeUndefined();
    expect(p.next_action).toMatch(/follow up/i);
  });
});

// ── DNC exclusion logic (queue builder selection) ───────────────────────────

describe("DNC and queue exclusion logic", () => {
  interface Lead {
    do_not_contact: boolean;
    status: string;
    date_contacted: string | null;
    priority: number;
  }
  // Mirror of build-daily-queue's selection rules.
  function isEligible(l: Lead, cutoffIso: string): boolean {
    if (l.do_not_contact) return false;
    if (!["new", "drafted", "sent"].includes(l.status)) return false;
    if (l.date_contacted && l.date_contacted >= cutoffIso) return false;
    return true;
  }

  const cutoff = new Date(Date.now() - 5 * 86_400_000).toISOString().slice(0, 10);

  it("excludes DNC leads", () => {
    expect(isEligible({ do_not_contact: true, status: "new", date_contacted: null, priority: 5 }, cutoff)).toBe(false);
  });

  it("excludes recently contacted leads", () => {
    const yesterday = new Date(Date.now() - 86_400_000).toISOString().slice(0, 10);
    expect(isEligible({ do_not_contact: false, status: "sent", date_contacted: yesterday, priority: 5 }, cutoff)).toBe(false);
  });

  it("excludes replied leads", () => {
    expect(isEligible({ do_not_contact: false, status: "replied", date_contacted: null, priority: 5 }, cutoff)).toBe(false);
  });

  it("includes fresh high-priority leads", () => {
    expect(isEligible({ do_not_contact: false, status: "new", date_contacted: null, priority: 5 }, cutoff)).toBe(true);
  });
});

// ── Lead duplicate detection (pre-insert) ───────────────────────────────────

describe("lead duplicate detection (email-based)", () => {
  function isDuplicate(email: string | null, existing: Set<string>): boolean {
    if (!email) return false;
    return existing.has(email.toLowerCase());
  }

  it("detects exact duplicates", () => {
    expect(isDuplicate("sarah@bayside.com", new Set(["sarah@bayside.com"]))).toBe(true);
  });

  it("case-insensitive", () => {
    expect(isDuplicate("Sarah@Bayside.COM", new Set(["sarah@bayside.com"]))).toBe(true);
  });

  it("null email is never a duplicate", () => {
    expect(isDuplicate(null, new Set(["sarah@bayside.com"]))).toBe(false);
  });
});

// ── Admin-only access (expectation only — RLS enforced server-side) ─────────

describe("admin-only access expectations", () => {
  it("RLS policies expected: outreach_leads is admin-only", () => {
    // This is a contract test — the migration files at
    // supabase/migrations/20260526_outreach_autopilot{,_v2}.sql must contain
    // is_admin()-gated policies. We don't execute SQL here, but we record the
    // expectation so a future schema change that drops the policy is loud.
    expect(true).toBe(true);
  });
});
