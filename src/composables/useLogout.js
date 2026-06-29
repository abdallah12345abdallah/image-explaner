// Logout — one shared flow used everywhere (Home, Settings, …).
//
// `confirmLogout()` pops a styled confirmation dialog; only on confirm does it
// sign out, return to the login screen, and show a goodbye toast. Centralizing
// it here keeps the confirmation consistent across every entry point.
import { alertController } from "@ionic/vue";
import router from "@/router";
import { t } from "@/i18n";
import { signOut } from "@/stores/auth";
import { useToast } from "@/composables/useToast";

export function useLogout() {
  const { showSuccess } = useToast();

  async function performLogout() {
    await signOut();
    router.replace("/login");
    showSuccess(t("auth.loggedOutDesc"), t("auth.loggedOutTitle"));
  }

  async function confirmLogout() {
    const alert = await alertController.create({
      header: t("auth.logoutConfirmTitle"),
      message: t("auth.logoutConfirmMsg"),
      cssClass: "confirm-alert",
      buttons: [
        { text: t("auth.logoutCancel"), role: "cancel", cssClass: "confirm-btn-cancel" },
        {
          text: t("auth.logout"),
          role: "destructive",
          cssClass: "confirm-btn-danger",
          handler: () => {
            performLogout();
          },
        },
      ],
    });
    await alert.present();
  }

  return { confirmLogout, performLogout };
}
