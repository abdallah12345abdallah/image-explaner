<template>
  <ion-page>
    <AppNavbar :title="t('history.title')">
      <template #actions>
        <button v-if="items.length" @click="onClear" :aria-label="t('common.delete')">
          <ion-icon :icon="trashOutline"></ion-icon>
        </button>
      </template>
    </AppNavbar>

    <ion-content :fullscreen="true" :dir="dir" class="page">
      <ion-refresher slot="fixed" @ionRefresh="onRefresh">
        <ion-refresher-content></ion-refresher-content>
      </ion-refresher>

      <div class="wrap">
        <!-- while fetching from the server → skeletons in place of the cards -->
        <div v-if="loading" class="list" aria-busy="true">
          <div v-for="n in 6" :key="n" class="item skel">
            <span class="thumb"><ion-skeleton-text :animated="true" /></span>
            <div class="text">
              <ion-skeleton-text :animated="true" class="s-line w70" />
              <ion-skeleton-text :animated="true" class="s-line w40" />
              <ion-skeleton-text :animated="true" class="s-line w30" />
            </div>
          </div>
        </div>

        <div v-else-if="items.length" class="list">
          <div v-for="h in items" :key="h.id" class="item" @click="openItem(h)">
            <img v-if="h.thumb" :src="h.thumb" class="thumb" alt="" />
            <span v-else class="thumb ph"><ion-icon :icon="documentTextOutline"></ion-icon></span>
            <div class="text">
              <strong>{{ h.data.title_ar || h.data.document_type || t("history.document") }}</strong>
              <small>{{ h.data.document_type }}</small>
              <small class="when">{{ fmt(h.createdAt) }}</small>
            </div>
            <button class="del" aria-label="حذف" @click.stop="onRemove(h)">
              <ion-icon :icon="trashOutline"></ion-icon>
            </button>
          </div>
        </div>

        <div v-else class="empty">
          <ion-icon :icon="timeOutline" class="empty-ico"></ion-icon>
          <p>{{ t("history.empty") }}</p>
        </div>
      </div>
    </ion-content>

    <history-detail-modal
      v-model:open="detailOpen"
      :item="selected"
      @delete="onDetailDelete"
      @add-appointment="onAddAppointment"
    />

    <save-appointment-modal
      v-model:open="saveOpen"
      :initial="saveInitial"
      @save="onSave"
    />
  </ion-page>
</template>

<script setup>
import {
  IonPage,
  IonContent,
  IonIcon,
  IonSkeletonText,
  IonRefresher,
  IonRefresherContent,
  onIonViewWillEnter,
} from "@ionic/vue";
import {
  trashOutline,
  documentTextOutline,
  timeOutline,
} from "ionicons/icons";
import { computed, ref } from "vue";
import AppNavbar from "@/components/AppNavbar.vue";
import HistoryDetailModal from "@/components/HistoryDetailModal.vue";
import SaveAppointmentModal from "@/components/SaveAppointmentModal.vue";
import { t, dir, localeTag } from "@/i18n";
import { historyStore, removeHistory, clearHistory, syncHistory } from "@/stores/history";
import { addAppointment } from "@/stores/appointments";
import { hasPermission } from "@/services/notifications";
import { useToast } from "@/composables/useToast";

const { showSuccess, showWarning } = useToast();

// Pull the latest history from the server each time this page is opened (no-op
// when logged out). The local cache renders instantly meanwhile.
onIonViewWillEnter(() => {
  syncHistory().catch(() => {});
});

// Pull-to-refresh: refresh in place (no skeleton) and end the spinner.
async function onRefresh(ev) {
  try {
    await syncHistory({ silent: true });
  } finally {
    ev.target.complete();
  }
}

const items = computed(() => historyStore.items);
// Show skeletons only while fetching with nothing cached to display.
const loading = computed(() => historyStore.loading);

// --- detail panel ---
const selected = ref(null);
const detailOpen = ref(false);

function openItem(h) {
  selected.value = h;
  detailOpen.value = true;
}
function onDetailDelete() {
  if (selected.value) removeHistory(selected.value.id);
  detailOpen.value = false;
}

// --- "add as appointment" from the panel ---
const saveOpen = ref(false);
const saveInitial = computed(() => {
  const d = selected.value?.data || {};
  return {
    title: d.title_ar || d.document_type || t("modal.defaultTitle"),
    datetimeISO: d.appointment_datetime || "",
    location: d.location_ar || "",
  };
});
function onAddAppointment() {
  // Close the detail sheet first, then open the save sheet once it has
  // animated away (avoids two bottom-sheets fighting over the screen).
  detailOpen.value = false;
  setTimeout(() => {
    saveOpen.value = true;
  }, 260);
}
async function onSave(payload) {
  await addAppointment(payload);
  const granted = await hasPermission();
  if (granted) showSuccess(t("appts.saved"));
  else showWarning(t("appts.savedNoPerm"));
}

function fmt(iso) {
  try {
    return new Intl.DateTimeFormat(localeTag(), {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }).format(new Date(iso));
  } catch {
    return "";
  }
}

function onRemove(h) {
  removeHistory(h.id);
}
function onClear() {
  clearHistory();
}
</script>

<style scoped>
.page { --background: #f7faf9; }
.wrap { max-width: 560px; margin: 0 auto; padding: 14px 18px 28px; font-family: "Cairo", sans-serif; }

.list { display: flex; flex-direction: column; gap: 10px; }
.item {
  display: flex; align-items: center; gap: 12px;
  padding: 10px 12px; border-radius: 16px; background: #fff;
  border: 1px solid rgba(13,148,136,0.1); box-shadow: 0 6px 18px rgba(13,70,65,0.06);
  cursor: pointer; transition: transform 0.16s ease;
}
.item:active { transform: scale(0.98); }
.thumb { flex: 0 0 auto; width: 54px; height: 54px; border-radius: 12px; object-fit: cover; }
.thumb.ph { display: grid; place-items: center; background: rgba(13,148,136,0.1); color: var(--ion-color-primary); font-size: 1.5rem; }

/* skeleton placeholders while the GET is in flight */
.item.skel { cursor: default; }
.item.skel:active { transform: none; }
.item.skel .thumb { overflow: hidden; }
.item.skel .thumb ion-skeleton-text { width: 100%; height: 100%; margin: 0; --border-radius: 12px; }
.item.skel .text { gap: 7px; }
.s-line { --border-radius: 6px; margin: 0; height: 12px; }
.s-line.w70 { width: 70%; height: 14px; }
.s-line.w40 { width: 40%; }
.s-line.w30 { width: 30%; height: 10px; }
.text { flex: 1 1 auto; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
.text strong { font-size: 1rem; font-weight: 700; color: #1b2524; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.text small { font-size: 0.8rem; color: #7a8a88; }
.text small.when { font-size: 0.74rem; opacity: 0.8; }
.del { flex: 0 0 auto; width: 34px; height: 34px; border: none; border-radius: 10px; background: rgba(239,68,68,0.08); color: #ef4444; font-size: 1.05rem; display: grid; place-items: center; cursor: pointer; }

.empty { text-align: center; color: #7a8a88; padding: 48px 18px; }
.empty-ico { font-size: 3rem; color: rgba(13,148,136,0.4); }
.empty p { margin: 12px 0 0; }
</style>
