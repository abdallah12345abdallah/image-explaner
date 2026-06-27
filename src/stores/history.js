import { reactive } from "vue";
import { Preferences } from "@capacitor/preferences";
import { genStringId } from "@/services/datetime";

const KEY = "wuduh.history";
const MAX_ITEMS = 50;

// items: array of { id, data, thumb, createdAt }
//   data  = the parsed result object from the backend
//   thumb = small downscaled jpeg data URL (or null)
export const historyStore = reactive({ items: [], loaded: false });

export async function loadHistory() {
  try {
    const { value } = await Preferences.get({ key: KEY });
    historyStore.items = value ? JSON.parse(value) : [];
  } catch {
    historyStore.items = [];
  }
  historyStore.loaded = true;
}

async function persist() {
  try {
    await Preferences.set({ key: KEY, value: JSON.stringify(historyStore.items) });
  } catch {
    /* ignore — likely storage limit; trim and retry once */
    historyStore.items = historyStore.items.slice(0, 20);
    try {
      await Preferences.set({ key: KEY, value: JSON.stringify(historyStore.items) });
    } catch {
      /* give up */
    }
  }
}

// Downscale an image data URL to a small JPEG thumbnail (~maxSize px).
async function makeThumb(previewUrl, maxSize = 240) {
  if (!previewUrl) return null;
  try {
    const img = await new Promise((resolve, reject) => {
      const im = new Image();
      im.onload = () => resolve(im);
      im.onerror = reject;
      im.src = previewUrl;
    });
    const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
    const w = Math.round(img.width * scale);
    const h = Math.round(img.height * scale);
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    canvas.getContext("2d").drawImage(img, 0, 0, w, h);
    return canvas.toDataURL("image/jpeg", 0.6);
  } catch {
    return null;
  }
}

export async function addHistory(data, previewUrl) {
  const thumb = await makeThumb(previewUrl);
  historyStore.items.unshift({
    id: genStringId("his"),
    data,
    thumb,
    createdAt: new Date().toISOString(),
  });
  if (historyStore.items.length > MAX_ITEMS) {
    historyStore.items.length = MAX_ITEMS;
  }
  await persist();
}

export async function removeHistory(id) {
  const i = historyStore.items.findIndex((h) => h.id === id);
  if (i < 0) return;
  historyStore.items.splice(i, 1);
  await persist();
}

export async function clearHistory() {
  historyStore.items = [];
  await persist();
}
