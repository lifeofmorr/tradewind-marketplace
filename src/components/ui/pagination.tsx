import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface PaginationProps {
  /** 1-based current page. */
  page: number;
  pageCount: number;
  onPageChange: (page: number) => void;
  /** Total matching rows, shown alongside the page indicator when provided. */
  total?: number;
  /** Disables both buttons while a page is being fetched. */
  isLoading?: boolean;
}

/**
 * Accessible Prev/Next pagination. Renders nothing when there is only one
 * page. The page indicator is a polite live region so screen readers hear
 * page changes.
 */
export function Pagination({ page, pageCount, onPageChange, total, isLoading }: PaginationProps) {
  if (pageCount <= 1) return null;
  const clamped = Math.min(Math.max(1, page), pageCount);
  return (
    <nav aria-label="Pagination" className="flex flex-wrap items-center justify-center gap-4 pt-2">
      <Button
        type="button"
        variant="outline"
        size="sm"
        aria-label="Previous page"
        disabled={clamped <= 1 || isLoading}
        onClick={() => onPageChange(clamped - 1)}
      >
        <ChevronLeft className="h-4 w-4" aria-hidden="true" />
        Previous
      </Button>
      <span aria-live="polite" className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
        Page {clamped} of {pageCount}
        {typeof total === "number" && (
          <span className="normal-case tracking-normal"> · {total.toLocaleString()} listings</span>
        )}
      </span>
      <Button
        type="button"
        variant="outline"
        size="sm"
        aria-label="Next page"
        disabled={clamped >= pageCount || isLoading}
        onClick={() => onPageChange(clamped + 1)}
      >
        Next
        <ChevronRight className="h-4 w-4" aria-hidden="true" />
      </Button>
    </nav>
  );
}
