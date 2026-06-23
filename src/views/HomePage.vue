<template>
  <ion-page>
    <ion-content :fullscreen="true" dir="rtl" class="home">
      <!-- unified top cap: navbar + welcome share one shaped background -->
      <header class="topcap">
        <div class="topcap-bg" aria-hidden="true">
          <span class="c c1"></span>
          <span class="c c2"></span>
          <ion-icon :icon="sparklesOutline" class="deco deco2"></ion-icon>
        </div>

        <div class="navbar">
          <h1 class="brand-name">وضوح</h1>
        </div>

        <div class="welcome">
          <p class="w-hi">أهلاً بك <span class="wave">👋</span></p>
          <p class="w-sub">
            <span>نشرح لك</span>
            <transition name="rotate" mode="out-in">
              <span class="rot" :key="rotIndex">{{ rotWords[rotIndex] }}</span>
            </transition>
          </p>
        </div>
      </header>

      <!-- body -->
      <main class="body">
        <transition name="swap" mode="out-in">
          <!-- motivational section -->
          <section v-if="!preview" class="motivate" key="motivate">
            <svg
              class="illu"
              viewBox="0 0 400 300"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              role="img"
              aria-label="قراءة المستند وفهمه"
            >
              <defs>
                <linearGradient id="docHead" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stop-color="#2cc2b3" />
                  <stop offset="1" stop-color="#0d9488" />
                </linearGradient>
                <linearGradient id="paper" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0" stop-color="#ffffff" />
                  <stop offset="1" stop-color="#eaf5f2" />
                </linearGradient>
                <linearGradient id="gT" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0" stop-color="#7defe0" />
                  <stop offset="1" stop-color="#0d9488" />
                </linearGradient>
                <linearGradient id="gA" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0" stop-color="#ffd98a" />
                  <stop offset="1" stop-color="#f59e0b" />
                </linearGradient>
                <radialGradient id="lensG" cx="0.4" cy="0.35" r="0.75">
                  <stop offset="0" stop-color="#ffffff" stop-opacity="0.55" />
                  <stop offset="1" stop-color="#0d9488" stop-opacity="0.06" />
                </radialGradient>
                <filter id="soft" x="-40%" y="-40%" width="180%" height="180%">
                  <feDropShadow dx="0" dy="9" stdDeviation="9" flood-color="#085a52" flood-opacity="0.22" />
                </filter>
                <clipPath id="docClip">
                  <rect x="120" y="70" width="160" height="180" rx="16" />
                </clipPath>
              </defs>

              <!-- ground shadow -->
              <ellipse class="shadow" cx="200" cy="274" rx="104" ry="15" fill="#0d9488" opacity="0.14" />

              <!-- gradient blobs -->
              <circle class="blobA" cx="86" cy="120" r="74" fill="url(#gT)" opacity="0.26" />
              <circle class="blobB" cx="322" cy="198" r="66" fill="url(#gA)" opacity="0.4" />

              <!-- particles -->
              <circle class="dot d1" cx="62" cy="58" r="5" fill="#0d9488" />
              <circle class="dot d2" cx="348" cy="86" r="6" fill="#f59e0b" />
              <circle class="dot d3" cx="54" cy="234" r="4" fill="#14b8a6" />
              <circle class="dot d4" cx="362" cy="244" r="4" fill="#0d9488" />

              <!-- stacked paper behind (depth) -->
              <rect class="paperBack" x="132" y="62" width="150" height="176" rx="16" fill="#cdece6" />

              <!-- main document -->
              <g class="doc" filter="url(#soft)">
                <rect x="120" y="70" width="160" height="180" rx="16" fill="url(#paper)" />
                <path d="M120 86a16 16 0 0 1 16-16h128a16 16 0 0 1 16 16v24H120z" fill="url(#docHead)" />
                <rect x="140" y="80" width="80" height="9" rx="4.5" fill="#fff" opacity="0.85" />

                <rect class="ln l1" x="140" y="130" width="120" height="9" rx="4.5" fill="#e2efec" />
                <rect class="ln l2" x="140" y="150" width="120" height="9" rx="4.5" fill="#e2efec" />
                <rect class="ln l3" x="140" y="170" width="92" height="9" rx="4.5" fill="#e2efec" />
                <rect class="ln l4" x="140" y="198" width="64" height="9" rx="4.5" fill="#f6d49a" />

                <g clip-path="url(#docClip)">
                  <rect class="beam" x="120" y="70" width="160" height="20" fill="#14b8a6" opacity="0.22" />
                </g>
              </g>

              <!-- floating data chips -->
              <g class="chip chipA">
                <rect x="34" y="150" width="86" height="34" rx="12" fill="#fff" filter="url(#soft)" />
                <circle cx="51" cy="167" r="6.5" fill="#0d9488" />
                <rect x="64" y="163" width="46" height="7" rx="3.5" fill="#d6e9e5" />
              </g>
              <g class="chip chipB">
                <rect x="284" y="86" width="86" height="34" rx="12" fill="#fff" filter="url(#soft)" />
                <circle cx="301" cy="103" r="6.5" fill="#f59e0b" />
                <rect x="314" y="99" width="46" height="7" rx="3.5" fill="#f6e2c4" />
              </g>

              <!-- glassy magnifier with check -->
              <g class="lens">
                <circle cx="262" cy="212" r="34" fill="url(#lensG)" stroke="#0d9488" stroke-width="6" />
                <path class="check" d="M249 212l9 9 17-18" stroke="#0d9488" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" />
                <line x1="286" y1="236" x2="312" y2="264" stroke="#0d9488" stroke-width="10" stroke-linecap="round" />
              </g>

              <!-- sparkles -->
              <path class="spark s1" d="M96 48c1.4 5.6 2.8 7 8.4 8.4-5.6 1.4-7 2.8-8.4 8.4-1.4-5.6-2.8-7-8.4-8.4 5.6-1.4 7-2.8 8.4-8.4z" fill="#f59e0b" />
              <path class="spark s2" d="M338 150c1 4 2 5 6 6-4 1-5 2-6 6-1-4-2-5-6-6 4-1 5-2 6-6z" fill="#14b8a6" />
              <path class="spark s3" d="M302 56c.9 3.6 1.8 4.5 5.4 5.4-3.6.9-4.5 1.8-5.4 5.4-.9-3.6-1.8-4.5-5.4-5.4 3.6-.9 4.5-1.8 5.4-5.4z" fill="#f59e0b" />
            </svg>
            <h2 class="m-title">ابدأ الآن ✨</h2>
            <p class="m-text">
              ارفع صورة المستند أو التقطها، وسيشرحها لك «وضوح» بالعربية في ثوانٍ.
            </p>
          </section>

          <!-- preview + explain -->
          <section v-else class="preview" key="preview">
            <div class="preview-card">
              <img :src="preview" alt="الصورة المختارة" />
              <button
                class="remove"
                :disabled="loading"
                aria-label="إزالة الصورة"
                @click="reset"
              >
                <ion-icon :icon="closeOutline"></ion-icon>
              </button>
            </div>

            <button class="cta" :disabled="loading" @click="onExplain">
              <span class="cta-shine"></span>
              <ion-icon :icon="sparklesOutline"></ion-icon>
              <span>{{ loading ? "جارٍ التحليل..." : "اشرح الصورة" }}</span>
            </button>
          </section>
        </transition>
      </main>

      <ion-loading :is-open="loading" message="جارٍ تحليل الصورة..."></ion-loading>
    </ion-content>

    <!-- bottom action bar with a center notch for the camera -->
    <nav class="tabbar" dir="rtl" aria-label="إضافة صورة">
      <button class="tab" @click="onPickGallery">
        <ion-icon class="t-ico" :icon="imagesOutline"></ion-icon>
        <span>المعرض</span>
      </button>

      <button class="tab tab-center" aria-label="التقاط صورة" @click="onTakePhoto">
        <span class="fab"><ion-icon :icon="cameraOutline"></ion-icon></span>
      </button>

      <button class="tab" @click="onPickFile">
        <ion-icon class="t-ico" :icon="documentAttachOutline"></ion-icon>
        <span>رفع ملف</span>
      </button>
    </nav>
  </ion-page>
