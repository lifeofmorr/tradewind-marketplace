import type { ListingCategory } from "@/types/database";

export type CategoryGroup = "boat" | "auto" | "aircraft";

export interface CategoryDef {
  key: ListingCategory;
  label: string;
  group: CategoryGroup;
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
  { key: "rv",               label: "RVs",               group: "auto", blurb: "Class A/B/C, fifth-wheels, trailers" },
  { key: "aircraft_single_engine", label: "Single-engine piston", group: "aircraft", blurb: "Cirrus, Cessna, Piper, Diamond" },
  { key: "aircraft_twin_engine",   label: "Twin-engine piston",   group: "aircraft", blurb: "Baron, Seneca, Cessna 310" },
  { key: "aircraft_turboprop",     label: "Turboprops",            group: "aircraft", blurb: "PC-12, King Air, TBM" },
  { key: "aircraft_jet",           label: "Jets",                  group: "aircraft", blurb: "Citation, Phenom, Pilatus" },
  { key: "aircraft_helicopter",    label: "Helicopters",           group: "aircraft", blurb: "Robinson, Bell, Airbus" },
  { key: "aircraft_vintage",       label: "Vintage & warbirds",    group: "aircraft", blurb: "T-6, P-51, antiques" },
];

export const AIRCRAFT_CATEGORIES = CATEGORIES
  .filter((c) => c.group === "aircraft")
  .map((c) => c.key) as ListingCategory[];

export function isAircraftCategory(category: ListingCategory): boolean {
  return category.startsWith("aircraft_");
}

export function isBoatCategory(category: ListingCategory): boolean {
  return category === "boat" || category === "performance_boat"
    || category === "yacht" || category === "center_console";
}

export const FEATURED_BOAT_BRANDS = [
  "Boston Whaler","Grady-White","Sea Ray","Pursuit","Regulator","Contender",
  "Yellowfin","Scout","Cobia","Robalo","Cigarette","Nor-Tech","MTI","SeaVee",
];
export const FEATURED_AUTO_BRANDS = [
  "Ford","Chevrolet","Toyota","RAM","GMC","Tesla","BMW","Mercedes-Benz",
  "Porsche","Lamborghini","Ferrari","McLaren","Cadillac","Jeep","Land Rover",
];

export const FEATURED_AIRCRAFT_BRANDS = [
  "Cirrus","Cessna","Piper","Beechcraft","Diamond","Pilatus","Daher",
  "Embraer","Robinson","Bell","Airbus Helicopters","North American","Icon",
];
