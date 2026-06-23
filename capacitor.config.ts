import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'ai.dqq.wuduh',
  appName: 'وضوح',
  webDir: 'dist',
  plugins: {
    SplashScreen: {
      launchShowDuration: 1600,
      backgroundColor: '#0d9488',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
    },
  },
};

export default config;