</template>

<script setup>
import {
  IonPage,
  IonContent,
  IonIcon,
  IonLoading,
  toastController,
} from "@ionic/vue";
import {
  cameraOutline,
  imagesOutline,
  documentAttachOutline,
  sparklesOutline,
  closeOutline,
} from "ionicons/icons";
import { ref, onMounted, onBeforeUnmount } from "vue";
import { useRouter } from "vue-router";
import { useCapture } from "@/composables/useCapture";
import { explainImage } from "@/services/explain";
import { setResult } from "@/stores/result";

const router = useRouter();
const { takePhoto, pickFromGallery, pickFile } = useCapture();

const captured = ref(null); // { base64, mediaType, previewUrl }
const preview = ref(null);
const loading = ref(false);

// modern rotating headline
const rotWords = ["المواعيد", "الفواتير", "العقود", "الرسائل الرسمية", "أي مستند"];
const rotIndex = ref(0);
let rotTimer = null;
onMounted(() => {
  rotTimer = setInterval(() => {
    rotIndex.value = (rotIndex.value + 1) % rotWords.length;
  }, 2200);
});
onBeforeUnmount(() => clearInterval(rotTimer));

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

function reset() {
  captured.value = null;
  preview.value = null;
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
.home {
  --background: #f7faf9;
}
/* make the content fill the viewport so the hero centers without scrolling */
.home::part(scroll) {
  display: flex;
  flex-direction: column;
}

/* ---------- unified top cap (navbar + welcome) ---------- */
.topcap {
  position: relative;
  overflow: hidden;
  color: #fff;
  padding: calc(env(safe-area-inset-top) + 16px) 22px 30px;
  background: linear-gradient(155deg, #0d9488 0%, #14b8a6 55%, #0ea5a0 100%);
  border-bottom-left-radius: 22px;
  border-bottom-right-radius: 22px;
  box-shadow: 0 14px 34px rgba(13, 148, 136, 0.32);
  animation: rise 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) both;
}
.topcap-bg {
  position: absolute;
  inset: 0;
  pointer-events: none;
}
.c {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.12);
}
.c1 {
  width: 170px;
  height: 170px;
  top: -64px;
  inset-inline-start: -46px;
  animation: floaty 9s ease-in-out infinite;
}
.c2 {
  width: 120px;
  height: 120px;
  bottom: -46px;
  inset-inline-end: -24px;
  background: rgba(255, 255, 255, 0.1);
  animation: floaty 11s ease-in-out infinite reverse;
}
.navbar {
  position: relative;
  z-index: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  padding-bottom: 12px;
}
.navbar::after {
  content: "";
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 2px;
  border-radius: 2px;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 227, 158, 0.45),
    rgba(255, 255, 255, 0.55),
    rgba(255, 227, 158, 0.45),
    transparent
  );
}
.brand-name {
  margin: 0;
  font-family: "Gulzar", "Aref Ruqaa", serif;
  font-size: 1.9rem;
  font-weight: 400;
  line-height: 1.5;
  letter-spacing: 0;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.18);
}
.welcome {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 2px;
  margin-top: 30px;
  font-family: "Cairo", sans-serif;
}
.w-hi {
  margin: 0;
  font-size: 0.95rem;
  font-weight: 600;
  opacity: 0.94;
  animation: rise 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) 0.2s both;
}
.wave {
  display: inline-block;
  transform-origin: 70% 70%;
  animation: wave 2.6s ease-in-out infinite;
}
.w-sub {
  margin: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  font-size: 1.4rem;
  font-weight: 800;
  letter-spacing: -0.3px;
  animation: rise 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) 0.32s both;
}
.rot {
  display: inline-block;
  color: #ffe39e;
  font-weight: 800;
}
.rotate-enter-active,
.rotate-leave-active {
  transition: opacity 0.35s ease, transform 0.35s cubic-bezier(0.2, 0.8, 0.2, 1);
}
.rotate-enter-from { opacity: 0; transform: translateY(10px); }
.rotate-leave-to { opacity: 0; transform: translateY(-10px); }

