import { reactive } from "vue";
import { Preferences } from "@capacitor/preferences";
import { genNumericId, genStringId } from "@/services/datetime";
import * as notif from "@/services/notifications";

const KEY = "wuduh.appointments";

// items: array of
//   { id, title, datetimeISO, location, leadMinutes, notificationId, createdAt }
export const appointmentsStore = reactive({ items: [], loaded: false });

export async function loadAppointments() {
  try {
    const { value } = await Preferences.get({ key: KEY });
    appointmentsStore.items = value ? JSON.parse(value) : [];
  } catch {
    appointmentsStore.items = [];
  }
  appointmentsStore.loaded = true;
}

async function persist() {
  try {
    await Preferences.set({
      key: KEY,
      value: JSON.stringify(appointmentsStore.items),
    });
  } catch {
    /* ignore */
  }
}

// Create an appointment from a partial ({ title, datetimeISO, location, leadMinutes }).
// Returns the saved record (with generated ids). Also schedules the reminder.
export async function addAppointment(partial) {
  const usedNotifIds = appointmentsStore.items.map((a) => a.notificationId);
  const rec = {
    id: genStringId("apt"),
    title: (partial.title || "موعد").trim(),
    datetimeISO: partial.datetimeISO,
    location: (partial.location || "").trim(),
    leadMinutes: Number(partial.leadMinutes) || 30,
    notificationId: genNumericId(usedNotifIds),
    createdAt: new Date().toISOString(),
  };
  appointmentsStore.items.push(rec);
  await persist();
  await notif.scheduleReminder(rec);
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
  });
  await persist();
  await notif.scheduleReminder(rec);
  return rec;
}

export async function removeAppointment(id) {
  const i = appointmentsStore.items.findIndex((a) => a.id === id);
  if (i < 0) return;
  await notif.cancelReminder(appointmentsStore.items[i].notificationId);
  appointmentsStore.items.splice(i, 1);
  await persist();
}

// Re-arm all future reminders on app launch (covers reboots / id drift).
export async function rescheduleAll() {
  for (const rec of appointmentsStore.items) {
    await notif.cancelReminder(rec.notificationId);
    await notif.scheduleReminder(rec);
  }
}

// Sorted helpers for the UI.
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
