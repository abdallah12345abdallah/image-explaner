<template>
  <ion-page>
    <AppNavbar :title="t('settings.title')" />

    <ion-content :fullscreen="true" :dir="dir" class="page">
      <div class="wrap">
        <!-- ───── account (top, prominent) ───── -->
        <section class="profile-card">
          <div class="profile-glow" aria-hidden="true"></div>
          <div class="avatar">{{ initials }}</div>
          <div class="profile-info">
            <p class="profile-name">{{ authStore.profile?.name || t("auth.account") }}</p>
            <small class="profile-email" dir="ltr">{{ authStore.user?.email }}</small>
          </div>
          <button class="logout-btn" :aria-label="t('auth.logout')" @click="confirmLogout">
            <ion-icon :icon="logOutOutline" />
            <span>{{ t("auth.logout") }}</span>
          </button>
        </section>

        <h2 class="section-h">{{ t("settings.language") }}</h2>
        <div class="card">
          <div class="leads">
            <button
              v-for="l in languages"
              :key="l.code"
              class="lead"
              :class="{ active: locale === l.code }"
              @click="setLocale(l.code)"
            >
              {{ t("langNames." + l.code) }}
            </button>
          </div>
        </div>

        <h2 class="section-h">{{ t("settings.reminders") }}</h2>
        <div class="card">
          <p class="lbl">{{ t("settings.defaultLeadLabel") }}</p>
          <div class="leads">
            <button
              v-for="opt in leadOptions"
              :key="opt.value"
              class="lead"
              :class="{ active: lead === opt.value }"
              @click="setLead(opt.value)"
            >
              {{ opt.label }}
            </button>
          </div>
        </div>

        <div class="card row">
          <div>
            <p class="lbl">{{ t("settings.notifPerm") }}</p>
            <small class="hint" :class="{ warn: perm === 'denied' }">{{ permLabel }}</small>
          </div>
          <button
            v-if="perm !== 'granted' && perm !== 'unsupported'"
            class="enable"
            @click="enable"
          >
            {{ t("settings.enable") }}
          </button>
          <ion-icon v-else-if="perm === 'granted'" :icon="checkmarkCircleOutline" class="ok"></ion-icon>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup>
import { IonPage, IonContent, IonIcon } from "@ionic/vue";
import { checkmarkCircleOutline, logOutOutline } from "ionicons/icons";
import AppNavbar from "@/components/AppNavbar.vue";
import { ref, computed, onMounted } from "vue";
import {
  t,
  dir,
  locale,
  setLocale,
  LANGUAGES,
  leadOptions as i18nLeadOptions,
} from "@/i18n";
import { settingsStore, saveSettings } from "@/stores/settings";
import { getPermissionState, requestPermission } from "@/services/notifications";
import { authStore } from "@/stores/auth";
import { useToast } from "@/composables/useToast";
import { useLogout } from "@/composables/useLogout";
import { initials as toInitials } from "@/services/user";

const { showWarning } = useToast();
const { confirmLogout } = useLogout();

// Initials shown in the avatar (name → "AB", else first email letter).
const initials = computed(() =>
  toInitials(authStore.profile?.name, authStore.user?.email)
);

const languages = LANGUAGES;
const leadOptions = computed(() => i18nLeadOptions());
const lead = computed(() => settingsStore.defaultLeadMinutes);
function setLead(v) {
  saveSettings({ defaultLeadMinutes: v });
}

// "unsupported" | "granted" | "denied" | "prompt"
const perm = ref("prompt");
const permLabel = computed(() => {
  switch (perm.value) {
    case "unsupported":
      return t("settings.permWeb");
    case "granted":
      return t("settings.permOn");
    case "denied":
      return t("settings.permBlocked");
    default:
      return t("settings.permOff");
  }
});

async function refreshPerm() {
  perm.value = await getPermissionState();
}
async function enable() {
  const result = await requestPermission();
  perm.value = result === "unsupported" ? "unsupported" : await getPermissionState();
  // Android won't re-prompt once blocked → tell the user how to enable it.
  if (perm.value === "denied") {
    showWarning(t("settings.permBlockedToast"));
  }
}
onMounted(refreshPerm);
</script>

