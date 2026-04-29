import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  CheckCircle2,
  Circle,
  Clock,
  FileText,
  MessageSquare,
  Handshake,
  Wrench,
  ArrowLeft,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { setMeta } from "@/lib/seo";
import { cn } from "@/lib/utils";

type StepStatus = "pending" | "in_progress" | "complete";
interface Step {
  key: string;
  label: string;
  status: StepStatus;
  detail?: string;
}

const DEMO_STEPS: Step[] = [
  { key: "inquiry",   label: "Inquiry",     status: "complete",    detail: "Buyer reached out · Apr 18" },
  { key: "offer",     label: "Offer",       status: "complete",    detail: "$92,500 — accepted Apr 22" },
  { key: "inspection",label: "Inspection",  status: "in_progress", detail: "Surveyor scheduled Apr 30" },
  { key: "financing", label: "Financing",   status: "in_progress", detail: "Pre-approval pending — Trident Finance" },
  { key: "insurance", label: "Insurance",   status: "pending",     detail: "Quote requested" },
  { key: "transport", label: "Transport",   status: "pending",     detail: "—" },
  { key: "closing",   label: "Closing",     status: "pending",     detail: "Target: May 12" },
];

const BOAT_DOCS = [
  { key: "title",       label: "Title (clean / lien release)" },
  { key: "bill_of_sale",label: "Bill of sale" },
  { key: "hin_decode",  label: "HIN decode + history" },
  { key: "survey",      label: "Marine survey report" },
  { key: "engine_log",  label: "Engine maintenance logs" },
  { key: "registration",label: "Current state registration" },
  { key: "insurance",   label: "Proof of insurance binder" },
  { key: "trailer",     label: "Trailer title (if applicable)" },
];

const AUTO_DOCS = [
  { key: "title",       label: "Title (clean / lien release)" },
  { key: "bill_of_sale",label: "Bill of sale" },
  { key: "vin_history", label: "VIN history report" },
  { key: "ppi",         label: "Pre-purchase inspection" },
  { key: "service",     label: "Service records" },
  { key: "registration",label: "Current state registration" },
  { key: "smog",        label: "Smog / emissions cert (if required)" },
  { key: "insurance",   label: "Proof of insurance binder" },
];

