import { Capacitor } from '@capacitor/core';
import { PushNotifications } from '@capacitor/push-notifications';
import { StatusBar, Style } from '@capacitor/status-bar';
import { apiFetch } from '@/lib/api/client';

// Check if running in a native Capacitor app
export const isNative = Capacitor.isNativePlatform();

export async function initNativeUI() {
  if (!isNative) return;

  document.documentElement.classList.add('capacitor-native');

  try {
    await StatusBar.setStyle({ style: Style.Light });
    if (Capacitor.getPlatform() === 'android') {
      await StatusBar.setBackgroundColor({ color: '#FFFFFF' });
    }
  } catch {
    // StatusBar may not be available on all platforms
  }

  // Fix back swipe + Next.js RSC conflict:
  // When WebView navigates back via gesture, the RSC payload fetch can fail.
  // Listen for popstate and force a clean page load if the URL changed.
  let lastUrl = window.location.href;
  window.addEventListener('popstate', () => {
    const currentUrl = window.location.href;
    if (currentUrl !== lastUrl) {
      lastUrl = currentUrl;
      // Small delay to let Next.js try first, reload if it fails
      setTimeout(() => {
        const pathname = window.location.pathname;
        // Check if the page actually rendered (Next.js sets __next)
        const nextRoot = document.getElementById('__next');
        if (!nextRoot || nextRoot.childElementCount === 0) {
          window.location.reload();
        }
      }, 500);
    }
  });
}

export async function initPushNotifications() {
  if (!isNative) return;

  try {
    const permResult = await PushNotifications.requestPermissions();
    if (permResult.receive !== 'granted') {
      console.log('[Push] Permission not granted');
      return;
    }

    await PushNotifications.removeAllListeners();

    PushNotifications.addListener('registration', async (token) => {
      console.log('[Push] Token received');
      try {
        await apiFetch('/api/web/push-token', {
          method: 'POST',
          body: { token: token.value, platform: Capacitor.getPlatform() },
        });
        console.log('[Push] Token registered with backend');
      } catch (err) {
        console.error('[Push] Failed to register token:', err);
      }
    });

    PushNotifications.addListener('registrationError', (error) => {
      console.error('[Push] Registration error:', error);
    });

    PushNotifications.addListener('pushNotificationReceived', (notification) => {
      console.log('[Push] Received in foreground:', notification);
    });

    PushNotifications.addListener('pushNotificationActionPerformed', (action) => {
      const data = action.notification.data;
      if (data?.url) {
        window.location.href = data.url;
      } else if (data?.planId) {
        window.location.href = `/app/plan/${data.planId}`;
      }
    });

    await PushNotifications.register();
  } catch (err) {
    console.error('[Push] Init error:', err);
  }
}
