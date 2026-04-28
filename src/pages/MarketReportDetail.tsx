import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { MarketReportCard } from "@/components/market/MarketReportCard";
import { Badge } from "@/components/ui/badge";
import { setMeta } from "@/lib/seo";
import { mdToHtml } from "@/lib/markdown";
import type { MarketReport } from "@/types/database";

export default function MarketReportDetail() {
  const { slug } = useParams<{ slug: string }>();

  const { data: report, isLoading } = useQuery({
    queryKey: ["market-report", slug],
    enabled: !!slug,
    queryFn: async (): Promise<MarketReport | null> => {
      const { data, error } = await supabase
        .from("market_reports").select("*")
        .eq("slug", slug ?? "")
        .eq("is_published", true)
        .maybeSingle();
      if (error) throw error;
      return (data as MarketReport | null) ?? null;
    },
  });

  const { data: related = [] } = useQuery({
    queryKey: ["market-reports-related", report?.id, report?.category],
    enabled: !!report,
    queryFn: async (): Promise<MarketReport[]> => {
      let q = supabase.from("market_reports").select("*").eq("is_published", true).neq("id", report!.id);
      if (report!.category) q = q.eq("category", report!.category);
      const { data, error } = await q.order("published_at", { ascending: false }).limit(3);
      if (error) throw error;
      return (data ?? []) as MarketReport[];
    },
  });

  useEffect(() => {
    if (!report) return;
    setMeta({
      title: report.title,
      description: report.summary ?? report.title,
      ogImage: report.cover_image_url ?? undefined,
      ogType: "article",
    });
  }, [report]);

  if (isLoading) return <div className="container-pad py-16 text-sm text-muted-foreground">Loading…</div>;
  if (!report) return <div className="container-pad py-16"><h1 className="font-display text-3xl">Report not found</h1></div>;

  return (
    <article className="container-pad py-12 max-w-3xl space-y-6">
      <Link to="/market-reports" className="text-xs text-muted-foreground hover:text-foreground">← All reports</Link>
      {report.cover_image_url && (
        <div className="aspect-[16/8] rounded-lg overflow-hidden bg-secondary">
          <img src={report.cover_image_url} alt={report.title} className="h-full w-full object-cover" />
        </div>
      )}
      <header className="space-y-2">
        <div className="flex items-center gap-2">
          <Badge variant="accent">Market report</Badge>
          {report.category && <span className="text-xs font-mono uppercase tracking-wider text-brass-400">{report.category.replace("_", " ")}</span>}
          {report.region && <span className="text-xs text-muted-foreground">· {report.region}</span>}
        </div>
        <h1 className="font-display text-4xl leading-tight">{report.title}</h1>
        {report.summary && <p className="text-muted-foreground">{report.summary}</p>}
        {report.published_at && (
          <div className="text-xs font-mono text-muted-foreground">{new Date(report.published_at).toLocaleDateString()}</div>
        )}
      </header>
      <div
        className="text-sm leading-relaxed"
        dangerouslySetInnerHTML={{ __html: mdToHtml(report.body_md) }}
      />
      {related.length > 0 && (
        <section className="border-t border-border pt-8">
          <h2 className="font-display text-2xl mb-4">More reports</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {related.map((r) => <MarketReportCard key={r.id} report={r} />)}
          </div>
        </section>
      )}
    </article>
  );
}
