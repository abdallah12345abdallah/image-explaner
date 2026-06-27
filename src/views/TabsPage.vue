<template>
  <ion-page>
    <ion-tabs>
      <!-- hub-and-spoke: no tab bar; Home is the hub, pages return via back -->
      <ion-router-outlet></ion-router-outlet>
    </ion-tabs>
  </ion-page>
</template>

<script setup>
import { IonPage, IonTabs, IonRouterOutlet } from "@ionic/vue";
</script>
