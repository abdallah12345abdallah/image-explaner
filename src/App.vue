<template>
  <ion-app>
    <ion-router-outlet />

    <!-- Global "talking to the server" indicator — shown whenever any store is
         fetching or sending data. Floats above everything, non-blocking. -->
    <transition name="sync-fade">
      <div v-if="isSyncing" class="sync-chip" :dir="dir" role="status" aria-live="polite">
        <span class="sync-spinner" aria-hidden="true"></span>
        <span class="sync-text">{{ t("common.syncing") }}</span>
      </div>
    </transition>
  </ion-app>
</template>

<script setup lang="ts">
import { IonApp, IonRouterOutlet, useBackButton } from '@ionic/vue';
import { useRouter, useRoute } from 'vue-router';
import { isSyncing } from '@/stores/sync';
import { t, dir } from '@/i18n';

const router = useRouter();
const route = useRoute();

/**
 * Hardware back button (Android).
 *
 * The spoke pages (scan / reminders / history) are children of `/tabs/`.
 * Ionic treats each tab sibling as the root of its own stack, so its built-in
 * back handler sees `canGoBack() === false` on those pages and lets the OS
 * close the app. We override that: anywhere except the Home hub, walk back
 * through the real navigation history; only on Home do we allow the exit.
 *
 * Priority 10 keeps overlays (modals, action sheets — priority 100) closing
 * first while still running before Ionic's default routing handler.
 */
// Root screens where back should exit the app: the Home hub (logged in) and
// the Login screen (logged out).
const ROOT_PATHS = ['/tabs/home', '/login'];

useBackButton(10, (processNextHandler) => {
  if (ROOT_PATHS.includes(route.path)) {
    processNextHandler(); // root → let the OS exit/minimize the app
  } else {
    router.back(); // otherwise return to the previous page
  }
});
</script>

<style scoped>
.sync-chip {
  position: fixed;
  top: calc(env(safe-area-inset-top, 0px) + 10px);
  left: 50%;
  transform: translateX(-50%);
  z-index: 99999;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 7px 14px;
  border-radius: 999px;
  background: rgba(15, 118, 110, 0.95);
  color: #fff;
  font-family: "Cairo", sans-serif;
  font-weight: 700;
  font-size: 0.8rem;
  box-shadow: 0 6px 18px rgba(13, 70, 65, 0.28);
  backdrop-filter: blur(6px);
  pointer-events: none;
}
.sync-spinner {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.4);
  border-top-color: #fff;
  animation: sync-spin 0.7s linear infinite;
}
@keyframes sync-spin {
  to { transform: rotate(360deg); }
}
.sync-fade-enter-active,
.sync-fade-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}
.sync-fade-enter-from,
.sync-fade-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(-8px);
}
</style>
