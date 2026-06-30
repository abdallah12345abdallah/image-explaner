// Appointments / reminders store.
//
// Records are now tied to the logged-in account and synced to the Supabase
// `appointments` table, so they survive a reinstall and follow the user to a
// new device. A local Preferences cache mirrors the synced list, which means:
//   - reads are instant and work fully offline,
//   - reminders (OS-level local notifications) still fire without a network
//     round-trip — `notificationId` stays device-local and is never synced.
//
// Sync model (offline-first, last-write-wins):
//   - every record carries a client-generated UUID `id` (the table's PK),
//   - `_dirty` marks a record that still needs to be pushed to the server,
//   - deleted ids are kept as tombstones until the server delete succeeds,
//   - `syncAppointments()` flushes tombstones + dirty records, then pulls the
//     server list and reconciles the cache.
// When the user is logged out or Supabase isn't configured, every server call
// is skipped and the store behaves exactly like the old local-only version.
import { reactive } from "vue";
import { Preferences } from "@capacitor/preferences";
import {
  genNumericId,
  genUUID,
  isUUID,
  parseLocalISO,
} from "@/services/datetime";
import { supabase, isSupabaseConfigured } from "@/services/supabase";
import { withSync } from "@/stores/sync";
import * as notif from "@/services/notifications";

const KEY = "wuduh.appointments";
const TOMBSTONE_KEY = "wuduh.appointments.deleted";

// items: array of
//   { id(uuid), title, datetimeISO, location, leadMinutes, notificationId, createdAt, _dirty? }
// `loading` is true while a server fetch (GET) is in flight — the UI shows a
// skeleton in place of the data, but only when there's nothing cached to show.
export const appointmentsStore = reactive({ items: [], loaded: false, loading: false });

// Ids deleted locally that still need to be deleted on the server.
let tombstones = [];

// ---------------------------------------------------------------------------
// Local persistence
// ---------------------------------------------------------------------------
export async function loadAppointments() {
  try {
    const { value } = await Preferences.get({ key: KEY });
    const items = value ? JSON.parse(value) : [];
    // Migrate pre-sync records (old "apt_..." ids): give them a UUID and mark
    // them dirty so the first sync pushes them up instead of losing them.
    let migrated = false;
    for (const rec of items) {
      if (!isUUID(rec.id)) {
        rec.id = genUUID();
        rec._dirty = true;
        migrated = true;
      }
    }
    appointmentsStore.items = items;
    if (migrated) await persist();
  } catch {
    appointmentsStore.items = [];
  }
  try {
    const { value } = await Preferences.get({ key: TOMBSTONE_KEY });
    tombstones = value ? JSON.parse(value) : [];
  } catch {
    tombstones = [];
  }
  appointmentsStore.loaded = true;
}

async function persist() {
  try {
    // Don't leak the transient `_dirty` flag is fine — it's small and useful to
    // keep across restarts so an offline change still syncs after a relaunch.
    await Preferences.set({
      key: KEY,
      value: JSON.stringify(appointmentsStore.items),
    });
  } catch {
    /* ignore */
  }
}

async function persistTombstones() {
  try {
    await Preferences.set({ key: TOMBSTONE_KEY, value: JSON.stringify(tombstones) });
  } catch {
    /* ignore */
  }
}

// ---------------------------------------------------------------------------
// Supabase mapping helpers
// ---------------------------------------------------------------------------
async function currentUserId() {
  if (!isSupabaseConfigured) return null;
  try {
    const { data } = await supabase.auth.getSession();
    return data.session?.user?.id ?? null;
  } catch {
    return null;
  }
}

