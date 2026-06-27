<template>
  <ion-page>
    <ion-content :fullscreen="true" :dir="dir" class="home">
      <!-- decorative background -->
      <div class="bg-decor" aria-hidden="true">
        <span class="orb o1"></span>
        <span class="orb o2"></span>
        <span class="orb o3"></span>
        <span class="bg-dots"></span>
      </div>

      <!-- greeting cap -->
      <header class="topcap">
        <div class="topcap-bg" aria-hidden="true">
          <span class="c c1"></span>
          <span class="c c2"></span>
        </div>
        <div class="navbar">
          <h1 class="brand-name">{{ t("brand") }}</h1>
        </div>
        <div class="welcome">
          <p class="w-hi">{{ t("home.welcome") }} <span class="wave">👋</span></p>
          <p class="w-sub">
            <span>{{ t("home.weExplain") }}</span>
            <transition name="rotate" mode="out-in">
              <span class="rot" :key="rotIndex">{{ rotWords[rotIndex] }}</span>
            </transition>
          </p>
        </div>
      </header>

      <main class="body">
        <h2 class="section-h">{{ t("home.whatToDo") }}</h2>

        <!-- hero / primary action -->
        <button class="hero rise" style="--d: 0ms" @click="go('/tabs/scan')">
          <span class="hero-ico">
            <svg class="scan-svg" viewBox="0 0 48 48" fill="none" aria-hidden="true">
              <!-- scan corner brackets -->
              <path d="M7 16V10a3 3 0 0 1 3-3h6" />
              <path d="M41 16V10a3 3 0 0 0-3-3h-6" />
              <path d="M7 32v6a3 3 0 0 0 3 3h6" />
              <path d="M41 32v6a3 3 0 0 1-3 3h-6" />
              <!-- framed photo -->
              <rect x="15" y="16" width="18" height="16" rx="2.5" />
              <circle cx="20.5" cy="21" r="1.7" fill="#fff" stroke="none" />
              <path d="M15.5 29.5l3.5-3.5 2.5 2.5 4-4.5 7 7.5" />
            </svg>
          </span>
          <span class="hero-text">
            <strong>{{ t("home.scanTitle") }}</strong>
            <small>{{ t("home.scanDesc") }}</small>
          </span>
          <span class="hero-go"><ion-icon :icon="heroGoIcon"></ion-icon></span>
        </button>

        <!-- two-up grid -->
        <div class="grid">
          <button class="card amber-card anim-bell rise" style="--d: 80ms" @click="go('/tabs/reminders')">
            <span class="chip amber">
              <span class="badge" aria-hidden="true"></span>
              <ion-icon :icon="notificationsOutline"></ion-icon>
            </span>
            <strong>{{ t("home.apptTitle") }}</strong>
            <small>{{ t("home.apptDesc") }}</small>
            <ion-icon :icon="goIcon" class="go"></ion-icon>
          </button>

          <button class="card indigo-card anim-clock rise" style="--d: 150ms" @click="go('/tabs/history')">
            <span class="chip indigo"><ion-icon :icon="timeOutline"></ion-icon></span>
            <strong>{{ t("home.historyTitle") }}</strong>
            <small>{{ t("home.historyDesc") }}</small>
            <ion-icon :icon="goIcon" class="go"></ion-icon>
          </button>
        </div>

        <!-- settings row — turning gear -->
        <button class="row violet-row anim-gear rise" style="--d: 220ms" @click="go('/settings')">
          <span class="chip violet sm"><ion-icon :icon="settingsOutline"></ion-icon></span>
          <span class="row-text">
            <strong>{{ t("home.settingsTitle") }}</strong>
            <small>{{ t("home.settingsDesc") }}</small>
          </span>
          <ion-icon :icon="goIcon" class="go"></ion-icon>
        </button>
      </main>
    </ion-content>
  </ion-page>
</template>

