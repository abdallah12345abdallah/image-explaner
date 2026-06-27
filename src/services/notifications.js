// Wrapper around @capacitor/local-notifications for appointment reminders.
// On web (dev server) scheduling is a no-op so nothing throws; reminders must
// be verified on the Android APK.
import { Capacitor } from "@capacitor/core";
import { LocalNotifications } from "@capacitor/local-notifications";
import { computeFireAt } from "./datetime";
import { t } from "@/i18n";

const NATIVE = Capacitor.isNativePlatform();

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

// Schedule (or reschedule) a reminder for an appointment record.
// Returns true if a notification was actually scheduled in the future.
export async function scheduleReminder(rec) {
  if (!NATIVE || !rec) return false;
  const at = computeFireAt(rec.datetimeISO, rec.leadMinutes);
  if (!at || at.getTime() <= Date.now()) return false; // past or invalid → skip
  const granted = await ensurePermission();
  if (!granted) return false;
  try {
    await LocalNotifications.schedule({
      notifications: [
        {
          id: rec.notificationId,
          title: t("notif.title"),
          body: rec.location ? `${rec.title} — ${rec.location}` : rec.title,
          schedule: { at, allowWhileIdle: true },
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

// Called once at app startup with the router so tapping a notification opens
// the reminders tab.
export async function registerTapHandler(router) {
  if (!NATIVE) return;
  try {
    await LocalNotifications.addListener(
      "localNotificationActionPerformed",
      () => {
        router.push("/tabs/reminders");
      }
    );
  } catch {
    /* ignore */
  }
}
