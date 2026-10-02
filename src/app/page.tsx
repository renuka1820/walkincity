import Link from "next/link";
import { CompanyGrid } from "@/components/CompanyGrid";
import { SearchForm } from "@/components/SearchForm";
import { Spark } from "@/components/Spark";
import { SITE } from "@/lib/config";
import { getFacets, getStats, searchCompanies } from "@/lib/data";
import { citySlug, formatDate } from "@/lib/utils";

export default async function Home() {
  const [facets, stats, latest] = await Promise.all([
    getFacets(),
    getStats(),
    searchCompanies({ hiring: true }),
  ]);

  return (
    <>
      <section className="relative bg-forest text-paper">
        <div aria-hidden className="pointer-events-none absolute inset-0 hidden overflow-hidden lg:block">
          <div className="absolute -right-10 top-4 text-[9rem] xl:text-[11rem]">
            <div className="outline-text opacity-45">Hiring</div>
            <div className="outline-text opacity-25">Hiring</div>
            <div className="outline-text opacity-10">Hiring</div>
          </div>
        </div>
        <Spark className="absolute left-4 top-8 h-6 w-6 text-amber sm:left-10" />
        <Spark className="absolute bottom-24 left-[46%] hidden h-9 w-9 text-accent lg:block" />
        <div className="container-page relative grid gap-8 pb-16 pt-14 sm:pb-24 sm:pt-20 lg:grid-cols-[1.15fr_1fr] lg:items-center">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-paper/25 px-3 py-1 text-xs font-semibold text-paper/85">
              <span className="h-2 w-2 animate-pulse rounded-full bg-amber" />
              {SITE.updateSchedule}
            </p>
            <h1 className="mt-5 text-4xl font-bold leading-[1.05] sm:text-6xl">
              Which companies in your city are <em className="text-amber">hiring</em> right now?
            </h1>
            <p className="mt-5 max-w-xl text-paper/75 sm:text-lg">
              We check company careers pages by hand, twice a week, so you don&apos;t have to open 50 tabs.
            </p>
            <dl className="mt-8 flex flex-wrap gap-x-8 gap-y-4">
              <div>
                <dt className="text-xs uppercase tracking-wide text-paper/60">Companies tracked</dt>
                <dd className="font-display text-3xl font-bold tabular-nums">{stats.total.toLocaleString("en-IN")}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-paper/60">Hiring now</dt>
                <dd className="font-display text-3xl font-bold tabular-nums text-amber">{stats.hiring.toLocaleString("en-IN")}</dd>
              </div>
              {stats.lastChecked && (
                <div>
                  <dt className="text-xs uppercase tracking-wide text-paper/60">Last update</dt>
                  <dd className="font-display text-3xl font-bold">{formatDate(stats.lastChecked)?.replace(/ \d{4}$/, "")}</dd>
                </div>
              )}
            </dl>
          </div>
          <div className="rounded-[2rem] bg-paper p-4 text-ink shadow-[0_18px_0_-6px_var(--color-accent)] sm:p-6">
            <p className="mb-3 font-display text-lg font-bold">{stats.total.toLocaleString("en-IN")} companies in {stats.cities.length} cities</p>
            <SearchForm facets={facets} />
          </div>
        </div>
        <a href="#hiring" className="absolute -bottom-9 left-1/2 grid h-20 w-20 -translate-x-1/2 place-items-center rounded-full bg-amber text-center text-xs font-bold leading-tight text-ink transition hover:scale-105">
          Scroll<br />down
        </a>
      </section>

      <section id="hiring" className="container-page scroll-mt-20 pb-10 pt-16">
        <div className="flex items-end justify-between gap-4">
          <h2 className="text-2xl font-bold sm:text-3xl">Hiring this week</h2>
          <Link href="/search?hiring=1" className="text-sm font-semibold hover:underline">See all {stats.hiring} →</Link>
        </div>
        <div className="mt-4">
          {latest.rows.length ? <CompanyGrid rows={latest.rows.slice(0, 6)} /> : <p className="text-ink-soft">No companies marked as hiring yet.</p>}
        </div>
      </section>

      <section className="container-page py-4">
        <h2 className="text-2xl font-bold sm:text-3xl">Pick your city</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {stats.cities.map((c) => (
            <Link key={c.name} href={`/${citySlug(c.name)}`} className="group rounded-2xl border border-line-strong bg-card p-5 transition hover:bg-chip">
              <p className="font-display text-2xl font-bold">{c.name}</p>
              <p className="mt-1 text-sm text-ink-soft">
                <span className="font-semibold text-hire">{c.hiring} hiring</span> · {c.total} companies
              </p>
              <p className="mt-4 text-sm font-semibold group-hover:underline">See companies →</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="container-page pt-10">
        <h2 className="text-lg font-bold">Browse by industry</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {facets.industries.map((i) => (
            <Link key={i.name} href={`/search?industry=${encodeURIComponent(i.name)}`} className="rounded-full border border-line-strong bg-card px-3 py-1.5 text-sm hover:bg-chip">
              {i.name} <span className="text-ink-soft">{i.total}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="container-page py-12">
        <div className="grid gap-4 rounded-[2rem] bg-olive p-6 text-paper sm:grid-cols-3 sm:p-8">
          {[
            ["1. We check", "Careers pages, LinkedIn and job boards for every company — every Monday and Wednesday."],
            ["2. You search", "Filter by city, area and industry. See who's hiring near your home or college."],
            ["3. You apply", "Go straight to the careers page. No middlemen, no fake listings."],
          ].map(([t, d]) => (
            <div key={t}>
              <p className="font-display text-lg font-bold text-amber">{t}</p>
              <p className="mt-1 text-sm text-paper/80">{d}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