// Map a local record → a server row. The canonical local-ISO datetime and the
// rest of the client fields live in `payload` (forward-compatible); `appt_at`
// is a real timestamptz derived from it for server-side sorting/queries.
function recToRow(rec, userId) {
  const d = parseLocalISO(rec.datetimeISO);
  return {
    id: rec.id,
    user_id: userId,
    title: rec.title,
    location: rec.location,
    appt_at: d ? d.toISOString() : null,
    lead_minutes: rec.leadMinutes,
    payload: {
      datetimeISO: rec.datetimeISO,
      title: rec.title,
      location: rec.location,
      leadMinutes: rec.leadMinutes,
      recurrence: rec.recurrence || "none",
      createdAt: rec.createdAt,
    },
  };
}

// Map a server row → a local record. Prefers `payload` (keeps the exact local
// ISO string) and falls back to the typed columns for rows written elsewhere.
// `notificationId` is device-local and supplied by the caller.
function rowToRec(row, notificationId) {
  const p = row.payload || {};
  return {
    id: row.id,
    title: p.title ?? row.title ?? "",
    datetimeISO: p.datetimeISO ?? row.appt_at ?? "",
    location: p.location ?? row.location ?? "",
    leadMinutes: Number(p.leadMinutes ?? row.lead_minutes) || 30,
    recurrence: p.recurrence ?? "none",
    notificationId,
    createdAt: p.createdAt ?? row.created_at,
  };
}

// Push one record to the server. On success clears its dirty flag. Best-effort:
// returns false (leaving it dirty for the next sync) when offline / logged out.
async function pushRecord(rec) {
  const userId = await currentUserId();
  if (!userId) return false;
  return withSync(async () => {
    try {
      const { error } = await supabase
        .from("appointments")
        .upsert(recToRow(rec, userId));
      if (error) return false;
      rec._dirty = false;
      await persist();
      return true;
    } catch {
      return false;
    }
  });
}

// Delete one id on the server. Keeps a tombstone if it can't be done now.
async function deleteOnServer(id) {
  const userId = await currentUserId();
  if (!userId) {
    addTombstone(id);
    return;
  }
  await withSync(async () => {
    try {
      const { error } = await supabase
        .from("appointments")
        .delete()
        .eq("id", id)
        .eq("user_id", userId);
      if (error) addTombstone(id);
      else removeTombstone(id);
    } catch {
      addTombstone(id);
    }
  });
}

function addTombstone(id) {
  if (!tombstones.includes(id)) {
    tombstones.push(id);
    persistTombstones();
  }
}

function removeTombstone(id) {
  const i = tombstones.indexOf(id);
  if (i >= 0) {
    tombstones.splice(i, 1);
    persistTombstones();
  }
}

// ---------------------------------------------------------------------------
// Mutations — write locally + schedule the reminder immediately, then push.
// ---------------------------------------------------------------------------

// Create an appointment from a partial ({ title, datetimeISO, location, leadMinutes }).
// Returns the saved record. Also schedules the reminder and syncs to the server.
export async function addAppointment(partial) {
  const usedNotifIds = appointmentsStore.items.map((a) => a.notificationId);
  const rec = {
    id: genUUID(),
    title: (partial.title || "موعد").trim(),
    datetimeISO: partial.datetimeISO,
    location: (partial.location || "").trim(),
    leadMinutes: Number(partial.leadMinutes) || 30,
    recurrence: partial.recurrence || "none",
    notificationId: genNumericId(usedNotifIds),
    createdAt: new Date().toISOString(),
    _dirty: true,
  };
  appointmentsStore.items.push(rec);
  await persist();
  await notif.scheduleReminder(rec);
  await pushRecord(rec);
  return rec;
}

export async function updateAppointment(id, patch) {
  const rec = appointmentsStore.items.find((a) => a.id === id);
  if (!rec) return null;
  await notif.cancelReminder(rec.notificationId);
  Object.assign(rec, {
    title: (patch.title ?? rec.title).trim(),
    datetimeISO: patch.datetimeISO ?? rec.datetimeISO,
    location: (patch.location ?? rec.location).trim(),
    leadMinutes: Number(patch.leadMinutes ?? rec.leadMinutes) || 30,
    recurrence: patch.recurrence ?? rec.recurrence ?? "none",
    _dirty: true,
  });
  await persist();
  await notif.scheduleReminder(rec);
  await pushRecord(rec);
  return rec;
}

