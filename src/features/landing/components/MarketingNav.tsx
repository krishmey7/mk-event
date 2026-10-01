/**
 * Nav marketing — logo, ancres, connexion, CTA.
 */

import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Logo } from '@/components/ui/Logo';
import { useAppTheme } from '@/context/ThemePreferenceContext';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { fontFamilies, shadows } from '@/constants/theme';
import { LANDING, useLandingTokens } from '../landingTokens';

export function MarketingNav({
  onJump,
}: {
  onJump: (anchor: 'features' | 'modeles' | 'parcours') => void;
}) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isDesktop } = useBreakpoint();
  const { mode } = useAppTheme();
  const L = useLandingTokens();
  const logoVariant = mode === 'dark' ? 'light' : 'ink';

  return (
    <View style={[styles.bar, { paddingTop: Math.max(insets.top, 12) }]}>
      <View style={styles.inner}>
        <Logo size={isDesktop ? 'md' : 'sm'} variant={logoVariant} />

        {isDesktop ? (
          <View style={styles.links}>
            <Pressable onPress={() => onJump('parcours')} hitSlop={8} style={({ pressed }) => pressed && styles.pressed}>
              <Text style={[styles.link, { color: L.creamMuted }]}>Parcours</Text>
            </Pressable>
            <Pressable onPress={() => onJump('features')} hitSlop={8} style={({ pressed }) => pressed && styles.pressed}>
              <Text style={[styles.link, { color: L.creamMuted }]}>Fonctionnalités</Text>
            </Pressable>
            <Pressable onPress={() => onJump('modeles')} hitSlop={8} style={({ pressed }) => pressed && styles.pressed}>
              <Text style={[styles.link, { color: L.creamMuted }]}>Modèles</Text>
            </Pressable>
          </View>
        ) : null}

        <View style={styles.actions}>
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push('/login')}
            hitSlop={8}
            style={({ pressed }) => [pressed && styles.pressed]}
          >
            <Text style={[styles.login, { color: L.cream }]}>Connexion</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Commencer"
            onPress={() => router.push('/onboarding')}
            style={({ pressed }) => [
              styles.cta,
              { backgroundColor: L.coral },
              pressed && styles.pressed,
              shadows.sm,
            ]}
          >
            <Text style={styles.ctaLabel}>Commencer</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    width: '100%',
    paddingHorizontal: 20,
    paddingBottom: 10,
    zIndex: 10,
  },
  inner: {
    maxWidth: LANDING.maxWidth,
    width: '100%',
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
  },
  links: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 28,
    flex: 1,
    justifyContent: 'center',
  },
  link: {
    fontFamily: fontFamilies.sansMedium,
    fontSize: 14,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  login: {
    fontFamily: fontFamilies.sansMedium,
    fontSize: 14,
  },
  cta: {
    minHeight: 40,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaLabel: {
    fontFamily: fontFamilies.sansSemiBold,
    fontSize: 13,
    color: '#FFFFFF',
  },
  pressed: { opacity: 0.82 },
});
