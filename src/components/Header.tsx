import Link from "next/link";
import { SITE } from "@/lib/config";
import { getViewer, isDemo } from "@/lib/data";
import { Spark } from "./Spark";

export async function Header() {
  const viewer = await getViewer();
  return (
    <header className="sticky top-0 z-20 bg-forest text-paper">
      {isDemo && (
        <div className="bg-amber py-1.5 text-center text-xs font-medium text-ink">
          Demo mode — showing made-up companies. Add your Supabase keys to use real data.
        </div>
      )}
      <div className="container-page flex h-14 items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2 font-display text-xl font-bold tracking-tight">
          <Spark className="h-6 w-6 text-amber" />
          {SITE.name}
        </Link>
        <nav className="flex items-center gap-1 text-sm font-medium sm:gap-3">
          <Link href="/search" className="rounded-lg px-2 py-1.5 hover:bg-white/10">Search</Link>
          <Link href="/pricing" className="rounded-lg px-2 py-1.5 hover:bg-white/10">Pricing</Link>
          {viewer.email ? (
            <Link href="/account" className="rounded-lg px-2 py-1.5 hover:bg-white/10">Account</Link>
          ) : (
            <Link href="/login" className="btn btn-amber px-4 py-1.5 text-sm">Sign in</Link>
          )}
        </nav>
      </div>
    </header>
  );
}
