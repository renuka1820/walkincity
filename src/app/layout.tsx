import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { Analytics } from "@/components/Analytics";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { ScrollBuddy } from "@/components/ScrollBuddy";
import { SITE } from "@/lib/config";
import "@fontsource-variable/fraunces";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: `${SITE.name} — Which companies in your city are hiring?`, template: `%s | ${SITE.name}` },
  description: `${SITE.tagline}. Hiring status, open roles and careers links for companies in Bangalore, Delhi, Gurgaon and Noida. ${SITE.updateSchedule}.`,
  openGraph: { siteName: SITE.name, type: "website", locale: "en_IN" },
  verification: process.env.NEXT_PUBLIC_GSC_VERIFICATION
    ? { google: process.env.NEXT_PUBLIC_GSC_VERIFICATION }
    : undefined,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en-IN" data-theme={SITE.theme} className={`${GeistSans.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <ScrollBuddy />
        <Analytics />
      </body>
    </html>
  );
}
