<template>
  <ion-page>
    <ion-content :fullscreen="true" dir="rtl" class="result">
      <!-- empty state -->
      <div v-if="!data" class="empty">
        <ion-icon :icon="documentTextOutline" class="empty-ico"></ion-icon>
        <p>لا توجد نتيجة بعد.</p>
        <button class="cta" @click="goHome">
          <ion-icon :icon="homeOutline"></ion-icon>
          العودة للرئيسية
        </button>
      </div>

      <template v-else>
        <!-- hero banner -->
        <header class="rhero" :class="{ 'no-img': !preview }">
          <img v-if="preview" :src="preview" alt="الصورة" class="rhero-img" />
          <div class="rhero-overlay"></div>

          <button class="rback" aria-label="رجوع" @click="goHome">
            <ion-icon :icon="chevronForwardOutline"></ion-icon>
          </button>

          <div class="rhero-text">
            <div class="rtags">
              <span class="rtype">{{ data.document_type }}</span>
              <span v-if="data.is_appointment" class="rbadge">
                <ion-icon :icon="calendarOutline"></ion-icon>
                موعد
              </span>
            </div>
            <h1 class="rtitle">{{ data.title_ar }}</h1>
          </div>
        </header>

        <main class="rbody">
          <!-- summary -->
          <section class="card summary-card" style="--i: 0">
            <h2 class="card-h">
              <ion-icon :icon="sparklesOutline"></ion-icon>
              الملخص
            </h2>
            <p class="summary">{{ data.summary_ar }}</p>
          </section>

          <!-- details -->
          <section v-if="details.length" class="details">
            <div
              v-for="(d, i) in details"
              :key="d.label"
              class="detail"
              :class="{ tappable: d.map }"
              :style="{ '--i': i + 1 }"
              @click="d.map && openMap(d.value)"
            >
              <span class="d-ico" :class="d.tone">
                <ion-icon :icon="d.icon"></ion-icon>
              </span>
              <div class="d-text">
                <p class="d-label">{{ d.label }}</p>
                <h3 class="d-value">{{ d.value }}</h3>
                <span v-if="d.map" class="d-hint">اضغط لعرضه على الخريطة</span>
              </div>
              <ion-icon v-if="d.map" :icon="navigateOutline" class="d-go"></ion-icon>
            </div>
          </section>

          <button class="cta" :style="{ '--i': details.length + 1 }" @click="goHome">
            <ion-icon :icon="cameraOutline"></ion-icon>
            تحليل صورة أخرى
          </button>
        </main>
      </template>
    </ion-content>
  </ion-page>
</template>

<script setup>
import { IonPage, IonContent, IonIcon, useIonRouter } from "@ionic/vue";
import {
  calendarOutline,
  timeOutline,
  locationOutline,
  checkmarkCircleOutline,
  sparklesOutline,
  cameraOutline,
  chevronForwardOutline,
  documentTextOutline,
  homeOutline,
  navigateOutline,
} from "ionicons/icons";
import { computed } from "vue";
import { resultStore } from "@/stores/result";

const ionRouter = useIonRouter();
function goHome() {
  ionRouter.push("/home", "back");
}

function openMap(query) {
  const url =
    "https://www.google.com/maps/search/?api=1&query=" +
    encodeURIComponent(query);
  window.open(url, "_blank", "noopener");
}

const data = computed(() => resultStore.data);
const preview = computed(() => resultStore.previewUrl);

const details = computed(() => {
  const d = data.value;
  if (!d) return [];
  const out = [];
  if (d.date_ar)
    out.push({ icon: calendarOutline, label: "التاريخ", value: d.date_ar, tone: "teal" });
  if (d.time_ar)
    out.push({ icon: timeOutline, label: "الوقت", value: d.time_ar, tone: "amber" });
  if (d.location_ar)
    out.push({
      icon: locationOutline,
      label: "المكان",
      value: d.location_ar,
      tone: "slate",
      map: true,
    });
  if (d.action_required_ar)
    out.push({
      icon: checkmarkCircleOutline,
      label: "المطلوب منك",
      value: d.action_required_ar,
      tone: "teal",
    });
  return out;
});
</script>

<style scoped>
.result {
  --background: #f7faf9;
  font-family: "Cairo", sans-serif;
}

