import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";
import { SITE } from "@/lib/config";

export const metadata: Metadata = { title: "Refund & Cancellation Policy" };

export default function Refund() {
  return (
    <LegalPage title="Refund & Cancellation Policy" updated="2 October 2026">
      <h2>Cancellation</h2>
      <p>All plans are one-time payments that do not renew automatically, so there is nothing to cancel. Your access simply ends when your plan expires.</p>
      <h2>Refunds</h2>
      <ul>
        <li>If you&apos;re not happy, email {SITE.contactEmail} within <strong>3 days</strong> of payment with your registered email and Razorpay payment ID, and we&apos;ll refund you in full — no questions asked, once per person.</li>
        <li>If you were charged twice or charged without getting access, we&apos;ll refund the extra amount in full at any time.</li>
        <li>Approved refunds are sent to your original payment method within <strong>5–7 working days</strong>. Your bank may take a few more days to show it.</li>
        <li>Access to the plan ends when the refund is issued.</li>
      </ul>
      <h2>Contact</h2>
      <p>{SITE.legalName} · {SITE.contactEmail} · {SITE.contactPhone} · {SITE.address}</p>
    </LegalPage>
  );
}