/* floating decorative imagery in the hero */
.deco {
  position: absolute;
  color: rgba(255, 255, 255, 0.16);
}
.deco2 {
  font-size: 30px;
  bottom: 16px;
  inset-inline-start: 30%;
  color: rgba(255, 227, 158, 0.4);
  animation: twk 3s ease-in-out infinite;
}

/* ---------- body ---------- */
.body {
  position: relative;
  z-index: 1;
  max-width: 520px;
  margin: 0 auto;
  padding: 20px 22px 110px;
  flex: 1 1 auto; /* fill the space below the top cap, no scrolling */
  min-height: 0;
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center; /* center the illustration on screen */
}

/* motivational section — full-bleed animated 3D illustration */
.motivate {
  text-align: center;
  margin-inline: -22px; /* cancel body padding → full width */
  perspective: 1000px;
  animation: rise 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) 0.1s both;
}
.illu {
  display: block;
  width: 100%;
  height: auto;
  transform-style: preserve-3d;
  will-change: transform;
  animation: tilt3d 9s ease-in-out infinite;
}
.m-title {
  margin: 10px 0 6px;
  font-family: "Cairo", sans-serif;
  font-size: 1.4rem;
  font-weight: 800;
  color: #0f766e;
  animation: rise 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) 0.18s both;
}
.m-text {
  margin: 0 auto;
  max-width: 26rem;
  padding-inline: 34px;
  font-family: "Cairo", sans-serif;
  color: #5b6b69;
  line-height: 1.75;
  font-size: 0.95rem;
  animation: rise 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) 0.28s both;
}

