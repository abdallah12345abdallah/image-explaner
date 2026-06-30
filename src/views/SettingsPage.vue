<template>
  <ion-page>
    <AppNavbar :title="t('settings.title')" />

    <ion-content :fullscreen="true" :dir="dir" class="page">
      <div class="wrap">
        <!-- ───── account (top, prominent) ───── -->
        <section class="profile-card">
          <div class="profile-glow" aria-hidden="true"></div>
          <div class="profile-top">
            <div class="avatar">{{ initials }}</div>
            <div class="profile-info">
              <p class="profile-name">{{ authStore.profile?.name || t("auth.account") }}</p>
              <small class="profile-email" dir="ltr">{{ authStore.user?.email }}</small>
            </div>
            <button class="logout-btn" :aria-label="t('auth.logout')" @click="confirmLogout">
              <ion-icon :icon="logOutOutline" />
            </button>
          </div>

          <!-- account details (only the fields the user actually has) -->
          <div v-if="hasDetails" class="profile-details">
            <div v-if="authStore.profile?.nationality" class="detail">
              <ion-icon :icon="globeOutline" />
              <span class="d-label">{{ t("auth.nationality") }}</span>
              <span class="d-value">{{ authStore.profile.nationality }}</span>
            </div>
            <div v-if="authStore.profile?.phone" class="detail">
              <ion-icon :icon="callOutline" />
              <span class="d-label">{{ t("auth.phone") }}</span>
              <span class="d-value" dir="ltr">{{ authStore.profile.phone }}</span>
            </div>
            <div v-if="memberSince" class="detail">
              <ion-icon :icon="calendarOutline" />
              <span class="d-label">{{ t("settings.memberSince") }}</span>
              <span class="d-value">{{ memberSince }}</span>
            </div>
          </div>

          <!-- footer: backup status + manage-account entry, in one section -->
          <div class="profile-foot">
            <span class="sync-state" :class="{ on: isSyncing }">
              <span v-if="isSyncing" class="mini-spinner" aria-hidden="true"></span>
              <ion-icon v-else :icon="cloudDoneOutline" />
              <span>{{ isSyncing ? t("common.syncing") : t("common.saved") }}</span>
            </span>
            <button class="manage-btn" @click="goAccount">
              <ion-icon :icon="createOutline" />
              <span>{{ t("settings.manageAccount") }}</span>
              <ion-icon :icon="chevronIcon" class="mb-chev" />
            </button>
          </div>
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
              :class="{ active: pendingLead === opt.value }"
              :disabled="saving"
              @click="pendingLead = opt.value"
            >
              {{ opt.label }}
            </button>
          </div>

          <button class="save-btn" :disabled="!leadDirty || saving" @click="saveLead">
            <span v-if="saving" class="btn-spinner" aria-hidden="true"></span>
            <ion-icon v-else :icon="saveOutline" />
            <span>{{ saving ? t("common.saving") : t("settings.saveChanges") }}</span>
          </button>
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
import { IonPage, IonContent, IonIcon, useIonRouter, onIonViewWillEnter } from "@ionic/vue";
import {
  checkmarkCircleOutline,
  logOutOutline,
  globeOutline,
  callOutline,
  calendarOutline,
  cloudDoneOutline,
  saveOutline,
  createOutline,
  chevronForwardOutline,
  chevronBackOutline,
} from "ionicons/icons";
import AppNavbar from "@/components/AppNavbar.vue";
import { ref, computed, onMounted, watch } from "vue";
import {
  t,
  dir,
  locale,
  setLocale,
  localeTag,
  LANGUAGES,
  leadOptions as i18nLeadOptions,
} from "@/i18n";
import { settingsStore, saveSettings, syncSettings } from "@/stores/settings";
import { getPermissionState, requestPermission } from "@/services/notifications";
import { authStore } from "@/stores/auth";
import { isSyncing } from "@/stores/sync";
import { useToast } from "@/composables/useToast";
import { useLogout } from "@/composables/useLogout";
import { initials as toInitials } from "@/services/user";

const { showWarning, showSuccess } = useToast();
const { confirmLogout } = useLogout();
const ionRouter = useIonRouter();

const chevronIcon = computed(() =>
  dir.value === "rtl" ? chevronBackOutline : chevronForwardOutline
);
function goAccount() {
  ionRouter.push("/account", "forward");
}

// ───── account details ─────
const hasDetails = computed(
  () =>
    !!(
      authStore.profile?.nationality ||
      authStore.profile?.phone ||
      authStore.profile?.created_at
    )
);
const memberSince = computed(() => {
  const iso = authStore.profile?.created_at;
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  try {
    return new Intl.DateTimeFormat(localeTag(), {
      year: "numeric",
      month: "long",
    }).format(d);
  } catch {
    return d.toLocaleDateString();
  }
});

// Initials shown in the avatar (name → "AB", else first email letter).
const initials = computed(() =>
  toInitials(authStore.profile?.name, authStore.user?.email)
);

const languages = LANGUAGES;
const leadOptions = computed(() => i18nLeadOptions());

