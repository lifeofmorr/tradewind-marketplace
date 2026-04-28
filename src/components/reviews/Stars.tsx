import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface DisplayProps {
  rating: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const SIZES = { sm: "h-3 w-3", md: "h-4 w-4", lg: "h-5 w-5" } as const;

export function Stars({ rating, size = "md", className }: DisplayProps) {
  return (
    <div className={cn("flex items-center gap-0.5", className)} aria-label={`${rating} of 5`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={cn(
            SIZES[size],
            n <= Math.round(rating)
              ? "fill-brass-500 text-brass-500"
              : "text-muted-foreground/40",
          )}
        />
      ))}
    </div>
  );
}

interface PickerProps {
  value: number;
  onChange: (n: number) => void;
}

export function StarPicker({ value, onChange }: PickerProps) {
  return (
    <div className="flex items-center gap-1" role="radiogroup" aria-label="rating">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          role="radio"
          aria-checked={value === n}
          aria-label={`${n} of 5`}
          onClick={() => onChange(n)}
          className="p-1"
        >
          <Star className={cn("h-6 w-6 transition-colors",
            n <= value ? "fill-brass-500 text-brass-500" : "text-muted-foreground/40 hover:text-brass-400")} />
        </button>
      ))}
    </div>
  );
}
