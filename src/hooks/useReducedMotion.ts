/**
 * ──────────────────────────────────────────────────────────────
 *  MK EVENTS — PRÉFÉRENCE « MOUVEMENT RÉDUIT »
 * ──────────────────────────────────────────────────────────────
 *  Expose `prefers-reduced-motion` sur le web et
 *  `AccessibilityInfo` sur mobile. Les animations purement
 *  décoratives doivent rendre leur état final quand c’est vrai.
 * ──────────────────────────────────────────────────────────────
 */

import { useEffect, useState } from 'react';
import { AccessibilityInfo, Platform } from 'react-native';

const WEB_QUERY = '(prefers-reduced-motion: reduce)';

function readWebPreference(): boolean {
  if (Platform.OS !== 'web' || typeof window === 'undefined') return false;
  return Boolean(window.matchMedia?.(WEB_QUERY)?.matches);
}

export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(readWebPreference);

  useEffect(() => {
    let active = true;
    let remove = () => undefined as void;

    if (Platform.OS === 'web') {
      if (typeof window === 'undefined' || !window.matchMedia) return;
      const media = window.matchMedia(WEB_QUERY);
      const update = () => {
        if (active) setReduced(media.matches);
      };
      update();
      if (typeof media.addEventListener === 'function') {
        media.addEventListener('change', update);
        remove = () => media.removeEventListener('change', update);
      } else if (typeof media.addListener === 'function') {
        media.addListener(update);
        remove = () => media.removeListener(update);
      }
    } else {
      void AccessibilityInfo.isReduceMotionEnabled()
        .then((value) => {
          if (active) setReduced(value);
        })
        .catch(() => undefined);
      const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', (value) => {
        if (active) setReduced(value);
      });
      remove = () => subscription.remove();
    }

    return () => {
      active = false;
      remove();
    };
  }, []);

  return reduced;
}
