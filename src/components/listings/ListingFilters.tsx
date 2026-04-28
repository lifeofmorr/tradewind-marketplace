import { useState } from "react";
import type { ListingCategory } from "@/types/database";
import { CATEGORIES } from "@/lib/categories";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

const ANY = "_any";

export interface ListingFilterValues {
  category?: ListingCategory;
  min_price?: number;
  max_price?: number;
  min_year?: number;
  max_year?: number;
  state?: string;
  search?: string;
}

interface Props {
  value: ListingFilterValues;
  onChange: (v: ListingFilterValues) => void;
}

export function ListingFilters({ value, onChange }: Props) {
  const [draft, setDraft] = useState<ListingFilterValues>(value);

  function update<K extends keyof ListingFilterValues>(k: K, v: ListingFilterValues[K]) {
    setDraft((d) => ({ ...d, [k]: v }));
  }

  return (
    <form
      onSubmit={(e) => { e.preventDefault(); onChange(draft); }}
      className="rounded-lg border border-border bg-card p-4 grid gap-3 md:grid-cols-7 md:items-end"
    >
      <div className="md:col-span-2">
        <Label htmlFor="search">Search</Label>
        <Input
          id="search"
          value={draft.search ?? ""}
          onChange={(e) => update("search", e.target.value || undefined)}
          placeholder="Boston Whaler 320"
        />
      </div>
      <div>
        <Label>Category</Label>
        <Select
          value={draft.category ?? ANY}
          onValueChange={(v) => update("category", v === ANY ? undefined : (v as ListingCategory))}
        >
          <SelectTrigger><SelectValue placeholder="Any" /></SelectTrigger>
          <SelectContent>
            <SelectItem value={ANY}>Any category</SelectItem>
            {CATEGORIES.map((c) => (
              <SelectItem key={c.key} value={c.key}>{c.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="min_price">Min $</Label>
        <Input
          id="min_price"
          type="number"
          inputMode="numeric"
          value={draft.min_price ?? ""}
          onChange={(e) => update("min_price", e.target.value ? Number(e.target.value) * 100 : undefined)}
        />
      </div>
      <div>
        <Label htmlFor="max_price">Max $</Label>
        <Input
          id="max_price"
          type="number"
          inputMode="numeric"
          value={draft.max_price ?? ""}
          onChange={(e) => update("max_price", e.target.value ? Number(e.target.value) * 100 : undefined)}
        />
      </div>
      <div>
        <Label htmlFor="state">State</Label>
        <Input
          id="state"
          value={draft.state ?? ""}
          onChange={(e) => update("state", e.target.value || undefined)}
          placeholder="FL"
          maxLength={2}
        />
      </div>
      <Button type="submit">Apply</Button>
    </form>
  );
}
