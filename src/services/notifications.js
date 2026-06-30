// Wrapper around @capacitor/local-notifications for appointment reminders.
// On web (dev server) scheduling is a no-op so nothing throws; reminders must
// be verified on the Android APK.
import { Capacitor } from "@capacitor/core";
import { LocalNotifications } from "@capacitor/local-notifications";
import { computeFireAt } from "./datetime";
import { t } from "@/i18n";

const NATIVE = Capacitor.isNativePlatform();

// Action buttons shown on a fired reminder (Android/iOS notification actions).
const ACTION_TYPE_ID = "REMINDER_ACTIONS";
const SNOOZE_10_ID = "snooze_10";
const SNOOZE_60_ID = "snooze_60";

// Map a recurrence value to the Capacitor `every` unit (null = one-off).
const EVERY_BY_RECURRENCE = {
  daily: "day",
  weekly: "week",
  monthly: "month",
};

export function isNative() {
  return NATIVE;
}

// The raw permission state:
//   "unsupported" (web) | "granted" | "denied" | "prompt"
// ("prompt-with-rationale" is collapsed into "prompt").
export async function getPermissionState() {
  if (!NATIVE) return "unsupported";
  try {
    const perm = await LocalNotifications.checkPermissions();
    return perm.display === "prompt-with-rationale" ? "prompt" : perm.display;
  } catch {
    return "denied";
  }
}

// Trigger the OS permission dialog when allowed, and return the resulting
// state. If already denied, Android won't show a dialog again → stays "denied"
// and the user must enable it from system settings.
export async function requestPermission() {
  if (!NATIVE) return "unsupported";
  try {
    let perm = await LocalNotifications.checkPermissions();
    if (perm.display === "granted") return "granted";
    perm = await LocalNotifications.requestPermissions();
    return perm.display === "prompt-with-rationale" ? "prompt" : perm.display;
  } catch {
    return "denied";
  }
}

// Ask for notification permission (Android 13+ shows a system prompt).
// Returns true if granted.
export async function ensurePermission() {
  return (await requestPermission()) === "granted";
}

export async function hasPermission() {
  return (await getPermissionState()) === "granted";
}

// The next time a reminder should fire. For a one-off, that's appointment time
// minus the lead. For a recurring reminder whose first fire is already past,
// advance by the recurrence interval until it's in the future.
function nextFireAt(rec) {
  const at = computeFireAt(rec.datetimeISO, rec.leadMinutes);
  if (!at) return null;
  const every = EVERY_BY_RECURRENCE[rec.recurrence];
  if (!every) return at; // one-off
  const now = Date.now();
  const d = new Date(at.getTime());
  let guard = 0;
  while (d.getTime() <= now && guard < 1000) {
    if (every === "day") d.setDate(d.getDate() + 1);
    else if (every === "week") d.setDate(d.getDate() + 7);
    else if (every === "month") d.setMonth(d.getMonth() + 1);
    guard += 1;
  }
  return d;
}

// Schedule (or reschedule) a reminder for an appointment record.
// Returns true if a notification was actually scheduled in the future.
export async function scheduleReminder(rec) {
  if (!NATIVE || !rec) return false;
  const every = EVERY_BY_RECURRENCE[rec.recurrence];
  const at = nextFireAt(rec);
  // A one-off in the past is skipped; a recurring one is always advanced to a
  // future occurrence by nextFireAt, so it's fine.
  if (!at || (!every && at.getTime() <= Date.now())) return false;
  const granted = await ensurePermission();
  if (!granted) return false;
  try {
    await LocalNotifications.schedule({
      notifications: [
        {
          id: rec.notificationId,
          title: t("notif.title"),
          body: rec.location ? `${rec.title} — ${rec.location}` : rec.title,
          schedule: { at, every: every || undefined, allowWhileIdle: true },
          actionTypeId: ACTION_TYPE_ID,
          extra: { appointmentId: rec.id },
          smallIcon: "ic_stat_icon",
        },
      ],
    });
    return true;
  } catch {
    return false;
  }
}

export async function cancelReminder(notificationId) {
  if (!NATIVE || notificationId == null) return;
  try {
    await LocalNotifications.cancel({ notifications: [{ id: notificationId }] });
  } catch {
    /* ignore */
  }
}

// Schedule a one-off "snooze" re-reminder `minutes` from now, reusing the
// fired notification's title/body. Uses a fresh id so it doesn't clash with the
// appointment's own scheduled reminder.
async function snooze(notification, minutes) {
  const at = new Date(Date.now() + minutes * 60000);
  try {
    await LocalNotifications.schedule({
      notifications: [
        {
          id: 1 + Math.floor(Math.random() * 2000000000),
          title: notification?.title || t("notif.title"),
          body: notification?.body || "",
          schedule: { at, allowWhileIdle: true },
          actionTypeId: ACTION_TYPE_ID,
          extra: notification?.extra || {},
          smallIcon: "ic_stat_icon",
        },
      ],
    });
  } catch {
    /* ignore */
  }
}

// Called once at app startup with the router. Registers the snooze action
// buttons and routes a plain tap to the reminders tab; snooze actions reschedule
// the reminder instead of navigating.
export async function registerTapHandler(router) {
  if (!NATIVE) return;
  try {
    await LocalNotifications.registerActionTypes({
      types: [
        {
          id: ACTION_TYPE_ID,
          actions: [
            { id: SNOOZE_10_ID, title: t("notif.snooze10") },
            { id: SNOOZE_60_ID, title: t("notif.snooze60") },
          ],
        },
      ],
    });
  } catch {
    /* ignore — actions just won't show */
  }
  try {
    await LocalNotifications.addListener(
      "localNotificationActionPerformed",
      (event) => {
        if (event.actionId === SNOOZE_10_ID) {
          snooze(event.notification, 10);
        } else if (event.actionId === SNOOZE_60_ID) {
          snooze(event.notification, 60);
        } else {
          router.push("/tabs/reminders");
        }
      }
    );
  } catch {
    /* ignore */
  }
}
