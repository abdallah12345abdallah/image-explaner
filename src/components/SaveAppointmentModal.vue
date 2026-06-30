<template>
  <ion-modal
    :is-open="open"
    :breakpoints="[0, 0.92]"
    :initial-breakpoint="0.92"
    @did-dismiss="close"
  >
    <div class="sheet-shell" :dir="dir">
      <div class="sheet-head">
        <h2>{{ initial && initial.id ? t("modal.editTitle") : t("modal.saveTitle") }}</h2>
        <div class="head-actions">
          <button class="save-h" @click="onSave">
            <ion-icon :icon="checkmarkOutline"></ion-icon>
            {{ t("modal.save") }}
          </button>
          <button class="x" :aria-label="t('common.back')" @click="close">
            <ion-icon :icon="closeOutline"></ion-icon>
          </button>
        </div>
      </div>

      <ion-content :dir="dir" class="sheet">
        <label class="field">
        <span class="lbl">{{ t("modal.titleLabel") }}</span>
        <input v-model="title" class="inp" type="text" :placeholder="t('modal.titlePlaceholder')" />
      </label>

      <label class="field">
        <span class="lbl">{{ t("modal.datetime") }}</span>
        <ion-datetime
          v-model="dt"
          presentation="date-time"
          :prefer-wheel="false"
          :locale="localeTag()"
          class="dtp"
        ></ion-datetime>
      </label>

      <label class="field">
        <span class="lbl">{{ t("modal.locationLabel") }}</span>
        <input v-model="location" class="inp" type="text" :placeholder="t('modal.locationPlaceholder')" />
      </label>

      <div class="field">
        <span class="lbl">{{ t("modal.remindBefore") }}</span>
        <div class="leads">
          <button
            v-for="opt in leadOptions"
            :key="opt.value"
            class="lead"
            :class="{ active: lead === opt.value }"
            @click="lead = opt.value"
          >
            {{ opt.label }}
          </button>
        </div>
      </div>

      <div class="field">
        <span class="lbl">{{ t("modal.repeat") }}</span>
        <div class="leads">
          <button
            v-for="opt in recurOptions"
            :key="opt.value"
            class="lead"
            :class="{ active: recurrence === opt.value }"
            @click="recurrence = opt.value"
          >
            {{ opt.label }}
          </button>
        </div>
      </div>
      </ion-content>
    </div>
  </ion-modal>
</template>

<script setup>
import { IonModal, IonContent, IonDatetime, IonIcon } from "@ionic/vue";
import { closeOutline, checkmarkOutline } from "ionicons/icons";
import { ref, computed, watch } from "vue";
import { toLocalISO } from "@/services/datetime";
import { settingsStore } from "@/stores/settings";
import { t, dir, localeTag, leadOptions as i18nLeadOptions } from "@/i18n";

const props = defineProps({
  open: { type: Boolean, default: false },
  initial: { type: Object, default: null },
});
const emit = defineEmits(["update:open", "save"]);

const leadOptions = computed(() => i18nLeadOptions());
const recurOptions = computed(() => [
  { value: "none", label: t("recur.none") },
  { value: "daily", label: t("recur.daily") },
  { value: "weekly", label: t("recur.weekly") },
  { value: "monthly", label: t("recur.monthly") },
]);

const title = ref("");
const dt = ref("");
const location = ref("");
const lead = ref(30);
const recurrence = ref("none");

function seed() {
  const i = props.initial || {};
  title.value = i.title || "";
  location.value = i.location || "";
  lead.value = i.leadMinutes || settingsStore.defaultLeadMinutes || 30;
  recurrence.value = i.recurrence || "none";
  // default datetime: provided ISO if valid, else now + 1 hour
  let base = i.datetimeISO ? new Date(i.datetimeISO) : null;
  if (!base || isNaN(base.getTime())) {
    base = new Date(Date.now() + 60 * 60 * 1000);
  }
  dt.value = toLocalISO(base);
}

watch(
  () => props.open,
  (v) => {
    if (v) seed();
  }
);

function close() {
  emit("update:open", false);
}

function onSave() {
  const d = new Date(dt.value);
  if (isNaN(d.getTime())) return;
  emit("save", {
    id: props.initial?.id || null,
    title: (title.value || t("modal.defaultTitle")).trim(),
    datetimeISO: toLocalISO(d),
    location: location.value.trim(),
    leadMinutes: lead.value,
    recurrence: recurrence.value,
  });
  close();
}
</script>

<style scoped>
/* flex column: form scrolls, footer stays pinned at the bottom */
.sheet-shell {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  background: #f7faf9;
}
.sheet {
  flex: 1 1 auto;
  min-height: 0; /* allow ion-content to shrink and scroll */
  --background: #f7faf9;
  font-family: "Cairo", sans-serif;
}
.sheet-head {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 16px 18px 12px;
  background: #f7faf9;
  border-bottom: 1px solid rgba(13, 70, 65, 0.06);
}
.sheet-head h2 { margin: 0; font-size: 1.2rem; font-weight: 800; color: #0f766e; }
.head-actions { display: flex; align-items: center; gap: 8px; }
.save-h {
  display: inline-flex; align-items: center; gap: 5px;
  padding: 8px 16px; border: none; border-radius: 11px;
  background: linear-gradient(100deg, #0d9488, #14b8a6); color: #fff;
  font-family: "Cairo", sans-serif; font-weight: 800; font-size: 0.92rem; cursor: pointer;
  box-shadow: 0 6px 16px rgba(13, 148, 136, 0.32);
  transition: transform 0.15s ease;
}
.save-h ion-icon { font-size: 1.05rem; }
.save-h:active { transform: scale(0.95); }
.x {
  width: 34px; height: 34px; border: none; border-radius: 11px;
  background: rgba(13,148,136,0.1); color: var(--ion-color-primary);
  font-size: 1.15rem; display: grid; place-items: center; cursor: pointer;
}
.field { display: block; padding: 10px 18px; }
.lbl { display: block; font-size: 0.85rem; font-weight: 700; color: #5b6b69; margin-bottom: 6px; }
.inp {
  width: 100%; box-sizing: border-box;
  padding: 12px 14px; border-radius: 12px;
  border: 1px solid rgba(13,148,136,0.2); background: #fff;
  font-family: "Cairo", sans-serif; font-size: 1rem; color: #1b2524;
}
.dtp {
  width: 100%;
  max-width: 100%;
  border-radius: 14px; background: #fff;
  border: 1px solid rgba(13,148,136,0.15);
  --background: #fff;
}
.leads { display: flex; flex-wrap: wrap; gap: 8px; }
.lead {
  padding: 8px 14px; border-radius: 999px;
  border: 1px solid rgba(13,148,136,0.25); background: #fff;
  color: #5b6b69; font-family: "Cairo", sans-serif; font-weight: 700; font-size: 0.85rem; cursor: pointer;
  transition: all 0.15s ease;
}
.lead.active { background: var(--ion-color-primary); color: #fff; border-color: var(--ion-color-primary); }
</style>
