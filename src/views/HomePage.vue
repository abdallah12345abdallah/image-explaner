<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-title>شرح الصورة</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true" class="ion-padding" dir="rtl">
      <div class="intro">
        <p>التقط صورة لمستند أو ارفعها، وسيشرحها لك الذكاء الاصطناعي بالعربية.</p>
      </div>

      <div class="actions">
        <ion-button expand="block" @click="onTakePhoto">
          <ion-icon slot="start" :icon="cameraOutline"></ion-icon>
          التقاط صورة
        </ion-button>
        <ion-button expand="block" fill="outline" @click="onPickGallery">
          <ion-icon slot="start" :icon="imagesOutline"></ion-icon>
          اختيار من المعرض
        </ion-button>
        <ion-button expand="block" fill="outline" @click="onPickFile">
          <ion-icon slot="start" :icon="documentAttachOutline"></ion-icon>
          رفع ملف
        </ion-button>
      </div>

      <div v-if="preview" class="preview">
        <img :src="preview" alt="الصورة المختارة" />
        <ion-button expand="block" :disabled="loading" @click="onExplain">
          <ion-icon slot="start" :icon="sparklesOutline"></ion-icon>
          اشرح الصورة
        </ion-button>
      </div>

      <ion-loading :is-open="loading" message="جارٍ تحليل الصورة..."></ion-loading>
    </ion-content>
  </ion-page>
</template>

<script setup>
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonIcon,
  IonLoading,
  toastController,
} from "@ionic/vue";
import {
  cameraOutline,
  imagesOutline,
  documentAttachOutline,
  sparklesOutline,
} from "ionicons/icons";
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useCapture } from "@/composables/useCapture";
import { explainImage } from "@/services/explain";
import { setResult } from "@/stores/result";

const router = useRouter();
const { takePhoto, pickFromGallery, pickFile } = useCapture();

const captured = ref(null); // { base64, mediaType, previewUrl }
const preview = ref(null);
const loading = ref(false);

async function showError(message) {
  const toast = await toastController.create({
    message,
    duration: 3000,
    color: "danger",
    position: "top",
  });
  await toast.present();
}

async function handleCapture(fn) {
  try {
    const result = await fn();
    if (!result) return;
    captured.value = result;
    preview.value = result.previewUrl;
  } catch (e) {
    await showError("تعذّر الوصول إلى الصورة.");
  }
}

const onTakePhoto = () => handleCapture(takePhoto);
const onPickGallery = () => handleCapture(pickFromGallery);
const onPickFile = () => handleCapture(pickFile);

async function onExplain() {
  if (!captured.value) return;
  loading.value = true;
  try {
    const data = await explainImage(captured.value);
    setResult(data, captured.value.previewUrl);
    router.push("/result");
  } catch (e) {
    const message =
      e?.response?.data?.error || "حدث خطأ أثناء تحليل الصورة. حاول مرة أخرى.";
    await showError(message);
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.intro {
  text-align: center;
  color: var(--ion-color-medium);
  margin-bottom: 1.25rem;
}
.actions ion-button {
  margin-bottom: 0.75rem;
}
.preview {
  margin-top: 1.5rem;
}
.preview img {
  width: 100%;
  border-radius: 12px;
  margin-bottom: 1rem;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.12);
}
</style>
