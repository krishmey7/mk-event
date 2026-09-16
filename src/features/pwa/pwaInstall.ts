/**
 * Détection & stockage pour l’invite d’installation PWA.
 */

import { Platform } from 'react-native';

const DISMISS_KEY = 'mk-event-pwa-dismissed-at';
const DISMISS_DAYS = 14;

export type PwaPlatform = 'ios' | 'android' | 'desktop' | 'other';

export function isWebRuntime(): boolean {
  return Platform.OS === 'web' && typeof window !== 'undefined';
}

export function isPwaInstalled(): boolean {
  if (!isWebRuntime()) return true;
  const media = window.matchMedia?.('(display-mode: standalone)');
  if (media?.matches) return true;
  const nav = window.navigator as Navigator & { standalone?: boolean };
  return Boolean(nav.standalone);
}

export function detectPwaPlatform(): PwaPlatform {
  if (!isWebRuntime()) return 'other';
  const ua = window.navigator.userAgent || '';
  if (/iPhone|iPad|iPod/i.test(ua)) return 'ios';
  if (/Android/i.test(ua)) return 'android';
  if (/Windows|Macintosh|Linux/i.test(ua)) return 'desktop';
  return 'other';
}

export function wasPwaPromptDismissed(): boolean {
  if (!isWebRuntime()) return true;
  try {
    const raw = window.localStorage.getItem(DISMISS_KEY);
    if (!raw) return false;
    const at = Number(raw);
    if (!Number.isFinite(at)) return false;
    return Date.now() - at < DISMISS_DAYS * 24 * 60 * 60 * 1000;
  } catch {
    return false;
  }
}

export function dismissPwaPrompt(): void {
  if (!isWebRuntime()) return;
  try {
    window.localStorage.setItem(DISMISS_KEY, String(Date.now()));
  } catch {
    /* ignore */
  }
}

export function clearPwaPromptDismiss(): void {
  if (!isWebRuntime()) return;
  try {
    window.localStorage.removeItem(DISMISS_KEY);
  } catch {
    /* ignore */
  }
}

export type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
};