export async function removeAppointment(id) {
  const i = appointmentsStore.items.findIndex((a) => a.id === id);
  if (i < 0) return;
  await notif.cancelReminder(appointmentsStore.items[i].notificationId);
  appointmentsStore.items.splice(i, 1);
  await persist();
  await deleteOnServer(id);
}

// ---------------------------------------------------------------------------
// Sync + lifecycle
// ---------------------------------------------------------------------------

// Re-arm all future reminders (covers reboots / id drift). Local-only.
export async function rescheduleAll() {
  for (const rec of appointmentsStore.items) {
    await notif.cancelReminder(rec.notificationId);
    await notif.scheduleReminder(rec);
  }
}

// Reconcile the local cache with the server. No-op when logged out / unconfigured
// (the app stays in pure local mode). Call on app start and after login.
export async function syncAppointments({ silent = false } = {}) {
  // `silent` (pull-to-refresh) keeps the list on screen and skips the skeleton.
  if (!silent) appointmentsStore.loading = true;
  const userId = await currentUserId();
  if (!userId) {
    appointmentsStore.loading = false;
    return;
  }

  // 1) Flush pending deletes and dirty writes.
  for (const id of [...tombstones]) await deleteOnServer(id);
  for (const rec of appointmentsStore.items.filter((r) => r._dirty)) {
    await pushRecord(rec);
  }

  // 2) Pull the authoritative server list.
  let rows;
  try {
    const res = await withSync(() =>
      supabase.from("appointments").select("*").eq("user_id", userId)
    );
    if (res.error) {
      appointmentsStore.loading = false;
      return; // network/permission issue → keep local as-is
    }
    rows = res.data || [];
  } catch {
    appointmentsStore.loading = false;
    return;
  }

  // 3) Merge: server is the source of truth, except records still dirty locally
  //    (an offline edit the push above couldn't deliver — keep ours).
  const serverById = new Map(rows.map((r) => [r.id, r]));
  const usedNotifIds = [];
  const merged = [];
  for (const rec of appointmentsStore.items) {
    if (rec._dirty) {
      merged.push(rec);
      usedNotifIds.push(rec.notificationId);
      continue;
    }
    const row = serverById.get(rec.id);
    if (row) {
      merged.push(rowToRec(row, rec.notificationId)); // keep device-local notif id
      usedNotifIds.push(rec.notificationId);
      serverById.delete(rec.id);
    } else {
      // Deleted on another device → drop it here too.
      await notif.cancelReminder(rec.notificationId);
    }
  }
  // Records that exist only on the server are new to this device.
  for (const row of serverById.values()) {
    const nid = genNumericId(usedNotifIds);
    usedNotifIds.push(nid);
    merged.push(rowToRec(row, nid));
  }

  appointmentsStore.items = merged;
  await persist();
  await rescheduleAll();
  appointmentsStore.loading = false;
}

// Wipe the local cache + scheduled reminders. Call on sign-out so the next user
// on this device doesn't inherit the previous user's reminders.
export async function clearLocalAppointments() {
  for (const rec of appointmentsStore.items) {
    await notif.cancelReminder(rec.notificationId);
  }
  appointmentsStore.items = [];
  tombstones = [];
  await persist();
  await persistTombstones();
}

// ---------------------------------------------------------------------------
// Sorted helpers for the UI.
// ---------------------------------------------------------------------------
export function upcoming() {
  const now = Date.now();
  return appointmentsStore.items
    .filter((a) => new Date(a.datetimeISO).getTime() >= now)
    .sort((a, b) => new Date(a.datetimeISO) - new Date(b.datetimeISO));
}

export function past() {
  const now = Date.now();
  return appointmentsStore.items
    .filter((a) => new Date(a.datetimeISO).getTime() < now)
    .sort((a, b) => new Date(b.datetimeISO) - new Date(a.datetimeISO));
}
