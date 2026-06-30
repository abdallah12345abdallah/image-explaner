<template>
  <ion-page>
    <AppNavbar :title="t('account.title')" backHref="/settings" />

    <ion-content :fullscreen="true" :dir="dir" class="page">
      <div class="wrap">
        <!-- ───── identity hero ───── -->
        <section class="hero">
          <span class="hero-glow" aria-hidden="true"></span>
          <span class="hero-glow g2" aria-hidden="true"></span>
          <div class="avatar">{{ initials }}</div>
          <h2 class="hero-name">{{ name || authStore.profile?.name || t("auth.account") }}</h2>
          <p class="hero-email" dir="ltr">{{ authStore.user?.email }}</p>
          <span v-if="memberSince" class="hero-chip">
            <ion-icon :icon="calendarOutline" />
            {{ t("settings.memberSince") }} {{ memberSince }}
          </span>
        </section>

        <!-- ───── personal information (view + edit, one section) ───── -->
        <h2 class="section-h">{{ t("account.profileSection") }}</h2>
        <div class="card">
          <label class="field">
            <span class="lbl"><ion-icon :icon="personOutline" /> {{ t("auth.name") }}</span>
            <input v-model="name" class="inp" type="text" autocomplete="name" />
          </label>
          <label class="field">
            <span class="lbl"><ion-icon :icon="globeOutline" /> {{ t("auth.nationality") }}</span>
            <input v-model="nationality" class="inp" type="text" />
          </label>
          <label class="field">
            <span class="lbl"><ion-icon :icon="callOutline" /> {{ t("auth.phone") }}</span>
            <input v-model="phone" class="inp" type="tel" dir="ltr" autocomplete="tel" />
          </label>

          <button class="btn primary" :disabled="!profileDirty || savingProfile" @click="onSaveProfile">
            <span v-if="savingProfile" class="spinner" aria-hidden="true"></span>
            <ion-icon v-else :icon="saveOutline" />
            <span>{{ savingProfile ? t("common.saving") : t("account.saveProfile") }}</span>
          </button>
        </div>

        <!-- ───── password ───── -->
        <h2 class="section-h">{{ t("account.passwordSection") }}</h2>
        <div class="card">
          <label class="field">
            <span class="lbl">{{ t("account.newPassword") }}</span>
            <input v-model="pw1" class="inp" type="password" dir="ltr" autocomplete="new-password" placeholder="••••••••" />
          </label>
          <label class="field">
            <span class="lbl">{{ t("account.confirmPassword") }}</span>
            <input v-model="pw2" class="inp" type="password" dir="ltr" autocomplete="new-password" placeholder="••••••••" />
          </label>

          <button class="btn primary" :disabled="!canChangePw || savingPw" @click="onChangePassword">
            <span v-if="savingPw" class="spinner" aria-hidden="true"></span>
            <ion-icon v-else :icon="lockClosedOutline" />
            <span>{{ savingPw ? t("common.saving") : t("account.changePassword") }}</span>
          </button>
        </div>

        <!-- ───── danger zone ───── -->
        <h2 class="section-h danger">{{ t("account.dangerSection") }}</h2>
        <div class="card danger-card">
          <p class="warn">{{ t("account.deleteWarning") }}</p>
          <button class="btn danger" :disabled="deleting" @click="onDeleteAccount">
            <span v-if="deleting" class="spinner dark" aria-hidden="true"></span>
            <ion-icon v-else :icon="trashOutline" />
            <span>{{ t("account.deleteAccount") }}</span>
          </button>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup>
import { IonPage, IonContent, IonIcon, useIonRouter, alertController } from "@ionic/vue";
import {
  saveOutline,
  lockClosedOutline,
  trashOutline,
  personOutline,
  globeOutline,
  callOutline,
  calendarOutline,
} from "ionicons/icons";
import { ref, computed } from "vue";
import AppNavbar from "@/components/AppNavbar.vue";
import { t, dir, localeTag } from "@/i18n";
import { authStore, updateProfile, changePassword, deleteAccount } from "@/stores/auth";
import { initials as toInitials } from "@/services/user";
import { useToast } from "@/composables/useToast";

