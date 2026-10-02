import { getFacets } from "@/lib/data";
import { areaSlug, citySlug, industrySlug } from "@/lib/utils";

/** "/gurgaon" → the real city name, or null if we don't track that city. */
export async function resolveCity(slug: string) {
  const { cities } = await getFacets();
  return cities.find((c) => citySlug(c.name) === slug) || null;
}

/** "/gurgaon/cyber-city" → area page; "/gurgaon/it-services-companies" → industry page. */
export async function resolveCitySection(city: string, slug: string) {
  const { areas, industries } = await getFacets(city);
  const area = areas.find((a) => areaSlug(a.name) === slug);
  if (area) return { kind: "area" as const, facet: area };
  const industry = industries.find((i) => industrySlug(i.name) === slug);
  if (industry) return { kind: "industry" as const, facet: industry };
  return null;
}
