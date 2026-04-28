import { Link } from "react-router-dom";
import type { MarketReport } from "@/types/database";

interface Props { report: Pick<MarketReport, "slug" | "title" | "summary" | "category" | "region" | "cover_image_url" | "published_at"> }

export function MarketReportCard({ report }: Props) {
  return (
    <Link
      to={`/market-reports/${report.slug}`}
      className="block rounded-lg border border-border bg-card overflow-hidden hover:border-brass-500/50 transition-colors"
    >
      <div className="aspect-[16/9] bg-secondary">
        {report.cover_image_url
          ? <img src={report.cover_image_url} alt={report.title} className="h-full w-full object-cover" loading="lazy" />
          : <div className="h-full w-full grid place-items-center text-xs font-mono text-muted-foreground">no cover</div>}
      </div>
      <div className="p-5 space-y-1">
        <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-brass-400">
          {report.category && <span>{report.category.replace("_", " ")}</span>}
          {report.region && <span className="text-muted-foreground">· {report.region}</span>}
        </div>
        <h3 className="font-display text-xl leading-tight">{report.title}</h3>
        {report.summary && <p className="text-sm text-muted-foreground line-clamp-2">{report.summary}</p>}
        {report.published_at && (
          <div className="text-xs text-muted-foreground pt-1">{new Date(report.published_at).toLocaleDateString()}</div>
        )}
      </div>
    </Link>
  );
}
