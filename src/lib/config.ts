// Edit this file to change the site name, prices, and contact details.

export const SITE = {
  name: "WalkInCity",
  tagline: "See which companies in your city are hiring right now",
  // Colour option: forest | sky | plum | harbor | midnight | sunny | cobalt
  theme: process.env.NEXT_PUBLIC_THEME || "sky",
  updateSchedule: "Updated every Monday & Wednesday",
  url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",

  // ⚠️ Fill these in before applying to Razorpay — they appear on the legal pages.
  legalName: "[Your full name or business name]",
  contactEmail: "billorerenuka00@gmail.com",
  contactPhone: "[+91 phone number]",
  address: "[Your postal address, Bangalore, Karnataka, PIN]",
};

export type PlanId = "weekly" | "monthly" | "quarterly";

export const PLANS: { id: PlanId; name: string; days: number; priceInr: number; note: string }[] = [
  { id: "weekly", name: "1 week", days: 7, priceInr: 49, note: "Try it during a job hunt sprint" },
  { id: "monthly", name: "1 month", days: 30, priceInr: 149, note: "Most popular" },
  { id: "quarterly", name: "3 months", days: 90, priceInr: 349, note: "Best value — save 22%" },
];

export const FREE_FEATURES = ["Company name, area and industry", "Hiring / not hiring badge", "Search and filter"];
export const PAID_FEATURES = [
  "Open roles for every company",
  "Direct careers page links",
  "One-tap LinkedIn & Naukri checks",
  "Twice-weekly updates",
];
