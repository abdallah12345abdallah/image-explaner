// App settings (currently just the default reminder lead time).
//
// Synced to the user's `profiles` row so the preference follows the account to
// a new device. A local Preferences copy keeps it instant and offline-safe;
// the server value wins on sync (login / app start).
import { reactive } from "vue";
import { Preferences } from "@capacitor/preferences";
import { supabase, isSupabaseConfigured } from "@/services/supabase";
import { withSync } from "@/stores/sync";

const KEY = "wuduh.settings";

export const settingsStore = reactive({
  defaultLeadMinutes: 30,
  loaded: false,
});

async function currentUserId() {
  if (!isSupabaseConfigured) return null;
  try {
    const { data } = await supabase.auth.getSession();
    return data.session?.user?.id ?? null;
  } catch {
    return null;
  }
}

export async function loadSettings() {
  try {
    const { value } = await Preferences.get({ key: KEY });
    if (value) {
      const s = JSON.parse(value);
      if (typeof s.defaultLeadMinutes === "number") {
        settingsStore.defaultLeadMinutes = s.defaultLeadMinutes;
      }
    }
  } catch {
    /* keep defaults */
  }
  settingsStore.loaded = true;
}

async function persist() {
  try {
    await Preferences.set({
      key: KEY,
      value: JSON.stringify({ defaultLeadMinutes: settingsStore.defaultLeadMinutes }),
    });
  } catch {
    /* ignore */
  }
}

export async function saveSettings(patch) {
  Object.assign(settingsStore, patch);
  await persist();
  // Mirror to the account (best-effort; offline changes get picked up on next
  // login via syncSettings — server reads the same local value back).
  const userId = await currentUserId();
  if (!userId) return;
  await withSync(async () => {
    try {
      await supabase
        .from("profiles")
        .update({ default_lead_minutes: settingsStore.defaultLeadMinutes })
        .eq("id", userId);
    } catch {
      /* ignore — stays in local cache, retried implicitly on next save */
    }
  });
}

// Pull the saved preference from the account and apply it. Server wins. No-op
// when logged out / unconfigured.
export async function syncSettings() {
  const userId = await currentUserId();
  if (!userId) return;
  try {
    const { data, error } = await withSync(() =>
      supabase
        .from("profiles")
        .select("default_lead_minutes")
        .eq("id", userId)
        .single()
    );
    if (error || !data) return;
    if (typeof data.default_lead_minutes === "number") {
      settingsStore.defaultLeadMinutes = data.default_lead_minutes;
      await persist();
    }
  } catch {
    /* keep local */
  }
}

// Reset to defaults on sign-out so the next user doesn't see the previous
// user's preference. Their value stays safe on the server.
export async function clearLocalSettings() {
  settingsStore.defaultLeadMinutes = 30;
  await persist();
}
