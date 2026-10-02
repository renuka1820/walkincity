import { NextResponse } from "next/server";
import { grantFromOrder, verifyWebhookSignature } from "@/lib/razorpay";

// Backup path: Razorpay calls this even if the visitor closes the tab after paying.
// Set it up in Razorpay Dashboard → Webhooks → URL: https://YOURSITE/api/razorpay/webhook, event: order.paid
export async function POST(req: Request) {
  const raw = await req.text();
  if (!verifyWebhookSignature(raw, req.headers.get("x-razorpay-signature") || "")) {
    return NextResponse.json({ error: "bad signature" }, { status: 400 });
  }
  const event = JSON.parse(raw);
  if (event.event === "order.paid") {
    try {
      await grantFromOrder(event.payload.order.entity, event.payload.payment.entity.id);
    } catch (e) {
      console.error("webhook grant failed", e);
      return NextResponse.json({ error: "grant failed" }, { status: 500 }); // Razorpay will retry
    }
  }
  return NextResponse.json({ ok: true });
}
