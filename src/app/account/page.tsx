import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getViewer } from "@/lib/data";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Your account", robots: { index: false } };

export default async function AccountPage({ searchParams }: PageProps<"/account">) {
  const viewer = await getViewer();
  if (!viewer.email) redirect("/login?next=/account");
  const { paid } = await searchParams;
  return (
    <div className="container-page max-w-lg py-10">
      {paid && <p className="mb-4 rounded-xl bg-hire-soft p-4 text-sm font-semibold text-hire">Payment successful — you&apos;re all set!</p>}
      <div className="rounded-3xl border border-line bg-card p-6">
        <h1 className="text-2xl font-extrabold">Your account</h1>
        <p className="mt-1 text-ink-soft">{viewer.email}</p>
        <hr className="my-5 border-line" />
        <p className="font-semibold">Access</p>
        <p className="mt-1 text-sm text-ink-soft">
          {viewer.expiresAt
            ? `Paid plan active until ${formatDate(viewer.expiresAt.slice(0, 10))}.`
            : viewer.hasAccess
              ? "Free launch access — everything is unlocked."
              : "Free account. Subscribe to see roles and links."}
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          <Link href="/search" className="btn btn-primary">Search companies</Link>
          {!viewer.expiresAt && viewer.paywallEnabled && <Link href="/pricing" className="btn btn-accent">See plans</Link>}
          <form action="/auth/signout" method="post"><button className="btn btn-ghost">Sign out</button></form>
        </div>
      </div>
    </div>
  );
}
