import { Capacitor } from '@capacitor/core';
import { App, URLOpenListenerEvent } from '@capacitor/app';

/**
 * Initialize deep link handling for native platforms.
 * Handles both Universal Links (https://www.slanup.com/...)
 * and custom scheme (slanup://verify?token=...).
 */
export function initDeepLinks() {
  if (!Capacitor.isNativePlatform()) return;

  App.addListener('appUrlOpen', (event: URLOpenListenerEvent) => {
    const url = new URL(event.url);
    let path: string;

    if (url.protocol === 'slanup:') {
      // Custom scheme: slanup://verify?token=abc → /app/verify?token=abc
      path = '/app/' + url.pathname.replace(/^\/+/, '') + url.search;
    } else {
      // Universal Link: https://www.slanup.com/app/verify?token=abc
      path = url.pathname + url.search;
    }

    if (path) {
      window.location.href = path;
    }
  });
}
