/**
 * Landing clair — design Edulex adapté à MK (orbes, glass, mockup, cartes soft).
 * Toujours en mode clair. Pas de preuve sociale.
 */

import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  useWindowDimensions,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Logo } from '@/components/ui/Logo';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { fontFamilies } from '@/constants/theme';
import { getTemplate } from '@/features/templates/registry';
import { LandingAtmosphere } from './LandingAtmosphere';
import { MarketingNav } from './components/MarketingNav';
import { MarketingTemplatePreview } from './components/MarketingTemplatePreview';
import {
  FinalCtaSection,
  AudienceSection,
  CapabilitiesSection,
  FaqSection,
  HowItWorksSection,
  MarketingFooter,
  PlatformSection,
  TemplatesShowcase,
} from './components/MarketingSections';
import {
  LandingScrollProgress,
  type LandingSectionId,
} from './components/LandingScrollProgress';
import {
  SCROLL_STORY_STEP_COUNT,
  ScrollStorySection,
} from './components/ScrollStorySection';
import { LANDING } from './landingTokens';

export function LandingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { height: windowH } = useWindowDimensions();
  const { isTablet, isDesktop } = useBreakpoint();
  const scrollRef = useRef<ScrollView>(null);
  const [anchors, setAnchors] = useState({
    platform: 0,
    journey: 0,
    models: 0,
    faq: 0,
  });
  const [storyY, setStoryY] = useState(0);
  const [storyHeight, setStoryHeight] = useState(1);
  const [storyStep, setStoryStep] = useState(0);
  const [maxScroll, setMaxScroll] = useState(1);
  const [scrollPosition, setScrollPosition] = useState(0);

  const titleSize = isDesktop ? 52 : isTablet ? 40 : 34;
  const heroMin = Math.max(640, windowH - 8);
  const previewTemplate = getTemplate('aurore');
  const previewW = isDesktop ? 310 : isTablet ? 268 : 242;

  const fade = useRef(new Animated.Value(0)).current;
  const rise = useRef(new Animated.Value(18)).current;
  const visualRise = useRef(new Animated.Value(28)).current;
  const scrollY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    void import('@/features/onboarding/onboardingHeroes')
      .then((m) => m.prefetchOnboardingHeroes())
      .catch(() => undefined);
  }, []);

  /** Forcer le chrome web en clair tant que le landing est monté. */
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof document === 'undefined') return;
    const root = document.documentElement;
    const prevBg = root.style.getPropertyValue('--mk-bg');
    const prevHtml = root.style.backgroundColor;
    const prevBody = document.body.style.backgroundColor;
    root.style.setProperty('--mk-bg', LANDING.bg);
    root.style.backgroundColor = LANDING.bg;
    document.body.style.backgroundColor = LANDING.bg;
    const rootEl = document.getElementById('root');
    if (rootEl) rootEl.style.backgroundColor = LANDING.bg;
    document.querySelectorAll('meta[name="theme-color"]').forEach((meta) => {
      meta.setAttribute('content', LANDING.bg);
    });
    return () => {
      root.style.setProperty('--mk-bg', prevBg || '');
      root.style.backgroundColor = prevHtml;
      document.body.style.backgroundColor = prevBody;
    };
  }, []);

  useEffect(() => {
    Animated.stagger(120, [
      Animated.parallel([
        Animated.timing(fade, {
          toValue: 1,
          duration: 720,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(rise, {
          toValue: 0,
          duration: 720,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(visualRise, {
        toValue: 0,
        duration: 780,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [fade, rise, visualRise]);

  const jump = (anchor: keyof typeof anchors) => {
    const y = anchors[anchor];
    if (y > 0) {
      scrollRef.current?.scrollTo({ y: Math.max(0, y - 12), animated: true });
    }
  };

  const activeSection: LandingSectionId =
    scrollPosition >= anchors.models - windowH * 0.34 && anchors.models > 0
      ? 'modeles'
      : scrollPosition >= anchors.journey - windowH * 0.34 && anchors.journey > 0
        ? 'parcours'
        : scrollPosition >= anchors.platform - windowH * 0.34 && anchors.platform > 0
          ? 'experience'
          : 'hero';

  const selectSection = (section: LandingSectionId) => {
    if (section === 'hero') {
      scrollRef.current?.scrollTo({ y: 0, animated: true });
      return;
    }
    if (section === 'experience') jump('platform');
    if (section === 'parcours') jump('journey');
    if (section === 'modeles') jump('models');
  };

  return (
    <View style={styles.root}>
      <StatusBar style="dark" translucent />
      <LandingAtmosphere tone="light" />

      <MarketingNav onJump={jump} />
      <LandingScrollProgress
        active={activeSection}
        progress={scrollPosition / Math.max(1, maxScroll)}
        onSelect={selectSection}
      />

      <Animated.ScrollView
        ref={scrollRef}
        style={styles.scroll}
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onContentSizeChange={(_, contentHeight) => {
          setMaxScroll(Math.max(1, contentHeight - windowH));
        }}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          {
            useNativeDriver: false,
            listener: (event: NativeSyntheticEvent<NativeScrollEvent>) => {
              const y = event.nativeEvent.contentOffset.y;
              setScrollPosition(y);
              if (storyY <= 0 || storyHeight <= 1) return;
              const storyContentTop = storyY + 230;
              const usableHeight = Math.max(1, storyHeight - 300);
              const local = y + windowH * 0.42 - storyContentTop;
              const next = Math.max(
                0,
                Math.min(
                  SCROLL_STORY_STEP_COUNT - 1,
                  Math.floor((local / usableHeight) * SCROLL_STORY_STEP_COUNT),
                ),
              );
              setStoryStep((current) => (current === next ? current : next));
            },
          },
        )}
      >
        <View style={[styles.hero, { minHeight: heroMin - insets.top - 64 }]}>
          <View style={[styles.heroInner, isDesktop && styles.heroInnerDesktop]}>
            <Animated.View
              style={[
                styles.heroCopy,
                isDesktop && styles.heroCopyDesktop,
                { opacity: fade, transform: [{ translateY: rise }] },
              ]}
            >
              <Logo size="xl" variant="ink" />
              <Text
                style={[
                  styles.title,
                  { fontSize: titleSize, lineHeight: titleSize + 8 },
                  isDesktop && styles.titleDesktop,
                ]}
              >
                Des invitations{'\n'}
                <Text style={styles.titleAccent}>numériques vivantes</Text>
              </Text>
              <Text style={[styles.subtitle, isDesktop && styles.subtitleDesktop]}>
                Créez, publiez, suivez les réponses — RSVP et pass QR inclus.
              </Text>
              <View style={[styles.heroActions, isDesktop && styles.heroActionsDesktop]}>
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
                  onPress={() => jump('models')}
                  style={({ pressed }) => [styles.secondary, pressed && styles.pressed]}
                >
                  <Text style={styles.secondaryLabel}>Voir les modèles</Text>
                </Pressable>
              </View>
            </Animated.View>

            <Animated.View
              style={[
                styles.heroVisual,
                { opacity: fade, transform: [{ translateY: visualRise }] },
              ]}
            >
              <View style={styles.previewOrbCoral} />
              <View style={styles.previewOrbPlum} />
              <MarketingTemplatePreview
                template={previewTemplate}
                width={previewW}
                showLabel={false}
              />
            </Animated.View>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Découvrir la plateforme"
            onPress={() => jump('platform')}
            style={({ pressed }) => [styles.scrollCue, pressed && styles.pressed]}
          >
            <Text style={styles.scrollCueLabel}>Découvrir</Text>
            <View style={styles.scrollCueLine}>
              <View style={styles.scrollCueFill} />
            </View>
            <Ionicons name="chevron-down" size={14} color={LANDING.coral} />
          </Pressable>
        </View>

        <PlatformSection
          onLayout={(event) => {
            const y = event.nativeEvent.layout.y;
            setAnchors((current) =>
              current.platform === y ? current : { ...current, platform: y },
            );
          }}
        />
        <ScrollStorySection
          activeStep={storyStep}
          onLayout={(event) => {
            const { y, height } = event.nativeEvent.layout;
            setStoryY((current) => (current === y ? current : y));
            setStoryHeight((current) => (current === height ? current : height));
            setAnchors((current) =>
              current.journey === y ? current : { ...current, journey: y },
            );
          }}
        />
        <HowItWorksSection />
        <CapabilitiesSection />
        <TemplatesShowcase
          onLayout={(event) => {
            const y = event.nativeEvent.layout.y;
            setAnchors((current) =>
              current.models === y ? current : { ...current, models: y },
            );
          }}
        />
        <AudienceSection />
        <FaqSection
          onLayout={(event) => {
            const y = event.nativeEvent.layout.y;
            setAnchors((current) => (current.faq === y ? current : { ...current, faq: y }));
          }}
        />
        <FinalCtaSection />
        <MarketingFooter />
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    height: '100%',
    width: '100%',
    backgroundColor: LANDING.bg,
  },
  scroll: {
    flex: 1,
  },
  hero: {
    width: '100%',
    paddingHorizontal: 20,
    justifyContent: 'center',
    paddingBottom: 48,
    paddingTop: 12,
    position: 'relative',
  },
  heroInner: {
    maxWidth: LANDING.maxWidth,
    width: '100%',
    alignSelf: 'center',
    alignItems: 'center',
    gap: 44,
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
    color: LANDING.text,
    marginTop: 4,
  },
  titleDesktop: {
    textAlign: 'left',
  },
  titleAccent: {
    fontFamily: fontFamilies.serifItalic,
    color: LANDING.coral,
  },
  subtitle: {
    fontFamily: fontFamilies.sans,
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    maxWidth: 380,
    color: LANDING.textMuted,
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
    minWidth: 168,
    minHeight: 52,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    backgroundColor: LANDING.coral,
    shadowColor: LANDING.coral,
    shadowOpacity: 0.35,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  ctaLabel: {
    fontFamily: fontFamilies.sansSemiBold,
    fontSize: 15,
    color: '#FFFFFF',
  },
  secondary: {
    minHeight: 52,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: LANDING.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    backgroundColor: LANDING.surfaceGlass,
  },
  secondaryLabel: {
    fontFamily: fontFamilies.sansMedium,
    fontSize: 14,
    color: LANDING.text,
  },
  heroVisual: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewOrbCoral: {
    position: 'absolute',
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: 'rgba(224, 122, 95, 0.22)',
    top: '18%',
  },
  previewOrbPlum: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(107, 58, 92, 0.12)',
    bottom: '8%',
    right: -20,
  },
  scrollCue: {
    position: 'absolute',
    bottom: 12,
    alignSelf: 'center',
    alignItems: 'center',
    gap: 5,
  },
  scrollCueLabel: {
    fontFamily: fontFamilies.sansSemiBold,
    fontSize: 9,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    color: LANDING.textFaint,
  },
  scrollCueLine: {
    width: 2,
    height: 24,
    borderRadius: 2,
    overflow: 'hidden',
    backgroundColor: LANDING.borderStrong,
  },
  scrollCueFill: {
    width: '100%',
    height: '55%',
    borderRadius: 2,
    backgroundColor: LANDING.coral,
  },
  pressed: { opacity: 0.86 },
});
