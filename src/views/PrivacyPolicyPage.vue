<template>
  <ion-page>
    <AppNavbar :title="t('auth.privacyPolicy')" :backHref="backHref" />
    <ion-content :fullscreen="true" :dir="dir" class="page">
      <div class="wrap">
        <!-- TODO: replace this placeholder with the client's real policy text. -->
        <p class="muted">
          {{ t("auth.privacyPolicy") }}
        </p>
        <p class="muted">………</p>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup>
import { IonPage, IonContent } from "@ionic/vue";
import AppNavbar from "@/components/AppNavbar.vue";
import { t, dir } from "@/i18n";
import { isLoggedIn } from "@/stores/auth";

// Reachable from signup (logged out) and from Settings (logged in).
const backHref = isLoggedIn() ? "/tabs/home" : "/signup";
</script>

<style scoped>
.page { --background: #f7faf9; }
.wrap {
  max-width: 560px;
  margin: 0 auto;
  padding: 18px;
  font-family: "Cairo", sans-serif;
  line-height: 1.8;
  color: #1b2524;
}
.muted { color: #5b6b69; }
</style>
