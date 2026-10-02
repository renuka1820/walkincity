import type { Metadata } from "next";
import { SITE } from "@/lib/config";
import { isDemo } from "@/lib/data";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = { title: "Sign in", robots: { index: false } };

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const sp = await searchParams;
  const raw = typeof sp.next === "string" ? sp.next : "/search";
  const next = raw.startsWith("/") && !raw.startsWith("//") ? raw : "/search";
  return (
    <div className="container-page flex justify-center py-12">
      <div className="w-full max-w-sm rounded-3xl border border-line bg-card p-6 sm:p-8">
        <h1 className="text-2xl font-extrabold">Sign in to {SITE.name}</h1>
        <p className="mt-1 mb-6 text-sm text-ink-soft">No password needed.</p>
        <LoginForm next={next} enabled={!isDemo} />
        {sp.error && <p className="mt-4 text-sm text-red-700">That sign-in link expired or was already used. Try again.</p>}
      </div>
    </div>
  );
}
