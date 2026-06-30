// Date/time helpers for appointments + reminders.
// All appointment datetimes are LOCAL ISO strings WITHOUT a timezone suffix
// (e.g. "2026-07-15T10:30:00"), so `new Date(iso)` parses them as local time.

// Parse a local ISO string into a Date, or null if invalid/empty.
export function parseLocalISO(iso) {
  if (!iso || typeof iso !== "string") return null;
  const d = new Date(iso);
  return isNaN(d.getTime()) ? null : d;
}

// Convert a Date to a local ISO string (no timezone), suitable for ion-datetime
// and for storage. Trims to minute precision: "YYYY-MM-DDTHH:mm:00".
export function toLocalISO(date) {
  if (!(date instanceof Date) || isNaN(date.getTime())) return "";
  const pad = (n) => String(n).padStart(2, "0");
  return (
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` +
    `T${pad(date.getHours())}:${pad(date.getMinutes())}:00`
  );
}

// The moment a reminder should fire: appointment time minus the lead minutes.
// Returns a Date, or null if the appointment datetime is invalid.
export function computeFireAt(iso, leadMinutes) {
  const d = parseLocalISO(iso);
  if (!d) return null;
  return new Date(d.getTime() - (Number(leadMinutes) || 0) * 60000);
}

import { localeTag } from "@/i18n";

// Human-readable date + time in the active language, e.g.
// "الأربعاء، ١٥ يوليو ٢٠٢٦، ١٠:٣٠ ص" / "Wednesday, 15 July 2026, 10:30 AM".
export function formatArabicDateTime(iso) {
  const d = parseLocalISO(iso);
  if (!d) return "";
  try {
    return new Intl.DateTimeFormat(localeTag(), {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }).format(d);
  } catch {
    return d.toLocaleString();
  }
}

// Shorter date (no weekday) for compact rows, in the active language.
export function formatArabicDateShort(iso) {
  const d = parseLocalISO(iso);
  if (!d) return "";
  try {
    return new Intl.DateTimeFormat(localeTag(), {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }).format(d);
  } catch {
    return d.toLocaleString();
  }
}

// A positive 32-bit integer id (Local Notifications requires a Java int).
// `exclude` is an optional array of ids to avoid collisions with.
export function genNumericId(exclude = []) {
  let id;
  do {
    id = 1 + Math.floor(Math.random() * 2_000_000_000); // 1 .. ~2e9, avoid 0
  } while (exclude.includes(id));
  return id;
}

// A short unique string id for app-level records.
export function genStringId(prefix = "id") {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}

// An RFC-4122 v4 UUID. Used as the primary key for synced records so a row can
// be created offline with a stable id and upserted to Supabase (uuid column)
// later. Prefers the native crypto generator, falls back to Math.random.
export function genUUID() {
  try {
    if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  } catch {
    /* fall through */
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = Math.floor(Math.random() * 16);
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// True if `s` looks like a UUID (used to detect pre-sync local ids to migrate).
export function isUUID(s) {
  return (
    typeof s === "string" &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s)
  );
}