const { showSuccess, showError } = useToast();
const ionRouter = useIonRouter();

// ───── profile ─────
const name = ref(authStore.profile?.name || "");
const nationality = ref(authStore.profile?.nationality || "");
const phone = ref(authStore.profile?.phone || "");
const savingProfile = ref(false);

const profileDirty = computed(
  () =>
    name.value !== (authStore.profile?.name || "") ||
    nationality.value !== (authStore.profile?.nationality || "") ||
    phone.value !== (authStore.profile?.phone || "")
);

const initials = computed(() =>
  toInitials(name.value || authStore.profile?.name, authStore.user?.email)
);
const memberSince = computed(() => {
  const iso = authStore.profile?.created_at;
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  try {
    return new Intl.DateTimeFormat(localeTag(), { year: "numeric", month: "long" }).format(d);
  } catch {
    return "";
  }
});

async function onSaveProfile() {
  if (!profileDirty.value || savingProfile.value) return;
  savingProfile.value = true;
  try {
    await updateProfile({ name: name.value, nationality: nationality.value, phone: phone.value });
    showSuccess(t("account.profileSaved"));
  } catch (e) {
    showError(e?.message || t("auth.errGeneric"));
  } finally {
    savingProfile.value = false;
  }
}

// ───── password ─────
const pw1 = ref("");
const pw2 = ref("");
const savingPw = ref(false);
const canChangePw = computed(() => pw1.value.length >= 6 && pw2.value.length >= 6);

async function onChangePassword() {
  if (!canChangePw.value || savingPw.value) return;
  if (pw1.value !== pw2.value) {
    showError(t("account.errPasswordMatch"));
    return;
  }
  savingPw.value = true;
  try {
    await changePassword(pw1.value);
    pw1.value = "";
    pw2.value = "";
    showSuccess(t("account.passwordChanged"));
  } catch (e) {
    showError(e?.message || t("auth.errPassword"));
  } finally {
    savingPw.value = false;
  }
}

// ───── delete account ─────
const deleting = ref(false);
async function onDeleteAccount() {
  const alert = await alertController.create({
    header: t("account.deleteConfirmTitle"),
    message: t("account.deleteConfirmMsg"),
    cssClass: "confirm-alert",
    buttons: [
      { text: t("auth.logoutCancel"), role: "cancel", cssClass: "confirm-btn-cancel" },
      {
        text: t("account.deleteConfirmBtn"),
        role: "destructive",
        cssClass: "confirm-btn-danger",
        handler: () => {
          runDelete();
        },
      },
    ],
  });
  await alert.present();
}

async function runDelete() {
  deleting.value = true;
  try {
    await deleteAccount();
    ionRouter.push("/login", "root");
    showSuccess(t("account.deleted"));
  } catch (e) {
    showError(e?.message || t("auth.errGeneric"));
  } finally {
    deleting.value = false;
  }
}
</script>

