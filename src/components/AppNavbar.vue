<template>
  <ion-header class="nav-header">
    <div class="nav-bar" :dir="dir">
      <button class="nav-btn nav-back" @click="back" :aria-label="t('common.back')">
        <ion-icon :icon="backIcon"></ion-icon>
      </button>
      <h1 class="nav-title">{{ title }}</h1>
      <div class="nav-actions"><slot name="actions"></slot></div>
    </div>
  </ion-header>
</template>

<script setup>
import { computed } from "vue";
import { IonHeader, IonIcon, useIonRouter } from "@ionic/vue";
import { chevronForwardOutline, chevronBackOutline } from "ionicons/icons";
import { t, dir } from "@/i18n";

const props = defineProps({
  title: { type: String, default: "" },
  backHref: { type: String, default: "/tabs/home" },
});

// back points right in RTL, left in LTR
const backIcon = computed(() =>
  dir.value === "rtl" ? chevronForwardOutline : chevronBackOutline
);

const ionRouter = useIonRouter();
function back() {
  ionRouter.push(props.backHref, "back");
}
</script>

<style scoped>
/* drop Ionic's default header shadow line */
.nav-header::after { display: none; }

.nav-bar {
  position: relative;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: calc(env(safe-area-inset-top) + 12px) 16px 14px;
  background: rgba(247, 250, 249, 0.82);
  backdrop-filter: blur(18px) saturate(180%);
  -webkit-backdrop-filter: blur(18px) saturate(180%);
  font-family: "Cairo", sans-serif;
}
/* gradient bottom border */
.nav-bar::after {
  content: "";
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 2px;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(13, 148, 136, 0.45),
    rgba(45, 212, 191, 0.7),
    rgba(13, 148, 136, 0.45),
    transparent
  );
}

/* circular-ish back + action chips */
.nav-btn,
.nav-actions :deep(button) {
  flex: 0 0 auto;
  width: 42px;
  height: 42px;
  border-radius: 14px;
  display: grid;
  place-items: center;
  border: 1px solid rgba(13, 148, 136, 0.16);
  background: rgba(13, 148, 136, 0.08);
  color: var(--ion-color-primary);
  font-size: 1.3rem;
  cursor: pointer;
  transition: transform 0.15s ease, background 0.15s ease;
}
.nav-btn:active,
.nav-actions :deep(button:active) {
  transform: scale(0.9);
  background: rgba(13, 148, 136, 0.16);
}

.nav-title {
  flex: 1 1 auto;
  min-width: 0;
  margin: 0;
  font-size: 1.2rem;
  font-weight: 800;
  color: #11302d;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* keep the title optically centered even when only one side has a button */
.nav-actions {
  flex: 0 0 auto;
  display: flex;
  gap: 8px;
  min-width: 42px;
  justify-content: flex-end;
}
</style>
