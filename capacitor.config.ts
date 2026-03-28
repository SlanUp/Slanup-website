import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.slanup.app',
  appName: 'Slanup',
  webDir: 'out',
  backgroundColor: '#FFFFFF',
  server: {
    url: 'https://www.slanup.com/app',
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
      overlaysWebView: false,
      style: 'DARK',
      backgroundColor: '#FFFFFF',
    },
  },
  ios: {
    scheme: 'Slanup',
    contentInset: 'never',
    preferredContentMode: 'mobile',
  },
  android: {
    backgroundColor: '#FFFFFF',
  },
};

export default config;
