/**
 * Nav marketing — glass claire façon Edulex, identité MK.
 */

import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Logo } from '@/components/ui/Logo';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { landingFonts } from '../landingFonts';
import { LANDING } from '../landingTokens';

type LandingAnchor = 'platform' | 'journey' | 'models' | 'faq';

export function MarketingNav({
  onJump,
}: {
  onJump: (anchor: LandingAnchor) => void;
}) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isDesktop } = useBreakpoint();

  return (
    <View style={[styles.bar, { paddingTop: Math.max(insets.top, 12) }]}>
      <View
        style={[
          styles.inner,
          Platform.OS === 'web' ? styles.glassWeb : styles.glassNative,
        ]}
      >
        <Logo size={isDesktop ? 'md' : 'sm'} variant="ink" />

        {isDesktop ? (
          <View style={styles.links}>
            {[
              ['platform', 'Plateforme'],
              ['journey', 'Parcours'],
              ['models', 'Modèles'],
              ['faq', 'FAQ'],
            ].map(([anchor, label]) => (
              <Pressable
                key={anchor}
                onPress={() => onJump(anchor as LandingAnchor)}
                hitSlop={8}
                style={({ pressed }) => pressed && styles.pressed}
              >
                <Text style={styles.link}>{label}</Text>
              </Pressable>
            ))}
          </View>
        ) : null}

        <View style={styles.actions}>
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push('/login')}
            hitSlop={8}
            style={({ pressed }) => pressed && styles.pressed}
          >
            <Text style={styles.login}>Connexion</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Commencer"
            onPress={() => router.push('/onboarding')}
            style={({ pressed }) => [styles.cta, pressed && styles.pressed]}
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
    paddingHorizontal: 16,
    paddingBottom: 8,
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
    borderRadius: 18,
    borderWidth: 1,
    borderColor: LANDING.border,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: LANDING.surfaceGlass,
  },
  glassWeb: {
    ...(Platform.OS === 'web'
      ? ({
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          boxShadow: `0 8px 32px ${LANDING.shadow}`,
        } as object)
      : null),
  },
  glassNative: {
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    shadowColor: '#2A1F24',
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  links: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 22,
  },
  link: {
    ...landingFonts.medium,
    fontSize: 14,
    color: LANDING.textMuted,
  },
  login: {
    ...landingFonts.medium,
    fontSize: 14,
    color: LANDING.text,
  },
  cta: {
    minHeight: 40,
    paddingHorizontal: 16,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: LANDING.coral,
    shadowColor: LANDING.coral,
    shadowOpacity: 0.35,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  ctaLabel: {
    ...landingFonts.semibold,
    fontSize: 13,
    color: '#FFFFFF',
  },
  pressed: { opacity: 0.84 },
});
