import "server-only";
import { cache } from "react";
import demoRows from "./demo-data.json";
import { hasSupabase } from "./supabase/env";
import { createClient } from "./supabase/server";

export type HiringStatus = "Hiring" | "Not hiring" | "Unknown";

export type Company = {
  id: string;
  slug: string;
  company_name: string;
  city: string;
  industry: string;
  area: string | null;
  pin_code: string | null;
  hiring_status: HiringStatus;
  last_checked: string | null;
};

export type Details = {
  website: string | null;
  careers_url: string | null;
  linkedin_url: string | null;
  open_roles: string | null;
};

export type Filters = { q?: string; city?: string; industry?: string; area?: string; hiring?: boolean; page?: number };
export type Facet = { name: string; total: number; hiring: number };
export type AreaFacet = Facet & { city: string };
export type Facets = { cities: Facet[]; areas: AreaFacet[]; industries: Facet[] };
export type Viewer = { email: string | null; hasAccess: boolean; paywallEnabled: boolean; expiresAt: string | null };

export const PAGE_SIZE = 24;
const PUBLIC_COLS = "id, slug, company_name, city, industry, area, pin_code, hiring_status, last_checked";

/** True when no Supabase keys are set — the site runs on fictional demo data. */
export const isDemo = !hasSupabase;
type DemoRow = Company & Details;
const demo = demoRows as DemoRow[];

const statusRank: Record<HiringStatus, number> = { Hiring: 0, "Not hiring": 1, Unknown: 2 };
const clean = (s?: string) => (s || "").replace(/[%_,()]/g, " ").trim();

export async function searchCompanies(f: Filters): Promise<{ rows: Company[]; total: number }> {
  const page = Math.max(1, f.page || 1);
  const from = (page - 1) * PAGE_SIZE;
  const q = clean(f.q);

  if (isDemo) {
    const rows = demo
      .filter(
        (c) =>
          (!q || c.company_name.toLowerCase().includes(q.toLowerCase())) &&
          (!f.city || c.city === f.city) &&
          (!f.industry || c.industry === f.industry) &&
          (!f.area || c.area === f.area) &&
          (!f.hiring || c.hiring_status === "Hiring"),
      )
      .sort((a, b) => statusRank[a.hiring_status] - statusRank[b.hiring_status] || a.company_name.localeCompare(b.company_name));
    return { rows: rows.slice(from, from + PAGE_SIZE), total: rows.length };
  }

  const supabase = await createClient();
  let query = supabase.from("companies").select(PUBLIC_COLS, { count: "exact" });
  if (q) query = query.ilike("company_name", `%${q}%`);
  if (f.city) query = query.eq("city", f.city);
  if (f.industry) query = query.eq("industry", f.industry);
  if (f.area) query = query.eq("area", f.area);
  if (f.hiring) query = query.eq("hiring_status", "Hiring");
  const { data, count, error } = await query
    .order("hiring_status") // "Hiring" < "Not hiring" < "Unknown"
    .order("last_checked", { ascending: false, nullsFirst: false })
    .order("company_name")
    .range(from, from + PAGE_SIZE - 1);
  if (error) console.error("searchCompanies", error.message);
  return { rows: (data as Company[]) || [], total: count || 0 };
}

export const getCompany = cache(async (slug: string): Promise<Company | null> => {
  if (isDemo) return demo.find((c) => c.slug === slug) || null;
  const supabase = await createClient();
  const { data } = await supabase.from("companies").select(PUBLIC_COLS).eq("slug", slug).maybeSingle();
  return (data as Company) || null;
});

/** Locked details. Returns {} unless the viewer has access (enforced in the database). */
export async function getDetails(ids: string[]): Promise<Record<string, Details>> {
  if (!ids.length) return {};
  if (isDemo) {
    if (process.env.DEMO_UNLOCKED !== "1") return {};
    return Object.fromEntries(demo.filter((c) => ids.includes(c.id)).map((c) => [c.id, c]));
  }
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("company_details", { ids });
  if (error) console.error("getDetails", error.message);
  return Object.fromEntries(((data as (Details & { id: string })[]) || []).map((d) => [d.id, d]));
}

