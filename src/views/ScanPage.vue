<template>
  <ion-page>
    <AppNavbar :title="t('scan.title')" />

    <ion-content :fullscreen="true" :dir="dir" class="scan">
      <div class="wrap">
        <transition name="swap" mode="out-in">
          <!-- empty: illustration + capture actions -->
          <section v-if="!preview" class="intro" key="intro">
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
              <ellipse class="shadow" cx="200" cy="274" rx="104" ry="15" fill="#0d9488" opacity="0.14" />
              <circle class="blobA" cx="86" cy="120" r="74" fill="url(#gT)" opacity="0.26" />
              <circle class="blobB" cx="322" cy="198" r="66" fill="url(#gA)" opacity="0.4" />
              <circle class="dot d1" cx="62" cy="58" r="5" fill="#0d9488" />
              <circle class="dot d2" cx="348" cy="86" r="6" fill="#f59e0b" />
              <circle class="dot d3" cx="54" cy="234" r="4" fill="#14b8a6" />
              <rect class="paperBack" x="132" y="62" width="150" height="176" rx="16" fill="#cdece6" />
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
              <g class="lens">
                <circle cx="262" cy="212" r="34" fill="url(#lensG)" stroke="#0d9488" stroke-width="6" />
                <path class="check" d="M249 212l9 9 17-18" stroke="#0d9488" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" />
                <line x1="286" y1="236" x2="312" y2="264" stroke="#0d9488" stroke-width="10" stroke-linecap="round" />
              </g>
              <path class="spark s1" d="M96 48c1.4 5.6 2.8 7 8.4 8.4-5.6 1.4-7 2.8-8.4 8.4-1.4-5.6-2.8-7-8.4-8.4 5.6-1.4 7-2.8 8.4-8.4z" fill="#f59e0b" />
              <path class="spark s2" d="M338 150c1 4 2 5 6 6-4 1-5 2-6 6-1-4-2-5-6-6 4-1 5-2 6-6z" fill="#14b8a6" />
            </svg>

            <h2 class="m-title">{{ t("scan.startNow") }}</h2>
            <p class="m-text">{{ t("scan.intro") }}</p>

            <div class="actions">
              <button class="cap primary" @click="onTakePhoto">
                <ion-icon :icon="cameraOutline"></ion-icon>
                <span>{{ t("scan.takePhoto") }}</span>
              </button>
              <button class="cap ghost" @click="onPickGallery">
                <ion-icon :icon="imagesOutline"></ion-icon>
                <span>{{ t("scan.gallery") }}</span>
              </button>
            </div>
          </section>

          <!-- preview → review → analyze in place -->
          <section v-else class="preview" key="preview">
            <div class="preview-card" :class="{ scanning: loading }">
              <img :src="preview" alt="" />

              <!-- in-place scanning animation -->
              <div v-if="loading" class="scanfx" aria-hidden="true">
                <span class="scanfx-tint"></span>
                <span class="scanfx-beam"></span>
                <span class="scanfx-corner tl"></span>
                <span class="scanfx-corner tr"></span>
                <span class="scanfx-corner bl"></span>
                <span class="scanfx-corner br"></span>
              </div>

              <button
                v-if="!loading"
                class="remove"
                aria-label="إزالة الصورة"
                @click="reset"
              >
                <ion-icon :icon="closeOutline"></ion-icon>
              </button>

              <div v-if="loading" class="scan-status">
                <span class="dots"><i></i><i></i><i></i></span>
                {{ t("scan.analyzing") }}
              </div>
            </div>

            <p v-if="!loading" class="review-hint">{{ t("scan.reviewHint") }}</p>

            <div class="preview-actions">
              <button class="cta" :disabled="loading" @click="onExplain">
                <ion-icon :icon="sparklesOutline"></ion-icon>
                <span>{{ loading ? t("scan.analyzing") : t("scan.explain") }}</span>
              </button>
              <button class="cta ghost" :disabled="loading" @click="reset">
                <ion-icon :icon="imagesOutline"></ion-icon>
                <span>{{ t("scan.another") }}</span>
              </button>
            </div>
          </section>
        </transition>
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
  cameraOutline,
  imagesOutline,
  sparklesOutline,
  closeOutline,
} from "ionicons/icons";
import { ref } from "vue";
import AppNavbar from "@/components/AppNavbar.vue";
import { t, dir, localeTag } from "@/i18n";
import { useCapture } from "@/composables/useCapture";
import { useToast } from "@/composables/useToast";
import { explainImage } from "@/services/explain";
import { setResult } from "@/stores/result";
import { addHistory } from "@/stores/history";

