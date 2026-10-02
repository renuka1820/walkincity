import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CompanyGrid } from "@/components/CompanyGrid";
import { LockedNotice } from "@/components/LockedNotice";
import { SITE } from "@/lib/config";
import { getViewer, searchCompanies } from "@/lib/data";
import { citySlug } from "@/lib/utils";
import { resolveCity, resolveCitySection } from "../resolve";

// /whitefield under /bangalore → area page; /it-services-companies → industry page
async function resolve(params: Promise<{ city: string; slug: string }>) {
  const { city: cs, slug } = await params;
  const city = await resolveCity(cs);
  if (!city) return null;
  const section = await resolveCitySection(city.name, slug);
  if (!section) return null;
  const isArea = section.kind === "area";
  return {
    city: city.name,
    slug,
    ...section,
    heading: isArea ? `Companies hiring in ${section.facet.name}, ${city.name}` : `${section.facet.name} companies hiring in ${city.name}`,
    what: isArea ? `companies in ${section.facet.name}, ${city.name}` : `${section.facet.name} companies in ${city.name}`,
  };
}

export async function generateMetadata({ params }: PageProps<"/[city]/[slug]">): Promise<Metadata> {
  const r = await resolve(params);
  if (!r) return {};
  return {
    title: r.heading,
    description: `${r.facet.hiring} of ${r.facet.total} ${r.what} are hiring now. ${SITE.updateSchedule}.`,
    alternates: { canonical: `/${citySlug(r.city)}/${r.slug}` },
  };
}

export default async function CitySectionPage({ params }: PageProps<"/[city]/[slug]">) {
  const r = await resolve(params);
  if (!r) notFound();
  const filters: Record<string, string> = { city: r.city, [r.kind]: r.facet.name };
  const [{ rows, total }, viewer] = await Promise.all([searchCompanies(filters), getViewer()]);
  const path = `/${citySlug(r.city)}/${r.slug}`;

  return (
    <div className="container-page py-8">
      <nav className="text-sm text-ink-soft">
        <Link href={`/${citySlug(r.city)}`} className="hover:underline">{r.city}</Link> / {r.facet.name}
      </nav>
      <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-4xl">{r.heading}</h1>
      <p className="mt-2 max-w-2xl text-ink-soft">
        We track {r.facet.total} {r.what}. <strong className="text-hire">{r.facet.hiring} are hiring</strong> as of our last check. {SITE.updateSchedule}.
      </p>
      {!viewer.hasAccess && <div className="mt-5"><LockedNotice viewer={viewer} next={path} /></div>}
      <div className="mt-5"><CompanyGrid rows={rows} /></div>
      {total > rows.length && (
        <div className="mt-6 text-center">
          <Link href={`/search?${new URLSearchParams(filters)}`} className="btn btn-ghost">See all {total} →</Link>
        </div>
      )}
    </div>
  );
}