// Pick-then-save: `pendingLead` holds the user's selection until they tap Save.
const pendingLead = ref(settingsStore.defaultLeadMinutes);
const saving = ref(false);
const leadDirty = computed(() => pendingLead.value !== settingsStore.defaultLeadMinutes);

// Keep the selection in step if the saved value changes elsewhere (e.g. a
// background sync pulls the account's value at startup) — but only when the
// user hasn't made an unsaved pick of their own.
watch(
  () => settingsStore.defaultLeadMinutes,
  (newVal, oldVal) => {
    if (pendingLead.value === oldVal) pendingLead.value = newVal;
  }
);

async function saveLead() {
  if (!leadDirty.value || saving.value) return;
  saving.value = true;
  try {
    await saveSettings({ defaultLeadMinutes: pendingLead.value });
    showSuccess(t("settings.savedToast"));
  } finally {
    saving.value = false;
  }
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

// Pull the account's saved settings each time the page opens (no-op when logged
// out). The watch above folds the fetched value into the picker.
onIonViewWillEnter(() => {
  refreshPerm();
  syncSettings().catch(() => {});
});
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
.lead:disabled { opacity: 0.55; cursor: default; }

/* save button for the reminder setting */
.save-btn {
  margin-top: 14px;
  width: 100%;
  display: inline-flex; align-items: center; justify-content: center; gap: 8px;
  border: none; border-radius: 12px;
  padding: 12px 16px;
  background: var(--ion-color-primary); color: #fff;
  font-family: "Cairo", sans-serif; font-weight: 800; font-size: 0.92rem;
  cursor: pointer;
  transition: opacity 0.16s ease, transform 0.12s ease, box-shadow 0.16s ease;
  box-shadow: 0 8px 18px rgba(13, 148, 136, 0.28);
}
.save-btn ion-icon { font-size: 1.15rem; }
.save-btn:active:not(:disabled) { transform: scale(0.98); }
.save-btn:disabled { opacity: 0.45; cursor: default; box-shadow: none; }
.btn-spinner {
  width: 16px; height: 16px; border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.45); border-top-color: #fff;
  animation: spin 0.7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

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
  flex-direction: column;
  gap: 14px;
  padding: 18px;
  margin-bottom: 22px;
  border-radius: 20px;
  background: linear-gradient(135deg, #0d9488 0%, #14b8a6 58%, #2dd4bf 100%);
  color: #fff;
  box-shadow: 0 14px 30px rgba(13, 148, 136, 0.3);
}
.profile-top {
  display: flex;
  align-items: center;
  gap: 14px;
  z-index: 1;
}
.profile-glow {
  position: absolute;
  top: -50px; inset-inline-end: -40px;
  width: 150px; height: 150px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.14);
  pointer-events: none;
}

/* account details grid */
.profile-details {
  display: flex;
  flex-direction: column;
  gap: 9px;
  z-index: 1;
  padding-top: 13px;
  border-top: 1px solid rgba(255, 255, 255, 0.22);
}
.detail {
  display: flex;
  align-items: center;
  gap: 9px;
  font-size: 0.84rem;
  min-width: 0;
}
.detail ion-icon { font-size: 1.05rem; opacity: 0.9; flex: 0 0 auto; }
.d-label { opacity: 0.8; font-weight: 600; }
.d-value {
  margin-inline-start: auto;
  font-weight: 800;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}

/* footer row: backup status + manage-account button */
.profile-foot {
  z-index: 1;
  display: flex; align-items: center; justify-content: space-between; gap: 10px;
  padding-top: 13px;
  border-top: 1px solid rgba(255, 255, 255, 0.22);
}
.sync-state {
  display: inline-flex; align-items: center; gap: 7px;
  padding: 5px 12px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.18);
  font-size: 0.76rem; font-weight: 700;
}
.sync-state ion-icon { font-size: 0.95rem; }
.mini-spinner {
  width: 12px; height: 12px; border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.4); border-top-color: #fff;
  animation: spin 0.7s linear infinite;
}
/* manage-account button (glassy, on the gradient card) */
.manage-btn {
  flex: 0 0 auto;
  display: inline-flex; align-items: center; gap: 6px;
  padding: 8px 14px; border: none; border-radius: 999px;
  background: rgba(255, 255, 255, 0.92); color: #0f766e;
  font-family: "Cairo", sans-serif; font-weight: 800; font-size: 0.8rem;
  cursor: pointer; transition: transform 0.15s ease, background 0.15s ease;
}
.manage-btn:active { transform: scale(0.95); }
.manage-btn ion-icon { font-size: 1rem; }
.manage-btn .mb-chev { font-size: 1.05rem; opacity: 0.6; }
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
  display: inline-grid; place-items: center;
  width: 40px; height: 40px;
  border: none; border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  color: #fff;
  cursor: pointer;
  transition: background 0.16s ease, transform 0.16s ease;
}
.logout-btn:active { background: rgba(255, 255, 255, 0.32); transform: scale(0.92); }
.logout-btn ion-icon { font-size: 1.25rem; }
.about { display: flex; align-items: center; gap: 14px; }
.about-logo { width: 48px; height: 48px; }
.about strong { display: block; font-size: 1.05rem; color: #1b2524; }
.about small { color: #7a8a88; font-size: 0.85rem; }
</style>
