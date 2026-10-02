import type { Metadata } from "next";
import Link from "next/link";
import { BuyButton } from "@/components/BuyButton";
import { FREE_FEATURES, PAID_FEATURES, PLANS, SITE } from "@/lib/config";
import { getViewer } from "@/lib/data";
import { razorpayReady } from "@/lib/razorpay";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Pricing",
  description: `Weekly, monthly and 3-month plans for ${SITE.name}. One-time payments, no auto-renewal.`,
};

export default async function PricingPage() {
  const viewer = await getViewer();
  const canPay = viewer.paywallEnabled && razorpayReady;

  return (
    <div className="container-page py-10">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Simple plans. No auto-renew.</h1>
        <p className="mt-3 text-ink-soft">Pay once for the time you&apos;re job hunting. When it ends, it just ends.</p>
        {!viewer.paywallEnabled && (
          <p className="mt-5 inline-block rounded-full bg-hire-soft px-4 py-2 text-sm font-semibold text-hire">
            🎉 Free launch: everything is unlocked for signed-in users right now
          </p>
        )}
        {viewer.expiresAt && (
          <p className="mt-5 text-sm font-medium">Your plan is active until {formatDate(viewer.expiresAt.slice(0, 10))}. Buying again adds time.</p>
        )}
      </div>

      <div className="mx-auto mt-10 grid max-w-4xl gap-4 sm:grid-cols-3">
        {PLANS.map((p) => {
          const best = p.id === "monthly";
          return (
            <div key={p.id} className={`flex flex-col rounded-3xl border bg-card p-6 ${best ? "border-accent ring-2 ring-accent/30" : "border-line"}`}>
              <p className="text-sm font-semibold text-ink-soft">{p.name}</p>
              <p className="mt-2 text-4xl font-extrabold">₹{p.priceInr}</p>
              <p className="mt-1 text-sm text-ink-soft">₹{(p.priceInr / p.days).toFixed(1)}/day · {p.note}</p>
              <ul className="my-6 flex-1 space-y-2 text-sm">
                {PAID_FEATURES.map((f) => <li key={f} className="flex gap-2"><span className="text-hire">✓</span>{f}</li>)}
              </ul>
              {!viewer.email ? (
                <Link href="/login?next=/pricing" className={`btn w-full ${best ? "btn-accent" : "btn-primary"}`}>
                  {viewer.paywallEnabled ? "Sign in to buy" : "Sign in — free for now"}
                </Link>
              ) : canPay ? (
                <BuyButton plan={p.id} label={p.name} siteName={SITE.name} highlight={best} />
              ) : (
                <span className="btn btn-ghost w-full cursor-default">{viewer.hasAccess ? "You have full access" : "Coming soon"}</span>
              )}
            </div>
          );
        })}
      </div>

      <div className="mx-auto mt-10 max-w-4xl rounded-2xl border border-line bg-card p-6 text-sm">
        <p className="font-semibold">Always free</p>
        <ul className="mt-2 grid gap-1 text-ink-soft sm:grid-cols-3">
          {FREE_FEATURES.map((f) => <li key={f}>✓ {f}</li>)}
        </ul>
        <p className="mt-4 text-ink-soft">
          Payments by Razorpay (UPI, cards, net banking). See our <Link href="/refund-policy" className="underline">refund policy</Link>.
        </p>
      </div>
    </div>
  );
}