<style scoped>
.app-header::after { display: none; }
.app-toolbar { --background: var(--ion-color-primary); --color: #fff; --border-width: 0; }
.app-title { font-family: "Cairo", sans-serif; font-weight: 800; color: #fff; }
.app-toolbar ion-button { --color: #fff; }
.page { --background: #f7faf9; }
.wrap { max-width: 560px; margin: 0 auto; padding: 16px 18px 28px; font-family: "Cairo", sans-serif; }

.section-h { margin: 10px 2px 10px; font-size: 1.02rem; font-weight: 800; color: #0f766e; }
.card {
  padding: 16px; border-radius: 16px; background: #fff;
  border: 1px solid rgba(13,148,136,0.1); box-shadow: 0 6px 18px rgba(13,70,65,0.06);
  margin-bottom: 12px;
}
.card.row { display: flex; align-items: center; justify-content: space-between; }
.lbl { margin: 0 0 10px; font-size: 0.92rem; font-weight: 700; color: #1b2524; }
.card.row .lbl { margin: 0 0 4px; }
.hint { font-size: 0.78rem; color: #7a8a88; }
.hint.warn { color: #d97706; font-weight: 700; }
.leads { display: flex; flex-wrap: wrap; gap: 8px; }
.lead {
  padding: 8px 14px; border-radius: 999px;
  border: 1px solid rgba(13,148,136,0.25); background: #fff;
  color: #5b6b69; font-family: "Cairo", sans-serif; font-weight: 700; font-size: 0.85rem; cursor: pointer;
}
.lead.active { background: var(--ion-color-primary); color: #fff; border-color: var(--ion-color-primary); }
.enable {
  border: none; border-radius: 999px; padding: 8px 18px;
  background: var(--ion-color-primary); color: #fff;
  font-family: "Cairo", sans-serif; font-weight: 700; cursor: pointer;
}
.ok { color: #16a34a; font-size: 1.6rem; }

/* ───── account profile card (top) ───── */
.profile-card {
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 18px;
  margin-bottom: 22px;
  border-radius: 20px;
  background: linear-gradient(135deg, #0d9488 0%, #14b8a6 58%, #2dd4bf 100%);
  color: #fff;
  box-shadow: 0 14px 30px rgba(13, 148, 136, 0.3);
}
.profile-glow {
  position: absolute;
  top: -50px; inset-inline-end: -40px;
  width: 150px; height: 150px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.14);
  pointer-events: none;
}
.avatar {
  flex: 0 0 auto;
  width: 56px; height: 56px;
  display: grid; place-items: center;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.22);
  border: 1.5px solid rgba(255, 255, 255, 0.45);
  font-size: 1.3rem; font-weight: 800;
  letter-spacing: 0.5px;
}
.profile-info { flex: 1 1 auto; min-width: 0; z-index: 1; }
.profile-name {
  margin: 0 0 3px;
  font-size: 1.1rem; font-weight: 800;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.profile-email {
  display: block;
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.86);
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.logout-btn {
  flex: 0 0 auto;
  z-index: 1;
  display: inline-flex; align-items: center; gap: 6px;
  border: none; border-radius: 999px;
  padding: 9px 15px;
  background: rgba(255, 255, 255, 0.2);
  color: #fff;
  font-family: "Cairo", sans-serif; font-weight: 700; font-size: 0.82rem;
  cursor: pointer;
  transition: background 0.16s ease, transform 0.16s ease;
}
.logout-btn:active { background: rgba(255, 255, 255, 0.32); transform: scale(0.95); }
.logout-btn ion-icon { font-size: 1.1rem; }
.about { display: flex; align-items: center; gap: 14px; }
.about-logo { width: 48px; height: 48px; }
.about strong { display: block; font-size: 1.05rem; color: #1b2524; }
.about small { color: #7a8a88; font-size: 0.85rem; }
</style>
