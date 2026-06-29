// Modern toast helper — one place to fire consistent, branded toasts.
//
// Ionic renders toasts in a shadow DOM at the document root, so their look is
// styled globally in `src/theme/toast.css` (scoped component styles can't reach
// them). Each toast has an icon, a bold title (header), a description (message)
// and a close button — RTL is inherited from <html dir> set by the i18n layer.
//
//   const { showSuccess, showError } = useToast();
//   showSuccess("You're signed in.", "Welcome back");
//   showError(err.message);            // title falls back to a generic one
import { toastController } from "@ionic/vue";
import {
  checkmarkCircle,
  closeCircle,
  alertCircle,
  informationCircle,
  closeOutline,
} from "ionicons/icons";
import { t } from "@/i18n";

// type → icon + generic title used when the caller doesn't pass one.
const VARIANTS = {
  success: { icon: checkmarkCircle, title: () => t("toast.success") },
  error: { icon: closeCircle, title: () => t("toast.error") },
  warning: { icon: alertCircle, title: () => t("toast.warning") },
  info: { icon: informationCircle, title: () => t("toast.info") },
};

export async function showToast({ type = "info", title, message, duration } = {}) {
  const v = VARIANTS[type] || VARIANTS.info;
  const toast = await toastController.create({
    header: title ?? v.title(),
    message,
    icon: v.icon,
    // Errors linger a touch longer so they're readable; the close button lets
    // the user dismiss any toast early.
    duration: duration ?? (type === "error" ? 4200 : 3000),
    position: "top",
    cssClass: ["modern-toast", `modern-toast-${type}`],
    buttons: [{ icon: closeOutline, role: "cancel", side: "end" }],
  });
  await toast.present();
  return toast;
}

// Convenience wrappers — `(message, title?)`. Title is optional; omit it to get
// the per-type generic title (Done / Error / …).
export function useToast() {
  return {
    showToast,
    showSuccess: (message, title) => showToast({ type: "success", message, title }),
    showError: (message, title) => showToast({ type: "error", message, title }),
    showWarning: (message, title) => showToast({ type: "warning", message, title }),
    showInfo: (message, title) => showToast({ type: "info", message, title }),
  };
}
