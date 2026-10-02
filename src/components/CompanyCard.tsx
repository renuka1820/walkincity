import Link from "next/link";
import type { Company, Details } from "@/lib/data";
import { formatDate, placeLabel, splitRoles, toUrl } from "@/lib/utils";
import { HiringBadge } from "./HiringBadge";

export function CompanyCard({ c, details, locked }: { c: Company; details?: Details; locked: boolean }) {
  const roles = splitRoles(details?.open_roles);
  return (
    <article className="flex flex-col rounded-2xl border border-line bg-card p-4 shadow-[0_1px_0_rgba(0,0,0,0.03)] transition hover:border-line-strong">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-semibold leading-snug">
            <Link href={`/company/${c.slug}`} className="hover:underline">{c.company_name}</Link>
          </h3>
          <p className="mt-0.5 text-sm text-ink-soft">{placeLabel(c)} · {c.industry}</p>
        </div>
        <HiringBadge status={c.hiring_status} />
      </div>

      <div className="mt-3 flex-1">
        {locked ? (
          c.hiring_status === "Hiring" && (
            <div className="relative" aria-label="Open roles locked">
              <div className="flex select-none flex-wrap gap-1.5 blur-[5px]" aria-hidden>
                <span className="rounded-md bg-chip px-2 py-1 text-xs">Software Engineer</span>
                <span className="rounded-md bg-chip px-2 py-1 text-xs">Executive</span>
              </div>
              <span className="absolute inset-0 flex items-center bg-card/70 text-xs font-medium text-ink-soft">🔒 Roles visible to members</span>
            </div>
          )
        ) : roles.length ? (
          <div className="flex flex-wrap gap-1.5">
            {roles.slice(0, 4).map((r) => <span key={r} className="rounded-md bg-chip px-2 py-1 text-xs">{r}</span>)}
            {roles.length > 4 && <span className="px-1 py-1 text-xs text-ink-soft">+{roles.length - 4} more</span>}
          </div>
        ) : null}
      </div>

      <div className="mt-4 flex items-center justify-between gap-2 text-xs text-ink-soft">
        <span>{c.last_checked ? `Checked ${formatDate(c.last_checked)}` : "Not checked yet"}</span>
        {!locked && details?.careers_url ? (
          <a href={toUrl(details.careers_url)!} target="_blank" rel="noopener nofollow" className="font-semibold text-ink hover:underline">
            Careers page ↗
          </a>
        ) : (
          <Link href={`/company/${c.slug}`} className="font-semibold text-ink hover:underline">Details →</Link>
        )}
      </div>
    </article>
  );
}
