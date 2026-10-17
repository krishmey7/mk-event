/**
 * Nav marketing — barre initiale (sur hero sombre) + pastille flottante au scroll.
 */

import { useEffect, useRef } from 'react';
import { Animated, Easing, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Logo } from '@/components/ui/Logo';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { landingFonts } from '../landingFonts';
import { LANDING } from '../landingTokens';
import { LandingCta } from './LandingCta';

type LandingAnchor = 'platform' | 'journey' | 'models' | 'faq';

const LINKS: Array<[LandingAnchor, string]> = [
  ['platform', 'Plateforme'],
  ['journey', 'Parcours'],
  ['models', 'Modèles'],
  ['faq', 'FAQ'],
];

function NavActions({
  compact,
  onDark,
  onLogin,
  onStart,
}: {
  compact?: boolean;
  onDark?: boolean;
  onLogin: () => void;
  onStart: () => void;
}) {
  return (
    <View style={[styles.actions, compact && styles.actionsCompact]}>
      {!compact ? (
        <Pressable
          accessibilityRole="button"
          onPress={onLogin}
          hitSlop={8}
          style={({ pressed }) => pressed && styles.pressed}
        >
          <Text style={[styles.login, onDark && styles.loginOnDark]}>Connexion</Text>
        </Pressable>
      ) : null}
      <LandingCta
        label="Commencer"
        onPress={onStart}
        variant={onDark ? 'white' : 'coral'}
        compact={compact}
      />
    </View>
  );
}

export function MarketingNav({
  onJump,
  scrolled = false,
}: {
  onJump: (anchor: LandingAnchor) => void;
  scrolled?: boolean;
}) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isDesktop } = useBreakpoint();
  const floatOpacity = useRef(new Animated.Value(0)).current;
  const floatY = useRef(new Animated.Value(-100)).current;
  const topOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!isDesktop) {
      floatOpacity.setValue(0);
      floatY.setValue(-100);
      topOpacity.setValue(1);
      return;
    }
    Animated.parallel([
      Animated.timing(floatOpacity, {
        toValue: scrolled ? 1 : 0,
        duration: 200,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(floatY, {
        toValue: scrolled ? 0 : -100,
        duration: 200,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(topOpacity, {
        toValue: scrolled ? 0 : 1,
        duration: 200,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [floatOpacity, floatY, isDesktop, scrolled, topOpacity]);

  const goLogin = () => router.push('/login');
  const goStart = () => router.push('/onboarding');

  return (
    <>
      <Animated.View
        pointerEvents={isDesktop && scrolled ? 'none' : 'auto'}
        style={[
          styles.bar,
          {
            paddingTop: Math.max(insets.top, 12),
            opacity: isDesktop ? topOpacity : 1,
          },
        ]}
      >
        <View style={styles.innerOnDark}>
          <Logo size={isDesktop ? 'md' : 'sm'} variant="light" />

          {isDesktop ? (
            <View style={styles.links}>
              {LINKS.map(([anchor, label]) => (
                <Pressable
                  key={anchor}
                  onPress={() => onJump(anchor)}
                  hitSlop={8}
                  style={({ pressed }) => pressed && styles.pressed}
                >
                  <Text style={styles.linkOnDark}>{label}</Text>
                </Pressable>
              ))}
            </View>
          ) : null}

          <NavActions onDark onLogin={goLogin} onStart={goStart} />
        </View>
      </Animated.View>

      {isDesktop ? (
        <Animated.View
          pointerEvents={scrolled ? 'auto' : 'none'}
          style={[
            styles.floatWrap,
            {
              top: Math.max(insets.top, 12) + 4,
              opacity: floatOpacity,
              transform: [{ translateY: floatY }],
            },
          ]}
        >
          <View
            style={[
              styles.floatPill,
              Platform.OS === 'web' ? styles.floatPillWeb : styles.floatPillNative,
            ]}
          >
            <Pressable onPress={() => onJump('platform')} hitSlop={6}>
              <Logo size="sm" variant="ink" />
            </Pressable>
            <View style={styles.floatLinks}>
              {LINKS.map(([anchor, label]) => (
                <Pressable
                  key={anchor}
                  onPress={() => onJump(anchor)}
                  hitSlop={6}
                  style={({ pressed }) => [styles.floatLinkHit, pressed && styles.pressed]}
                >
                  <Text style={styles.floatLink}>{label}</Text>
                </Pressable>
              ))}
            </View>
            <NavActions compact onLogin={goLogin} onStart={goStart} />
          </View>
        </Animated.View>
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  bar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    width: '100%',
    paddingHorizontal: 16,
    paddingBottom: 8,
    zIndex: 40,
  },
  innerOnDark: {
    maxWidth: LANDING.maxWidth,
    width: '100%',
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
    paddingHorizontal: 6,
    paddingVertical: 8,
  },
  floatWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 60,
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  floatPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: LANDING.border,
    backgroundColor: '#FFFFFF',
    maxWidth: '100%',
  },
  floatPillWeb: {
    ...(Platform.OS === 'web'
      ? ({
          backdropFilter: 'blur(14px)',
          WebkitBackdropFilter: 'blur(14px)',
          boxShadow: '0 12px 40px rgba(42, 31, 36, 0.14)',
        } as object)
      : null),
  },
  floatPillNative: {
    shadowColor: '#2A1F24',
    shadowOpacity: 0.14,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  floatLinks: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  floatLinkHit: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
  },
  floatLink: {
    ...landingFonts.regular,
    fontSize: 13,
    color: LANDING.textMuted,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  actionsCompact: {
    gap: 8,
  },
  links: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 22,
  },
  linkOnDark: {
    ...landingFonts.regular,
    fontSize: 14,
    color: 'rgba(255, 249, 245, 0.78)',
  },
  login: {
    ...landingFonts.medium,
    fontSize: 14,
    color: LANDING.text,
  },
  loginOnDark: {
    color: 'rgba(255, 249, 245, 0.82)',
  },
  pressed: { opacity: 0.84 },
});
