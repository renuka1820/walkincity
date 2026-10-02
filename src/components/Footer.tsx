import Link from "next/link";
import { SITE } from "@/lib/config";
import { getFacets } from "@/lib/data";
import { citySlug } from "@/lib/utils";

export async function Footer() {
  const { cities, industries } = await getFacets();
  return (
    <footer className="mt-16 bg-forest-deep text-paper">
      <div className="container-page grid gap-8 py-10 text-sm sm:grid-cols-3">
        <div>
          <p className="font-display text-xl font-bold">{SITE.name}</p>
          <p className="mt-2 text-paper/70">{SITE.tagline}. {SITE.updateSchedule}.</p>
        </div>
        <div>
          <p className="font-semibold">Browse by city</p>
          <ul className="mt-2 space-y-1.5 text-paper/70">
            {cities.map((c) => (
              <li key={c.name}><Link className="hover:text-amber" href={`/${citySlug(c.name)}`}>Companies hiring in {c.name}</Link></li>
            ))}
            {industries.slice(0, 4).map((i) => (
              <li key={i.name}><Link className="hover:text-amber" href={`/search?industry=${encodeURIComponent(i.name)}`}>{i.name} companies</Link></li>
            ))}
          </ul>
        </div>
        <div>
          <p className="font-semibold">Company</p>
          <ul className="mt-2 space-y-1.5 text-paper/70">
            <li><Link className="hover:text-amber" href="/pricing">Pricing</Link></li>
            <li><Link className="hover:text-amber" href="/contact">Contact</Link></li>
            <li><Link className="hover:text-amber" href="/privacy">Privacy Policy</Link></li>
            <li><Link className="hover:text-amber" href="/terms">Terms</Link></li>
            <li><Link className="hover:text-amber" href="/refund-policy">Refund Policy</Link></li>
          </ul>
        </div>
      </div>
      <p className="container-page pb-24 text-xs text-paper/70">
        © {new Date().getFullYear()} {SITE.name}. Hiring status is checked by hand from public careers pages and may change — always confirm on the company&apos;s site.
      </p>
    </footer>
  );
}
