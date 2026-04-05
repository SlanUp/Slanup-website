import { Capacitor } from '@capacitor/core';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';

const isNative = Capacitor.isNativePlatform();

/** Light tap — buttons, nav, list items */
export function hapticLight() {
  if (!isNative) return;
  Haptics.impact({ style: ImpactStyle.Light }).catch(() => {});
}

/** Medium tap — form submit, confirm actions */
export function hapticMedium() {
  if (!isNative) return;
  Haptics.impact({ style: ImpactStyle.Medium }).catch(() => {});
}

/** Heavy tap — destructive actions, important confirmations */
export function hapticHeavy() {
  if (!isNative) return;
  Haptics.impact({ style: ImpactStyle.Heavy }).catch(() => {});
}

/** Success — login, sent, approved */
export function hapticSuccess() {
  if (!isNative) return;
  Haptics.notification({ type: NotificationType.Success }).catch(() => {});
}

/** Error — failed actions, validation errors */
export function hapticError() {
  if (!isNative) return;
  Haptics.notification({ type: NotificationType.Error }).catch(() => {});
}

/** Warning — destructive confirmations */
export function hapticWarning() {
  if (!isNative) return;
  Haptics.notification({ type: NotificationType.Warning }).catch(() => {});
}

/** Selection tick — toggles, pickers, tab switches */
export function hapticSelection() {
  if (!isNative) return;
  Haptics.selectionStart().catch(() => {});
}
