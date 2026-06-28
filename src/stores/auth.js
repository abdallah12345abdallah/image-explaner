// Auth store — reactive session + profile, backed by Supabase.
//
//   authStore.user     → the logged-in auth user (or null)
//   authStore.profile  → the matching row from `public.profiles` (name, etc.)
//   authStore.ready    → true once the initial session has been restored
//
// The router guard (router/index.js) awaits `authReady` before deciding
// whether to allow a route, so a logged-in user isn't bounced to /login on
// a cold start.
import { reactive } from "vue";
import { supabase } from "@/services/supabase";

export const authStore = reactive({
  user: null,
  profile: null,
  ready: false,
});

// Resolves once the first session restore completes — guards await this.
let markReady;
export const authReady = new Promise((resolve) => {
  markReady = resolve;
});

export const isLoggedIn = () => !!authStore.user;

async function loadProfile() {
  if (!authStore.user) {
    authStore.profile = null;
    return;
  }
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", authStore.user.id)
    .single();
  if (!error) authStore.profile = data;
}

/**
 * Restore any persisted session and start listening for auth changes.
 * Call once at app startup (main.ts).
 */
export async function initAuth() {
  try {
    const { data } = await supabase.auth.getSession();
    authStore.user = data.session?.user ?? null;
    if (authStore.user) await loadProfile();

    // Keep the store in sync on login / logout / token refresh.
    supabase.auth.onAuthStateChange((_event, session) => {
      authStore.user = session?.user ?? null;
      if (authStore.user) loadProfile();
      else authStore.profile = null;
    });
  } catch (e) {
    console.warn("[auth] init failed", e);
  } finally {
    authStore.ready = true;
    markReady();
  }
}

/** Email + password login. Throws on bad credentials (caller shows the message). */
export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim(),
    password,
  });
  if (error) throw error;
  authStore.user = data.user;
  await loadProfile();
  return data.user;
}

/**
 * Create an account. Profile fields (name, nationality, phone, privacy
 * acceptance) are passed as user metadata; a DB trigger copies them into
 * `public.profiles` (see supabase/schema.sql).
 *
 * Returns { needsConfirmation } — true when Supabase requires the user to
 * verify their email before they can log in.
 */
export async function signUp({ name, nationality, phone, email, password, acceptedPrivacy }) {
  const { data, error } = await supabase.auth.signUp({
    email: email.trim(),
    password,
    options: {
      data: {
        name: name?.trim() || "",
        nationality: nationality?.trim() || "",
        phone: phone?.trim() || "",
        accepted_privacy: !!acceptedPrivacy,
      },
    },
  });
  if (error) throw error;

  // When email confirmation is ON, Supabase returns a user but no session.
  const needsConfirmation = !data.session;
  if (data.session) {
    authStore.user = data.user;
    await loadProfile();
  }
  return { needsConfirmation };
}

/**
 * Social login (Google / Facebook) via Supabase OAuth.
 * Requires the provider to be enabled in the Supabase dashboard
 * (Authentication → Providers). On web this redirects the browser; on native
 * it opens the system browser and returns via the app's deep link.
 */
export async function signInWithProvider(provider) {
  const redirectTo =
    typeof window !== "undefined" ? `${window.location.origin}/tabs/home` : undefined;
  const { error } = await supabase.auth.signInWithOAuth({ provider, options: { redirectTo } });
  if (error) throw error;
}

/** Send a password-reset email. Supabase delivers it; user sets a new password. */
export async function sendPasswordReset(email) {
  const redirectTo =
    typeof window !== "undefined" ? `${window.location.origin}/reset-password` : undefined;
  const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo });
  if (error) throw error;
}

export async function signOut() {
  await supabase.auth.signOut();
  authStore.user = null;
  authStore.profile = null;
}
