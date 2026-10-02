import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CompanyGrid } from "@/components/CompanyGrid";
import { LockedNotice } from "@/components/LockedNotice";
import { SITE } from "@/lib/config";
import { getFacets, getViewer, searchCompanies, type Facet } from "@/lib/data";
import { areaSlug, citySlug, industrySlug } from "@/lib/utils";
import { resolveCity } from "./resolve";

export async function generateMetadata({ params }: PageProps<"/[city]">): Promise<Metadata> {
  const city = await resolveCity((await params).city);
  if (!city) return {};
  return {
    title: `Companies hiring in ${city.name}`,
    description: `${city.hiring} of ${city.total} companies we track in ${city.name} are hiring now. Browse by area and industry. ${SITE.updateSchedule}.`,
    alternates: { canonical: `/${citySlug(city.name)}` },
  };
}

function FacetList({ items, href }: { items: Facet[]; href: (n: string) => string }) {
  return (
    <ul className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((x) => (
        <li key={x.name}>
          <Link href={href(x.name)} className="flex items-baseline justify-between gap-3 rounded-xl border border-line bg-card px-4 py-3 hover:border-line-strong">
            <span className="font-medium">{x.name}</span>
            <span className="shrink-0 text-sm text-ink-soft"><span className="text-hire">{x.hiring} hiring</span> · {x.total}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

export default async function CityPage({ params }: PageProps<"/[city]">) {
  const city = await resolveCity((await params).city);
  if (!city) notFound();
  const base = `/${citySlug(city.name)}`;
  const [{ cities, areas, industries }, hiring, viewer] = await Promise.all([
    getFacets(city.name),
    searchCompanies({ city: city.name, hiring: true }),
    getViewer(),
  ]);

  return (
    <>
      <section className="bg-forest text-paper">
        <div className="container-page py-10 sm:py-14">
          <nav className="flex flex-wrap gap-2 text-sm" aria-label="Cities">
            {cities.map((c) => (
              <Link
                key={c.name}
                href={`/${citySlug(c.name)}`}
                aria-current={c.name === city.name ? "page" : undefined}
                className={`rounded-full border px-3 py-1 ${c.name === city.name ? "border-amber bg-amber font-semibold text-ink" : "border-paper/30 text-paper/85 hover:border-amber"}`}
              >
                {c.name}
              </Link>
            ))}
          </nav>
          <h1 className="mt-5 text-4xl font-bold leading-tight sm:text-5xl">
            Companies hiring in <em className="text-amber">{city.name}</em>
          </h1>
          <p className="mt-3 max-w-2xl text-paper/75 sm:text-lg">
            We track {city.total.toLocaleString("en-IN")} companies in {city.name}. {city.hiring.toLocaleString("en-IN")} are hiring as of our last check. {SITE.updateSchedule}.
          </p>
          <Link href={`/search?city=${encodeURIComponent(city.name)}`} className="btn btn-amber mt-6">Search all {city.name} companies</Link>
        </div>
      </section>

      <div className="container-page py-8">
        <div className="flex items-end justify-between gap-4">
          <h2 className="text-2xl font-bold">Hiring now in {city.name}</h2>
          {hiring.total > 6 && (
            <Link href={`/search?city=${encodeURIComponent(city.name)}&hiring=1`} className="text-sm font-semibold hover:underline">See all {hiring.total} →</Link>
          )}
        </div>
        {!viewer.hasAccess && hiring.total > 0 && <div className="mt-4"><LockedNotice viewer={viewer} next={base} /></div>}
        <div className="mt-4">
          {hiring.rows.length ? (
            <CompanyGrid rows={hiring.rows.slice(0, 6)} />
          ) : (
            <p className="rounded-2xl border border-dashed border-line-strong p-6 text-ink-soft">
              No companies in {city.name} are marked as hiring yet. Check back after our next update.
            </p>
          )}
        </div>

        {areas.length > 0 && (
          <>
            <h2 className="mt-10 text-xl font-bold">{city.name} by area</h2>
            <FacetList items={areas} href={(n) => `${base}/${areaSlug(n)}`} />
          </>
        )}
        <h2 className="mt-10 text-xl font-bold">{city.name} by industry</h2>
        <FacetList items={industries} href={(n) => `${base}/${industrySlug(n)}`} />
      </div>
    </>
  );
}
