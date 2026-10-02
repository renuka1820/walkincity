import type { Metadata } from "next";
import Link from "next/link";
import { CompanyGrid } from "@/components/CompanyGrid";
import { LockedNotice } from "@/components/LockedNotice";
import { SearchForm } from "@/components/SearchForm";
import { getFacets, getViewer, PAGE_SIZE, searchCompanies, type Filters } from "@/lib/data";

export const metadata: Metadata = { title: "Search companies", robots: { index: false, follow: true } };

const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) || undefined;

export default async function SearchPage({ searchParams }: PageProps<"/search">) {
  const sp = await searchParams;
  const filters: Filters = {
    q: one(sp.q),
    city: one(sp.city),
    industry: one(sp.industry),
    area: one(sp.area),
    hiring: one(sp.hiring) === "1",
    page: Number(one(sp.page)) || 1,
  };
  const [facets, { rows, total }, viewer] = await Promise.all([
    getFacets(filters.city),
    searchCompanies(filters),
    getViewer(),
  ]);
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const pageHref = (p: number) => {
    const u = new URLSearchParams();
    for (const [k, v] of Object.entries(filters)) if (v && k !== "page") u.set(k, v === true ? "1" : String(v));
    if (p > 1) u.set("page", String(p));
    return `/search?${u}`;
  };
  const label = [filters.hiring && "Hiring", filters.industry, "companies", `in ${[filters.area, filters.city].filter(Boolean).join(", ") || "all cities"}`]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="container-page py-6">
      <SearchForm facets={facets} values={filters} compact />
      <div className="mt-6 flex flex-wrap items-baseline justify-between gap-2">
        <h1 className="text-xl font-bold">{label}</h1>
        <p className="text-sm text-ink-soft">{total.toLocaleString("en-IN")} result{total === 1 ? "" : "s"}</p>
      </div>
      {!viewer.hasAccess && total > 0 && (
        <div className="mt-4"><LockedNotice viewer={viewer} /></div>
      )}
      <div className="mt-4">
        {rows.length ? (
          <CompanyGrid rows={rows} />
        ) : (
          <div className="rounded-2xl border border-dashed border-line p-10 text-center text-ink-soft">
            No companies match. <Link href="/search" className="font-semibold text-ink underline">Clear filters</Link>
          </div>
        )}
      </div>
      {pages > 1 && (
        <nav className="mt-8 flex items-center justify-center gap-3 text-sm">
          {filters.page! > 1 && <Link className="btn btn-ghost" href={pageHref(filters.page! - 1)}>← Previous</Link>}
          <span className="text-ink-soft">Page {filters.page} of {pages}</span>
          {filters.page! < pages && <Link className="btn btn-ghost" href={pageHref(filters.page! + 1)}>Next →</Link>}
        </nav>
      )}
    </div>
  );
}
