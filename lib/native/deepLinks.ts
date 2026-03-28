import { Capacitor } from '@capacitor/core';
import { App, URLOpenListenerEvent } from '@capacitor/app';

/**
 * Initialize deep link handling for native platforms.
 * When a magic link (or any slanup.com URL) is opened, it routes
 * within the Capacitor WebView instead of the system browser.
 */
export function initDeepLinks() {
  if (!Capacitor.isNativePlatform()) return;

  App.addListener('appUrlOpen', (event: URLOpenListenerEvent) => {
    const url = new URL(event.url);

    // Extract the path (e.g., /app/verify?token=abc123)
    const path = url.pathname + url.search;

    if (path) {
      // Navigate inside the WebView
      window.location.href = path;
    }
  });
}
