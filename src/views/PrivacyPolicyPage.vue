<template>
  <ion-page>
    <AppNavbar :title="t('auth.privacyPolicy')" :backHref="backHref" />
    <ion-content :fullscreen="true" :dir="dir" class="page">
      <div class="wrap">
        <p class="updated">{{ t("privacy.updated") }}</p>
        <p class="intro">{{ t("privacy.intro") }}</p>

        <section v-for="(s, i) in sections" :key="i" class="sec">
          <h2 class="sec-h">{{ s.h }}</h2>
          <p class="sec-b">{{ s.b }}</p>
        </section>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup>
import { computed } from "vue";
import { IonPage, IonContent } from "@ionic/vue";
import AppNavbar from "@/components/AppNavbar.vue";
import { t, dir } from "@/i18n";
import { isLoggedIn } from "@/stores/auth";

// NOTE FOR THE CLIENT: this is a ready-to-use template covering what the app
// actually collects. Have it reviewed by your legal contact and replace the
// "[support email]" placeholder (in src/i18n/index.js → privacy.sections, the
// "Contact us" section) with your real support/contact address before launch.
const sections = computed(() => t("privacy.sections"));

// Reachable from signup (logged out) and from Settings (logged in).
const backHref = isLoggedIn() ? "/tabs/home" : "/signup";
</script>

<style scoped>
.page { --background: #f7faf9; }
.wrap {
  max-width: 560px;
  margin: 0 auto;
  padding: 18px 18px 32px;
  font-family: "Cairo", sans-serif;
  color: #1b2524;
}
.updated { margin: 0 0 4px; font-size: 0.8rem; color: #7a8a88; font-weight: 700; }
.intro { margin: 0 0 8px; font-size: 0.98rem; line-height: 1.8; color: #2b3a38; }
.sec { margin-top: 18px; }
.sec-h { margin: 0 0 6px; font-size: 1.05rem; font-weight: 800; color: #0f766e; }
.sec-b {
  margin: 0;
  font-size: 0.94rem;
  line-height: 1.85;
  color: #2b3a38;
  white-space: pre-line; /* honour the line breaks in list-style bodies */
}
</style>