const ionRouter = useIonRouter();
const { takePhoto, pickFromGallery } = useCapture();

const captured = ref(null);
const preview = ref(null);
const loading = ref(false);

const { showError } = useToast();

async function handleCapture(fn) {
  try {
    const result = await fn();
    if (!result) return;
    captured.value = result;
    preview.value = result.previewUrl;
  } catch (e) {
    await showError(t("scan.errImage"));
  }
}

function reset() {
  captured.value = null;
  preview.value = null;
}

const onTakePhoto = () => handleCapture(takePhoto);
const onPickGallery = () => handleCapture(pickFromGallery);

async function onExplain() {
  if (!captured.value) return;
  loading.value = true;
  try {
    const data = await explainImage(captured.value, localeTag());
    const previewUrl = captured.value.previewUrl;
    setResult(data, previewUrl);
    // Save to history (server-only); warn if it couldn't be stored. Doesn't
    // block navigation to the result.
    addHistory(data, previewUrl).then((ok) => {
      if (!ok) showError(t("history.saveFailed"));
    });
    reset();
    ionRouter.push("/result", "forward");
  } catch (e) {
    const message = e?.response?.data?.error || t("scan.errGeneric");
    await showError(message);
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.scan { --background: #f7faf9; }
.wrap {
  min-height: 100%;
  max-width: 520px;
  margin: 0 auto;
  padding: 14px 20px 24px;
  font-family: "Cairo", sans-serif;
  /* vertically center the content within the page */
  display: flex;
  flex-direction: column;
  justify-content: center;
  box-sizing: border-box;
}

/* intro */
.intro { text-align: center; }
.illu {
  display: block;
  width: 100%;
  max-width: 340px;
  height: auto;
  margin: 4px auto 6px;
  perspective: 1000px;
}
.m-title {
  margin: 6px 0 6px;
  font-size: 1.35rem;
  font-weight: 800;
  color: #0f766e;
}
.m-text {
  margin: 0 auto 22px;
  max-width: 24rem;
  color: #5b6b69;
  line-height: 1.7;
  font-size: 0.95rem;
}

/* capture actions — two simple buttons in one row */
.actions { display: flex; gap: 12px; }
.cap {
  flex: 1 1 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 13px 14px;
  border: none;
  border-radius: 14px;
  cursor: pointer;
  font-family: "Cairo", sans-serif;
  font-size: 1rem;
  font-weight: 700;
  transition: transform 0.16s ease;
}
.cap:active { transform: scale(0.97); }
.cap ion-icon { font-size: 1.25rem; }

.cap.primary {
  background: linear-gradient(120deg, #15bdac, #0d9488);
  color: #fff;
  box-shadow: 0 10px 22px rgba(13, 148, 136, 0.3);
}
.cap.ghost {
  background: #fff;
  color: var(--ion-color-primary);
  border: 1px solid rgba(13, 148, 136, 0.2);
}

/* ===== review + analyze flow ===== */
.preview { display: flex; flex-direction: column; gap: 14px; padding-top: 6px; }
.preview-card {
  position: relative;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 18px 44px rgba(13, 70, 65, 0.2);
  transition: box-shadow 0.3s ease;
}
.preview-card.scanning { box-shadow: 0 18px 50px rgba(13, 148, 136, 0.4); }
.preview-card img { display: block; width: 100%; max-height: 50vh; object-fit: cover; }

.remove {
  position: absolute;
  top: 0.7rem;
  inset-inline-start: 0.7rem;
  width: 36px; height: 36px;
  display: grid; place-items: center;
  border: none; border-radius: 50%;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(6px);
  color: #fff; font-size: 1.2rem; cursor: pointer;
  transition: transform 0.15s ease;
}
.remove:active { transform: scale(0.9); }

/* ---- in-place scanning animation ---- */
.scanfx { position: absolute; inset: 0; pointer-events: none; }
.scanfx-tint {
  position: absolute; inset: 0;
  background: rgba(6, 58, 53, 0.32);
}
.scanfx-beam {
  position: absolute;
  left: 0; right: 0; top: 0;
  height: 30px;
  background: linear-gradient(
    to bottom,
    rgba(45, 212, 191, 0) 0%,
    rgba(45, 212, 191, 0.45) 70%,
    rgba(94, 234, 212, 0.95) 100%
  );
  box-shadow: 0 0 16px rgba(45, 212, 191, 0.8);
  animation: beam-scan 1.9s cubic-bezier(0.45, 0, 0.55, 1) infinite;
}
.scanfx-corner {
  position: absolute;
  width: 26px; height: 26px;
  border: 3px solid rgba(94, 234, 212, 0.9);
  filter: drop-shadow(0 0 6px rgba(45, 212, 191, 0.6));
}
.scanfx-corner.tl { top: 12px; left: 12px; border-right: 0; border-bottom: 0; border-radius: 8px 0 0 0; }
.scanfx-corner.tr { top: 12px; right: 12px; border-left: 0; border-bottom: 0; border-radius: 0 8px 0 0; }
.scanfx-corner.bl { bottom: 12px; left: 12px; border-right: 0; border-top: 0; border-radius: 0 0 0 8px; }
.scanfx-corner.br { bottom: 12px; right: 12px; border-left: 0; border-top: 0; border-radius: 0 0 8px 0; }

.scan-status {
  position: absolute;
  inset-inline: 0; bottom: 14px;
  display: flex; align-items: center; justify-content: center; gap: 8px;
  color: #fff; font-weight: 800; font-size: 0.95rem;
  text-shadow: 0 1px 6px rgba(0, 0, 0, 0.5);
}
.dots { display: inline-flex; gap: 4px; }
.dots i {
  width: 7px; height: 7px; border-radius: 50%;
  background: #5eead4;
  animation: dot-bounce 1s ease-in-out infinite;
}
.dots i:nth-child(2) { animation-delay: 0.15s; }
.dots i:nth-child(3) { animation-delay: 0.3s; }

.review-hint {
  margin: 0;
  text-align: center;
  font-size: 0.86rem;
  color: #7a8a88;
}

/* ---- actions ---- */
.preview-actions { display: flex; flex-direction: column; gap: 10px; }
.cta {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.55rem;
  width: 100%;
  padding: 1.05rem;
  border: none;
  border-radius: 14px;
  background: linear-gradient(100deg, #0d9488, #14b8a6);
  color: #fff;
  font-family: "Cairo", sans-serif;
  font-size: 1.1rem;
  font-weight: 800;
  cursor: pointer;
  box-shadow: 0 12px 30px rgba(13, 148, 136, 0.4);
  transition: transform 0.18s ease;
}
.cta ion-icon { font-size: 1.3rem; }
.cta:active { transform: scale(0.98); }
.cta:disabled { opacity: 0.7; cursor: default; }
.cta.ghost {
  background: #fff;
  color: var(--ion-color-primary);
  border: 1px solid rgba(13, 148, 136, 0.22);
  box-shadow: none;
  font-size: 1rem;
  padding: 0.85rem;
}

/* illustration animations */
.illu .doc, .illu .beam, .illu .ln, .illu .spark, .illu .lens, .illu .check,
.illu .dot, .illu .blobA, .illu .blobB, .illu .paperBack, .illu .shadow {
  transform-box: fill-box;
  transform-origin: center;
}
.illu { animation: tilt3d 9s ease-in-out infinite; transform-style: preserve-3d; }
.illu .blobA { animation: drift 9s ease-in-out infinite; }
.illu .blobB { animation: drift 11s ease-in-out infinite reverse; }
.illu .doc { animation: docFloat 5.5s ease-in-out infinite; }
.illu .beam { animation: scan 3.4s ease-in-out infinite; }
.illu .paperBack { animation: paperFloat 5.5s ease-in-out infinite; }
.illu .shadow { animation: shadowPulse 5.5s ease-in-out infinite; }
.illu .ln { transform-origin: right center; animation: lineIn 0.6s ease both; }
.illu .l1 { animation-delay: 0.35s; }
.illu .l2 { animation-delay: 0.5s; }
.illu .l3 { animation-delay: 0.65s; }
.illu .l4 { animation-delay: 0.85s; }
.illu .lens { animation: lensPop 5s ease-in-out infinite; }
.illu .check { stroke-dasharray: 42; stroke-dashoffset: 42; animation: draw 0.9s ease forwards 1s; }
.illu .spark { animation: twk 2.4s ease-in-out infinite; }
.illu .s2 { animation-delay: 0.8s; }
.illu .d1 { animation: floaty2 6s ease-in-out infinite; }
.illu .d2 { animation: floaty2 7s ease-in-out infinite reverse; }
.illu .d3 { animation: floaty2 5.5s ease-in-out infinite; }

.swap-enter-active, .swap-leave-active { transition: opacity 0.25s ease, transform 0.25s ease; }
.swap-enter-from { opacity: 0; transform: translateY(12px); }
.swap-leave-to { opacity: 0; transform: translateY(-12px); }

@keyframes drift { 0%,100% { transform: translate(0,0); } 50% { transform: translate(10px,-12px); } }
@keyframes docFloat { 0%,100% { transform: translateY(0) rotate(-1.5deg); } 50% { transform: translateY(-9px) rotate(1deg); } }
@keyframes scan { 0% { transform: translateY(0); opacity: 0; } 12% { opacity: 0.5; } 50% { transform: translateY(162px); opacity: 0.5; } 62% { opacity: 0; } 100% { transform: translateY(0); opacity: 0; } }
@keyframes lineIn { from { transform: scaleX(0); opacity: 0; } to { transform: scaleX(1); opacity: 1; } }
@keyframes lensPop { 0%,100% { transform: scale(1); } 50% { transform: scale(1.06); } }
@keyframes draw { to { stroke-dashoffset: 0; } }
@keyframes twk { 0%,100% { transform: scale(0.7) rotate(0); opacity: 0.5; } 50% { transform: scale(1.1) rotate(20deg); opacity: 1; } }
@keyframes floaty2 { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
@keyframes tilt3d { 0%,100% { transform: rotateX(7deg) rotateY(-7deg); } 50% { transform: rotateX(2deg) rotateY(7deg); } }
@keyframes paperFloat { 0%,100% { transform: translateY(0) rotate(-3deg); } 50% { transform: translateY(-6px) rotate(-1deg); } }
@keyframes shadowPulse { 0%,100% { transform: scaleX(1); opacity: 0.14; } 50% { transform: scaleX(0.86); opacity: 0.1; } }
@keyframes beam-scan {
  0% { top: 0; }
  50% { top: calc(100% - 30px); }
  100% { top: 0; }
}
@keyframes dot-bounce {
  0%, 100% { transform: translateY(0); opacity: 0.6; }
  50% { transform: translateY(-6px); opacity: 1; }
}

@media (prefers-reduced-motion: reduce) {
  .illu, .illu *, .scanfx-beam, .dots i { animation: none !important; }
  .illu .check { stroke-dashoffset: 0; }
}
</style>
