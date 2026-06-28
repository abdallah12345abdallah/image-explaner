<template>
  <ion-app>
    <ion-router-outlet />
  </ion-app>
</template>

<script setup lang="ts">
import { IonApp, IonRouterOutlet, useBackButton } from '@ionic/vue';
import { useRouter, useRoute } from 'vue-router';

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
