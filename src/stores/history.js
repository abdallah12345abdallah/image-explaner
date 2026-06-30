// Analysis history store — SERVER-ONLY (no local cache).
//
// History rows live in the Supabase `history` table; each thumbnail is a file
// in the private `history-thumbnails` Storage bucket (path
// `<user_id>/<history_id>.jpg`), shown via short-lived signed URLs. Unlike
// reminders, history is NOT cached on the device: opening the History page
// always fetches from the server (a skeleton shows while it loads). Creating an
// entry already requires a network call (the image analysis), so there's no
// offline case to cache for.
import { reactive } from "vue";
import { Preferences } from "@capacitor/preferences";
import { genUUID } from "@/services/datetime";
import { supabase, isSupabaseConfigured } from "@/services/supabase";
import { withSync } from "@/stores/sync";

const BUCKET = "history-thumbnails";
const MAX_ITEMS = 50;
const SIGNED_URL_TTL = 60 * 60 * 24 * 7; // 7 days

// Keys written by the old local-cache implementation — cleaned up on first load
// so we don't leave stale (and potentially large) data on the device.
const LEGACY_KEYS = ["wuduh.history", "wuduh.history.deleted"];

// items: array of { id, data, thumb, thumbPath, createdAt }
//   thumb is a signed Storage URL (from the server) or, for an item just
//   created this session, the local data-URL used for instant display.
export const historyStore = reactive({ items: [], loaded: false, loading: false });

// No local cache to load — just clear any leftover legacy data and mark ready.
// The list fills when the History page opens (syncHistory).
export async function loadHistory() {
  for (const k of LEGACY_KEYS) {
    try {
      await Preferences.remove({ key: k });
    } catch {
      /* ignore */
    }
  }
  historyStore.loaded = true;
}

async function currentUserId() {
  if (!isSupabaseConfigured) return null;
  try {
    const { data } = await supabase.auth.getSession();
    return data.session?.user?.id ?? null;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Thumbnail helpers
// ---------------------------------------------------------------------------

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

// Upload a data-URL thumbnail to the private bucket; returns its path or null.
async function uploadThumb(userId, id, dataUrl) {
  if (!dataUrl || !dataUrl.startsWith("data:")) return null;
  try {
    const blob = await (await fetch(dataUrl)).blob();
    const path = `${userId}/${id}.jpg`;
    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(path, blob, { upsert: true, contentType: "image/jpeg" });
    return error ? null : path;
  } catch {
    return null;
  }
}

// A short-lived signed URL to display a private thumbnail, or null.
async function signedThumbUrl(path) {
  if (!path) return null;
  try {
    const { data, error } = await supabase.storage
      .from(BUCKET)
      .createSignedUrl(path, SIGNED_URL_TTL);
    return error ? null : data?.signedUrl ?? null;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Mutations — write straight to the server.
// ---------------------------------------------------------------------------
// Save an analysis to the server. Returns true on success, false if it
// couldn't be saved (so the caller can warn the user — there's no local
// fallback). Retries once on a transient failure.
export async function addHistory(data, previewUrl) {
  const userId = await currentUserId();
  if (!userId) return false; // not logged in → nowhere to save
  const id = genUUID();
  const createdAt = new Date().toISOString();
  const thumb = await makeThumb(previewUrl);
  return withSync(async () => {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const thumbPath = thumb ? await uploadThumb(userId, id, thumb) : null;
        const { error } = await supabase.from("history").upsert({
          id,
          user_id: userId,
          payload: { data, createdAt, thumbPath },
          created_at: createdAt,
        });
        if (!error) {
          // Show it immediately, using the local thumbnail for this session.
          historyStore.items.unshift({ id, data, thumb, thumbPath, createdAt });
          if (historyStore.items.length > MAX_ITEMS) {
            historyStore.items.length = MAX_ITEMS;
          }
          return true;
        }
      } catch {
        /* fall through to one retry */
      }
    }
    return false;
  });
}

export async function removeHistory(id) {
  const i = historyStore.items.findIndex((h) => h.id === id);
  const thumbPath = i >= 0 ? historyStore.items[i].thumbPath ?? null : null;
  if (i >= 0) historyStore.items.splice(i, 1);
  const userId = await currentUserId();
  if (!userId) return;
  await withSync(async () => {
    try {
      if (thumbPath) await supabase.storage.from(BUCKET).remove([thumbPath]);
      await supabase.from("history").delete().eq("id", id).eq("user_id", userId);
    } catch {
      /* ignore */
    }
  });
}

export async function clearHistory() {
  const removed = historyStore.items.slice();
  historyStore.items = [];
  const userId = await currentUserId();
  if (!userId) return;
  await withSync(async () => {
    try {
      const paths = removed.map((r) => r.thumbPath).filter(Boolean);
      if (paths.length) await supabase.storage.from(BUCKET).remove(paths);
      const ids = removed.map((r) => r.id);
      if (ids.length) {
        await supabase.from("history").delete().in("id", ids).eq("user_id", userId);
      }
    } catch {
      /* ignore */
    }
  });
}

// ---------------------------------------------------------------------------
// Load from the server (the only source). Skeleton shows while this runs.
// ---------------------------------------------------------------------------
export async function syncHistory({ silent = false } = {}) {
  // `silent` (used by pull-to-refresh) keeps the existing list on screen and
  // skips the skeleton, since the refresher already shows a spinner.
  if (!silent) historyStore.loading = true;
  const userId = await currentUserId();
  if (!userId) {
    historyStore.items = [];
    historyStore.loading = false;
    return;
  }

  let rows;
  try {
    const res = await withSync(() =>
      supabase
        .from("history")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(MAX_ITEMS)
    );
    if (res.error) {
      historyStore.loading = false;
      return;
    }
    rows = res.data || [];
  } catch {
    historyStore.loading = false;
    return;
  }

  const items = [];
  for (const row of rows) {
    const p = row.payload || {};
    const thumbPath = p.thumbPath ?? null;
    items.push({
      id: row.id,
      data: p.data,
      thumb: thumbPath ? await signedThumbUrl(thumbPath) : null,
      thumbPath,
      createdAt: p.createdAt ?? row.created_at,
    });
  }
  historyStore.items = items;
  historyStore.loading = false;
}

// Clear the in-memory list on sign-out (nothing is persisted locally anyway).
export function clearLocalHistory() {
  historyStore.items = [];
}
