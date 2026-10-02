import Link from "next/link";
import type { Viewer } from "@/lib/data";

export function LockedNotice({ viewer, next = "/search" }: { viewer: Viewer; next?: string }) {
  const signedIn = Boolean(viewer.email);
  return (
    <div className="rounded-2xl border border-accent/30 bg-accent-soft p-5">
      <p className="font-semibold">
        {signedIn ? "Subscribe to see open roles and direct links" : "Sign in free to see open roles and direct links"}
      </p>
      <p className="mt-1 text-sm text-ink-soft">
        {signedIn
          ? "Plans start at one week — cancel anytime, nothing auto-renews."
          : viewer.paywallEnabled
            ? "Create an account, then pick a plan."
            : "We're in free launch — everything is unlocked once you sign in."}
      </p>
      <Link href={signedIn ? "/pricing" : `/login?next=${encodeURIComponent(next)}`} className="btn btn-primary mt-4">
        {signedIn ? "See plans" : "Sign in — it's free"}
      </Link>
    </div>
  );
}
