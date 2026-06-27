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
      <div class="wrap">
        <div v-if="items.length" class="list">
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
  </ion-page>
</template>

<script setup>
import {
  IonPage,
  IonContent,
  IonIcon,
  useIonRouter,
} from "@ionic/vue";
import {
  trashOutline,
  documentTextOutline,
  timeOutline,
} from "ionicons/icons";
import { computed } from "vue";
import AppNavbar from "@/components/AppNavbar.vue";
import { t, dir, localeTag } from "@/i18n";
import { historyStore, removeHistory, clearHistory } from "@/stores/history";
import { setResult } from "@/stores/result";

const ionRouter = useIonRouter();
const items = computed(() => historyStore.items);

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

function openItem(h) {
  setResult(h.data, h.thumb || null);
  ionRouter.push("/result", "forward");
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
.text { flex: 1 1 auto; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
.text strong { font-size: 1rem; font-weight: 700; color: #1b2524; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.text small { font-size: 0.8rem; color: #7a8a88; }
.text small.when { font-size: 0.74rem; opacity: 0.8; }
.del { flex: 0 0 auto; width: 34px; height: 34px; border: none; border-radius: 10px; background: rgba(239,68,68,0.08); color: #ef4444; font-size: 1.05rem; display: grid; place-items: center; cursor: pointer; }

.empty { text-align: center; color: #7a8a88; padding: 48px 18px; }
.empty-ico { font-size: 3rem; color: rgba(13,148,136,0.4); }
.empty p { margin: 12px 0 0; }
</style>
