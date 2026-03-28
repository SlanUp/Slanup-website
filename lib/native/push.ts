import { Capacitor } from '@capacitor/core';
import { PushNotifications } from '@capacitor/push-notifications';
import { StatusBar, Style } from '@capacitor/status-bar';
import { apiFetch } from '@/lib/api/client';

// Check if running in a native Capacitor app
export const isNative = Capacitor.isNativePlatform();

export async function initNativeUI() {
  if (!isNative) return;

  // Tag the document so CSS can scope native-only styles
  document.documentElement.classList.add('capacitor-native');

  try {
    await StatusBar.setStyle({ style: Style.Light });
    if (Capacitor.getPlatform() === 'android') {
      await StatusBar.setBackgroundColor({ color: '#FFFFFF' });
    }
  } catch {
    // StatusBar may not be available on all platforms
  }
}

export async function initPushNotifications() {
  if (!isNative) return;

  const permResult = await PushNotifications.requestPermissions();
  if (permResult.receive !== 'granted') {
    console.log('[Push] Permission not granted');
    return;
  }

  await PushNotifications.register();

  // Token received — send to backend
  PushNotifications.addListener('registration', async (token) => {
    console.log('[Push] Token:', token.value);
    try {
      await apiFetch('/api/web/push-token', {
        method: 'POST',
        body: { token: token.value, platform: Capacitor.getPlatform() },
      });
    } catch (err) {
      console.error('[Push] Failed to register token:', err);
    }
  });

  PushNotifications.addListener('registrationError', (error) => {
    console.error('[Push] Registration error:', error);
  });

  // Notification received while app is in foreground
  PushNotifications.addListener('pushNotificationReceived', (notification) => {
    console.log('[Push] Received in foreground:', notification);
  });

  // User tapped on a notification
  PushNotifications.addListener('pushNotificationActionPerformed', (action) => {
    const data = action.notification.data;
    if (data?.url) {
      window.location.href = data.url;
    } else if (data?.planId) {
      window.location.href = `/app/plan/${data.planId}`;
    }
  });
}
