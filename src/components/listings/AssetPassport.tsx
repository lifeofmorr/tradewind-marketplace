import { useQuery } from "@tanstack/react-query";
import { Check, Clock, ShieldCheck, X } from "lucide-react";
import { ReportButton } from "@/components/ui/ReportButton";
import { supabase } from "@/lib/supabase";
import type { Listing, AircraftSpecs } from "@/types/database";
import { isAircraftCategory } from "@/lib/categories";
import { cn } from "@/lib/utils";

type Status = "verified" | "pending" | "missing";

interface PassportItem {
  label: string;
  status: Status;
  detail?: string;
}

interface Section {
  title: string;
  items: PassportItem[];
}

interface Props {
  listing: Listing;
}

/**
 * Demo-listing buckets used to fake realistic passport data for the
 * pre-launch marketplace preview. Hash the listing id into a bucket so the
 * same listing always shows the same passport.
 */
const DEMO_BUCKETS: Status[][] = [
  ["verified", "verified", "verified", "pending"],
  ["verified", "pending", "verified", "verified"],
  ["verified", "verified", "pending", "missing"],
  ["pending", "verified", "verified", "verified"],
  ["verified", "missing", "pending", "verified"],
];

function hashBucket(seed: string): Status[] {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return DEMO_BUCKETS[h % DEMO_BUCKETS.length];
}

function aircraftStatus(value: unknown, truthy?: string): Status {
  if (value === true) return "verified";
  if (truthy && value === truthy) return "verified";
  if (value === false || value == null || value === "") return "missing";
  return "pending";
}

function buildAircraftSections(
  listing: Listing,
  spec: AircraftSpecs | null,
): Section[] {
  const isDemo = listing.is_demo;
  const demo = isDemo ? hashBucket(listing.id) : null;

  // Identification
  const reg = spec?.registration_number ?? spec?.n_number ?? null;
  const registration: PassportItem = {
    label: "N-number on file",
    status: reg ? "verified" : isDemo ? demo![0] : "missing",
    detail: reg ? `Registration ${reg} (verify against FAA registry)` : "Seller has not provided",
  };
  const serial: PassportItem = {
    label: "Serial number on file",
    status: spec?.serial_number ? "verified" : "missing",
    detail: spec?.serial_number ?? "Seller has not provided",
  };
  const ownership: PassportItem = isDemo
    ? {
        label: "Identity & title-readiness",
        status: demo![0],
        detail: demo![0] === "verified"
          ? "Demo: seller KYC complete, title research recommended"
          : "Demo: pending KYC review",
      }
    : {
        label: "Identity & title-readiness",
        status: listing.is_verified ? "verified" : "pending",
        detail: listing.is_verified
          ? "Seller KYC complete — title research required separately"
          : "Seller verification pending",
      };
  const titleStatus: PassportItem = {
    label: "Title research (independent)",
    status: "missing",
    detail: "Tradewind does not perform title research. Use an aircraft title company.",
  };

  // Certificate / inspection
  const airworth: PassportItem = {
    label: "Airworthiness certificate",
    status: aircraftStatus(
      spec?.airworthiness_certificate_status ?? spec?.airworthiness_status,
      "standard",
    ),
    detail: spec?.airworthiness_certificate_status
      ?? spec?.airworthiness_status
      ?? "Not provided — verify with FAA",
  };
  const annual: PassportItem = {
    label: "Annual inspection",
    status: spec?.annual_inspection_date
      ? (() => {
          const d = new Date(spec.annual_inspection_date!);
          const months = (Date.now() - d.getTime()) / (1000 * 60 * 60 * 24 * 30);
          if (months < 12) return "verified";
          if (months < 14) return "pending";
          return "missing";
        })()
      : "missing",
    detail: spec?.annual_inspection_date
      ? `Last annual: ${new Date(spec.annual_inspection_date).toLocaleDateString()}`
      : "No annual date provided",
  };
  const logbooks: PassportItem = {
    label: "Logbooks complete",
    status: spec?.logbooks_complete ? "verified" : isDemo ? demo![1] : "missing",
    detail: spec?.logbooks_complete
      ? "Seller states logbooks are complete (buyer to verify)"
      : "Logbooks partial / unverified",
  };
  const adsb: PassportItem = {
    label: "ADS-B in/out",
    status: (spec?.adsb ?? spec?.ads_b) ? "verified" : "missing",
    detail: (spec?.adsb ?? spec?.ads_b)
      ? "Equipped (Out — Rule 91.225 compliance)"
      : "Not equipped",
  };
  const adsb_compliance: PassportItem = {
    label: "AD/SB compliance notes",
    status: spec?.ad_sb_compliance ? "pending" : "missing",
    detail: spec?.ad_sb_compliance
      ? "Notes on file — independent A&P/IA verification required"
      : "Verify with A&P/IA — Tradewind does not check AD/SB compliance",
  };
  const prebuy: PassportItem = {
    label: "Pre-buy inspection",
    status: spec?.pre_buy_inspection_status
      ? (spec.pre_buy_inspection_status === "passed" || spec.pre_buy_inspection_status === "completed"
          ? "verified"
          : "pending")
      : isDemo ? demo![2] : "missing",
    detail: spec?.pre_buy_inspection_status
      ? `Status: ${spec.pre_buy_inspection_status.replace(/_/g, " ")}`
      : "Schedule via Tradewind pre-buy request",
  };

  // Financing / insurance / escrow / ferry / hangar
  const financing: PassportItem = {
    label: "Financing partners ready",
    status: listing.is_finance_partner ? "verified" : "pending",
    detail: listing.is_finance_partner
      ? "Aviation lenders available via buyer hub"
      : "Request a quote from aviation lenders",
  };
  const insurance: PassportItem = {
    label: "Insurance partners ready",
    status: listing.is_insurance_partner ? "verified" : "pending",
    detail: listing.is_insurance_partner
      ? "Aviation insurance brokers available"
      : "Request a quote from an aviation insurance broker",
  };
  const escrow: PassportItem = {
    label: "Escrow partner identified",
    status: "pending",
    detail: "Escrow must be handled by an aircraft escrow/title company",
  };
  const ferry: PassportItem = {
    label: "Ferry / delivery planning",
    status: spec?.ferry_ready ? "verified" : "pending",
    detail: spec?.ferry_ready
      ? "Aircraft is ferry-ready (insurance + permits required)"
      : "Coordinate with a ferry pilot",
  };
  const hangar: PassportItem = {
    label: "Hangar / storage at destination",
    status: spec?.hangared || spec?.hangar_status === "hangared"
      ? "verified"
      : "pending",
    detail: spec?.hangar_status
      ? `Current status: ${spec.hangar_status.replace(/_/g, " ")}`
      : "Confirm destination hangar/tie-down before closing",
  };

  return [
    { title: "Identification", items: [registration, serial, ownership, titleStatus] },
    { title: "Certificate & inspections", items: [airworth, annual, logbooks, adsb, adsb_compliance, prebuy] },
    { title: "Closing readiness", items: [financing, insurance, escrow, ferry, hangar] },
  ];
}

