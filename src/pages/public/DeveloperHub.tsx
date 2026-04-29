import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Code2, Webhook, Boxes, Terminal, Check } from "lucide-react";
import { setMeta } from "@/lib/seo";
import { BRAND } from "@/lib/brand";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";

const SAMPLE = `curl https://api.gotradewind.com/v1/listings \\
  -H "Authorization: Bearer $TRADEWIND_API_KEY" \\
  -H "Content-Type: application/json"`;

export default function DeveloperHub() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [requested, setRequested] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [companyName, setCompanyName] = useState("");
  const [useCase, setUseCase] = useState("");

  useEffect(() => {
    setMeta({
      title: "Developer Platform",
      description: `Build on ${BRAND.name} — APIs, webhooks, and SDKs for the marketplace economy.`,
    });
  }, []);

  useEffect(() => {
    if (!user) {
      setRequested(false);
      return;
    }
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("integration_requests")
        .select("integration_key")
        .eq("user_id", user.id)
        .eq("integration_key", "developer_api")
        .maybeSingle();
      if (cancelled) return;
      if (data) setRequested(true);
    })();
    return () => { cancelled = true; };
  }, [user]);

  async function requestAccess() {
    if (!user) {
      navigate(`/login?redirect=${encodeURIComponent("/integrations/developer")}`);
      return;
    }
    setPending(true);
    setError(null);
    const { error } = await supabase.from("integration_requests").insert({
      user_id: user.id,
      integration_key: "developer_api",
      integration_name: "TradeWind Developer API",
      category: "Developer",
      notes: [companyName && `Company: ${companyName}`, useCase && `Use case: ${useCase}`]
        .filter(Boolean)
        .join("\n") || null,
    });
    setPending(false);
    if (error) {
      setError(error.message);
      return;
    }
    setRequested(true);
  }

  return (
    <>
      <section className="relative overflow-hidden border-b border-border hero-glow">
        <div className="container-pad py-16 lg:py-20">
          <div className="inline-flex items-center gap-2 text-brass-400 mb-3">
            <Terminal className="h-4 w-4" />
            <span className="font-mono text-xs uppercase tracking-[0.32em]">Developer Platform</span>
          </div>
          <h1 className="font-display text-4xl md:text-5xl leading-tight">
            Build on <span className="text-brass-gradient">{BRAND.name}</span>.
          </h1>
          <p className="mt-5 max-w-2xl text-muted-foreground">
            Programmatic access to listings, leads, transactions, and partner workflows.
            Same primitives that power the {BRAND.name} marketplace, available to you.
          </p>
          <div className="mt-6 flex flex-wrap gap-2 text-xs font-mono uppercase tracking-[0.2em]">
            <Pill>REST API</Pill>
            <Pill>Webhooks</Pill>
            <Pill>OAuth 2.0</Pill>
            <Pill>SDKs</Pill>
          </div>
        </div>
      </section>

      <section className="container-pad py-12">
        <div className="grid gap-6 lg:grid-cols-3">
          <FeatureCard
            icon={<Code2 className="h-5 w-5" />}
            title="REST API"
            status="coming_soon"
          >
            Listings, dealers, leads, offers, and transactions over a clean REST surface with
            cursor pagination and idempotent writes.
          </FeatureCard>
          <FeatureCard
            icon={<Webhook className="h-5 w-5" />}
            title="Webhooks"
            status="coming_soon"
          >
            Subscribe to <code>listing.created</code>, <code>inquiry.received</code>,{" "}
            <code>offer.accepted</code>, and more — signed with HMAC for verification.
          </FeatureCard>
          <FeatureCard
            icon={<Boxes className="h-5 w-5" />}
            title="SDKs"
            status="coming_soon"
          >
            First-class TypeScript and Python clients with retries, types, and hosted
            playground for quick experimentation.
          </FeatureCard>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-[1.2fr_1fr]">
          <div className="rounded-xl border border-border bg-card/60 p-5">
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-muted-foreground mb-2">
              <Terminal className="h-3.5 w-3.5" />
              Sample request
            </div>
            <pre className="text-[12px] leading-relaxed font-mono whitespace-pre-wrap text-muted-foreground/90 bg-secondary/30 rounded-md p-4">
{SAMPLE}
            </pre>
            <p className="text-xs text-muted-foreground mt-3 leading-relaxed">
              Endpoints, schemas, and authentication will be finalized during private partner
              preview. Request access below to be in the first cohort.
            </p>
          </div>

          <RequestAccessForm
            requested={requested}
            pending={pending}
            error={error}
            companyName={companyName}
            useCase={useCase}
            onCompanyName={setCompanyName}
            onUseCase={setUseCase}
            onSubmit={requestAccess}
          />
        </div>
      </section>
    </>
  );
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="chip bg-brass-500/10 text-brass-300 ring-brass-400/20 ring-1 ring-inset">
      {children}
    </span>
  );
}

function FeatureCard({
  icon, title, status, children,
}: {
  icon: React.ReactNode;
  title: string;
  status: "coming_soon" | "available";
  children: React.ReactNode;
}) {
  return (
    <div className="glass-card lift-card brass-glow p-5">
      <div className="flex items-center justify-between">
        <div className="h-10 w-10 rounded-md grid place-items-center bg-gradient-to-br from-brass-500/20 to-brass-700/5 border border-white/10 text-foreground">
          {icon}
        </div>
        <span className={cn(
          "chip ring-1 ring-inset",
          status === "coming_soon"
            ? "bg-slate-500/15 text-slate-300 ring-slate-400/20"
            : "bg-emerald-500/15 text-emerald-300 ring-emerald-400/20",
        )}>
          {status === "coming_soon" ? "Coming soon" : "Available"}
        </span>
      </div>
      <div className="font-display text-lg mt-3">{title}</div>
      <p className="text-sm text-muted-foreground mt-1">{children}</p>
    </div>
  );
}

interface FormProps {
  requested: boolean;
  pending: boolean;
  error: string | null;
  companyName: string;
  useCase: string;
  onCompanyName: (v: string) => void;
  onUseCase: (v: string) => void;
  onSubmit: () => void;
}

function RequestAccessForm(props: FormProps) {
  if (props.requested) {
    return (
      <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/[0.06] p-5">
        <div className="flex items-center gap-2 text-emerald-300 font-display">
          <Check className="h-4 w-4" /> You're on the list
        </div>
        <p className="text-sm text-muted-foreground mt-2">
          We'll reach out as soon as the developer preview opens.
        </p>
      </div>
    );
  }
  return (
    <form
      className="rounded-xl border border-brass-500/30 bg-gradient-to-br from-brass-500/[0.06] via-card to-card p-5 space-y-3"
      onSubmit={(e) => { e.preventDefault(); props.onSubmit(); }}
    >
      <div className="font-display text-lg">Request preview access</div>
      <div>
        <Label htmlFor="dh-company">Company</Label>
        <Input
          id="dh-company"
          placeholder="Acme Marine Group"
          value={props.companyName}
          onChange={(e) => props.onCompanyName(e.target.value)}
        />
      </div>
      <div>
        <Label htmlFor="dh-use">What will you build?</Label>
        <Textarea
          id="dh-use"
          rows={3}
          placeholder="CRM sync, in-house pricing model, custom buyer portal, etc."
          value={props.useCase}
          onChange={(e) => props.onUseCase(e.target.value)}
        />
      </div>
      <Button type="submit" disabled={props.pending}>
        {props.pending ? "Sending…" : "Request access"}
      </Button>
      {props.error && <div className="text-xs text-rose-400">{props.error}</div>}
    </form>
  );
}
