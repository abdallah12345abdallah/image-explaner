<template>
  <ion-modal
    :is-open="open"
    :breakpoints="[0, 0.85]"
    :initial-breakpoint="0.85"
    @did-dismiss="close"
  >
    <div class="sheet-shell" :dir="dir">
      <div class="sheet-head">
        <h2>{{ t("appts.detailTitle") }}</h2>
        <button class="x" :aria-label="t('common.back')" @click="close">
          <ion-icon :icon="closeOutline"></ion-icon>
        </button>
      </div>

      <ion-content class="sheet">
        <div v-if="a" class="detail">
          <!-- title hero -->
          <div class="hero">
            <span class="hero-deco" aria-hidden="true"></span>
            <span class="hero-deco hero-deco2" aria-hidden="true"></span>
            <span class="hero-ico"><ion-icon :icon="calendarOutline"></ion-icon></span>
            <h3 class="hero-title">{{ a.title }}</h3>
            <p v-if="relative" class="hero-rel">{{ relative }}</p>
            <span class="hero-when" :class="{ past: isPast }">
              <ion-icon :icon="isPast ? checkmarkDoneOutline : timeOutline"></ion-icon>
              {{ isPast ? t("appts.past") : t("appts.upcoming") }}
            </span>
          </div>

          <!-- rows -->
          <div class="row">
            <span class="r-ico teal"><ion-icon :icon="timeOutline"></ion-icon></span>
            <div class="r-text">
              <p class="r-label">{{ t("modal.datetime") }}</p>
              <p class="r-value">{{ fmt(a.datetimeISO) }}</p>
            </div>
          </div>

          <button v-if="a.location" class="row tappable" @click="openMap(a.location)">
            <span class="r-ico slate"><ion-icon :icon="locationOutline"></ion-icon></span>
            <div class="r-text">
              <p class="r-label">{{ t("result.place") }}</p>
              <p class="r-value">{{ a.location }}</p>
            </div>
            <ion-icon :icon="navigateOutline" class="r-go"></ion-icon>
          </button>

          <div class="row">
            <span class="r-ico amber"><ion-icon :icon="notificationsOutline"></ion-icon></span>
            <div class="r-text">
              <p class="r-label">{{ t("appts.reminderBefore") }}</p>
              <p class="r-value">{{ leadLabel(a.leadMinutes) }}</p>
            </div>
          </div>

          <div v-if="a.recurrence && a.recurrence !== 'none'" class="row">
            <span class="r-ico teal"><ion-icon :icon="repeatOutline"></ion-icon></span>
            <div class="r-text">
              <p class="r-label">{{ t("modal.repeat") }}</p>
              <p class="r-value">{{ t("recur." + a.recurrence) }}</p>
            </div>
          </div>
        </div>
      </ion-content>

      <div class="sheet-foot">
        <button class="act delete" @click="emit('delete')">
          <ion-icon :icon="trashOutline"></ion-icon>
          {{ t("common.delete") }}
        </button>
        <button class="act edit" @click="emit('edit')">
          <ion-icon :icon="createOutline"></ion-icon>
          {{ t("common.edit") }}
        </button>
      </div>
    </div>
  </ion-modal>
</template>

<script setup>
import { computed } from "vue";
import { IonModal, IonContent, IonIcon } from "@ionic/vue";
import {
  closeOutline,
  calendarOutline,
  timeOutline,
  locationOutline,
  notificationsOutline,
  navigateOutline,
  trashOutline,
  createOutline,
  repeatOutline,
  checkmarkDoneOutline,
} from "ionicons/icons";
import { t, dir, localeTag, leadLabel } from "@/i18n";
import { formatArabicDateTime } from "@/services/datetime";

const props = defineProps({
  open: { type: Boolean, default: false },
  appointment: { type: Object, default: null },
});
const emit = defineEmits(["update:open", "delete", "edit"]);

const a = computed(() => props.appointment);
const fmt = (iso) => formatArabicDateTime(iso);
const isPast = computed(() => {
  const v = props.appointment?.datetimeISO;
  return v ? new Date(v).getTime() < Date.now() : false;
});

// localized relative time, e.g. "tomorrow" / "بعد ٣ أيام" / "2 hours ago"
const relative = computed(() => {
  const v = props.appointment?.datetimeISO;
  if (!v) return "";
  const diff = new Date(v).getTime() - Date.now();
  const abs = Math.abs(diff);
  try {
    const rtf = new Intl.RelativeTimeFormat(localeTag(), { numeric: "auto" });
    if (abs >= 86400000) return rtf.format(Math.round(diff / 86400000), "day");
    if (abs >= 3600000) return rtf.format(Math.round(diff / 3600000), "hour");
    return rtf.format(Math.round(diff / 60000), "minute");
  } catch {
    return "";
  }
});

function openMap(query) {
  const url =
    "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(query);
  window.open(url, "_blank", "noopener");
}
function close() {
  emit("update:open", false);
}
</script>

