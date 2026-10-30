import { createElement, useEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { Platform } from 'react-native';
import gsap from 'gsap';

import { Logo } from '@/components/ui/Logo';
import { brandColors, fontFamilies } from '@/constants/theme';

const screenStyle: CSSProperties = {
  position: 'fixed',
  inset: 0,
  zIndex: 10000,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  overflow: 'auto',
  padding: '24px',
  boxSizing: 'border-box',
  background:
    'radial-gradient(ellipse at 50% 35%, rgba(107, 58, 92, 0.42), transparent 58%), #2A1824',
  color: '#F7F0E8',
  textAlign: 'center',
};

const contentStyle: CSSProperties = {
  width: '100%',
  maxWidth: '440px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
};

const animationStyle: CSSProperties = {
  position: 'relative',
  width: '220px',
  height: '205px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: '18px',
};

const orbitStyle = (size: number, border: string): CSSProperties => ({
  position: 'absolute',
  width: `${size}px`,
  height: `${size}px`,
  border: `1px solid ${border}`,
  borderRadius: '50%',
  transformOrigin: '50% 50%',
});

export function OfflineScreen() {
  const [offline, setOffline] = useState(false);
  const animationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return;

    const updateConnection = () => setOffline(!window.navigator.onLine);
    updateConnection();
    window.addEventListener('online', updateConnection);
    window.addEventListener('offline', updateConnection);
    return () => {
      window.removeEventListener('online', updateConnection);
      window.removeEventListener('offline', updateConnection);
    };
  }, []);

  useEffect(() => {
    if (!offline || !animationRef.current || typeof window === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const animation = gsap.context(() => {
      gsap.to('.mk-offline-orbit', {
        rotation: 360,
        duration: 22,
        repeat: -1,
        ease: 'none',
      });
      gsap.to('.mk-offline-orbit-inner', {
        rotation: -360,
        duration: 30,
        repeat: -1,
        ease: 'none',
      });
      gsap.to('.mk-offline-logo', {
        y: -8,
        duration: 2,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      });
      gsap.to('.mk-offline-glow', {
        scale: 1.16,
        opacity: 0.72,
        duration: 1.8,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      });
      gsap.to('.mk-offline-spark', {
        rotation: 180,
        scale: 1.3,
        duration: 2.4,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      });
    }, animationRef);

    return () => animation.revert();
  }, [offline]);

  if (Platform.OS !== 'web' || !offline) return null;

  return createElement(
    'div',
    {
      role: 'status',
      'aria-live': 'polite',
      'aria-labelledby': 'mk-offline-title',
      style: screenStyle,
    },
    createElement(
      'div',
      { style: contentStyle },
      createElement(
        'div',
        { ref: animationRef, className: 'mk-offline-animation', style: animationStyle },
        createElement('div', {
          className: 'mk-offline-glow',
          style: {
            position: 'absolute',
            width: '126px',
            height: '126px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(224, 122, 95, 0.3), transparent 72%)',
          },
        }),
        createElement(
          'div',
          { className: 'mk-offline-orbit', style: orbitStyle(164, 'rgba(247, 240, 232, 0.22)') },
          createElement('span', {
            style: {
              position: 'absolute',
              top: '18px',
              left: '22px',
              width: '9px',
              height: '9px',
              borderRadius: '50%',
              backgroundColor: brandColors.coralSoft,
              boxShadow: '0 0 18px rgba(240, 160, 144, 0.8)',
            },
          }),
        ),
        createElement(
          'div',
          {
            className: 'mk-offline-orbit-inner',
            style: orbitStyle(132, 'rgba(224, 122, 95, 0.35)'),
          },
          createElement('span', {
            className: 'mk-offline-spark',
            style: {
              position: 'absolute',
              right: '4px',
              top: '30px',
              width: '8px',
              height: '8px',
              borderRadius: '2px',
              backgroundColor: brandColors.coral,
              boxShadow: '0 0 16px rgba(224, 122, 95, 0.8)',
            },
          }),
        ),
        createElement(
          'div',
          {
            className: 'mk-offline-logo',
            style: { position: 'relative', zIndex: 1, filter: 'drop-shadow(0 10px 24px rgba(0,0,0,0.2))' },
          },
          createElement(Logo, { size: 'lg', variant: 'light' }),
        ),
      ),
      createElement(
        'p',
        {
          style: {
            margin: '0 0 12px',
            color: brandColors.coralSoft,
            fontFamily: fontFamilies.sansSemiBold,
            fontSize: '11px',
            letterSpacing: '2px',
            textTransform: 'uppercase',
          },
        },
        'MK Events',
      ),
      createElement(
        'h1',
        {
          id: 'mk-offline-title',
          style: {
            margin: '0',
            fontFamily: fontFamilies.serifSemiBold,
            fontSize: 'clamp(30px, 7vw, 42px)',
            lineHeight: 1.15,
            fontWeight: 600,
          },
        },
        'Vous êtes hors ligne',
      ),
      createElement(
        'p',
        {
          style: {
            maxWidth: '340px',
            margin: '16px 0 26px',
            color: 'rgba(247, 240, 232, 0.72)',
            fontFamily: fontFamilies.sans,
            fontSize: '15px',
            lineHeight: 1.7,
          },
        },
        'La connexion semble interrompue. Rétablissez-la pour retrouver toutes les fonctionnalités de MK Events.',
      ),
      createElement(
        'button',
        {
          type: 'button',
          onClick: () => window.location.reload(),
          style: {
            minHeight: '48px',
            padding: '0 24px',
            border: 0,
            borderRadius: '999px',
            background: brandColors.coral,
            color: brandColors.ink,
            fontFamily: fontFamilies.sansSemiBold,
            fontSize: '14px',
            cursor: 'pointer',
            boxShadow: '0 8px 26px rgba(224, 122, 95, 0.22)',
          },
        },
        'Réessayer',
      ),
    ),
  );
}