/* every animated SVG part needs its own box for transform-origin */
.illu .doc,
.illu .beam,
.illu .ln,
.illu .spark,
.illu .lens,
.illu .check,
.illu .dot,
.illu .blobA,
.illu .blobB,
.illu .paperBack,
.illu .shadow,
.illu .chip {
  transform-box: fill-box;
  transform-origin: center;
}

.illu .paperBack { animation: paperFloat 5.5s ease-in-out infinite; }
.illu .shadow { animation: shadowPulse 5.5s ease-in-out infinite; }
.illu .chipA { animation: floaty2 4.8s ease-in-out infinite; }
.illu .chipB { animation: floaty2 5.6s ease-in-out infinite reverse; }

.illu .blobA { animation: drift 9s ease-in-out infinite; }
.illu .blobB { animation: drift 11s ease-in-out infinite reverse; }

.illu .doc { animation: docFloat 5.5s ease-in-out infinite; }

.illu .beam { animation: scan 3.4s ease-in-out infinite; }

.illu .ln {
  transform-origin: right center; /* RTL: grow from the right */
  animation: lineIn 0.6s ease both;
}
.illu .l1 { animation-delay: 0.35s; }
.illu .l2 { animation-delay: 0.5s; }
.illu .l3 { animation-delay: 0.65s; }
.illu .l4 { animation-delay: 0.85s; }

.illu .lens { animation: lensPop 5s ease-in-out infinite; }
.illu .check {
  stroke-dasharray: 42;
  stroke-dashoffset: 42;
  animation: draw 0.9s ease forwards 1s;
}

.illu .spark { animation: twk 2.4s ease-in-out infinite; }
.illu .s1 { animation-delay: 0s; }
.illu .s2 { animation-delay: 0.8s; }
.illu .s3 { animation-delay: 1.5s; }

