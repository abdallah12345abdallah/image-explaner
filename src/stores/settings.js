import { reactive } from "vue";
import { Preferences } from "@capacitor/preferences";

const KEY = "wuduh.settings";

export const settingsStore = reactive({
  defaultLeadMinutes: 30,
  loaded: false,
});

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

export async function saveSettings(patch) {
  Object.assign(settingsStore, patch);
  try {
    await Preferences.set({
      key: KEY,
      value: JSON.stringify({ defaultLeadMinutes: settingsStore.defaultLeadMinutes }),
    });
  } catch {
    /* ignore */
  }
}
