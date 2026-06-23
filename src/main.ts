import { createApp } from 'vue'
import App from './App.vue'
import router from './router';

import { IonicVue, createAnimation } from '@ionic/vue';

/* Capacitor PWA elements — required for the Camera plugin to work in the browser */
import { defineCustomElements } from '@ionic/pwa-elements/loader';

/* Core CSS required for Ionic components to work properly */
import '@ionic/vue/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/vue/css/normalize.css';
import '@ionic/vue/css/structure.css';
import '@ionic/vue/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/vue/css/padding.css';
import '@ionic/vue/css/float-elements.css';
import '@ionic/vue/css/text-alignment.css';
import '@ionic/vue/css/text-transformation.css';
import '@ionic/vue/css/flex-utils.css';
import '@ionic/vue/css/display.css';

/**
 * Ionic Dark Mode
 * -----------------------------------------------------
 * For more info, please see:
 * https://ionicframework.com/docs/theming/dark-mode
 */

/* Light theme only — dark palettes intentionally disabled. */
/* import '@ionic/vue/css/palettes/dark.always.css'; */
/* import '@ionic/vue/css/palettes/dark.class.css'; */
/* import '@ionic/vue/css/palettes/dark.system.css'; */

/* Theme variables */
import './theme/variables.css';

/* Modern page transition: cross-fade + subtle zoom/slide (direction-aware) */
const pageTransition = (_baseEl: HTMLElement, opts: any) => {
  const { enteringEl, leavingEl, direction } = opts;
  const dir = direction === 'back' ? -1 : 1;
  const easing = 'cubic-bezier(0.25, 0.8, 0.25, 1)';

  const entering = createAnimation()
    .addElement(enteringEl)
    .beforeStyles({ 'z-index': '101' })
    .duration(320)
    .easing(easing)
    .fromTo('opacity', '0', '1')
    .fromTo(
      'transform',
      `translateY(${20 * dir}px) scale(0.97)`,
      'translateY(0) scale(1)'
    );

  const animations = [entering];

  if (leavingEl) {
    const leaving = createAnimation()
      .addElement(leavingEl)
      .beforeStyles({ 'z-index': '100' })
      .duration(320)
      .easing(easing)
      .fromTo('opacity', '1', '0')
      .fromTo(
        'transform',
        'translateY(0) scale(1)',
        `translateY(${-14 * dir}px) scale(1.02)`
      );
    animations.push(leaving);
  }

  return createAnimation().addAnimation(animations);
};

const app = createApp(App)
  .use(IonicVue, { navAnimation: pageTransition })
  .use(router);

router.isReady().then(() => {
  app.mount('#app');
});

defineCustomElements(window);
