/**
 * Landing — une composition : marque, invitation produit, CTA.
 */

import { useEffect, useRef } from 'react';
import {
  Animated,
  Easing,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Logo } from '@/components/ui/Logo';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { fontFamilies, shadows, spacing } from '@/constants/theme';
import { LandingAtmosphere } from './LandingAtmosphere';

const ACCENT = '#5BA89F';
const ACCENT_DEEP = '#2F6F69';
const INK = '#0F1419';
const PAPER = '#F7F9FA';

export function LandingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isTablet, isDesktop } = useBreakpoint();
  const titleSize = isDesktop ? 42 : isTablet ? 36 : 28;

  const fade = useRef(new Animated.Value(0)).current;
  const rise = useRef(new Animated.Value(18)).current;
  const cardRise = useRef(new Animated.Value(28)).current;

  useEffect(() => {
    Animated.stagger(120, [
      Animated.parallel([
        Animated.timing(fade, {
          toValue: 1,
          duration: 700,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(rise, {
          toValue: 0,
          duration: 700,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(cardRise, {
        toValue: 0,
        duration: 750,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [fade, rise, cardRise]);

  return (
    <View style={[styles.screen, { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 20 }]}>
      <StatusBar style="light" />
      <LandingAtmosphere />

      <Animated.View style={[styles.top, { opacity: fade, transform: [{ translateY: rise }] }]}>
        <Logo size="xl" variant="light" />
        <Text style={[styles.title, { fontSize: titleSize, lineHeight: titleSize + 8 }]}>
          Des invitations{'\n'}
          <Text style={styles.titleAccent}>numériques vivantes</Text>
        </Text>
        <Text style={styles.subtitle}>
          Créez, personnalisez, publiez — RSVP et check-in inclus.
        </Text>
      </Animated.View>

      <Animated.View
        style={[
          styles.cardWrap,
          { opacity: fade, transform: [{ translateY: cardRise }] },
        ]}
      >
        <InvitePreview />
      </Animated.View>

      <Animated.View style={[styles.actions, { opacity: fade }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Commencer"
          onPress={() => router.push('/onboarding')}
          style={({ pressed }) => [styles.cta, pressed && styles.pressed]}
        >
          <Text style={styles.ctaLabel}>Commencer</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          onPress={() => router.push('/login')}
          hitSlop={10}
          style={({ pressed }) => [pressed && styles.pressed]}
        >
          <Text style={styles.link}>J’ai déjà un compte</Text>
        </Pressable>
      </Animated.View>
    </View>
  );
}

function InvitePreview() {
  return (
    <View style={styles.stage}>
      <View style={[styles.shadowCard, styles.shadowLeft]} />
      <View style={[styles.shadowCard, styles.shadowRight]} />

      <View style={styles.invite}>
        <View style={styles.inviteAccent} />
        <Text style={styles.inviteKicker}>SAVE THE DATE</Text>
        <Text style={styles.inviteNames}>Léa & Thomas</Text>
        <View style={styles.inviteRule} />
        <Text style={styles.inviteDate}>14 juin 2025</Text>
        <Text style={styles.invitePlace}>Château de Bellevue</Text>
        <View style={styles.inviteChip}>
          <Text style={styles.inviteChipText}>RSVP ouvert</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: INK,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    overflow: 'hidden',
  },
  top: {
    alignItems: 'center',
    gap: 16,
    width: '100%',
    maxWidth: 440,
    paddingTop: 8,
  },
  title: {
    fontFamily: fontFamilies.serifSemiBold,
    textAlign: 'center',
    color: '#F2F4F7',
    letterSpacing: -0.5,
    marginTop: 8,
  },
  titleAccent: {
    fontFamily: fontFamilies.serifItalic,
    color: ACCENT,
  },
  subtitle: {
    fontFamily: fontFamilies.sans,
    fontSize: 14.5,
    lineHeight: 21,
    textAlign: 'center',
    color: 'rgba(242, 244, 247, 0.58)',
    maxWidth: 320,
  },
  cardWrap: {
    flex: 1,
    width: '100%',
    maxWidth: 360,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 220,
  },
  stage: {
    width: 260,
    height: 300,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shadowCard: {
    position: 'absolute',
    width: 200,
    height: 260,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  shadowLeft: {
    transform: [{ rotate: '-8deg' }, { translateX: -28 }],
  },
  shadowRight: {
    transform: [{ rotate: '8deg' }, { translateX: 28 }],
    backgroundColor: 'rgba(91, 168, 159, 0.12)',
  },
  invite: {
    width: 210,
    height: 280,
    borderRadius: 22,
    backgroundColor: PAPER,
    alignItems: 'center',
    paddingTop: 22,
    paddingHorizontal: 18,
    ...shadows.lg,
  },
  inviteAccent: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: ACCENT_DEEP,
    marginBottom: 18,
  },
  inviteKicker: {
    fontFamily: fontFamilies.sansMedium,
    fontSize: 9,
    letterSpacing: 3.2,
    color: ACCENT_DEEP,
    marginBottom: 10,
  },
  inviteNames: {
    fontFamily: fontFamilies.serifSemiBold,
    fontSize: 26,
    lineHeight: 32,
    color: INK,
    textAlign: 'center',
  },
  inviteRule: {
    width: 40,
    height: 1.5,
    backgroundColor: ACCENT,
    marginVertical: 14,
  },
  inviteDate: {
    fontFamily: fontFamilies.sansSemiBold,
    fontSize: 13,
    color: INK,
    marginBottom: 4,
  },
  invitePlace: {
    fontFamily: fontFamilies.sans,
    fontSize: 12,
    color: '#5A6270',
    textAlign: 'center',
  },
  inviteChip: {
    marginTop: 'auto',
    marginBottom: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(47, 111, 105, 0.12)',
  },
  inviteChipText: {
    fontFamily: fontFamilies.sansMedium,
    fontSize: 11,
    color: ACCENT_DEEP,
  },
  actions: {
    alignItems: 'center',
    gap: 14,
    width: '100%',
    paddingBottom: 4,
  },
  cta: {
    minWidth: 240,
    minHeight: 54,
    borderRadius: 14,
    backgroundColor: ACCENT,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
    ...shadows.sm,
  },
  ctaLabel: {
    fontFamily: fontFamilies.sansSemiBold,
    fontSize: 16,
    color: INK,
  },
  link: {
    fontFamily: fontFamilies.sansMedium,
    fontSize: 14,
    color: 'rgba(242, 244, 247, 0.72)',
  },
  pressed: { opacity: 0.82 },
});