function buildVehicleSections(listing: Listing): Section[] {
  const isDemo = listing.is_demo;
  const demo = isDemo ? hashBucket(listing.id) : null;

  const verification: PassportItem = isDemo
    ? {
        label: "Identity & ownership",
        status: demo![0],
        detail:
          demo![0] === "verified"
            ? "Demo: seller KYC complete, ownership confirmed"
            : "Demo: pending KYC review",
      }
    : {
        label: "Identity & ownership",
        status: listing.is_verified ? "verified" : "pending",
        detail: listing.is_verified
          ? "Seller KYC complete, ownership confirmed"
          : "Seller verification pending",
      };

  const documents: PassportItem = isDemo
    ? {
        label: "Title & registration",
        status: demo![1],
        detail:
          demo![1] === "verified"
            ? "Demo: clean title on file"
            : demo![1] === "pending"
              ? "Demo: waiting on registration upload"
              : "Demo: documents not yet uploaded",
      }
    : {
        label: "Title & registration",
        status:
          listing.title_status === "clean"
            ? "verified"
            : listing.title_status
              ? "pending"
              : "missing",
        detail:
          listing.title_status === "clean"
            ? "Clean title on file"
            : listing.title_status
              ? `Title status: ${listing.title_status}`
              : "Title not yet on file",
      };

  const vinHin: PassportItem = {
    label: listing.category.includes("boat") ? "HIN decoded" : "VIN decoded",
    status: isDemo
      ? demo![2]
      : listing.vin_hin_decoded
        ? "verified"
        : listing.vin_or_hin
          ? "pending"
          : "missing",
    detail: isDemo
      ? demo![2] === "verified"
        ? "Demo: matched factory record"
        : "Demo: awaiting decode"
      : listing.vin_hin_decoded
        ? "Matched factory record"
        : listing.vin_or_hin
          ? "On file, decode in progress"
          : "Not provided by seller",
  };

  const inspection: PassportItem = isDemo
    ? {
        label: "Inspection / survey",
        status: demo![3],
        detail:
          demo![3] === "verified"
            ? "Demo: pre-purchase inspection on file"
            : demo![3] === "pending"
              ? "Demo: PPI scheduled by buyer"
              : "Demo: no inspection requested",
      }
    : {
        label: "Inspection / survey",
        status: "pending",
        detail: "Schedule a Tradewind-vetted inspector via the buyer hub",
      };

  return [
    { title: "Verification", items: [verification, vinHin] },
    { title: "Documents", items: [documents] },
    { title: "Inspection readiness", items: [inspection] },
    {
      title: "Financial readiness",
      items: [
        {
          label: "Financing partners ready",
          status: listing.is_finance_partner ? "verified" : "pending",
          detail: listing.is_finance_partner
            ? "Pre-qualified offers available from Tradewind lenders"
            : "Apply via the buyer financial hub",
        },
        {
          label: "Insurance partners ready",
          status: listing.is_insurance_partner ? "verified" : "pending",
          detail: listing.is_insurance_partner
            ? "Quotes available from Tradewind insurers"
            : "Request a quote from the buyer hub",
        },
        {
          label: "Transport partners ready",
          status: listing.is_transport_partner ? "verified" : "pending",
          detail: listing.is_transport_partner
            ? "Door-to-door transport quoted"
            : "Request a quote from the buyer hub",
        },
      ],
    },
  ];
}

