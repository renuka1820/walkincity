import type { MetadataRoute } from "next";
import { SITE } from "@/lib/config";
import { getFacets, isDemo } from "@/lib/data";
import { hasSupabase, SUPABASE_KEY, SUPABASE_URL } from "@/lib/supabase/env";
import { areaSlug, citySlug, industrySlug } from "@/lib/utils";
import { createClient } from "@supabase/supabase-js";
import demo from "@/lib/demo-data.json";

export const revalidate = 3600;

// Submit https://YOURSITE/sitemap.xml in Google Search Console.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = SITE.url.replace(/\/$/, "");
  const { cities, areas } = await getFacets();
  const perCity = await Promise.all(cities.map(async (c) => ({ city: c.name, industries: (await getFacets(c.name)).industries })));
  let companies: { slug: string; last_checked: string | null }[] = [];
  if (isDemo) companies = demo;
  else if (hasSupabase) {
    const { data } = await createClient(SUPABASE_URL, SUPABASE_KEY).from("companies").select("slug, last_checked").limit(5000);
    companies = data || [];
  }
  const now = new Date();
  return [
    { url: base, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${base}/pricing`, changeFrequency: "monthly", priority: 0.5 },
    ...cities.map((c) => ({ url: `${base}/${citySlug(c.name)}`, changeFrequency: "weekly" as const, priority: 0.9 })),
    ...areas.map((a) => ({ url: `${base}/${citySlug(a.city)}/${areaSlug(a.name)}`, changeFrequency: "weekly" as const, priority: 0.8 })),
    ...perCity.flatMap((c) => c.industries.map((i) => ({ url: `${base}/${citySlug(c.city)}/${industrySlug(i.name)}`, changeFrequency: "weekly" as const, priority: 0.8 }))),
    ...companies.map((c) => ({ url: `${base}/company/${c.slug}`, lastModified: c.last_checked || undefined, changeFrequency: "weekly" as const, priority: 0.6 })),
    ...["contact", "privacy", "terms", "refund-policy"].map((p) => ({ url: `${base}/${p}`, priority: 0.2 })),
  ];
}
