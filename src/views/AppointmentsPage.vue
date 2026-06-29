<template>
  <ion-page>
    <AppNavbar :title="t('appts.title')">
      <template #actions>
        <button @click="openAdd" :aria-label="t('appts.add')">
          <ion-icon :icon="addOutline"></ion-icon>
        </button>
      </template>
    </AppNavbar>

    <ion-content :fullscreen="true" :dir="dir" class="page">
      <div class="wrap">
        <template v-if="upcomingItems.length || pastItems.length">
          <template v-if="upcomingItems.length">
            <h2 class="section-h">{{ t("appts.upcoming") }}</h2>
            <div class="list">
              <div
                v-for="a in upcomingItems"
                :key="a.id"
                class="item"
                @click="openView(a)"
              >
                <span class="ico"><ion-icon :icon="calendarOutline"></ion-icon></span>
                <div class="text">
                  <strong>{{ a.title }}</strong>
                  <small>{{ fmt(a.datetimeISO) }}</small>
                  <small v-if="a.location" class="loc">
                    <ion-icon :icon="locationOutline"></ion-icon> {{ a.location }}
                  </small>
                  <span class="lead-tag">{{ t("appts.reminderBefore") }} {{ leadLabel(a.leadMinutes) }}</span>
                </div>
                <button class="del" :aria-label="t('common.delete')" @click.stop="onDelete(a)">
                  <ion-icon :icon="trashOutline"></ion-icon>
                </button>
              </div>
            </div>
          </template>

          <template v-if="pastItems.length">
            <h2 class="section-h muted">{{ t("appts.past") }}</h2>
            <div class="list">
              <div v-for="a in pastItems" :key="a.id" class="item past" @click="openView(a)">
                <span class="ico gray"><ion-icon :icon="calendarOutline"></ion-icon></span>
                <div class="text">
                  <strong>{{ a.title }}</strong>
                  <small>{{ fmt(a.datetimeISO) }}</small>
                </div>
                <button class="del" :aria-label="t('common.delete')" @click.stop="onDelete(a)">
                  <ion-icon :icon="trashOutline"></ion-icon>
                </button>
              </div>
            </div>
          </template>
        </template>

        <div v-else class="empty">
          <ion-icon :icon="notificationsOutline" class="empty-ico"></ion-icon>
          <p>{{ t("appts.empty") }}</p>
          <button class="add-cta" @click="openAdd">
            <ion-icon :icon="addOutline"></ion-icon>
            {{ t("appts.add") }}
          </button>
        </div>
      </div>
    </ion-content>

    <save-appointment-modal
      v-model:open="modalOpen"
      :initial="null"
      @save="onSave"
    />

    <appointment-detail-modal
      v-model:open="detailOpen"
      :appointment="viewing"
      @delete="onDetailDelete"
    />
  </ion-page>
</template>

<script setup>
import {
  IonPage,
  IonContent,
  IonIcon,
} from "@ionic/vue";
import {
  addOutline,
  calendarOutline,
  locationOutline,
  trashOutline,
  notificationsOutline,
} from "ionicons/icons";
import { ref, computed } from "vue";
import {
  appointmentsStore,
  upcoming,
  past,
  addAppointment,
  removeAppointment,
} from "@/stores/appointments";
import { formatArabicDateTime } from "@/services/datetime";
import { t, dir, leadLabel } from "@/i18n";
import { hasPermission } from "@/services/notifications";
import { useToast } from "@/composables/useToast";
import SaveAppointmentModal from "@/components/SaveAppointmentModal.vue";
import AppointmentDetailModal from "@/components/AppointmentDetailModal.vue";

const { showSuccess, showWarning, showInfo } = useToast();
import AppNavbar from "@/components/AppNavbar.vue";

const fmt = (iso) => formatArabicDateTime(iso);
const upcomingItems = computed(() => {
  void appointmentsStore.items;
  return upcoming();
});
const pastItems = computed(() => {
  void appointmentsStore.items;
  return past();
});


const modalOpen = ref(false);

function openAdd() {
  modalOpen.value = true;
}

// view panel (read-only) + delete
const detailOpen = ref(false);
const viewing = ref(null);
function openView(a) {
  viewing.value = { ...a };
  detailOpen.value = true;
}
async function onDetailDelete() {
  const a = viewing.value;
  detailOpen.value = false;
  if (a) await onDelete(a);
}

async function onSave(payload) {
  await addAppointment(payload);
  await notifyResult(payload.datetimeISO);
}

async function notifyResult() {
  const granted = await hasPermission();
  if (granted) showSuccess(t("appts.saved"));
  else showWarning(t("appts.savedNoPerm"));
}

async function onDelete(a) {
  await removeAppointment(a.id);
  showInfo(t("appts.deleted"));
}
</script>

<style scoped>
.app-header::after { display: none; }
.app-toolbar { --background: var(--ion-color-primary); --color: #fff; --border-width: 0; }
.app-title { font-family: "Cairo", sans-serif; font-weight: 800; color: #fff; }
.app-toolbar ion-button { --color: #fff; }
.page { --background: #f7faf9; }
.wrap { max-width: 560px; margin: 0 auto; padding: 14px 18px 28px; font-family: "Cairo", sans-serif; }

.section-h { margin: 8px 2px 10px; font-size: 1.02rem; font-weight: 800; color: #0f766e; }
.section-h.muted { color: #7a8a88; }

.list { display: flex; flex-direction: column; gap: 10px; margin-bottom: 8px; }
.item {
  display: flex; align-items: flex-start; gap: 12px;
  padding: 12px 14px; border-radius: 16px; background: #fff;
  border: 1px solid rgba(13,148,136,0.1); box-shadow: 0 6px 18px rgba(13,70,65,0.06);
  cursor: pointer; transition: transform 0.16s ease;
}
.item:active { transform: scale(0.98); }
.item.past { opacity: 0.7; }
.ico { flex: 0 0 auto; width: 44px; height: 44px; border-radius: 13px; display: grid; place-items: center; color: #fff; font-size: 1.3rem; background: linear-gradient(135deg, #14b8a6, #0d9488); }
.ico.gray { background: linear-gradient(135deg, #94a3b8, #64748b); }
.text { flex: 1 1 auto; min-width: 0; display: flex; flex-direction: column; gap: 3px; }
.text strong { font-size: 1.02rem; font-weight: 700; color: #1b2524; }
.text small { font-size: 0.82rem; color: #7a8a88; }
.text small.loc { display: inline-flex; align-items: center; gap: 4px; }
.lead-tag { align-self: flex-start; margin-top: 4px; font-size: 0.72rem; font-weight: 700; color: var(--ion-color-primary); background: rgba(13,148,136,0.1); padding: 2px 8px; border-radius: 999px; }
.del { flex: 0 0 auto; width: 34px; height: 34px; border: none; border-radius: 10px; background: rgba(239,68,68,0.08); color: #ef4444; font-size: 1.1rem; display: grid; place-items: center; cursor: pointer; }

.empty { text-align: center; color: #7a8a88; padding: 48px 18px; }
.empty-ico { font-size: 3rem; color: rgba(13,148,136,0.4); }
.empty p { margin: 12px 0 18px; }
.add-cta {
  display: inline-flex; align-items: center; gap: 0.5rem;
  padding: 0.85rem 1.4rem; border: none; border-radius: 14px;
  background: linear-gradient(100deg, #0d9488, #14b8a6); color: #fff;
  font-family: "Cairo", sans-serif; font-weight: 700; font-size: 1rem; cursor: pointer;
  box-shadow: 0 12px 28px rgba(13,148,136,0.35);
}
</style>
