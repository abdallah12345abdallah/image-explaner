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
import {
  syncAppointments,
  clearLocalAppointments,
} from "@/stores/appointments";
import { clearLocalHistory } from "@/stores/history";
import { clearLocalSettings } from "@/stores/settings";

// On login, sync reminders right away so cross-device reminders get scheduled
// with the OS without waiting for the user to open the Reminders tab. History
// and settings sync lazily when their own page is opened. Fire-and-forget.
function syncUserData() {
  syncAppointments().catch(() => {});
}

// Drop the previous user's cached data from this device on sign-out. The data
// itself stays safe on the server.
async function clearUserData() {
  await clearLocalAppointments();
  await clearLocalHistory();
  await clearLocalSettings();
}

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

// The account id whose profile is currently loaded — lets us skip redundant
// fetches when an auth event fires for the same user (initial-session replay,
// token refresh, …).
let loadedProfileUid = null;

async function loadProfile() {
  if (!authStore.user) {
    authStore.profile = null;
    loadedProfileUid = null;
    return;
  }
  const uid = authStore.user.id;
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", uid)
    .single();
  if (!error) {
    authStore.profile = data;
    loadedProfileUid = uid;
  }
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

    // Keep the store in sync on login / logout / token refresh. Only refetch
    // the profile when the account actually changes — this skips the immediate
    // initial-session replay (already handled above) and every token refresh,
    // which were each firing a duplicate `profiles` request.
    supabase.auth.onAuthStateChange((_event, session) => {
      const user = session?.user ?? null;
      authStore.user = user;
      if (!user) {
        authStore.profile = null;
        loadedProfileUid = null;
      } else if (user.id !== loadedProfileUid) {
        loadProfile();
      }
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
  syncUserData();
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
    // Adopt any data the user created as a guest before signing up.
    syncUserData();
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
  // Clear cached reminders/history/settings so the next user on this device
  // doesn't inherit them. The data remains safe on the server.
  await clearUserData();
}

/**
 * Update the editable profile fields (name / nationality / phone) on the user's
 * `profiles` row and refresh the local copy. Throws on failure.
 */
export async function updateProfile({ name, nationality, phone }) {
  if (!authStore.user) throw new Error("not authenticated");
  const patch = {
    name: (name ?? "").trim(),
    nationality: (nationality ?? "").trim(),
    phone: (phone ?? "").trim(),
  };
  const { error } = await supabase
    .from("profiles")
    .update(patch)
    .eq("id", authStore.user.id);
  if (error) throw error;
  // Reflect immediately without an extra round-trip.
  authStore.profile = { ...(authStore.profile || {}), ...patch };
}

/** Change the logged-in user's password. Throws on failure (e.g. too short). */
export async function changePassword(newPassword) {
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) throw error;
}

/**
 * Permanently delete the account and all its data via the `delete_user` RPC
 * (see supabase/schema.sql), then sign out locally. Irreversible.
 */
export async function deleteAccount() {
  const { error } = await supabase.rpc("delete_user");
  if (error) throw error;
  await signOut();
}
