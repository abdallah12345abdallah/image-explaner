<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/home" text="رجوع"></ion-back-button>
        </ion-buttons>
        <ion-title>النتيجة</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true" class="ion-padding" dir="rtl">
      <div v-if="!data" class="empty">
        <p>لا توجد نتيجة بعد.</p>
        <ion-button expand="block" router-link="/home">العودة</ion-button>
      </div>

      <template v-else>
        <img v-if="preview" :src="preview" alt="الصورة" class="thumb" />

        <ion-card>
          <ion-card-header>
            <ion-card-subtitle>{{ data.document_type }}</ion-card-subtitle>
            <ion-card-title>{{ data.title_ar }}</ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <p class="summary">{{ data.summary_ar }}</p>
          </ion-card-content>
        </ion-card>

        <ion-list v-if="hasDetails" inset>
          <ion-item v-if="data.date_ar">
            <ion-icon slot="start" :icon="calendarOutline"></ion-icon>
            <ion-label>
              <p class="field-label">التاريخ</p>
              <h3>{{ data.date_ar }}</h3>
            </ion-label>
          </ion-item>
          <ion-item v-if="data.time_ar">
            <ion-icon slot="start" :icon="timeOutline"></ion-icon>
            <ion-label>
              <p class="field-label">الوقت</p>
              <h3>{{ data.time_ar }}</h3>
            </ion-label>
          </ion-item>
          <ion-item v-if="data.location_ar">
            <ion-icon slot="start" :icon="locationOutline"></ion-icon>
            <ion-label>
              <p class="field-label">المكان</p>
              <h3>{{ data.location_ar }}</h3>
            </ion-label>
          </ion-item>
          <ion-item v-if="data.action_required_ar">
            <ion-icon slot="start" :icon="checkmarkCircleOutline"></ion-icon>
            <ion-label class="ion-text-wrap">
              <p class="field-label">المطلوب منك</p>
              <h3>{{ data.action_required_ar }}</h3>
            </ion-label>
          </ion-item>
        </ion-list>

        <ion-button expand="block" router-link="/home" class="again">
          صورة أخرى
        </ion-button>
      </template>
    </ion-content>
  </ion-page>
</template>

<script setup>
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonBackButton,
  IonContent,
  IonButton,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
  IonList,
  IonItem,
  IonLabel,
  IonIcon,
} from "@ionic/vue";
import {
  calendarOutline,
  timeOutline,
  locationOutline,
  checkmarkCircleOutline,
} from "ionicons/icons";
import { computed } from "vue";
import { resultStore } from "@/stores/result";

const data = computed(() => resultStore.data);
const preview = computed(() => resultStore.previewUrl);
const hasDetails = computed(
  () =>
    data.value &&
    (data.value.date_ar ||
      data.value.time_ar ||
      data.value.location_ar ||
      data.value.action_required_ar)
);
</script>

<style scoped>
.thumb {
  width: 100%;
  max-height: 220px;
  object-fit: cover;
  border-radius: 12px;
  margin-bottom: 1rem;
}
.summary {
  font-size: 1rem;
  line-height: 1.7;
}
.field-label {
  color: var(--ion-color-medium);
  font-size: 0.8rem;
  margin: 0;
}
.again {
  margin-top: 1.5rem;
}
.empty {
  text-align: center;
  margin-top: 3rem;
}
</style>