.illu .d1 { animation: floaty2 6s ease-in-out infinite; }
.illu .d2 { animation: floaty2 7s ease-in-out infinite reverse; }
.illu .d3 { animation: floaty2 5.5s ease-in-out infinite; }
.illu .d4 { animation: floaty2 8s ease-in-out infinite reverse; }

@keyframes drift {
  0%, 100% { transform: translate(0, 0); }
  50% { transform: translate(10px, -12px); }
}
@keyframes docFloat {
  0%, 100% { transform: translateY(0) rotate(-1.5deg); }
  50% { transform: translateY(-9px) rotate(1deg); }
}
@keyframes scan {
  0% { transform: translateY(0); opacity: 0; }
  12% { opacity: 0.5; }
  50% { transform: translateY(162px); opacity: 0.5; }
  62% { opacity: 0; }
  100% { transform: translateY(0); opacity: 0; }
}
@keyframes lineIn {
  from { transform: scaleX(0); opacity: 0; }
  to { transform: scaleX(1); opacity: 1; }
}
@keyframes lensPop {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.06); }
}
@keyframes draw {
  to { stroke-dashoffset: 0; }
}
@keyframes twk {
  0%, 100% { transform: scale(0.7) rotate(0); opacity: 0.5; }
  50% { transform: scale(1.1) rotate(20deg); opacity: 1; }
}
@keyframes floaty2 {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}
@keyframes tilt3d {
  0%, 100% { transform: rotateX(7deg) rotateY(-7deg); }
  50% { transform: rotateX(2deg) rotateY(7deg); }
}
@keyframes paperFloat {
  0%, 100% { transform: translateY(0) rotate(-3deg); }
  50% { transform: translateY(-6px) rotate(-1deg); }
}
@keyframes shadowPulse {
  0%, 100% { transform: scaleX(1); opacity: 0.14; }
  50% { transform: scaleX(0.86); opacity: 0.1; }
}
@keyframes wave {
  0%, 60%, 100% { transform: rotate(0deg); }
  10% { transform: rotate(14deg); }
  20% { transform: rotate(-8deg); }
  30% { transform: rotate(14deg); }
  40% { transform: rotate(-4deg); }
  50% { transform: rotate(10deg); }
}
/* ---------- preview + cta ---------- */
.preview {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.preview-card {
  position: relative;
  border-radius: 14px;
  overflow: hidden;
  box-shadow: 0 16px 40px rgba(13, 70, 65, 0.18);
  animation: rise 0.5s cubic-bezier(0.2, 0.8, 0.2, 1) both;
}
.preview-card img {
  display: block;
  width: 100%;
  max-height: 48vh;
  object-fit: cover;
}
.remove {
  position: absolute;
  top: 0.7rem;
  inset-inline-start: 0.7rem;
  width: 34px;
  height: 34px;
  display: grid;
  place-items: center;
  border: none;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.55);
  backdrop-filter: blur(6px);
  color: #fff;
  font-size: 1.15rem;
  cursor: pointer;
}
.cta {
  position: relative;
  overflow: hidden;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.55rem;
  width: 100%;
  padding: 1.05rem;
  border: none;
  border-radius: 12px;
  background: linear-gradient(100deg, #0d9488, #14b8a6);
  color: #fff;
  font: inherit;
  font-size: 1.1rem;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 12px 30px rgba(13, 148, 136, 0.4);
  transition: transform 0.18s ease;
  animation: rise 0.5s cubic-bezier(0.2, 0.8, 0.2, 1) 0.08s both;
}
.cta ion-icon {
  font-size: 1.3rem;
  animation: twinkle 2.2s ease-in-out infinite;
}
.cta:active { transform: scale(0.98); }
.cta:disabled { opacity: 0.7; cursor: default; }
.cta-shine {
  position: absolute;
  top: 0;
  inset-inline-start: -60%;
  width: 50%;
  height: 100%;
  background: linear-gradient(100deg, transparent, rgba(255, 255, 255, 0.35), transparent);
  transform: skewX(-18deg);
  animation: shine 3.2s ease-in-out infinite;
}

/* ---------- floating rounded action bar ---------- */
.tabbar {
  position: fixed;
  left: 16px;
  right: 16px;
  bottom: calc(14px + env(safe-area-inset-bottom));
  max-width: 440px;
  margin-inline: auto;
  z-index: 20;
  height: 72px;
  display: flex;
  align-items: center;
  justify-content: space-around;
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(13, 148, 136, 0.1);
  border-radius: 18px;
  box-shadow: 0 16px 36px rgba(13, 70, 65, 0.2);
  animation: rise 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) 0.2s both;
}
.tab {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  border: none;
  background: none;
  color: #7f8f8d;
  font: inherit;
  font-size: 0.72rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.16s ease, color 0.16s ease;
}
.tab .t-ico {
  font-size: 1.5rem;
}
.tab:active {
  transform: scale(0.92);
  color: var(--ion-color-primary);
}
@media (hover: hover) {
  .tab:hover { color: var(--ion-color-primary); }
}