/* ---------- hero banner ---------- */
.rhero {
  position: relative;
  height: 46vh;
  max-height: 340px;
  min-height: 240px;
  overflow: hidden;
  border-bottom-left-radius: 22px;
  border-bottom-right-radius: 22px;
}
.rhero.no-img {
  background: linear-gradient(155deg, #0d9488, #14b8a6 60%, #0ea5a0);
}
.rhero-img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.rhero-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to top,
    rgba(6, 58, 53, 0.92) 0%,
    rgba(6, 58, 53, 0.45) 42%,
    rgba(6, 58, 53, 0.05) 72%
  );
}
.rback {
  position: absolute;
  top: calc(env(safe-area-inset-top) + 12px);
  inset-inline-start: 16px;
  width: 42px;
  height: 42px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: #fff;
  font-size: 1.4rem;
  text-decoration: none;
  cursor: pointer;
  transition: transform 0.16s ease;
}
.rback:active { transform: scale(0.9); }
.rhero-text {
  position: absolute;
  inset-inline: 0;
  bottom: 0;
  padding: 20px 22px 22px;
  color: #fff;
  animation: rise 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) 0.1s both;
}
.rtags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 8px;
}
.rtype,
.rbadge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 12px;
  border-radius: 999px;
  font-size: 0.8rem;
  font-weight: 700;
  backdrop-filter: blur(6px);
}
.rtype {
  background: rgba(255, 255, 255, 0.22);
  border: 1px solid rgba(255, 255, 255, 0.3);
}
.rbadge {
  background: linear-gradient(135deg, #fbbf24, #f59e0b);
  color: #5a3a00;
}
.rbadge ion-icon { font-size: 0.95rem; }
.rtitle {
  margin: 0;
  font-size: 1.55rem;
  font-weight: 800;
  line-height: 1.35;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.35);
}

/* ---------- body ---------- */
.rbody {
  position: relative;
  max-width: 560px;
  margin: 0 auto;
  padding: 18px 18px calc(env(safe-area-inset-bottom) + 28px);
}
.card,
.detail,
.cta {
  animation: rise 0.55s cubic-bezier(0.2, 0.8, 0.2, 1) both;
  animation-delay: calc(var(--i, 0) * 0.07s + 0.12s);
}
.card {
  padding: 16px 18px;
  border-radius: 16px;
  background: #fff;
  border: 1px solid rgba(13, 148, 136, 0.1);
  box-shadow: 0 8px 22px rgba(13, 70, 65, 0.07);
}
.card-h {
  display: flex;
  align-items: center;
  gap: 7px;
  margin: 0 0 8px;
  font-size: 1.05rem;
  font-weight: 800;
  color: var(--ion-color-primary);
}
.card-h ion-icon { font-size: 1.2rem; color: #f59e0b; }
.summary {
  margin: 0;
  font-size: 1rem;
  line-height: 1.85;
  color: #2b3a38;
}

/* ---------- details ---------- */
.details {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 14px;
}
.detail {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  border-radius: 16px;
  background: #fff;
  border: 1px solid rgba(13, 148, 136, 0.1);
  box-shadow: 0 6px 18px rgba(13, 70, 65, 0.06);
}
.d-ico {
  flex: 0 0 auto;
  width: 44px;
  height: 44px;
  border-radius: 13px;
  display: grid;
  place-items: center;
  color: #fff;
  font-size: 1.3rem;
}
.d-ico.teal { background: linear-gradient(135deg, #14b8a6, #0d9488); }
.d-ico.amber { background: linear-gradient(135deg, #fbbf24, #f59e0b); }
.d-ico.slate { background: linear-gradient(135deg, #64748b, #475569); }
.d-text { flex: 1 1 auto; min-width: 0; }
.d-label {
  margin: 0;
  font-size: 0.78rem;
  color: #7a8a88;
  font-weight: 600;
}
.d-value {
  margin: 2px 0 0;
  font-size: 1.02rem;
  font-weight: 700;
  color: #1b2524;
  line-height: 1.5;
}
.d-hint {
  display: inline-block;
  margin-top: 3px;
  font-size: 0.74rem;
  font-weight: 600;
  color: var(--ion-color-primary);
}
.detail.tappable {
  cursor: pointer;
  transition: transform 0.16s ease, box-shadow 0.16s ease;
}
.detail.tappable:active {
  transform: scale(0.98);
}
@media (hover: hover) {
  .detail.tappable:hover {
    box-shadow: 0 10px 24px rgba(13, 70, 65, 0.12);
    border-color: rgba(13, 148, 136, 0.3);
  }
}
.d-go {
  flex: 0 0 auto;
  color: var(--ion-color-primary);
  font-size: 1.25rem;
}

/* ---------- cta ---------- */
.cta {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;
  margin-top: 20px;
  padding: 1rem;
  border: none;
  border-radius: 14px;
  background: linear-gradient(100deg, #0d9488, #14b8a6);
  color: #fff;
  font-family: "Cairo", sans-serif;
  font-size: 1.05rem;
  font-weight: 700;
  text-decoration: none;
  cursor: pointer;
  box-shadow: 0 12px 28px rgba(13, 148, 136, 0.38);
  transition: transform 0.16s ease;
}
.cta:active { transform: scale(0.98); }
.cta ion-icon { font-size: 1.25rem; }

/* ---------- empty ---------- */
.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 14px;
  height: 80vh;
  padding-inline: 32px;
  text-align: center;
  color: #5b6b69;
  font-family: "Cairo", sans-serif;
}
.empty-ico { font-size: 3rem; color: rgba(13, 148, 136, 0.5); }

@keyframes rise {
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
}
@media (prefers-reduced-motion: reduce) {
  .rhero-text, .card, .detail, .cta { animation-duration: 0.01ms; }
}
</style>
