import { NextResponse } from "next/server";
import { PLANS, type PlanId } from "@/lib/config";
import { createOrder, razorpayReady } from "@/lib/razorpay";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  if (!razorpayReady) return NextResponse.json({ error: "Payments are not set up yet" }, { status: 503 });
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Please sign in first" }, { status: 401 });

  const { plan } = (await req.json().catch(() => ({}))) as { plan?: PlanId };
  if (!PLANS.some((p) => p.id === plan)) return NextResponse.json({ error: "Unknown plan" }, { status: 400 });

  try {
    const order = await createOrder(user.id, plan!);
    return NextResponse.json({ orderId: order.id, amount: order.amount, email: user.email });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Could not start payment" }, { status: 502 });
  }
}
