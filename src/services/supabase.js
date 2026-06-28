// Supabase client — handles auth (login/signup/password reset) and, later,
// per-user data sync. Credentials come from env (Vite) so they never get
// hard-coded; the anon key is safe to ship (Row Level Security guards the data).
//
// Set these in `.env` (and Render/CI):
//   VITE_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
//   VITE_SUPABASE_ANON_KEY=YOUR-ANON-PUBLIC-KEY
import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = !!(url && anonKey);

if (!isSupabaseConfigured) {
  // Loud in dev, harmless in prod — makes a missing .env obvious immediately.
  console.warn(
    "[supabase] VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY are not set — auth will not work."
  );
}

// `createClient` throws on an empty URL, which would crash the app before the
// client's keys are added. Fall back to a syntactically valid placeholder so
// the app still boots (to the login screen); real calls just fail until set.
export const supabase = createClient(
  url || "https://placeholder.supabase.co",
  anonKey || "placeholder-anon-key",
  {
    auth: {
      // Persist the session in the WebView's localStorage so the user stays
      // logged in across app restarts; refresh the token automatically.
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: false,
    },
  }
);
