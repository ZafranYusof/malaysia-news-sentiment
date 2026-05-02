import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.mynews.sentiment',
  appName: 'MYNews Sentiment',
  webDir: 'dist',
  android: {
    backgroundColor: '#020617',
  },
  plugins: {
    SplashScreen: {
      backgroundColor: '#020617',
      launchAutoHide: true,
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
    },
  },
};

export default config;