const STATUS_ICON: Record<Status, typeof Check> = {
  verified: Check,
  pending: Clock,
  missing: X,
};

const STATUS_STYLE: Record<Status, string> = {
  verified: "bg-emerald-500/15 text-emerald-300 ring-emerald-400/30",
  pending: "bg-amber-500/15 text-amber-300 ring-amber-400/30",
  missing: "bg-rose-500/15 text-rose-300 ring-rose-400/30",
};

const STATUS_LABEL: Record<Status, string> = {
  verified: "Verified",
  pending: "Pending",
  missing: "Missing",
};

export function AssetPassport({ listing }: Props) {
  const isAircraft = isAircraftCategory(listing.category);

  const { data: spec } = useQuery({
    queryKey: ["aircraft-specs", listing.id],
    enabled: isAircraft,
    queryFn: async (): Promise<AircraftSpecs | null> => {
      const { data, error } = await supabase
        .from("aircraft_specs")
        .select("*")
        .eq("listing_id", listing.id)
        .maybeSingle();
      if (error) throw error;
      return (data as AircraftSpecs | null) ?? null;
    },
  });

  const sections = isAircraft
    ? buildAircraftSections(listing, spec ?? null)
    : buildVehicleSections(listing);

  const total = sections.reduce((acc, s) => acc + s.items.length, 0);
  const verified = sections.reduce(
    (acc, s) => acc + s.items.filter((i) => i.status === "verified").length,
    0,
  );

  return (
    <div className="rounded-xl border border-brass-500/30 bg-gradient-to-br from-brass-500/[0.06] via-card to-card p-5 shadow-[0_0_0_1px_rgba(214,160,87,0.05)]">
      <header className="flex items-start gap-3 pb-4 border-b border-brass-500/15">
        <div className="grid h-9 w-9 place-items-center rounded-md bg-brass-500/15 text-brass-300 ring-1 ring-brass-500/30">
          <ShieldCheck className="h-4 w-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-mono text-[10px] uppercase tracking-[0.32em] text-brass-400">
            Tradewind
          </div>
          <h3 className="font-display text-lg leading-tight">
            {isAircraft ? "Aircraft Asset Passport" : "Asset Passport"}
          </h3>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {verified}/{total} checks verified
            {listing.is_demo && " · demo data"}
          </p>
        </div>
        <ReportButton
          targetType="listing"
          targetId={listing.id}
          variant="icon"
          className="self-start"
        />
      </header>

      <div className="space-y-4 pt-4">
        {sections.map((section) => (
          <section key={section.title} className="space-y-2">
            <div className="font-mono text-[10px] uppercase tracking-[0.28em] text-muted-foreground">
              {section.title}
            </div>
            <ul className="space-y-1.5">
              {section.items.map((item) => {
                const Icon = STATUS_ICON[item.status];
                return (
                  <li
                    key={item.label}
                    className="flex items-start gap-3 rounded-md px-1 py-1.5"
                  >
                    <span
                      className={cn(
                        "grid h-5 w-5 shrink-0 place-items-center rounded-full ring-1 ring-inset",
                        STATUS_STYLE[item.status],
                      )}
                      aria-label={STATUS_LABEL[item.status]}
                    >
                      <Icon className="h-3 w-3" />
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm leading-tight">{item.label}</div>
                      {item.detail && (
                        <div className="mt-0.5 text-[11px] text-muted-foreground/90 leading-snug">
                          {item.detail}
                        </div>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </div>

      <div className="mt-4 pt-3 border-t border-brass-500/10 flex items-center justify-between gap-3">
        <p className="text-[11px] text-muted-foreground/80 flex-1">
          The passport is a snapshot of trust signals on this asset. Tradewind
          concierge can complete any pending check on your behalf.
        </p>
        <ReportButton targetType="listing" targetId={listing.id} variant="inline" />
      </div>

      {isAircraft && (
        <p className="mt-3 pt-3 border-t border-amber-500/15 text-[11px] leading-relaxed text-amber-200/85">
          <span className="font-display text-amber-100">Aviation notice.</span>{" "}
          Aircraft details, registration, title, logbooks, maintenance status,
          AD/SB compliance, and airworthiness must be independently verified by
          qualified aviation professionals (A&amp;P / IA / aircraft title
          company) before purchase. Tradewind does not verify FAA status,
          airworthiness, title chain, escrow, ferry, insurance, or financing.
        </p>
      )}
    </div>
  );
}
