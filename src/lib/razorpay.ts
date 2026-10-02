import "server-only";
import crypto from "node:crypto";
import { PLANS, type PlanId } from "./config";
import { createAdminClient } from "./supabase/server";

const KEY_ID = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "";
const KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || "";
export const razorpayReady = Boolean(KEY_ID && KEY_SECRET);

async function rzp<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`https://api.razorpay.com/v1${path}`, {
    ...init,
    headers: {
      Authorization: "Basic " + Buffer.from(`${KEY_ID}:${KEY_SECRET}`).toString("base64"),
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Razorpay ${path} failed: ${res.status} ${await res.text()}`);
  return res.json();
}

type Order = { id: string; amount: number; status: string; notes: { user_id?: string; plan?: string } };

export function createOrder(userId: string, planId: PlanId) {
  const plan = PLANS.find((p) => p.id === planId);
  if (!plan) throw new Error("Unknown plan");
  return rzp<Order>("/orders", {
    method: "POST",
    body: JSON.stringify({
      amount: plan.priceInr * 100, // paise
      currency: "INR",
      receipt: `wic_${Date.now()}`,
      notes: { user_id: userId, plan: plan.id },
    }),
  });
}

export const fetchOrder = (id: string) => rzp<Order>(`/orders/${id}`);

const safeEqual = (a: string, b: string) =>
  a.length === b.length && crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));

export function verifyPaymentSignature(orderId: string, paymentId: string, signature: string) {
  const expected = crypto.createHmac("sha256", KEY_SECRET).update(`${orderId}|${paymentId}`).digest("hex");
  return safeEqual(expected, signature);
}

export function verifyWebhookSignature(rawBody: string, signature: string) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET || "";
  if (!secret) return false;
  const expected = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
  return safeEqual(expected, signature);
}

/** Records the payment and returns the new expiry. Safe to call twice for one payment. */
export async function grantFromOrder(order: Order, paymentId: string) {
  const plan = PLANS.find((p) => p.id === order.notes.plan);
  if (!plan || !order.notes.user_id) throw new Error("Order is missing plan/user notes");
  if (order.amount !== plan.priceInr * 100) throw new Error("Amount mismatch");
  const { data, error } = await createAdminClient().rpc("grant_subscription", {
    p_user_id: order.notes.user_id,
    p_plan: plan.id,
    p_days: plan.days,
    p_payment_id: paymentId,
  });
  if (error) throw new Error(error.message);
  return data as string;
}
