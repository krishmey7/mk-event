/**
 * Landing — claire : marque, promesse, produit, parcours, modèles.
 * Pas de preuve sociale.
 */

import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Logo } from '@/components/ui/Logo';
import { useAppTheme } from '@/context/ThemePreferenceContext';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { fontFamilies } from '@/constants/theme';
import { getTemplate } from '@/features/templates/registry';
import { LandingAtmosphere } from './LandingAtmosphere';
import { MarketingNav } from './components/MarketingNav';
import { MarketingTemplatePreview } from './components/MarketingTemplatePreview';
import {
  FinalCtaSection,
  HowItWorksSection,
  MarketingFooter,
  TemplatesShowcase,
} from './components/MarketingSections';
import { LANDING, useLandingTokens } from './landingTokens';

export function LandingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { mode } = useAppTheme();
  const L = useLandingTokens();
  const { height: windowH } = useWindowDimensions();
  const { isTablet, isDesktop } = useBreakpoint();
  const scrollRef = useRef<ScrollView>(null);
  const [modelsY, setModelsY] = useState(0);

  const titleSize = isDesktop ? 48 : isTablet ? 38 : 32;
  const heroMin = Math.max(620, windowH - 8);
  const previewTemplate = getTemplate('aurore');
  const logoVariant = mode === 'dark' ? 'light' : 'ink';
  const previewW = isDesktop ? 300 : isTablet ? 260 : 236;

  const fade = useRef(new Animated.Value(0)).current;
  const rise = useRef(new Animated.Value(18)).current;
  const visualRise = useRef(new Animated.Value(28)).current;

  useEffect(() => {
    void import('@/features/onboarding/onboardingHeroes')
      .then((m) => m.prefetchOnboardingHeroes())
      .catch(() => undefined);
  }, []);

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
      Animated.timing(visualRise, {
        toValue: 0,
        duration: 760,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [fade, rise, visualRise]);

  const jumpModels = () => {
    if (modelsY > 0) {
      scrollRef.current?.scrollTo({ y: Math.max(0, modelsY - 12), animated: true });
    }
  };

  return (
    <View style={[styles.root, { backgroundColor: L.ink }]}>
      <StatusBar style={mode === 'dark' ? 'light' : 'dark'} translucent />
      <LandingAtmosphere />

      <MarketingNav onJumpModels={jumpModels} />

      <ScrollView
        ref={scrollRef}
        style={styles.scroll}
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.hero, { minHeight: heroMin - insets.top - 52 }]}>
          <View style={[styles.heroInner, isDesktop && styles.heroInnerDesktop]}>
            <Animated.View
              style={[
                styles.heroCopy,
                isDesktop && styles.heroCopyDesktop,
                { opacity: fade, transform: [{ translateY: rise }] },
              ]}
            >
              <Logo size="xl" variant={logoVariant} />
              <Text
                style={[
                  styles.title,
                  { fontSize: titleSize, lineHeight: titleSize + 8, color: L.cream },
                  isDesktop && styles.titleDesktop,
                ]}
              >
                Des invitations{'\n'}
                <Text style={[styles.titleAccent, { color: L.coral }]}>numériques vivantes</Text>
              </Text>
              <Text
                style={[
                  styles.subtitle,
                  { color: L.creamMuted },
                  isDesktop && styles.subtitleDesktop,
                ]}
              >
                Créez, publiez, suivez les réponses — RSVP et pass QR inclus.
              </Text>
              <View style={[styles.heroActions, isDesktop && styles.heroActionsDesktop]}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Commencer"
                  onPress={() => router.push('/onboarding')}
                  style={({ pressed }) => [
                    styles.cta,
                    { backgroundColor: L.coral },
                    pressed && styles.pressed,
                  ]}
                >
                  <Text style={styles.ctaLabel}>Commencer</Text>
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  onPress={jumpModels}
                  style={({ pressed }) => [
                    styles.secondary,
                    { borderColor: L.border },
                    pressed && styles.pressed,
                  ]}
                >
                  <Text style={[styles.secondaryLabel, { color: L.cream }]}>Voir les modèles</Text>
                </Pressable>
              </View>
            </Animated.View>

            <Animated.View
              style={[
                styles.heroVisual,
                { opacity: fade, transform: [{ translateY: visualRise }] },
              ]}
            >
              <View
                style={[
                  styles.previewGlow,
                  {
                    backgroundColor: mode === 'dark' ? 'rgba(224, 122, 95, 0.18)' : 'rgba(224, 122, 95, 0.14)',
                  },
                ]}
              />
              <MarketingTemplatePreview
                template={previewTemplate}
                width={previewW}
                showLabel={false}
              />
            </Animated.View>
          </View>
        </View>

        <HowItWorksSection />
        <TemplatesShowcase
          onLayout={(event) => {
            const y = event.nativeEvent.layout.y;
            setModelsY((prev) => (prev === y ? prev : y));
          }}
        />
        <FinalCtaSection />
        <MarketingFooter />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    height: '100%',
    width: '100%',
  },
  scroll: {
    flex: 1,
  },
  hero: {
    width: '100%',
    paddingHorizontal: 20,
    justifyContent: 'center',
    paddingBottom: 40,
  },
  heroInner: {
    maxWidth: LANDING.maxWidth,
    width: '100%',
    alignSelf: 'center',
    alignItems: 'center',
    gap: 40,
  },
  heroInnerDesktop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 56,
  },
  heroCopy: {
    alignItems: 'center',
    gap: 14,
    width: '100%',
    maxWidth: 460,
  },
  heroCopyDesktop: {
    alignItems: 'flex-start',
    flex: 1,
  },
  title: {
    fontFamily: fontFamilies.serifSemiBold,
    textAlign: 'center',
    letterSpacing: -0.5,
    marginTop: 2,
  },
  titleDesktop: {
    textAlign: 'left',
  },
  titleAccent: {
    fontFamily: fontFamilies.serifItalic,
  },
  subtitle: {
    fontFamily: fontFamilies.sans,
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    maxWidth: 380,
  },
  subtitleDesktop: {
    textAlign: 'left',
  },
  heroActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 10,
    justifyContent: 'center',
  },
  heroActionsDesktop: {
    justifyContent: 'flex-start',
  },
  cta: {
    minWidth: 160,
    minHeight: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 22,
  },
  ctaLabel: {
    fontFamily: fontFamilies.sansSemiBold,
    fontSize: 15,
    color: '#FFFFFF',
  },
  secondary: {
    minHeight: 52,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
  },
  secondaryLabel: {
    fontFamily: fontFamilies.sansMedium,
    fontSize: 14,
  },
  heroVisual: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewGlow: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 140,
    opacity: 0.9,
  },
  pressed: { opacity: 0.84 },
});
