import { Anchor, Ship, Sailboat, Car, Truck, Bike, Caravan, Sparkles } from "lucide-react";
import type { ListingCategory } from "@/types/database";
import { cn } from "@/lib/utils";

interface Props {
  category: ListingCategory;
  className?: string;
  label?: string;
}

const ICONS: Record<ListingCategory, React.ElementType> = {
  boat: Anchor,
  center_console: Anchor,
  performance_boat: Sailboat,
  yacht: Ship,
  car: Car,
  truck: Truck,
  exotic: Sparkles,
  classic: Car,
  powersports: Bike,
  rv: Caravan,
};

export function ListingPlaceholder({ category, className, label }: Props) {
  const Icon = ICONS[category] ?? Car;
  return (
    <div
      className={cn(
        "relative h-full w-full overflow-hidden",
        "bg-[radial-gradient(ellipse_at_center,_#1a3454_0%,_#0a1628_70%,_#050b18_100%)]",
        className,
      )}
      aria-label={label ?? "no photo placeholder"}
    >
      <div
        aria-hidden
        className="absolute inset-0 opacity-40 mix-blend-screen"
        style={{
          backgroundImage:
            "radial-gradient(circle at 30% 30%, rgba(230,196,120,0.18), transparent 60%), radial-gradient(circle at 70% 75%, rgba(201,168,76,0.12), transparent 55%)",
        }}
      />
      <div className="relative h-full w-full grid place-items-center">
        <div className="flex flex-col items-center gap-2 text-brass-400">
          <Icon className="h-12 w-12" strokeWidth={1.4} />
          {label && (
            <div className="font-mono text-[10px] uppercase tracking-[0.32em] text-brass-400/80">
              {label}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
