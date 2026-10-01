/**
 * Landing marketing — hero marque + page scrollable moderne.
 * Suit automatiquement le thème système (clair / sombre).
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
import { fontFamilies, shadows } from '@/constants/theme';
import { getTemplate } from '@/features/templates/registry';
import { LandingAtmosphere } from './LandingAtmosphere';
import { MarketingNav } from './components/MarketingNav';
import { MarketingTemplatePreview } from './components/MarketingTemplatePreview';
import {
  FeaturesSection,
  FinalCtaSection,
  GuestTeaserSection,
  HowItWorksSection,
  MarketingFooter,
  TemplatesShowcase,
} from './components/MarketingSections';
import { LANDING, useLandingTokens } from './landingTokens';

type Anchor = 'features' | 'modeles' | 'parcours';

export function LandingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { mode } = useAppTheme();
  const L = useLandingTokens();
  const { height: windowH } = useWindowDimensions();
  const { isTablet, isDesktop } = useBreakpoint();
  const scrollRef = useRef<ScrollView>(null);
  const [anchors, setAnchors] = useState<Record<Anchor, number>>({
    parcours: 0,
    features: 0,
    modeles: 0,
  });

  const titleSize = isDesktop ? 52 : isTablet ? 40 : 32;
  const heroMin = Math.max(640, windowH - 8);
  const previewTemplate = getTemplate('aurore');
  const logoVariant = mode === 'dark' ? 'light' : 'ink';

  const fade = useRef(new Animated.Value(0)).current;
  const rise = useRef(new Animated.Value(22)).current;
  const visualRise = useRef(new Animated.Value(36)).current;

  useEffect(() => {
    void import('@/features/onboarding/onboardingHeroes')
      .then((m) => m.prefetchOnboardingHeroes())
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    Animated.stagger(140, [
      Animated.parallel([
        Animated.timing(fade, {
          toValue: 1,
          duration: 780,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(rise, {
          toValue: 0,
          duration: 780,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(visualRise, {
        toValue: 0,
        duration: 820,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [fade, rise, visualRise]);

  const jump = (anchor: Anchor) => {
    const y = anchors[anchor];
    if (y > 0) {
      scrollRef.current?.scrollTo({ y: Math.max(0, y - 12), animated: true });
    }
  };

  return (
    <View style={[styles.root, { backgroundColor: L.ink }]}>
      <StatusBar style={mode === 'dark' ? 'light' : 'dark'} translucent />
      <LandingAtmosphere />

      <MarketingNav onJump={jump} />

      <ScrollView
        ref={scrollRef}
        style={styles.scroll}
        contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero — une composition, marque dominante */}
        <View style={[styles.hero, { minHeight: heroMin - insets.top - 56 }]}>
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
                  { fontSize: titleSize, lineHeight: titleSize + 10, color: L.cream },
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
                Créez, personnalisez et publiez. RSVP, pass QR et check-in inclus —
                pour mariages, anniversaires et événements pro.
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
                    shadows.sm,
                  ]}
                >
                  <Text style={styles.ctaLabel}>Commencer</Text>
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => jump('modeles')}
                  style={({ pressed }) => [
                    styles.secondary,
                    { borderColor: L.border, backgroundColor: L.surface },
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
              <MarketingTemplatePreview
                template={previewTemplate}
                width={isDesktop ? 280 : isTablet ? 250 : 230}
                showLabel={false}
              />
              <Text style={[styles.heroVisualCaption, { color: L.creamFaint }]}>
                Aurore — aperçu réel du modèle
              </Text>
            </Animated.View>
          </View>
        </View>

        <View style={[styles.proof, { borderColor: L.border }]}>
          <Text style={[styles.proofItem, { color: L.creamMuted }]}>Mariages</Text>
          <Text style={[styles.proofDot, { color: L.creamFaint }]}>·</Text>
          <Text style={[styles.proofItem, { color: L.creamMuted }]}>Anniversaires</Text>
          <Text style={[styles.proofDot, { color: L.creamFaint }]}>·</Text>
          <Text style={[styles.proofItem, { color: L.creamMuted }]}>Conférences</Text>
        </View>

        <HowItWorksSection
          onLayout={(event) => {
            const y = event.nativeEvent.layout.y;
            setAnchors((prev) => (prev.parcours === y ? prev : { ...prev, parcours: y }));
          }}
        />
        <FeaturesSection
          onLayout={(event) => {
            const y = event.nativeEvent.layout.y;
            setAnchors((prev) => (prev.features === y ? prev : { ...prev, features: y }));
          }}
        />
        <TemplatesShowcase
          onLayout={(event) => {
            const y = event.nativeEvent.layout.y;
            setAnchors((prev) => (prev.modeles === y ? prev : { ...prev, modeles: y }));
          }}
        />
        <GuestTeaserSection />
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
    paddingBottom: 28,
  },
  heroInner: {
    maxWidth: LANDING.maxWidth,
    width: '100%',
    alignSelf: 'center',
    alignItems: 'center',
    gap: 36,
  },
  heroInnerDesktop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 48,
  },
  heroCopy: {
    alignItems: 'center',
    gap: 16,
    width: '100%',
    maxWidth: 480,
  },
  heroCopyDesktop: {
    alignItems: 'flex-start',
    flex: 1,
  },
  title: {
    fontFamily: fontFamilies.serifSemiBold,
    textAlign: 'center',
    letterSpacing: -0.6,
    marginTop: 4,
  },
  titleDesktop: {
    textAlign: 'left',
  },
  titleAccent: {
    fontFamily: fontFamilies.serifItalic,
  },
  subtitle: {
    fontFamily: fontFamilies.sans,
    fontSize: 15,
    lineHeight: 23,
    textAlign: 'center',
    maxWidth: 420,
  },
  subtitleDesktop: {
    textAlign: 'left',
  },
  heroActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 8,
    justifyContent: 'center',
  },
  heroActionsDesktop: {
    justifyContent: 'flex-start',
  },
  cta: {
    minWidth: 168,
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
    gap: 12,
  },
  heroVisualCaption: {
    fontFamily: fontFamilies.sans,
    fontSize: 12,
  },
  proof: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  proofItem: {
    fontFamily: fontFamilies.sansMedium,
    fontSize: 13,
    letterSpacing: 0.4,
  },
  proofDot: {
    fontSize: 13,
  },
  pressed: { opacity: 0.84 },
});
