import type { Facets, Filters } from "@/lib/data";

/**
 * Plain GET form, so it works without JavaScript.
 * Areas are grouped by city; once a city is chosen and searched, only that city's areas are listed.
 */
export function SearchForm({ facets, values = {}, compact = false }: { facets: Facets; values?: Filters; compact?: boolean }) {
  const { cities, areas, industries } = facets;
  const areaCities = [...new Set(areas.map((a) => a.city))];
  return (
    <form action="/search" method="get" className={`grid gap-2.5 ${compact ? "grid-cols-2 lg:grid-cols-[1.3fr_.9fr_1fr_1fr_auto_auto]" : "sm:grid-cols-2"}`}>
      <label className={compact ? "col-span-2 lg:col-span-1" : "sm:col-span-2"}>
        <span className="sr-only">Company name</span>
        <input id="search-q" name="q" defaultValue={values.q} placeholder="Company name (optional)" className="field" />
      </label>
      <label className={compact ? "col-span-2 lg:col-span-1" : "sm:col-span-2"}>
        <span className="sr-only">City</span>
        <select id="search-city" name="city" defaultValue={values.city || ""} className="field">
          <option value="">All cities</option>
          {cities.map((c) => <option key={c.name} value={c.name}>{c.name} ({c.total})</option>)}
        </select>
      </label>
      <label>
        <span className="sr-only">Industry</span>
        <select id="search-industry" name="industry" defaultValue={values.industry || ""} className="field">
          <option value="">All industries</option>
          {industries.map((i) => <option key={i.name} value={i.name}>{i.name} ({i.total})</option>)}
        </select>
      </label>
      <label>
        <span className="sr-only">Area</span>
        <select id="search-area" name="area" defaultValue={values.area || ""} className="field">
          <option value="">All areas</option>
          {areaCities.length > 1
            ? areaCities.map((city) => (
                <optgroup key={city} label={city}>
                  {areas.filter((a) => a.city === city).map((a) => <option key={a.name} value={a.name}>{a.name} ({a.total})</option>)}
                </optgroup>
              ))
            : areas.map((a) => <option key={a.name} value={a.name}>{a.name} ({a.total})</option>)}
        </select>
      </label>
      <label className={`flex items-center gap-2 rounded-[.9rem] border border-line-strong bg-field px-3 py-2.5 text-sm ${compact ? "" : "sm:col-span-2"}`}>
        <input id="search-hiring" type="checkbox" name="hiring" value="1" defaultChecked={values.hiring} className="h-4 w-4 accent-[var(--color-hire)]" />
        Hiring only
      </label>
      <button type="submit" className={`btn btn-accent ${compact ? "" : "sm:col-span-2 py-3 text-base"}`}>
        Search companies
      </button>
    </form>
  );
}
