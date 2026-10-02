export const slugify = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

export const citySlug = (city: string) => slugify(city);
export const areaSlug = (area: string) => slugify(area);
export const industrySlug = (industry: string) => `${slugify(industry)}-companies`;

/** "abctech.com/careers" → "https://abctech.com/careers" */
export const toUrl = (u?: string | null) => (!u ? null : /^https?:\/\//i.test(u) ? u : `https://${u}`);

export const linkedinJobsUrl = (name: string, city: string) =>
  `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(name)}&location=${encodeURIComponent(city)}`;

/** A company's own LinkedIn page → its jobs tab. Search links and other URLs are left as they are. */
export const linkedinCompanyJobs = (u: string) =>
  /linkedin\.com\/company\/[^/?#]+\/?$/i.test(u) ? `${u.replace(/\/$/, "")}/jobs/` : u;

export const naukriUrl = (name: string, city: string) => {
  const s = slugify(name.replace(/\b(pvt|private|ltd|limited|llp)\b\.?/gi, ""));
  return `https://www.naukri.com/${s}-jobs-in-${slugify(city)}`;
};

/** "Whitefield, Bangalore" — or just the city when the area is unknown. */
export const placeLabel = (c: { area: string | null; city: string }) => (c.area ? `${c.area}, ${c.city}` : c.city);

export const splitRoles = (r?: string | null) =>
  (r || "").split(",").map((x) => x.trim()).filter(Boolean);

export function formatDate(d?: string | null) {
  if (!d) return null;
  return new Date(d + (d.length === 10 ? "T00:00:00" : "")).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