/* prominent center capture button — raised above the floating bar */
.tab-center {
  flex: 0 0 auto;
  perspective: 520px; /* depth for the 3D swing */
}
.fab {
  position: relative;
  width: 62px;
  height: 62px;
  border-radius: 18px;
  border: none;
  display: grid;
  place-items: center;
  background: linear-gradient(145deg, #2cc2b3 0%, #0d9488 70%);
  color: #fff;
  font-size: 1.65rem;
  box-shadow: 0 10px 22px rgba(13, 148, 136, 0.5),
    inset 0 2px 5px rgba(255, 255, 255, 0.35),
    inset 0 -3px 6px rgba(0, 0, 0, 0.12);
  transform-style: preserve-3d;
  overflow: hidden; /* keep the glint inside the circle */
  animation: fab3d 5s ease-in-out infinite;
}
.fab ion-icon {
  position: relative;
  z-index: 2;
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.2));
}
.fab::after {
  content: "";
  position: absolute;
  top: 0;
  bottom: 0;
  inset-inline-start: -150%;
  width: 55%;
  background: linear-gradient(100deg, transparent, rgba(255, 255, 255, 0.55), transparent);
  transform: skewX(-20deg);
  animation: fabShine 3.6s ease-in-out infinite;
}
.tab-center:active .fab {
  animation-play-state: paused;
}
@keyframes fabShine {
  0% { inset-inline-start: -150%; }
  55%, 100% { inset-inline-start: 150%; }
}
@keyframes fab3d {
  0%, 60% { transform: rotateY(0deg); }
  100% { transform: rotateY(360deg); }
}

/* ---------- transitions / keyframes ---------- */
.swap-enter-active,
.swap-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}
.swap-enter-from { opacity: 0; transform: translateY(12px); }
.swap-leave-to { opacity: 0; transform: translateY(-12px); }
@keyframes rise {
  from { opacity: 0; transform: translateY(18px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes floaty {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(12px); }
}
@keyframes twinkle {
  0%, 100% { transform: scale(1) rotate(0); opacity: 1; }
  50% { transform: scale(1.18) rotate(8deg); opacity: 0.85; }
}
@keyframes shine {
  0% { inset-inline-start: -60%; }
  55%, 100% { inset-inline-start: 130%; }
}
@media (prefers-reduced-motion: reduce) {
  .c1, .c2, .cta ion-icon, .cta-shine, .fab, .fab::after, .deco, .wave,
  .illu, .illu .doc, .illu .beam, .illu .spark, .illu .lens, .illu .dot,
  .illu .blobA, .illu .blobB, .illu .paperBack, .illu .shadow, .illu .chip {
    animation: none;
  }
  .illu .check { stroke-dashoffset: 0; animation: none; }
  .topcap, .motivate, .preview-card, .cta, .tabbar, .illu .ln, .w-hi, .w-sub {
    animation-duration: 0.01ms;
  }
}
</style>