<script setup>
import { IonPage, IonContent, IonIcon, useIonRouter } from "@ionic/vue";
import {
  notificationsOutline,
  timeOutline,
  settingsOutline,
  chevronBackOutline,
  chevronForwardOutline,
  arrowBackOutline,
  arrowForwardOutline,
} from "ionicons/icons";
import { ref, computed, onMounted, onBeforeUnmount } from "vue";
import { t, dir } from "@/i18n";

const ionRouter = useIonRouter();
const go = (path) => ionRouter.push(path, "forward");

// "go forward" arrows point left in RTL, right in LTR
const goIcon = computed(() =>
  dir.value === "rtl" ? chevronBackOutline : chevronForwardOutline
);
const heroGoIcon = computed(() =>
  dir.value === "rtl" ? arrowBackOutline : arrowForwardOutline
);

const rotWords = computed(() => t("home.rot"));
const rotIndex = ref(0);
let rotTimer = null;
onMounted(() => {
  rotTimer = setInterval(() => {
    rotIndex.value = (rotIndex.value + 1) % rotWords.value.length;
  }, 2200);
});
onBeforeUnmount(() => clearInterval(rotTimer));
</script>

<style scoped>
.home { --background: #f6f9f8; }

/* ---------- decorative background ---------- */
.bg-decor {
  position: absolute;
  inset: 0;
  z-index: 0;
  overflow: hidden;
  pointer-events: none;
}
.orb { position: absolute; border-radius: 50%; }
.o1 {
  width: 260px; height: 260px;
  top: 150px; inset-inline-end: -90px;
  background: radial-gradient(circle, rgba(20, 184, 166, 0.14), rgba(20, 184, 166, 0) 70%);
}
.o2 {
  width: 220px; height: 220px;
  top: 400px; inset-inline-start: -80px;
  background: radial-gradient(circle, rgba(245, 158, 11, 0.12), rgba(245, 158, 11, 0) 70%);
}
.o3 {
  width: 280px; height: 280px;
  bottom: 20px; inset-inline-end: -100px;
  background: radial-gradient(circle, rgba(124, 58, 237, 0.12), rgba(124, 58, 237, 0) 70%);
}
/* faint dot grid for texture */
.bg-dots {
  position: absolute;
  inset: 200px 0 0 0;
  background-image: radial-gradient(rgba(13, 70, 65, 0.05) 1.5px, transparent 1.5px);
  background-size: 22px 22px;
  -webkit-mask-image: linear-gradient(to bottom, #000, transparent 70%);
  mask-image: linear-gradient(to bottom, #000, transparent 70%);
}

/* ---------- greeting cap ---------- */
.topcap {
  position: relative;
  z-index: 1;
  overflow: hidden;
  color: #fff;
  padding: calc(env(safe-area-inset-top) + 18px) 22px 40px;
  background: linear-gradient(155deg, #0d9488 0%, #14b8a6 55%, #0ea5a0 100%);
  border-bottom-left-radius: 26px;
  border-bottom-right-radius: 26px;
  box-shadow: 0 14px 34px rgba(13, 148, 136, 0.3);
}
.topcap-bg { position: absolute; inset: 0; pointer-events: none; }
.c { position: absolute; border-radius: 50%; background: rgba(255, 255, 255, 0.1); }
.c1 { width: 180px; height: 180px; top: -70px; inset-inline-start: -50px; }
.c2 { width: 120px; height: 120px; bottom: -50px; inset-inline-end: -24px; }
.navbar { position: relative; z-index: 1; display: flex; justify-content: center; padding-bottom: 10px; }
.brand-name {
  margin: 0;
  font-family: "Gulzar", "Aref Ruqaa", serif;
  font-size: 1.9rem; font-weight: 400; line-height: 1.5;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.18);
}
.welcome {
  position: relative; z-index: 1;
  display: flex; flex-direction: column; align-items: center; text-align: center;
  gap: 2px; margin-top: 20px; font-family: "Cairo", sans-serif;
}
.w-hi { margin: 0; font-size: 0.95rem; font-weight: 600; opacity: 0.94; }
.wave { display: inline-block; transform-origin: 70% 70%; animation: wave 2.6s ease-in-out infinite; }
.w-sub { margin: 0; display: flex; justify-content: center; align-items: center; gap: 8px; font-size: 1.35rem; font-weight: 800; }
.rot { display: inline-block; color: #ffe39e; }
.rotate-enter-active, .rotate-leave-active { transition: opacity 0.35s ease, transform 0.35s cubic-bezier(0.2, 0.8, 0.2, 1); }
.rotate-enter-from { opacity: 0; transform: translateY(10px); }
.rotate-leave-to { opacity: 0; transform: translateY(-10px); }

/* ---------- body ---------- */
.body { position: relative; z-index: 1; max-width: 560px; margin: 0 auto; padding: 20px 18px 32px; font-family: "Cairo", sans-serif; }
.section-h { margin: 4px 2px 14px; font-size: 1.05rem; font-weight: 800; color: #0f766e; }

/* shared chip (icon badge) */
.chip {
  position: relative;
  flex: 0 0 auto;
  width: 50px; height: 50px;
  border-radius: 12px;
  display: grid; place-items: center;
  color: #fff; font-size: 1.5rem;
  background: linear-gradient(135deg, #14b8a6, #0d9488);
  box-shadow: 0 6px 14px rgba(13, 148, 136, 0.35);
}
.chip.amber { background: linear-gradient(135deg, #fbbf24, #f59e0b); box-shadow: 0 6px 14px rgba(245, 158, 11, 0.32); }
.chip.indigo { background: linear-gradient(135deg, #6366f1, #4f46e5); box-shadow: 0 6px 14px rgba(79, 70, 229, 0.32); }
.chip.violet { background: linear-gradient(135deg, #a78bfa, #7c3aed); box-shadow: 0 6px 14px rgba(124, 58, 237, 0.32); }
.chip.sm { width: 44px; height: 44px; border-radius: 11px; font-size: 1.3rem; }

.go { color: #c2cecc; font-size: 1.15rem; }

/* ---------- hero (clean & light) ---------- */
.hero {
  display: flex; align-items: center; gap: 14px;
  width: 100%;
  margin-bottom: 16px;
  padding: 18px;
  border: none;
  border-radius: 14px;
  color: #fff;
  cursor: pointer;
  text-align: start;
  font-family: "Cairo", sans-serif;
  background: linear-gradient(120deg, #15bdac, #0d9488);
  box-shadow: 0 10px 22px rgba(13, 148, 136, 0.26);
}
.hero-ico {
  flex: 0 0 auto;
  width: 54px; height: 54px;
  border-radius: 13px;
  display: grid; place-items: center;
  background: rgba(255, 255, 255, 0.18);
  animation: hero-breathe 2.8s ease-in-out infinite;
}
.scan-svg {
  width: 30px; height: 30px;
  stroke: #fff;
  stroke-width: 2.3;
  stroke-linecap: round;
  stroke-linejoin: round;
}
.hero-text { flex: 1 1 auto; min-width: 0; display: flex; flex-direction: column; gap: 5px; }
.hero-text strong { font-size: 1.18rem; font-weight: 800; }
.hero-text small { font-size: 0.82rem; opacity: 0.9; }
.hero-go {
  flex: 0 0 auto;
  display: grid; place-items: center;
  font-size: 1.2rem;
  opacity: 0.9;
  animation: nudge 1.8s ease-in-out infinite;
}

/* ---------- grid cards ---------- */
.grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
.card {
  position: relative;
  display: flex; flex-direction: column; align-items: flex-start; gap: 3px;
  min-height: 140px;
  padding: 16px 15px;
  border: 1px solid rgba(13, 70, 65, 0.06);
  border-radius: 14px;
  background: #fff;
  box-shadow: 0 8px 20px rgba(13, 70, 65, 0.06);
  cursor: pointer;
  text-align: start;
  font-family: "Cairo", sans-serif;
}
.card .chip { margin-bottom: 10px; }
.card strong { font-size: 1.05rem; font-weight: 800; color: #1b2524; }
.card small { font-size: 0.78rem; color: #7a8a88; line-height: 1.4; margin-top: 4px; }
.card .go { position: absolute; top: 16px; inset-inline-end: 14px; }

/* ---------- settings row ---------- */
.row {
  display: flex; align-items: center; gap: 13px;
  width: 100%;
  margin-top: 14px;
  padding: 13px 15px;
  border: 1px solid rgba(13, 70, 65, 0.06);
  border-radius: 14px;
  background: #fff;
  box-shadow: 0 8px 20px rgba(13, 70, 65, 0.06);
  cursor: pointer;
  text-align: start;
  font-family: "Cairo", sans-serif;
}
.row-text { flex: 1 1 auto; min-width: 0; display: flex; flex-direction: column; gap: 4px; }
.row-text strong { font-size: 1rem; font-weight: 800; color: #1b2524; }
.row-text small { font-size: 0.78rem; color: #7a8a88; }

/* ---------- per-card identity (themed background wash) ---------- */
.amber-card { background: radial-gradient(135% 90% at 100% 0%, rgba(245, 158, 11, 0.12), #fff 56%); }
.indigo-card { background: radial-gradient(135% 90% at 100% 0%, rgba(79, 70, 229, 0.12), #fff 56%); }
.violet-row { background: radial-gradient(150% 220% at 100% 0%, rgba(124, 58, 237, 0.1), #fff 60%); }

/* المواعيد — bell rings + a pulsing notification dot */
.anim-bell .chip ion-icon { transform-origin: 50% 14%; animation: bell-ring 3.2s ease-in-out infinite; }
.badge {
  position: absolute;
  top: -2px; inset-inline-end: -2px;
  width: 13px; height: 13px;
  border-radius: 50%;
  background: #ef4444;
  border: 2px solid #fff;
  animation: badge-pulse 1.8s ease-in-out infinite;
}

/* السجل — clock turns slowly */
.anim-clock .chip ion-icon { animation: spin 8s linear infinite; }

/* الإعدادات — gear turns slowly */
.anim-gear .chip ion-icon { animation: spin 11s linear infinite; }

/* ---------- interactions ---------- */
.hero:active, .card:active, .row:active { transform: scale(0.975); }
.hero, .card, .row { transition: transform 0.16s ease, box-shadow 0.16s ease; }

/* staggered entrance (settles to a flat resting state) */
.rise { animation: rise 0.5s cubic-bezier(0.22, 1, 0.36, 1) both; animation-delay: var(--d); }

@keyframes rise {
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes nudge {
  0%, 100% { transform: translateX(0); }
  50% { transform: translateX(-4px); }
}
@keyframes hero-breathe {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.06); }
}
@keyframes bell-ring {
  0%, 55%, 100% { transform: rotate(0deg); }
  60% { transform: rotate(15deg); }
  67% { transform: rotate(-12deg); }
  74% { transform: rotate(8deg); }
  81% { transform: rotate(-5deg); }
  88% { transform: rotate(3deg); }
}
@keyframes badge-pulse {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.3); opacity: 0.7; }
}
@keyframes spin { to { transform: rotate(360deg); } }
@keyframes wave {
  0%, 60%, 100% { transform: rotate(0deg); }
  10% { transform: rotate(14deg); }
  20% { transform: rotate(-8deg); }
  30% { transform: rotate(14deg); }
  40% { transform: rotate(-4deg); }
  50% { transform: rotate(10deg); }
}

@media (prefers-reduced-motion: reduce) {
  .wave, .badge, .hero-go, .hero-ico,
  .anim-bell .chip ion-icon,
  .anim-clock .chip ion-icon,
  .anim-gear .chip ion-icon { animation: none; }
  .rise { animation: none; opacity: 1; transform: none; }
}
</style>
