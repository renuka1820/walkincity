export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
// Supabase calls this the "publishable" key (older projects: "anon" key). Safe to expose.
export const SUPABASE_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
export const hasSupabase = Boolean(SUPABASE_URL && SUPABASE_KEY);
