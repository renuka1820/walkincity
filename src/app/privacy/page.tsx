import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";
import { SITE } from "@/lib/config";

export const metadata: Metadata = { title: "Privacy Policy" };

export default function Privacy() {
  return (
    <LegalPage title="Privacy Policy" updated="2 October 2026">
      <p>{SITE.name} (&quot;we&quot;, &quot;us&quot;) is operated by {SITE.legalName}, {SITE.address}. This policy explains what personal data we collect and how we use it, in line with India&apos;s Digital Personal Data Protection Act, 2023.</p>
      <h2>What we collect</h2>
      <ul>
        <li><strong>Account data:</strong> your email address, and your name and profile photo if you sign in with Google.</li>
        <li><strong>Payment data:</strong> when you buy a plan, Razorpay processes your payment. We receive the payment ID, amount and status — we never see or store your card, UPI or bank details.</li>
        <li><strong>Usage data:</strong> pages viewed, device and browser type, approximate location and referring site, collected through Google Analytics and Microsoft Clarity (which can record clicks and scrolling to help us improve the site).</li>
      </ul>
      <h2>How we use it</h2>
      <ul>
        <li>To sign you in and give you the access you paid for.</li>
        <li>To send service emails (sign-in links, payment receipts). We don&apos;t send marketing emails unless you opt in.</li>
        <li>To understand which pages are useful and fix problems.</li>
      </ul>
      <h2>Who we share it with</h2>
      <p>Only service providers that run the site: Supabase (database and login), our hosting provider, Razorpay (payments), Google Analytics and Microsoft Clarity. We do not sell your data.</p>
      <h2>Company information</h2>
      <p>The company details on this site come from public sources such as government company registers and companies&apos; own websites. If you represent a listed company and want a correction, contact us.</p>
      <h2>Your choices</h2>
      <p>You can ask us to access, correct or delete your personal data at any time by emailing {SITE.contactEmail}. We keep payment records as long as tax law requires.</p>
      <h2>Cookies</h2>
      <p>We use essential cookies to keep you signed in, and analytics cookies from Google and Microsoft. You can block cookies in your browser; the site will still work, but you&apos;ll need to sign in again each visit.</p>
      <h2>Contact</h2>
      <p>Grievance contact: {SITE.legalName}, {SITE.contactEmail}, {SITE.contactPhone}.</p>
    </LegalPage>
  );
}
