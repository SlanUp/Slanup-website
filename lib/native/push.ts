import { Capacitor } from '@capacitor/core';
import { PushNotifications } from '@capacitor/push-notifications';
import { FirebaseMessaging } from '@capacitor-firebase/messaging';
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

  try {
    const permResult = await PushNotifications.requestPermissions();
    if (permResult.receive !== 'granted') {
      console.log('[Push] Permission not granted:', permResult.receive);
      return;
    }

    // Get the FCM token (works on both iOS and Android)
    const { token } = await FirebaseMessaging.getToken();
    console.log('[Push] FCM token received');

    try {
      await apiFetch('/api/web/push-token', {
        method: 'POST',
        body: { token, platform: Capacitor.getPlatform() },
      });
      console.log('[Push] Token registered with backend');
    } catch (err) {
      console.error('[Push] Failed to register token:', err);
    }

    // Listen for token refresh
    await FirebaseMessaging.removeAllListeners();

    FirebaseMessaging.addListener('tokenReceived', async (event) => {
      console.log('[Push] Token refreshed');
      try {
        await apiFetch('/api/web/push-token', {
          method: 'POST',
          body: { token: event.token, platform: Capacitor.getPlatform() },
        });
      } catch (err) {
        console.error('[Push] Failed to register refreshed token:', err);
      }
    });

    // Notification received while app is in foreground
    FirebaseMessaging.addListener('notificationReceived', (event) => {
      console.log('[Push] Received in foreground:', event);
    });

    // User tapped on a notification
    FirebaseMessaging.addListener('notificationActionPerformed', (event) => {
      const data = event.notification?.data as Record<string, string> | undefined;
      if (data?.url) {
        window.location.href = data.url;
      } else if (data?.planId) {
        window.location.href = `/app/plan/${data.planId}`;
      }
    });
  } catch (err) {
    console.error('[Push] Init error:', err);
  }
}
