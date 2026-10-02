import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";
import { SITE } from "@/lib/config";

export const metadata: Metadata = { title: "Contact us" };

export default function Contact() {
  return (
    <LegalPage title="Contact us" updated="2 October 2026">
      <p>Questions, corrections to a company listing, or payment issues — we usually reply within one working day.</p>
      <ul>
        <li><strong>Email:</strong> <a className="underline" href={`mailto:${SITE.contactEmail}`}>{SITE.contactEmail}</a></li>
        <li><strong>Phone / WhatsApp:</strong> {SITE.contactPhone}</li>
        <li><strong>Operated by:</strong> {SITE.legalName}</li>
        <li><strong>Address:</strong> {SITE.address}</li>
      </ul>
      <p>For a payment issue, please include your registered email and the Razorpay payment ID from your receipt.</p>
    </LegalPage>
  );
}
