-- WalkInCity — Supabase schema
-- Run this once in Supabase: Dashboard → SQL Editor → New query → paste → Run.
-- Safe to re-run: it uses "if not exists" / "or replace" where possible.

-- ─────────────────────────────────────────────────────────────
-- 1. Companies (you edit this table on Monday/Wednesday nights)
-- ─────────────────────────────────────────────────────────────
create table if not exists public.companies (
  id            uuid primary key default gen_random_uuid(),
  company_name  text not null,
  city          text not null default 'Bangalore',
  industry      text not null default 'Other',
  area          text,          -- neighbourhood, e.g. Whitefield. Leave blank if unknown.
  pin_code      text,
  website       text,
  careers_url   text,
  linkedin_url  text,
  hiring_status text not null default 'Unknown'
                check (hiring_status in ('Hiring', 'Not hiring', 'Unknown')),
  open_roles    text,          -- comma separated, e.g. "Java Developer, HR Executive"
  last_checked  date,
  created_at    timestamptz not null default now()
);

-- Upgrading an older install (before cities were added): these lines are safe to re-run.
alter table public.companies add column if not exists city text not null default 'Bangalore';
alter table public.companies alter column area drop not null;
alter table public.companies alter column area drop default;

-- URL-friendly name, built automatically: "abc-technologies-pvt-ltd-bangalore-560066"
alter table public.companies drop column if exists slug;
alter table public.companies add column slug text generated always as (
  trim(both '-' from regexp_replace(
    lower(company_name || '-' || city || coalesce('-' || pin_code, '')), '[^a-z0-9]+', '-', 'g'))
) stored unique;

create index if not exists companies_city_idx     on public.companies (city);
create index if not exists companies_area_idx     on public.companies (area);
create index if not exists companies_industry_idx on public.companies (industry);
create index if not exists companies_status_idx   on public.companies (hiring_status);

-- ─────────────────────────────────────────────────────────────
-- 2. Subscriptions (written only by the server after a payment)
-- ─────────────────────────────────────────────────────────────
create table if not exists public.subscriptions (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid not null references auth.users (id) on delete cascade,
  plan                text not null,           -- weekly | monthly | quarterly | manual
  expires_at          timestamptz not null,
  razorpay_payment_id text unique,             -- stops the same payment counting twice
  created_at          timestamptz not null default now()
);
create index if not exists subscriptions_user_idx on public.subscriptions (user_id, expires_at desc);

-- ─────────────────────────────────────────────────────────────
-- 3. Site settings — one row. Flip paywall_enabled to true in Week 4.
--    While false, ANY signed-in user sees full details (free launch).
-- ─────────────────────────────────────────────────────────────
create table if not exists public.app_settings (
  id              int primary key default 1 check (id = 1),
  paywall_enabled boolean not null default false
);
insert into public.app_settings (id) values (1) on conflict (id) do nothing;

-- ─────────────────────────────────────────────────────────────
-- 4. Security
--    Visitors can read only the public columns (name, area, industry,
--    status…). Roles and links come through company_details(), which
--    checks has_access(). Nobody but the server can write.
-- ─────────────────────────────────────────────────────────────
alter table public.companies     enable row level security;
alter table public.subscriptions enable row level security;
alter table public.app_settings  enable row level security;

drop policy if exists "companies readable" on public.companies;
create policy "companies readable" on public.companies for select using (true);

drop policy if exists "own subscriptions" on public.subscriptions;
create policy "own subscriptions" on public.subscriptions
  for select using (auth.uid() = user_id);

drop policy if exists "settings readable" on public.app_settings;
create policy "settings readable" on public.app_settings for select using (true);

-- Column-level lock: anon/authenticated may only select these columns.
revoke select on public.companies from anon, authenticated;
grant select (id, slug, company_name, city, industry, area, pin_code, hiring_status, last_checked, created_at)
  on public.companies to anon, authenticated;

-- Does the current visitor get full details?
create or replace function public.has_access()
returns boolean
language sql stable security definer set search_path = public
as $$
  select auth.uid() is not null and (
    not coalesce((select paywall_enabled from app_settings where id = 1), false)
    or exists (select 1 from subscriptions
               where user_id = auth.uid() and expires_at > now())
  );
$$;

-- Locked details for a list of companies (empty if no access).
create or replace function public.company_details(ids uuid[])
returns table (id uuid, website text, careers_url text, linkedin_url text, open_roles text)
language sql stable security definer set search_path = public
as $$
  select c.id, c.website, c.careers_url, c.linkedin_url, c.open_roles
  from companies c
  where c.id = any(ids) and public.has_access();
$$;

grant execute on function public.has_access()             to anon, authenticated;
grant execute on function public.company_details(uuid[])  to anon, authenticated;

-- Counts for the homepage, city pages and SEO pages.
drop view if exists public.area_counts;
drop view if exists public.industry_counts;
drop view if exists public.city_counts;

create view public.city_counts with (security_invoker = true) as
  select city, count(*)::int as total,
         count(*) filter (where hiring_status = 'Hiring')::int as hiring
  from public.companies group by city;

create view public.area_counts with (security_invoker = true) as
  select city, area, count(*)::int as total,
         count(*) filter (where hiring_status = 'Hiring')::int as hiring
  from public.companies where coalesce(area, '') <> '' group by city, area;

create view public.industry_counts with (security_invoker = true) as
  select city, industry, count(*)::int as total,
         count(*) filter (where hiring_status = 'Hiring')::int as hiring
  from public.companies group by city, industry;

grant select on public.city_counts, public.area_counts, public.industry_counts to anon, authenticated;

-- ─────────────────────────────────────────────────────────────
-- 5. Called by the payment webhook (service role only).
--    Extends from the later of now / current expiry, so renewing
--    early never loses days.
-- ─────────────────────────────────────────────────────────────
create or replace function public.grant_subscription(
  p_user_id uuid, p_plan text, p_days int, p_payment_id text)
returns timestamptz
language plpgsql security definer set search_path = public
as $$
declare
  v_start timestamptz;
  v_exp   timestamptz;
begin
  select expires_at into v_exp from subscriptions where razorpay_payment_id = p_payment_id;
  if found then return v_exp; end if;  -- already processed

  select greatest(now(), coalesce(max(expires_at), now())) into v_start
  from subscriptions where user_id = p_user_id;

  insert into subscriptions (user_id, plan, expires_at, razorpay_payment_id)
  values (p_user_id, p_plan, v_start + make_interval(days => p_days), p_payment_id)
  returning expires_at into v_exp;
  return v_exp;
end;
$$;
revoke execute on function public.grant_subscription(uuid, text, int, text) from public, anon, authenticated;
