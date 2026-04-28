import type { ListingCategory } from "@/types/database";

export interface CategoryDef {
  key: ListingCategory;
  label: string;
  group: "boat" | "auto";
  blurb: string;
}

export const CATEGORIES: CategoryDef[] = [
  { key: "boat",             label: "Boats",             group: "boat", blurb: "Cruisers, bowriders, fishing" },
  { key: "center_console",   label: "Center Consoles",   group: "boat", blurb: "Saltwater fishing, family" },
  { key: "performance_boat", label: "Performance Boats", group: "boat", blurb: "Cigarette · Nor-Tech · MTI" },
  { key: "yacht",            label: "Yachts",            group: "boat", blurb: "Sport yachts and motoryachts" },
  { key: "car",              label: "Cars",              group: "auto", blurb: "Sedans, coupes, hatchbacks" },
  { key: "truck",            label: "Trucks",            group: "auto", blurb: "Pickups, diesel, work trucks" },
  { key: "exotic",           label: "Exotics",           group: "auto", blurb: "Lambo, Ferrari, McLaren" },
  { key: "classic",          label: "Classics",          group: "auto", blurb: "Vintage and restomod" },
  { key: "powersports",      label: "Powersports",       group: "auto", blurb: "ATVs, side-by-sides, dirt bikes" },
];

export const FEATURED_BOAT_BRANDS = [
  "Boston Whaler","Grady-White","Sea Ray","Pursuit","Regulator","Contender",
  "Yellowfin","Scout","Cobia","Robalo","Cigarette","Nor-Tech","MTI","SeaVee",
];
export const FEATURED_AUTO_BRANDS = [
  "Ford","Chevrolet","Toyota","RAM","GMC","Tesla","BMW","Mercedes-Benz",
  "Porsche","Lamborghini","Ferrari","McLaren","Cadillac","Jeep","Land Rover",
];
