# WalkInCity — Company Hiring Directory (Bangalore, Delhi, Gurgaon, Noida)

Next.js 16 + Tailwind CSS + Supabase. Mobile-first. Built from the 4-week plan.

**What's already built**

| Plan item | Where |
|---|---|
| Homepage — search (city + industry + area), city cards, live count, "Updated every Monday & Wednesday" | `src/app/page.tsx` |
| Search results — cards with green/grey hiring badge; roles & links locked for non-members | `src/app/search/` |
| Company page — Careers page / Check on LinkedIn / Check on Naukri buttons | `src/app/company/[slug]/` |
| Pricing — weekly / monthly / 3-month | `src/app/pricing/`, prices in `src/lib/config.ts` |
| City pages — `/bangalore`, `/gurgaon`, `/noida`, `/delhi`, plus area and industry pages like `/bangalore/whitefield`, `/gurgaon/it-services-companies`; sitemap, robots | `src/app/[city]/`, `src/app/sitemap.ts` |
| Login — Google + email link (no passwords) | `src/app/login/` |
| Legal — Privacy, Terms, Refund, Contact (needed for Razorpay) | `src/app/privacy` etc. |
| Database — companies, subscriptions, locked columns, free-launch switch | `supabase/schema.sql` |
| Tracking — Google Analytics, Clarity, Search Console (turn on with env vars) | `src/components/Analytics.tsx` |
| Payments — Razorpay order, verify, webhook (off until keys are added) | `src/app/api/razorpay/` |
| Phase 1 data filter for the data.gov.in CSV | `scripts/filter_mca_csv.py` |

Without Supabase keys the site runs in **demo mode** with 33 made-up companies across the four cities, so you can look at it right away.

---

## Run it on your computer

Needs Node.js 20.9 or newer (nodejs.org).

```bash
npm install
npm run dev          # open http://localhost:3000
```

Preview the "subscriber" view in demo mode: `DEMO_UNLOCKED=1 npm run dev`.

## Step 1 — Your company data

`data/companies_import_supabase.csv` is ready to import: 400 companies, 100 each for Bangalore, Delhi, Gurgaon and Noida.

- `city` decides which city page a company appears on. **A new city name creates a new city page automatically** — no code change.
- `area` is the neighbourhood (Whitefield, Cyber City…). Leave blank if unknown; the company still shows under its city.
- `hiring_status` must be exactly `Hiring`, `Not hiring` or `Unknown`.
- `last_checked` is a date like `2026-10-05`. `open_roles` is comma-separated.
- See `data/companies_template.csv` for the format when adding more.

## Step 2 — Set up Supabase (Phase 3)

1. Create a project at supabase.com (region: Mumbai).
2. **SQL Editor → New query** → paste all of `supabase/schema.sql` → **Run**.
3. **Table Editor → companies → Insert → Import data from CSV** → upload `data/companies_import_supabase.csv`. (Optional: run `supabase/demo_seed.sql` instead to test with fake rows.)
   - Already ran an older `schema.sql`? Just run the new one again — it adds the city column and keeps your rows.
4. **Authentication → Sign In / Providers**: Email is on by default. Turn on **Google** (needs a Google Cloud OAuth client — Supabase shows the steps and the callback URL to paste).
5. **Authentication → URL Configuration**: Site URL = your live address; add `http://localhost:3000/**` and `https://YOUR-SITE.netlify.app/**` to Redirect URLs.
6. Copy `.env.example` to `.env.local` and fill in the Supabase URL and keys (**Project Settings → API**).

## Step 3 — Put it online (Phase 4)

1. Create an empty repository on GitHub, then:
   ```bash
   git remote add origin https://github.com/YOUR-USER/walkincity.git
   git push -u origin main
   ```
2. Netlify → **Add new project → Import from GitHub** → pick the repo. Build settings are detected automatically.
3. **Site configuration → Environment variables** → add everything from your `.env.local` (set `NEXT_PUBLIC_SITE_URL` to the netlify.app address).
4. Deploy. Every `git push` redeploys automatically.

## Step 4 — Tracking (Phase 5)

Add `NEXT_PUBLIC_GA_ID`, `NEXT_PUBLIC_CLARITY_ID`, `NEXT_PUBLIC_GSC_VERIFICATION` in Netlify, redeploy, then submit `https://YOUR-SITE/sitemap.xml` in Search Console.

## Step 5 — Payments (Phase 6)

1. Before applying: edit `SITE` in `src/lib/config.ts` (legal name, phone, address) — they appear on the legal pages Razorpay checks.
2. After KYC: add `NEXT_PUBLIC_RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `SUPABASE_SERVICE_ROLE_KEY` in Netlify.
3. Razorpay Dashboard → **Webhooks** → URL `https://YOUR-SITE/api/razorpay/webhook`, event **order.paid**, set a secret → put it in `RAZORPAY_WEBHOOK_SECRET`.
4. Test with Razorpay **test-mode** keys first.
5. Turn on the paywall — Supabase SQL Editor:
   ```sql
   update app_settings set paywall_enabled = true;
   ```
   Until then, every signed-in user sees everything (free launch).

Give someone free access manually (e.g. early users):
```sql
insert into subscriptions (user_id, plan, expires_at)
select id, 'manual', now() + interval '30 days' from auth.users where email = 'friend@example.com';
```

## Weekly updates

Supabase → Table Editor → companies → edit `hiring_status`, `open_roles`, `last_checked`. Changes show on the site immediately — no redeploy.

## How the lock works

Visitors can only read the public columns (name, area, industry, status). Roles and links come from the `company_details()` database function, which returns nothing unless `has_access()` is true. So locked data can't be pulled from the browser, even by someone who inspects the page.
