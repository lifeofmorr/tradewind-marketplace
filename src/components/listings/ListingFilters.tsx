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

  const dirty =
    draft.search !== value.search ||
    draft.category !== value.category ||
    draft.min_price !== value.min_price ||
    draft.max_price !== value.max_price ||
    draft.state !== value.state;

  function clearAll() {
    const cleared: ListingFilterValues = {};
    setDraft(cleared);
    onChange(cleared);
  }

  return (
    <form
      onSubmit={(e) => { e.preventDefault(); onChange(draft); }}
      className="rounded-lg border border-border bg-card p-4 grid gap-3 sm:grid-cols-2 md:grid-cols-7 md:items-end"
    >
      <div className="sm:col-span-2 md:col-span-2">
        <Label htmlFor="search">Search</Label>
        <Input
          id="search"
          value={draft.search ?? ""}
          onChange={(e) => update("search", e.target.value || undefined)}
          placeholder="Boston Whaler 320"
          autoComplete="off"
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
          min={0}
          inputMode="numeric"
          value={draft.min_price != null ? draft.min_price / 100 : ""}
          onChange={(e) => update("min_price", e.target.value ? Number(e.target.value) * 100 : undefined)}
        />
      </div>
      <div>
        <Label htmlFor="max_price">Max $</Label>
        <Input
          id="max_price"
          type="number"
          min={0}
          inputMode="numeric"
          value={draft.max_price != null ? draft.max_price / 100 : ""}
          onChange={(e) => update("max_price", e.target.value ? Number(e.target.value) * 100 : undefined)}
        />
      </div>
      <div>
        <Label htmlFor="state">State</Label>
        <Input
          id="state"
          value={draft.state ?? ""}
          onChange={(e) => update("state", (e.target.value || "").toUpperCase().replace(/[^A-Z]/g, "") || undefined)}
          placeholder="FL"
          maxLength={2}
          autoCapitalize="characters"
        />
      </div>
      <div className="flex gap-2 sm:col-span-2 md:col-span-1">
        <Button type="submit" className="flex-1" disabled={!dirty}>Apply</Button>
        {(value.search || value.category || value.min_price || value.max_price || value.state) && (
          <Button type="button" variant="outline" onClick={clearAll}>Clear</Button>
        )}
      </div>
    </form>
  );
}
