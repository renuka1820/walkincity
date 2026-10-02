"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { PlanId } from "@/lib/config";

type RazorpayResponse = { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string };
declare global {
  interface Window {
    Razorpay?: new (opts: Record<string, unknown>) => { open: () => void };
  }
}

function loadCheckout() {
  return new Promise<boolean>((resolve) => {
    if (window.Razorpay) return resolve(true);
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });
}

export function BuyButton({ plan, label, siteName, highlight }: { plan: PlanId; label: string; siteName: string; highlight?: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function buy() {
    setBusy(true);
    setError("");
    try {
      if (!(await loadCheckout())) throw new Error("Couldn't load Razorpay. Check your connection.");
      const res = await fetch("/api/razorpay/order", { method: "POST", body: JSON.stringify({ plan }) });
      const order = await res.json();
      if (!res.ok) throw new Error(order.error);
      new window.Razorpay!({
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        order_id: order.orderId,
        amount: order.amount,
        currency: "INR",
        name: siteName,
        description: label,
        prefill: { email: order.email },
        theme: { color: "#3a2119" },
        handler: async (r: RazorpayResponse) => {
          const v = await fetch("/api/razorpay/verify", { method: "POST", body: JSON.stringify(r) });
          if (v.ok) router.push("/account?paid=1");
          else setError((await v.json()).error || "Activation failed — contact us with your payment ID.");
        },
        modal: { ondismiss: () => setBusy(false) },
      }).open();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
      setBusy(false);
    }
  }

  return (
    <div>
      <button onClick={buy} disabled={busy} className={`btn w-full ${highlight ? "btn-accent" : "btn-primary"} disabled:opacity-60`}>
        {busy ? "Opening…" : `Get ${label}`}
      </button>
      {error && <p className="mt-2 text-sm text-red-700">{error}</p>}
    </div>
  );
}
