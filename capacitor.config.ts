import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.slanup.app',
  appName: 'Slanup',
  webDir: 'out',
  server: {
    url: 'https://www.slanup.com',
    cleartext: false,
  },
  plugins: {
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
    SplashScreen: {
      launchAutoHide: true,
      launchShowDuration: 2000,
      backgroundColor: '#FFFFFF',
      showSpinner: false,
    },
    StatusBar: {
      style: 'LIGHT',
      backgroundColor: '#FFFFFF',
    },
  },
  ios: {
    scheme: 'Slanup',
    contentInset: 'automatic',
  },
  android: {
    backgroundColor: '#FFFFFF',
  },
};

export default config;
