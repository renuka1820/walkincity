import { NextResponse } from "next/server";
import { fetchOrder, grantFromOrder, verifyPaymentSignature } from "@/lib/razorpay";
import { createClient } from "@/lib/supabase/server";

// Called by the browser right after Razorpay Checkout succeeds.
export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const b = (await req.json().catch(() => ({}))) as Record<string, string>;
  const { razorpay_order_id: orderId, razorpay_payment_id: paymentId, razorpay_signature: sig } = b;
  if (!orderId || !paymentId || !sig || !verifyPaymentSignature(orderId, paymentId, sig)) {
    return NextResponse.json({ error: "Invalid payment signature" }, { status: 400 });
  }
  try {
    const order = await fetchOrder(orderId);
    if (order.notes.user_id !== user.id) return NextResponse.json({ error: "Order belongs to another user" }, { status: 403 });
    const expiresAt = await grantFromOrder(order, paymentId);
    return NextResponse.json({ ok: true, expiresAt });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Payment received but activation failed — contact us" }, { status: 500 });
  }
}
