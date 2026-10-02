import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";
import { PLANS, SITE } from "@/lib/config";

export const metadata: Metadata = { title: "Terms of Service" };

export default function Terms() {
  return (
    <LegalPage title="Terms of Service" updated="2 October 2026">
      <p>These terms apply to your use of {SITE.name}, operated by {SITE.legalName}, {SITE.address}. By using the site you agree to them.</p>
      <h2>What we provide</h2>
      <p>{SITE.name} is a directory of Bangalore companies with their hiring status, which we check by hand from public sources (usually every Monday and Wednesday). We are not a recruiter or placement agency, we don&apos;t guarantee that any company is hiring or will hire you, and hiring status can change between our checks. Always confirm on the company&apos;s official careers page.</p>
      <h2>Accounts</h2>
      <p>You need an account to see some details. Keep your sign-in email secure. One account is for one person — don&apos;t share or resell access.</p>
      <h2>Plans and payment</h2>
      <ul>
        {PLANS.map((p) => <li key={p.id}>{p.name}: ₹{p.priceInr}, gives access for {p.days} days from payment.</li>)}
        <li>Payments are one-time and processed by Razorpay. Plans do not renew automatically.</li>
        <li>Prices include applicable taxes unless stated otherwise. We may change prices for future purchases; this doesn&apos;t affect plans you&apos;ve already bought.</li>
      </ul>
      <h2>Acceptable use</h2>
      <p>Don&apos;t scrape, copy or republish the directory in bulk, try to get around the paywall, or use the site for anything unlawful. We may suspend accounts that do.</p>
      <h2>Liability</h2>
      <p>The site is provided &quot;as is&quot;. To the extent the law allows, our total liability to you is limited to the amount you paid us in the last 3 months.</p>
      <h2>Changes and law</h2>
      <p>We may update these terms and will change the date above when we do. These terms are governed by the laws of India, and courts in Bangalore, Karnataka have jurisdiction.</p>
      <h2>Contact</h2>
      <p>{SITE.contactEmail} · {SITE.contactPhone}</p>
    </LegalPage>
  );
}
