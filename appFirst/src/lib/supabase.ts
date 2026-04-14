import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseKey =
  (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined) ||
  (import.meta.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY as string | undefined);
const fallbackUrl = "https://example.supabase.co";
const fallbackKey = "public-anon-key";

if (!supabaseUrl || !supabaseKey) {
  console.warn(
    "[supabase] Missing VITE_SUPABASE_URL or key. Set VITE_SUPABASE_ANON_KEY (or VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY).",
  );
}

export const supabase = createClient(supabaseUrl || fallbackUrl, supabaseKey || fallbackKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
});

