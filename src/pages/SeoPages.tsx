import { useEffect, useMemo } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { ListingGrid } from "@/components/listings/ListingGrid";
import { Pagination } from "@/components/ui/pagination";
import { useListings, usePaginatedListings } from "@/hooks/useListings";
import { usePageParam } from "@/hooks/usePageParam";
import { setMeta } from "@/lib/seo";
import { BRAND } from "@/lib/brand";
import {
  US_STATES, FEATURED_CITIES, findStateBySlug, findCityBySlug, slugifyName,
} from "@/lib/geo";
import { CATEGORIES, FEATURED_BOAT_BRANDS, FEATURED_AUTO_BRANDS } from "@/lib/categories";
import type { ListingCategory } from "@/types/database";

const BOAT_CATEGORIES: ListingCategory[] = ["boat", "performance_boat", "yacht", "center_console"];

function breadcrumbsLD(items: { name: string; href: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: `https://${BRAND.domain}${it.href}`,
    })),
  };
}

// ─── /boats-for-sale-in-:state ───────────────────────────────────────────────

export function StatePage() {
  const { state: stateSlug } = useParams<{ state: string }>();
  const state = useMemo(() => stateSlug ? findStateBySlug(stateSlug) : undefined, [stateSlug]);
  const [page, setPage] = usePageParam();

  const { data, isLoading, isFetching } = usePaginatedListings({
    categories: BOAT_CATEGORIES,
    state: state?.code,
    status: "active",
    order: "newest",
    page,
    enabled: !!state,
  });
  const listings = data?.listings ?? [];

  useEffect(() => {
    if (data && page > data.pageCount) setPage(data.pageCount);
  }, [data, page, setPage]);

  useEffect(() => {
    if (!state) return;
    const title = `Boats for sale in ${state.name}`;
    setMeta({
      title,
      description: `Browse ${data?.total || "all"} active boats for sale in ${state.name} on ${BRAND.name}.`,
      jsonLd: breadcrumbsLD([
        { name: "Home", href: "/" },
        { name: "Boats", href: "/categories/boat" },
        { name: state.name, href: `/boats-for-sale-in-${slugifyName(state.name)}` },
      ]),
    });
  }, [state, data?.total]);

  if (stateSlug && !state) return <Navigate to="/browse" replace />;
  if (!state) return null;

  return (
    <div className="container-pad py-12 space-y-8">
      <header>
        <div className="font-mono text-xs uppercase tracking-[0.32em] text-brass-400">Boats for sale</div>
        <h1 className="font-display text-4xl mt-1">Boats for sale in {state.name}</h1>
        <p className="text-muted-foreground mt-2 max-w-2xl">
          Active center-consoles, cruisers, performance boats, and yachts located in {state.name}.
        </p>
      </header>
      {isLoading ? <div className="text-sm text-muted-foreground">Loading…</div> : (
        <>
          <ListingGrid listings={listings} emptyText={`No active boats in ${state.name} just yet.`} />
          <Pagination page={page} pageCount={data?.pageCount ?? 1} total={data?.total} onPageChange={setPage} isLoading={isFetching} />
        </>
      )}
      <RelatedStates current={state.code} />
    </div>
  );
}

