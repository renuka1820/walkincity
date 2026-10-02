import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { HiringBadge } from "@/components/HiringBadge";
import { LockedNotice } from "@/components/LockedNotice";
import { getCompany, getDetails, getViewer } from "@/lib/data";
import { areaSlug, citySlug, formatDate, industrySlug, linkedinCompanyJobs, linkedinJobsUrl, naukriUrl, placeLabel, splitRoles, toUrl } from "@/lib/utils";

export async function generateMetadata({ params }: PageProps<"/company/[slug]">): Promise<Metadata> {
  const c = await getCompany((await params).slug);
  if (!c) return {};
  const status = c.hiring_status === "Hiring" ? "is hiring" : c.hiring_status === "Not hiring" ? "is not hiring right now" : "hiring status";
  return {
    title: `${c.company_name} jobs in ${placeLabel(c)}`,
    description: `${c.company_name} (${c.industry}, ${placeLabel(c)}) ${status}. Last checked ${formatDate(c.last_checked) || "soon"}. See open roles and the careers page.`,
    alternates: { canonical: `/company/${c.slug}` },
  };
}

export default async function CompanyPage({ params }: PageProps<"/company/[slug]">) {
  const { slug } = await params;
  const c = await getCompany(slug);
  if (!c) notFound();
  const viewer = await getViewer();
  const d = viewer.hasAccess ? (await getDetails([c.id]))[c.id] : undefined;
  const roles = splitRoles(d?.open_roles);

  return (
    <div className="container-page max-w-3xl py-6 sm:py-10">
      <nav className="text-sm text-ink-soft">
        <Link href="/search" className="hover:underline">Search</Link> /{" "}
        <Link href={`/${citySlug(c.city)}`} className="hover:underline">{c.city}</Link>
        {c.area && <> / <Link href={`/${citySlug(c.city)}/${areaSlug(c.area)}`} className="hover:underline">{c.area}</Link></>}
      </nav>

      <div className="mt-4 rounded-3xl border border-line bg-card p-5 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">{c.company_name}</h1>
          <HiringBadge status={c.hiring_status} />
        </div>

        <dl className="mt-5 grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
          {[
            ["Industry", <Link key="i" className="hover:underline" href={`/${citySlug(c.city)}/${industrySlug(c.industry)}`}>{c.industry}</Link>],
            ["City", <Link key="c" className="hover:underline" href={`/${citySlug(c.city)}`}>{c.city}</Link>],
            ["Area", c.area ? <Link key="a" className="hover:underline" href={`/${citySlug(c.city)}/${areaSlug(c.area)}`}>{c.area}</Link> : "—"],
            ["Last checked", formatDate(c.last_checked) || "Not yet"],
          ].map(([k, v]) => (
            <div key={k as string}>
              <dt className="text-xs uppercase tracking-wide text-ink-soft">{k}</dt>
              <dd className="mt-0.5 font-medium">{v}</dd>
            </div>
          ))}
        </dl>

        <hr className="my-6 border-line" />

        {d ? (
          <>
            <h2 className="font-semibold">Open roles</h2>
            {roles.length ? (
              <ul className="mt-2 flex flex-wrap gap-2">
                {roles.map((r) => <li key={r} className="rounded-lg bg-chip px-3 py-1.5 text-sm">{r}</li>)}
              </ul>
            ) : (
              <p className="mt-1 text-sm text-ink-soft">No specific roles listed. Check the careers page for the latest.</p>
            )}
            <div className="mt-6 grid gap-2 sm:grid-cols-3">
              {toUrl(d.careers_url) ? (
                <a className="btn btn-accent" href={toUrl(d.careers_url)!} target="_blank" rel="noopener nofollow">Careers page ↗</a>
              ) : toUrl(d.website) ? (
                <a className="btn btn-accent" href={toUrl(d.website)!} target="_blank" rel="noopener nofollow">Website ↗</a>
              ) : null}
              <a className="btn btn-ghost" href={toUrl(d.linkedin_url) ? linkedinCompanyJobs(toUrl(d.linkedin_url)!) : linkedinJobsUrl(c.company_name, c.city)} target="_blank" rel="noopener nofollow">
                Check on LinkedIn ↗
              </a>
              <a className="btn btn-ghost" href={naukriUrl(c.company_name, c.city)} target="_blank" rel="noopener nofollow">Check on Naukri ↗</a>
            </div>
          </>
        ) : (
          <LockedNotice viewer={viewer} next={`/company/${c.slug}`} />
        )}
      </div>

      <p className="mt-4 text-xs text-ink-soft">
        Status is based on the company&apos;s public careers page on the date shown. Always apply through official channels — companies never ask for money to hire.
      </p>
    </div>
  );
}