export default function TransactionRoom() {
  const { id } = useParams<{ id: string }>();
  const [steps, setSteps] = useState<Step[]>(DEMO_STEPS);
  const [docCategory, setDocCategory] = useState<"boat" | "auto">("boat");
  const [checked, setChecked] = useState<Record<string, boolean>>({
    title: true,
    bill_of_sale: false,
  });

  useEffect(() => {
    setMeta({
      title: `Transaction Room ${id ? `#${id.slice(0, 8)}` : ""}`,
      description: "Premium workspace for offer, inspection, financing, insurance, and closing.",
    });
  }, [id]);

  const completion = useMemo(() => {
    const done = steps.filter((s) => s.status === "complete").length;
    return Math.round((done / steps.length) * 100);
  }, [steps]);

  function advance(key: string) {
    setSteps((prev) =>
      prev.map((s) =>
        s.key !== key
          ? s
          : {
              ...s,
              status: s.status === "complete" ? "complete" : s.status === "in_progress" ? "complete" : "in_progress",
            },
      ),
    );
  }

  const docs = docCategory === "boat" ? BOAT_DOCS : AUTO_DOCS;

  return (
    <div className="container-pad py-10 space-y-8">
      <div className="flex items-center gap-3 text-xs font-mono uppercase tracking-[0.32em] text-muted-foreground">
        <Link to="/buyer" className="inline-flex items-center gap-1 hover:text-brass-400">
          <ArrowLeft className="h-3.5 w-3.5" /> Back
        </Link>
        <span>/</span>
        <span>Transactions</span>
        <span>/</span>
        <span className="text-brass-400">{id ?? "preview"}</span>
      </div>

      <header className="rounded-xl border border-brass-500/30 bg-gradient-to-br from-brass-500/[0.06] via-card to-card p-6">
        <div className="flex flex-wrap items-start gap-4 justify-between">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.32em] text-brass-400">Transaction Room Preview</div>
            <h1 className="font-display text-3xl mt-1">2022 Boston Whaler 380 Outrage</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Newport, RI · Ref #{id?.slice(0, 8) ?? "demo-0001"} · Demo data shown for beta
            </p>
          </div>
          <div className="text-right">
            <div className="font-mono text-[10px] uppercase tracking-[0.32em] text-muted-foreground">Progress</div>
            <div className="font-display text-3xl text-brass-400">{completion}%</div>
          </div>
        </div>
        <div className="mt-4 inline-flex items-center gap-2 rounded-md border border-blue-400/30 bg-blue-400/10 px-3 py-1.5 text-xs text-blue-200">
          <Info className="h-3.5 w-3.5" />
          This page is a preview. Status, messages, and documents will be live in the next release.
        </div>
      </header>

      <Tabs defaultValue="timeline">
        <TabsList>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="messages">Messages</TabsTrigger>
          <TabsTrigger value="offers">Offers</TabsTrigger>
          <TabsTrigger value="services">Services</TabsTrigger>
        </TabsList>

        <TabsContent value="timeline" className="mt-6">
          <Timeline steps={steps} onAdvance={advance} />
        </TabsContent>

        <TabsContent value="documents" className="mt-6">
          <DocumentChecklist
            docs={docs}
            category={docCategory}
            onCategory={setDocCategory}
            checked={checked}
            onToggle={(k) => setChecked((c) => ({ ...c, [k]: !c[k] }))}
          />
        </TabsContent>

        <TabsContent value="messages" className="mt-6">
          <PreviewPanel icon={<MessageSquare className="h-4 w-4 text-brass-400" />} title="Messages">
            Direct messaging with the seller and your concierge will live here. For now, use{" "}
            <Link to="/messages" className="text-brass-400 hover:underline">/messages</Link>.
          </PreviewPanel>
        </TabsContent>

        <TabsContent value="offers" className="mt-6">
          <PreviewPanel icon={<Handshake className="h-4 w-4 text-brass-400" />} title="Offers">
            Offer history with counter-offer threading. Build a draft from any listing detail page.
          </PreviewPanel>
        </TabsContent>

        <TabsContent value="services" className="mt-6">
          <PreviewPanel icon={<Wrench className="h-4 w-4 text-brass-400" />} title="Services">
            Track inspection, transport, financing, insurance and concierge requests in one place.
          </PreviewPanel>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Timeline({ steps, onAdvance }: { steps: Step[]; onAdvance: (key: string) => void }) {
  return (
    <ol className="relative space-y-4 border-l border-border pl-6">
      {steps.map((step) => (
        <li key={step.key} className="relative">
          <span className={cn(
            "absolute -left-[31px] top-1 grid h-6 w-6 place-items-center rounded-full ring-2 ring-background",
            step.status === "complete" && "bg-brass-500 text-navy-950",
            step.status === "in_progress" && "bg-blue-500/20 text-blue-300",
            step.status === "pending" && "bg-secondary/60 text-muted-foreground",
          )}>
            {step.status === "complete" ? <CheckCircle2 className="h-4 w-4" /> :
             step.status === "in_progress" ? <Clock className="h-4 w-4" /> :
             <Circle className="h-3.5 w-3.5" />}
          </span>
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-card/60 px-4 py-3">
            <div>
              <div className="font-display text-base">{step.label}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{step.detail}</div>
            </div>
            <Button size="sm" variant="outline" onClick={() => onAdvance(step.key)}>
              {step.status === "complete" ? "Done" : step.status === "in_progress" ? "Mark complete" : "Start"}
            </Button>
          </div>
        </li>
      ))}
    </ol>
  );
}

interface DocChecklistProps {
  docs: { key: string; label: string }[];
  category: "boat" | "auto";
  onCategory: (c: "boat" | "auto") => void;
  checked: Record<string, boolean>;
  onToggle: (key: string) => void;
}

function DocumentChecklist({ docs, category, onCategory, checked, onToggle }: DocChecklistProps) {
  const done = docs.filter((d) => checked[d.key]).length;
  return (
    <div className="rounded-xl border border-border bg-card/60 p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-brass-400" />
          <span className="font-display text-lg">Document checklist</span>
          <span className="text-xs font-mono text-muted-foreground">— {done}/{docs.length}</span>
        </div>
        <div className="flex gap-1 rounded-md border border-border p-1">
          {(["boat", "auto"] as const).map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => onCategory(c)}
              className={cn(
                "px-3 py-1 text-xs font-mono uppercase tracking-wider rounded",
                category === c ? "bg-brass-500/20 text-brass-300" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {c}
            </button>
          ))}
        </div>
      </div>
      <ul className="mt-4 space-y-1">
        {docs.map((d) => (
          <li key={d.key}>
            <button
              type="button"
              onClick={() => onToggle(d.key)}
              className="flex w-full items-center gap-3 rounded-md px-2 py-2 text-sm hover:bg-secondary/50"
            >
              <span className={cn(
                "grid h-4 w-4 place-items-center rounded ring-1 ring-inset",
                checked[d.key] ? "bg-brass-500 ring-brass-500 text-navy-950" : "ring-border text-transparent",
              )}>
                <CheckCircle2 className="h-3 w-3" />
              </span>
              <span className={cn("flex-1 text-left", checked[d.key] && "line-through text-muted-foreground")}>{d.label}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function PreviewPanel({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-card/60 p-6">
      <div className="flex items-center gap-2 font-display text-lg">{icon}{title}</div>
      <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{children}</p>
    </div>
  );
}