<style scoped>
.page { --background: #f7faf9; }
.wrap { max-width: 560px; margin: 0 auto; padding: 16px 18px 28px; font-family: "Cairo", sans-serif; }

/* identity hero */
.hero {
  position: relative;
  overflow: hidden;
  display: flex; flex-direction: column; align-items: center; text-align: center;
  gap: 6px; padding: 26px 18px 22px; margin-bottom: 8px;
  border-radius: 22px;
  background: linear-gradient(150deg, #2dd4bf 0%, #14b8a6 50%, #0d9488 100%);
  color: #fff;
  box-shadow: 0 16px 34px rgba(13, 148, 136, 0.32);
}
.hero-glow {
  position: absolute; inset-inline-end: -40px; top: -50px;
  width: 160px; height: 160px; border-radius: 50%;
  background: radial-gradient(circle, rgba(255,255,255,0.22), rgba(255,255,255,0) 70%);
  pointer-events: none;
}
.hero-glow.g2 { inset-inline-start: -30px; inset-inline-end: auto; top: auto; bottom: -54px; width: 130px; height: 130px; }
.avatar {
  position: relative;
  width: 72px; height: 72px; border-radius: 50%;
  display: grid; place-items: center;
  background: rgba(255,255,255,0.22); border: 1.5px solid rgba(255,255,255,0.5);
  font-size: 1.7rem; font-weight: 800; letter-spacing: 0.5px;
  box-shadow: inset 0 1px 1px rgba(255,255,255,0.5);
}
.hero-name {
  position: relative; margin: 8px 0 0;
  font-size: 1.4rem; font-weight: 800; line-height: 1.3;
  text-shadow: 0 1px 6px rgba(0,0,0,0.12);
}
.hero-email { position: relative; margin: 0; font-size: 0.85rem; color: rgba(255,255,255,0.9); }
.hero-chip {
  position: relative; display: inline-flex; align-items: center; gap: 6px;
  margin-top: 8px; padding: 5px 13px; border-radius: 999px;
  background: rgba(255,255,255,0.2); backdrop-filter: blur(4px);
  font-size: 0.76rem; font-weight: 700;
}
.hero-chip ion-icon { font-size: 0.95rem; }

.section-h { margin: 16px 2px 10px; font-size: 1.02rem; font-weight: 800; color: #0f766e; }
.section-h.danger { color: #dc2626; }

.card {
  padding: 16px; border-radius: 16px; background: #fff;
  border: 1px solid rgba(13,148,136,0.1); box-shadow: 0 6px 18px rgba(13,70,65,0.06);
  margin-bottom: 12px;
}
.danger-card { border-color: rgba(220,38,38,0.18); }

.field { display: block; margin-bottom: 12px; }
.lbl {
  display: flex; align-items: center; gap: 6px;
  margin: 0 0 6px; font-size: 0.85rem; font-weight: 700; color: #1b2524;
}
.lbl ion-icon { font-size: 1rem; color: var(--ion-color-primary); }
.inp {
  width: 100%; box-sizing: border-box;
  padding: 12px 14px; border-radius: 12px;
  border: 1px solid rgba(13,148,136,0.22); background: #f9fdfc;
  font-family: "Cairo", sans-serif; font-size: 0.95rem; color: #1b2524;
  outline: none; transition: border-color 0.15s ease, background 0.15s ease;
}
.inp:focus { border-color: var(--ion-color-primary); background: #fff; }

.warn { margin: 0 0 14px; font-size: 0.88rem; line-height: 1.7; color: #b91c1c; }

.btn {
  width: 100%;
  display: inline-flex; align-items: center; justify-content: center; gap: 8px;
  border: none; border-radius: 12px; padding: 12px 16px; margin-top: 4px;
  font-family: "Cairo", sans-serif; font-weight: 800; font-size: 0.92rem; cursor: pointer;
  transition: opacity 0.16s ease, transform 0.12s ease;
}
.btn:active:not(:disabled) { transform: scale(0.98); }
.btn:disabled { opacity: 0.45; cursor: default; }
.btn ion-icon { font-size: 1.15rem; }
.btn.primary { background: var(--ion-color-primary); color: #fff; box-shadow: 0 8px 18px rgba(13,148,136,0.28); }
.btn.danger { background: rgba(220,38,38,0.1); color: #dc2626; }

.spinner {
  width: 16px; height: 16px; border-radius: 50%;
  border: 2px solid rgba(255,255,255,0.45); border-top-color: #fff;
  animation: spin 0.7s linear infinite;
}
.spinner.dark { border-color: rgba(220,38,38,0.35); border-top-color: #dc2626; }
@keyframes spin { to { transform: rotate(360deg); } }
</style>