type CountRow = { city: string; name: string; total: number; hiring: number };

/** All per-city counts, loaded once per request. */
const loadCounts = cache(async (): Promise<{ areas: CountRow[]; industries: CountRow[] }> => {
  if (isDemo) {
    const tally = (key: "area" | "industry") => {
      const m = new Map<string, CountRow>();
      for (const c of demo) {
        const name = c[key];
        if (!name) continue;
        const k = `${c.city}|${name}`;
        const f = m.get(k) || { city: c.city, name, total: 0, hiring: 0 };
        f.total++;
        if (c.hiring_status === "Hiring") f.hiring++;
        m.set(k, f);
      }
      return [...m.values()];
    };
    return { areas: tally("area"), industries: tally("industry") };
  }
  const supabase = await createClient();
  const [a, i] = await Promise.all([
    supabase.from("area_counts").select("city, area, total, hiring"),
    supabase.from("industry_counts").select("city, industry, total, hiring"),
  ]);
  if (a.error || i.error) console.error("loadCounts", a.error?.message || i.error?.message);
  return {
    areas: (a.data || []).map((r) => ({ city: r.city, name: r.area, total: r.total, hiring: r.hiring })),
    industries: (i.data || []).map((r) => ({ city: r.city, name: r.industry, total: r.total, hiring: r.hiring })),
  };
});

const byTotal = (a: Facet, b: Facet) => b.total - a.total || a.name.localeCompare(b.name);

/**
 * Lists for the filters and browse pages.
 * Pass a city to get only that city's areas and industries.
 */
export async function getFacets(city?: string): Promise<Facets> {
  const { areas, industries } = await loadCounts();
  const merge = (rows: CountRow[], key: (r: CountRow) => string) => {
    const m = new Map<string, Facet>();
    for (const r of rows) {
      const f = m.get(key(r)) || { name: key(r), total: 0, hiring: 0 };
      f.total += r.total;
      f.hiring += r.hiring;
      m.set(key(r), f);
    }
    return [...m.values()].sort(byTotal);
  };
  const inCity = (r: CountRow) => !city || r.city === city;
  return {
    cities: merge(industries, (r) => r.city), // every company has an industry, so this counts everyone
    areas: areas.filter(inCity).map((r) => ({ ...r })).sort((a, b) => a.city.localeCompare(b.city) || byTotal(a, b)),
    industries: merge(industries.filter(inCity), (r) => r.name),
  };
}

export const getStats = cache(async () => {
  const { cities } = await getFacets();
  const total = cities.reduce((s, c) => s + c.total, 0);
  const hiring = cities.reduce((s, c) => s + c.hiring, 0);
  let lastChecked: string | null = null;
  if (isDemo) {
    lastChecked = demo.map((c) => c.last_checked).filter(Boolean).sort().pop() || null;
  } else {
    const supabase = await createClient();
    const { data } = await supabase
      .from("companies")
      .select("last_checked")
      .not("last_checked", "is", null)
      .order("last_checked", { ascending: false })
      .limit(1);
    lastChecked = data?.[0]?.last_checked ?? null;
  }
  return { total, hiring, lastChecked, cities };
});

export const getViewer = cache(async (): Promise<Viewer> => {
  if (isDemo) {
    const unlocked = process.env.DEMO_UNLOCKED === "1";
    return { email: unlocked ? "demo@example.com" : null, hasAccess: unlocked, paywallEnabled: false, expiresAt: null };
  }
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const [{ data: access }, { data: settings }, subs] = await Promise.all([
    supabase.rpc("has_access"),
    supabase.from("app_settings").select("paywall_enabled").eq("id", 1).maybeSingle(),
    user
      ? supabase.from("subscriptions").select("expires_at").order("expires_at", { ascending: false }).limit(1)
      : Promise.resolve({ data: null }),
  ]);
  const exp = subs.data?.[0]?.expires_at ?? null;
  return {
    email: user?.email ?? null,
    hasAccess: Boolean(access),
    paywallEnabled: Boolean(settings?.paywall_enabled),
    expiresAt: exp && new Date(exp) > new Date() ? exp : null,
  };
});
