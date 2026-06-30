<template>
  <ion-modal
    :is-open="open"
    :breakpoints="[0, 0.9]"
    :initial-breakpoint="0.9"
    @did-dismiss="close"
  >
    <div class="sheet-shell" :dir="dir">
      <div class="sheet-head">
        <h2>{{ t("history.detailTitle") }}</h2>
        <button class="x" :aria-label="t('common.back')" @click="close">
          <ion-icon :icon="closeOutline"></ion-icon>
        </button>
      </div>

      <ion-content class="sheet">
        <div v-if="data" class="detail">
          <!-- hero: thumbnail (or gradient fallback) with type + title -->
          <div class="hero" :class="{ 'no-img': !thumb }">
            <img v-if="thumb" :src="thumb" alt="" class="hero-img" />
            <span v-else class="hero-deco" aria-hidden="true"></span>
            <div class="hero-overlay"></div>
            <div class="hero-text">
              <div class="tags">
                <span v-if="data.document_type" class="tag type">{{ data.document_type }}</span>
                <span v-if="data.is_appointment" class="tag badge">
                  <ion-icon :icon="calendarOutline"></ion-icon>
                  {{ t("result.appointment") }}
                </span>
              </div>
              <h3 class="hero-title">{{ title }}</h3>
            </div>
          </div>

          <!-- summary -->
          <section v-if="data.summary_ar" class="card">
            <h4 class="card-h">
              <ion-icon :icon="sparklesOutline"></ion-icon>
              {{ t("result.summary") }}
            </h4>
            <p class="summary">{{ data.summary_ar }}</p>
          </section>

          <!-- detail rows -->
          <button
            v-for="d in details"
            :key="d.label"
            class="row"
            :class="{ tappable: d.map }"
            @click="d.map && openMap(d.value)"
          >
            <span class="r-ico" :class="d.tone"><ion-icon :icon="d.icon"></ion-icon></span>
            <div class="r-text">
              <p class="r-label">{{ d.label }}</p>
              <p class="r-value">{{ d.value }}</p>
            </div>
            <ion-icon v-if="d.map" :icon="navigateOutline" class="r-go"></ion-icon>
          </button>

          <!-- when it was analyzed -->
          <div class="row">
            <span class="r-ico slate"><ion-icon :icon="timeOutline"></ion-icon></span>
            <div class="r-text">
              <p class="r-label">{{ t("history.analyzedOn") }}</p>
              <p class="r-value">{{ analyzedOn }}</p>
            </div>
          </div>
        </div>
      </ion-content>

      <div class="sheet-foot">
        <button class="act delete" @click="emit('delete')">
          <ion-icon :icon="trashOutline"></ion-icon>
          {{ t("common.delete") }}
        </button>
        <button class="act save" @click="emit('add-appointment')">
          <ion-icon :icon="notificationsOutline"></ion-icon>
          {{ data && data.is_appointment ? t("result.saveAppt") : t("result.addAsAppt") }}
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
  checkmarkCircleOutline,
  sparklesOutline,
  navigateOutline,
  trashOutline,
  notificationsOutline,
} from "ionicons/icons";
import { t, dir, localeTag } from "@/i18n";

const props = defineProps({
  open: { type: Boolean, default: false },
  item: { type: Object, default: null },
});
const emit = defineEmits(["update:open", "delete", "add-appointment"]);

const data = computed(() => props.item?.data || null);
const thumb = computed(() => props.item?.thumb || null);
const title = computed(
  () => data.value?.title_ar || data.value?.document_type || t("history.document")
);

const analyzedOn = computed(() => {
  const iso = props.item?.createdAt;
  if (!iso) return "";
  try {
    return new Intl.DateTimeFormat(localeTag(), {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }).format(new Date(iso));
  } catch {
    return "";
  }
});

// Same fields the result page surfaces, built from the stored analysis.
const details = computed(() => {
  const d = data.value;
  if (!d) return [];
  const out = [];
  if (d.date_ar)
    out.push({ icon: calendarOutline, label: t("result.date"), value: d.date_ar, tone: "teal" });
  if (d.time_ar)
    out.push({ icon: timeOutline, label: t("result.time"), value: d.time_ar, tone: "amber" });
  if (d.location_ar)
    out.push({
      icon: locationOutline,
      label: t("result.place"),
      value: d.location_ar,
      tone: "slate",
      map: true,
    });
  if (d.action_required_ar)
    out.push({
      icon: checkmarkCircleOutline,
      label: t("result.actionRequired"),
      value: d.action_required_ar,
      tone: "teal",
    });
  return out;
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

/* hero with thumbnail */
.hero {
  position: relative;
  overflow: hidden;
  height: 180px;
  margin-bottom: 16px;
  border-radius: 22px;
  box-shadow: 0 16px 34px rgba(13, 148, 136, 0.28);
}
.hero.no-img { background: linear-gradient(150deg, #2dd4bf 0%, #14b8a6 50%, #0d9488 100%); }
.hero-img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
.hero-overlay {
  position: absolute; inset: 0;
  background: linear-gradient(
    to top,
    rgba(6, 58, 53, 0.92) 0%,
    rgba(6, 58, 53, 0.4) 48%,
    rgba(6, 58, 53, 0.05) 78%
  );
}
.hero-deco {
  position: absolute; inset-inline-end: -36px; top: -46px;
  width: 160px; height: 160px; border-radius: 50%;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.22), rgba(255, 255, 255, 0) 70%);
}
.hero-text { position: absolute; inset-inline: 0; bottom: 0; padding: 16px 18px; color: #fff; }
.tags { display: flex; flex-wrap: wrap; gap: 7px; margin-bottom: 7px; }
.tag {
  display: inline-flex; align-items: center; gap: 5px;
  padding: 4px 11px; border-radius: 999px;
  font-size: 0.76rem; font-weight: 700;
  backdrop-filter: blur(6px);
}
.tag.type { background: rgba(255, 255, 255, 0.22); border: 1px solid rgba(255, 255, 255, 0.3); }
.tag.badge { background: linear-gradient(135deg, #fbbf24, #f59e0b); color: #5a3a00; }
.tag.badge ion-icon { font-size: 0.9rem; }
.hero-title {
  margin: 0; font-size: 1.3rem; font-weight: 800; line-height: 1.35;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.35);
}

/* summary card */
.card {
  padding: 16px 18px; margin-bottom: 14px;
  border-radius: 16px; background: #fff;
  border: 1px solid rgba(13, 148, 136, 0.1);
  box-shadow: 0 8px 22px rgba(13, 70, 65, 0.07);
}
.card-h {
  display: flex; align-items: center; gap: 7px; margin: 0 0 8px;
  font-size: 1.02rem; font-weight: 800; color: var(--ion-color-primary);
}
.card-h ion-icon { font-size: 1.15rem; color: #f59e0b; }
.summary { margin: 0; font-size: 0.98rem; line-height: 1.85; color: #2b3a38; }

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
  font-family: "Cairo", sans-serif; font-weight: 800; font-size: 0.98rem; cursor: pointer;
  transition: transform 0.15s ease;
}
.act:active { transform: scale(0.97); }
.act ion-icon { font-size: 1.2rem; }
.act.delete { flex: 0 0 auto; width: 54px; background: rgba(239, 68, 68, 0.1); color: #ef4444; }
.act.save { background: linear-gradient(100deg, #0d9488, #14b8a6); color: #fff; box-shadow: 0 10px 22px rgba(13, 148, 136, 0.32); }
</style>