<style scoped>
.sheet-shell {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  background: #f7faf9;
  font-family: "Cairo", sans-serif;
}
.sheet-head {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 18px 12px;
  background: #f7faf9;
  border-bottom: 1px solid rgba(13, 70, 65, 0.06);
}
.sheet-head h2 { margin: 0; font-size: 1.2rem; font-weight: 800; color: #0f766e; }
.x {
  width: 34px; height: 34px; border: none; border-radius: 11px;
  background: rgba(13, 148, 136, 0.1); color: var(--ion-color-primary);
  font-size: 1.15rem; display: grid; place-items: center; cursor: pointer;
}
.sheet { flex: 1 1 auto; min-height: 0; --background: #f7faf9; }

.detail { padding: 16px 18px; }

/* hero */
.hero {
  position: relative;
  overflow: hidden;
  display: flex; flex-direction: column; align-items: center; text-align: center;
  gap: 8px; padding: 24px 18px 22px; margin-bottom: 16px;
  border-radius: 22px;
  background: linear-gradient(150deg, #2dd4bf 0%, #14b8a6 50%, #0d9488 100%);
  color: #fff;
  box-shadow: 0 16px 34px rgba(13, 148, 136, 0.38);
}
/* contained decorative glows (radial-gradient = no overflow/compositing issues) */
.hero-deco {
  position: absolute;
  width: 150px; height: 150px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.22), rgba(255, 255, 255, 0) 70%);
  pointer-events: none;
}
.hero-deco { inset-inline-end: -36px; top: -46px; }
.hero-deco2 {
  inset-inline-start: -30px; bottom: -50px;
  width: 120px; height: 120px;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.16), rgba(255, 255, 255, 0) 70%);
}
.hero-ico {
  position: relative;
  width: 58px; height: 58px; border-radius: 18px;
  display: grid; place-items: center; font-size: 1.75rem;
  background: rgba(255, 255, 255, 0.2);
  box-shadow: inset 0 1px 1px rgba(255, 255, 255, 0.5);
}
.hero-title {
  position: relative;
  margin: 4px 0 0; font-size: 1.3rem; font-weight: 800; line-height: 1.4;
  text-shadow: 0 1px 6px rgba(0, 0, 0, 0.12);
}
.hero-rel {
  position: relative;
  margin: 0; font-size: 0.92rem; font-weight: 700;
  opacity: 0.95;
}
.hero-when {
  position: relative;
  display: inline-flex; align-items: center; gap: 5px;
  margin-top: 4px;
  font-size: 0.76rem; font-weight: 800;
  padding: 5px 13px; border-radius: 999px;
  background: rgba(255, 255, 255, 0.22);
  backdrop-filter: blur(4px);
}
.hero-when ion-icon { font-size: 0.95rem; }
.hero-when.past { background: rgba(0, 0, 0, 0.2); }

/* rows */
.row {
  display: flex; align-items: center; gap: 12px; width: 100%;
  padding: 14px; margin-bottom: 10px;
  border-radius: 16px; background: #fff;
  border: 1px solid rgba(13, 70, 65, 0.06);
  box-shadow: 0 6px 18px rgba(13, 70, 65, 0.05);
  text-align: start; font-family: "Cairo", sans-serif;
}
.row.tappable { cursor: pointer; transition: transform 0.15s ease; }
.row.tappable:active { transform: scale(0.98); }
.r-ico {
  flex: 0 0 auto; width: 44px; height: 44px; border-radius: 13px;
  display: grid; place-items: center; color: #fff; font-size: 1.25rem;
}
.r-ico.teal { background: linear-gradient(135deg, #14b8a6, #0d9488); }
.r-ico.amber { background: linear-gradient(135deg, #fbbf24, #f59e0b); }
.r-ico.slate { background: linear-gradient(135deg, #64748b, #475569); }
.r-text { flex: 1 1 auto; min-width: 0; }
.r-label { margin: 0; font-size: 0.76rem; color: #7a8a88; font-weight: 600; }
.r-value { margin: 2px 0 0; font-size: 1rem; font-weight: 700; color: #1b2524; line-height: 1.5; }
.r-go { flex: 0 0 auto; color: var(--ion-color-primary); font-size: 1.2rem; }

/* footer actions */
.sheet-foot {
  flex: 0 0 auto;
  display: flex; gap: 10px;
  padding: 12px 18px calc(12px + env(safe-area-inset-bottom, 0px));
  background: #f7faf9;
  box-shadow: 0 -10px 18px rgba(13, 70, 65, 0.06);
}
.act {
  flex: 1 1 0;
  display: inline-flex; align-items: center; justify-content: center; gap: 7px;
  padding: 0.95rem; border: none; border-radius: 14px;
  font-family: "Cairo", sans-serif; font-weight: 800; font-size: 1rem; cursor: pointer;
  transition: transform 0.15s ease;
}
.act:active { transform: scale(0.97); }
.act ion-icon { font-size: 1.2rem; }
.act.delete {
  flex: 0 0 auto; width: 54px;
  background: rgba(239, 68, 68, 0.1); color: #ef4444;
}
.act.edit {
  background: linear-gradient(100deg, #0d9488, #14b8a6); color: #fff;
  box-shadow: 0 10px 22px rgba(13, 148, 136, 0.32);
}
</style>