function RelatedStates({ current }: { current: string }) {
  const others = US_STATES.filter((s) => s.code !== current).slice(0, 12);
  return (
    <section className="border-t border-border pt-8">
      <div className="font-mono text-xs uppercase tracking-[0.32em] text-brass-400 mb-3">Other states</div>
      <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 text-sm">
        {others.map((s) => (
          <li key={s.code}>
            <Link className="text-muted-foreground hover:text-foreground" to={`/boats-for-sale-in-${slugifyName(s.name)}`}>
              {s.name}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

// ─── /:brand-for-sale ────────────────────────────────────────────────────────

const ALL_BRANDS = Array.from(new Set([...FEATURED_BOAT_BRANDS, ...FEATURED_AUTO_BRANDS]));

function findBrandBySlug(slug: string): string | undefined {
  const normalized = slug.toLowerCase();
  return ALL_BRANDS.find((b) => slugifyName(b) === normalized);
}

export function BrandPage() {
  const { brand: brandSlug } = useParams<{ brand: string }>();
  const brand = useMemo(() => brandSlug ? findBrandBySlug(brandSlug) : undefined, [brandSlug]);

  const [page, setPage] = usePageParam();
  const { data, isLoading, isFetching } = usePaginatedListings({
    make: brand,
    status: "active",
    order: "newest",
    page,
    enabled: !!brand,
  });
  const listings = data?.listings ?? [];

  useEffect(() => {
    if (data && page > data.pageCount) setPage(data.pageCount);
  }, [data, page, setPage]);

  useEffect(() => {
    if (!brand) return;
    setMeta({
      title: `${brand} for sale`,
      description: `Active ${brand} listings — boats and autos — on ${BRAND.name}.`,
      jsonLd: breadcrumbsLD([
        { name: "Home", href: "/" },
        { name: "Brands", href: "/brands" },
        { name: brand, href: `/${slugifyName(brand)}-for-sale` },
      ]),
    });
  }, [brand]);

  if (brandSlug && !brand) return <Navigate to="/browse" replace />;
  if (!brand) return null;

  return (
    <div className="container-pad py-12 space-y-8">
      <header>
        <div className="font-mono text-xs uppercase tracking-[0.32em] text-brass-400">Brand</div>
        <h1 className="font-display text-4xl mt-1">{brand} for sale</h1>
        <p className="text-muted-foreground mt-2 max-w-2xl">
          Every active {brand} listing on {BRAND.name}. Boats and autos.
        </p>
      </header>
      {isLoading ? <div className="text-sm text-muted-foreground">Loading…</div> : (
        <>
          <ListingGrid listings={listings} emptyText={`No active ${brand} listings yet.`} />
          <Pagination page={page} pageCount={data?.pageCount ?? 1} total={data?.total} onPageChange={setPage} isLoading={isFetching} />
        </>
      )}
      <RelatedBrands current={brand} />
    </div>
  );
}

function RelatedBrands({ current }: { current: string }) {
  const others = ALL_BRANDS.filter((b) => b !== current).slice(0, 12);
  return (
    <section className="border-t border-border pt-8">
      <div className="font-mono text-xs uppercase tracking-[0.32em] text-brass-400 mb-3">More brands</div>
      <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 text-sm">
        {others.map((b) => (
          <li key={b}>
            <Link className="text-muted-foreground hover:text-foreground" to={`/${slugifyName(b)}-for-sale`}>{b}</Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function BrandsIndex() {
  useEffect(() => {
    setMeta({
      title: "Brands for sale",
      description: `Browse boats and autos by brand on ${BRAND.name}.`,
    });
  }, []);
  return (
    <div className="container-pad py-12 space-y-6">
      <header>
        <div className="font-mono text-xs uppercase tracking-[0.32em] text-brass-400">Brands</div>
        <h1 className="font-display text-4xl mt-1">All brands</h1>
      </header>
      <section>
        <div className="font-mono text-xs uppercase tracking-wider text-brass-400 mb-2">Boats</div>
        <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 text-sm">
          {FEATURED_BOAT_BRANDS.map((b) => (
            <li key={b}><Link className="text-muted-foreground hover:text-foreground" to={`/${slugifyName(b)}-for-sale`}>{b}</Link></li>
          ))}
        </ul>
      </section>
      <section>
        <div className="font-mono text-xs uppercase tracking-wider text-brass-400 mb-2">Autos</div>
        <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 text-sm">
          {FEATURED_AUTO_BRANDS.map((b) => (
            <li key={b}><Link className="text-muted-foreground hover:text-foreground" to={`/${slugifyName(b)}-for-sale`}>{b}</Link></li>
          ))}
        </ul>
      </section>
    </div>
  );
}

// ─── /:category-in-:city ─────────────────────────────────────────────────────

export function CityPage() {
  const { category: categorySlug, city: citySlug } = useParams<{ category: string; city: string }>();
  const category = useMemo(
    () => CATEGORIES.find((c) => c.key === categorySlug),
    [categorySlug],
  );
  const city = useMemo(() => (citySlug ? findCityBySlug(citySlug) : undefined), [citySlug]);

  const [page, setPage] = usePageParam();
  const { data, isLoading, isFetching } = usePaginatedListings({
    category: category?.key,
    city: city?.name,
    status: "active",
    order: "newest",
    page,
    enabled: !!category && !!city,
  });
  const listings = data?.listings ?? [];

  useEffect(() => {
    if (data && page > data.pageCount) setPage(data.pageCount);
  }, [data, page, setPage]);

  useEffect(() => {
    if (!category || !city) return;
    setMeta({
      title: `${category.label} in ${city.name}, ${city.state}`,
      description: `Active ${category.label.toLowerCase()} listings in ${city.name}, ${city.state} on ${BRAND.name}.`,
      jsonLd: breadcrumbsLD([
        { name: "Home", href: "/" },
        { name: category.label, href: `/categories/${category.key}` },
        { name: `${city.name}, ${city.state}`, href: `/${category.key}-in-${city.slug}` },
      ]),
    });
  }, [category, city]);

  if ((categorySlug || citySlug) && (!category || !city)) {
    return <Navigate to="/browse" replace />;
  }
  if (!category || !city) return null;

  return (
    <div className="container-pad py-12 space-y-8">
      <header>
        <div className="font-mono text-xs uppercase tracking-[0.32em] text-brass-400">{category.group}</div>
        <h1 className="font-display text-4xl mt-1">{category.label} in {city.name}, {city.state}</h1>
        <p className="text-muted-foreground mt-2 max-w-2xl">{category.blurb}.</p>
      </header>
      {isLoading ? <div className="text-sm text-muted-foreground">Loading…</div> : (
        <>
          <ListingGrid listings={listings} emptyText={`No active ${category.label.toLowerCase()} in ${city.name} just yet.`} />
          <Pagination page={page} pageCount={data?.pageCount ?? 1} total={data?.total} onPageChange={setPage} isLoading={isFetching} />
        </>
      )}
      <NearbyCities current={city.slug} />
    </div>
  );
}

function NearbyCities({ current }: { current: string }) {
  const others = FEATURED_CITIES.filter((c) => c.slug !== current).slice(0, 9);
  return (
    <section className="border-t border-border pt-8">
      <div className="font-mono text-xs uppercase tracking-[0.32em] text-brass-400 mb-3">More cities</div>
      <ul className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-sm">
        {others.map((c) => (
          <li key={c.slug}>
            <Link className="text-muted-foreground hover:text-foreground" to={`/center_console-in-${c.slug}`}>
              {c.name}, {c.state}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

// ─── Optional index pages so the SEO routes are discoverable internally ─────

export function StatesIndex() {
  useEffect(() => {
    setMeta({ title: "Boats by state", description: `Boats for sale by state on ${BRAND.name}.` });
  }, []);
  return (
    <div className="container-pad py-12 space-y-6">
      <h1 className="font-display text-4xl">Boats by state</h1>
      <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 text-sm">
        {US_STATES.map((s) => (
          <li key={s.code}>
            <Link className="text-muted-foreground hover:text-foreground" to={`/boats-for-sale-in-${slugifyName(s.name)}`}>
              {s.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function PreviewListings({ category }: { category: ListingCategory }) {
  const { data = [] } = useListings({ category, status: "active", limit: 8 });
  return <ListingGrid listings={data} emptyText="" />;
}

export function CategoryCityIndex() {
  useEffect(() => {
    setMeta({ title: "By city", description: `Boats and autos by city on ${BRAND.name}.` });
  }, []);
  const groups = [
    { label: "Center consoles", category: "center_console" as ListingCategory },
    { label: "Yachts", category: "yacht" as ListingCategory },
    { label: "Exotics", category: "exotic" as ListingCategory },
    { label: "Trucks", category: "truck" as ListingCategory },
  ];
  return (
    <div className="container-pad py-12 space-y-8">
      <h1 className="font-display text-4xl">Browse by city</h1>
      {groups.map((g) => (
        <section key={g.category}>
          <div className="font-mono text-xs uppercase tracking-wider text-brass-400 mb-2">{g.label}</div>
          <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 text-sm">
            {FEATURED_CITIES.map((c) => (
              <li key={c.slug}>
                <Link className="text-muted-foreground hover:text-foreground" to={`/${g.category}-in-${c.slug}`}>
                  {c.name}, {c.state}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
