// US states + a hand-curated list of major boating + auto cities used for
// programmatic SEO routes (/boats-for-sale-in-:state, /:category-in-:city).

export interface State { code: string; name: string }

export const US_STATES: State[] = [
  { code: "AL", name: "Alabama" },        { code: "AK", name: "Alaska" },
  { code: "AZ", name: "Arizona" },        { code: "AR", name: "Arkansas" },
  { code: "CA", name: "California" },     { code: "CO", name: "Colorado" },
  { code: "CT", name: "Connecticut" },    { code: "DE", name: "Delaware" },
  { code: "FL", name: "Florida" },        { code: "GA", name: "Georgia" },
  { code: "HI", name: "Hawaii" },         { code: "ID", name: "Idaho" },
  { code: "IL", name: "Illinois" },       { code: "IN", name: "Indiana" },
  { code: "IA", name: "Iowa" },           { code: "KS", name: "Kansas" },
  { code: "KY", name: "Kentucky" },       { code: "LA", name: "Louisiana" },
  { code: "ME", name: "Maine" },          { code: "MD", name: "Maryland" },
  { code: "MA", name: "Massachusetts" },  { code: "MI", name: "Michigan" },
  { code: "MN", name: "Minnesota" },      { code: "MS", name: "Mississippi" },
  { code: "MO", name: "Missouri" },       { code: "MT", name: "Montana" },
  { code: "NE", name: "Nebraska" },       { code: "NV", name: "Nevada" },
  { code: "NH", name: "New Hampshire" },  { code: "NJ", name: "New Jersey" },
  { code: "NM", name: "New Mexico" },     { code: "NY", name: "New York" },
  { code: "NC", name: "North Carolina" }, { code: "ND", name: "North Dakota" },
  { code: "OH", name: "Ohio" },           { code: "OK", name: "Oklahoma" },
  { code: "OR", name: "Oregon" },         { code: "PA", name: "Pennsylvania" },
  { code: "RI", name: "Rhode Island" },   { code: "SC", name: "South Carolina" },
  { code: "SD", name: "South Dakota" },   { code: "TN", name: "Tennessee" },
  { code: "TX", name: "Texas" },          { code: "UT", name: "Utah" },
  { code: "VT", name: "Vermont" },        { code: "VA", name: "Virginia" },
  { code: "WA", name: "Washington" },     { code: "WV", name: "West Virginia" },
  { code: "WI", name: "Wisconsin" },      { code: "WY", name: "Wyoming" },
];

export function findStateBySlug(slug: string): State | undefined {
  const normalized = slug.toLowerCase();
  return US_STATES.find(
    (s) => s.code.toLowerCase() === normalized || slugifyName(s.name) === normalized,
  );
}

export function slugifyName(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export interface CityDef { slug: string; name: string; state: string }

export const FEATURED_CITIES: CityDef[] = [
  // Boating-heavy
  { slug: "miami",       name: "Miami",        state: "FL" },
  { slug: "tampa",       name: "Tampa",        state: "FL" },
  { slug: "fort-lauderdale", name: "Fort Lauderdale", state: "FL" },
  { slug: "naples",      name: "Naples",       state: "FL" },
  { slug: "annapolis",   name: "Annapolis",    state: "MD" },
  { slug: "newport",     name: "Newport",      state: "RI" },
  { slug: "san-diego",   name: "San Diego",    state: "CA" },
  { slug: "newport-beach", name: "Newport Beach", state: "CA" },
  { slug: "seattle",     name: "Seattle",      state: "WA" },
  { slug: "lake-of-the-ozarks", name: "Lake of the Ozarks", state: "MO" },
  // Auto-heavy
  { slug: "scottsdale",  name: "Scottsdale",   state: "AZ" },
  { slug: "los-angeles", name: "Los Angeles",  state: "CA" },
  { slug: "dallas",      name: "Dallas",       state: "TX" },
  { slug: "houston",     name: "Houston",      state: "TX" },
  { slug: "atlanta",     name: "Atlanta",      state: "GA" },
  { slug: "charlotte",   name: "Charlotte",    state: "NC" },
  { slug: "denver",      name: "Denver",       state: "CO" },
  { slug: "chicago",     name: "Chicago",      state: "IL" },
  { slug: "new-york",    name: "New York",     state: "NY" },
  { slug: "boston",      name: "Boston",       state: "MA" },
];

export function findCityBySlug(slug: string): CityDef | undefined {
  return FEATURED_CITIES.find((c) => c.slug === slug);
}
