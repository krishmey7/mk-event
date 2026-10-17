/**
 * Landing MK — hero sombre façon Edulex (2 colonnes + marquee), reste clair.
 */

import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  useWindowDimensions,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useBreakpoint } from '@/hooks/useBreakpoint';
import { LandingAtmosphere } from './LandingAtmosphere';
import { MarketingNav } from './components/MarketingNav';
import { HeroMarquee } from './components/HeroMarquee';
import { LandingCta } from './components/LandingCta';
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
import { LandingScrollProvider } from './components/LandingReveal';
import { LANDING } from './landingTokens';
import { ensureLandingFontsLoaded, landingFonts } from './landingFonts';

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
  const [storyStep, setStoryStep] = useState(0);
  const [storyProgress, setStoryProgress] = useState(0);
  const storyYRef = useRef(0);
  const storyHeightRef = useRef(1);
  const windowHRef = useRef(windowH);
  const scrollOffsetRef = useRef(0);
  windowHRef.current = windowH;
  const [maxScroll, setMaxScroll] = useState(1);
  const [scrollPosition, setScrollPosition] = useState(0);

  const titleSize = isDesktop ? 64 : isTablet ? 46 : 36;
  const heroMin = Math.max(windowH, 640);

  const fade = useRef(new Animated.Value(0)).current;
  const rise = useRef(new Animated.Value(20)).current;
  const visualFade = useRef(new Animated.Value(0)).current;
  const visualRise = useRef(new Animated.Value(20)).current;
  const cueFade = useRef(new Animated.Value(0)).current;
  const cueRise = useRef(new Animated.Value(20)).current;
  const scrollY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    void import('@/features/onboarding/onboardingHeroes')
      .then((m) => m.prefetchOnboardingHeroes())
      .catch(() => undefined);
  }, []);

  useEffect(() => ensureLandingFontsLoaded(), []);

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
      meta.setAttribute('content', '#1A0F16');
    });
    return () => {
      root.style.setProperty('--mk-bg', prevBg || '');
      root.style.backgroundColor = prevHtml;
      document.body.style.backgroundColor = prevBody;
    };
  }, []);

  useEffect(() => {
    const ease = Easing.out(Easing.cubic);
    Animated.parallel([
      Animated.timing(fade, {
        toValue: 1,
        duration: 600,
        easing: ease,
        useNativeDriver: true,
      }),
      Animated.timing(rise, {
        toValue: 0,
        duration: 600,
        easing: ease,
        useNativeDriver: true,
      }),
      Animated.timing(visualFade, {
        toValue: 1,
        duration: 600,
        delay: 200,
        easing: ease,
        useNativeDriver: true,
      }),
      Animated.timing(visualRise, {
        toValue: 0,
        duration: 600,
        delay: 200,
        easing: ease,
        useNativeDriver: true,
      }),
      Animated.timing(cueFade, {
        toValue: 1,
        duration: 600,
        delay: 400,
        easing: ease,
        useNativeDriver: true,
      }),
      Animated.timing(cueRise, {
        toValue: 0,
        duration: 600,
        delay: 400,
        easing: ease,
        useNativeDriver: true,
      }),
    ]).start();
  }, [cueFade, cueRise, fade, rise, visualFade, visualRise]);

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
      <StatusBar style="light" translucent />
      <LandingAtmosphere tone="light" />

      <MarketingNav onJump={jump} scrolled={scrollPosition > 100} />
      <LandingScrollProgress
        active={activeSection}
        progress={scrollPosition / Math.max(1, maxScroll)}
        onSelect={selectSection}
      />

      <LandingScrollProvider
        scrollY={scrollY}
        viewportH={windowH}
        getOffset={() => scrollOffsetRef.current}
      >
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
                scrollOffsetRef.current = y;
                setScrollPosition(y);
                const sectionY = storyYRef.current;
                const sectionH = storyHeightRef.current;
                const vh = windowHRef.current;
                if (sectionY <= 0 || sectionH <= 1) return;
                const start = sectionY - vh * 0.1;
                const end = sectionY + sectionH - vh * 0.5;
                const span = Math.max(1, end - start);
                const nextProgress = Math.max(0, Math.min(1, (y - start) / span));
                const nextStep = Math.min(
                  SCROLL_STORY_STEP_COUNT - 1,
                  Math.floor(nextProgress * SCROLL_STORY_STEP_COUNT),
                );
                setStoryProgress((current) =>
                  Math.abs(current - nextProgress) < 0.004 ? current : nextProgress,
                );
                setStoryStep((current) => (current === nextStep ? current : nextStep));
              },
            },
          )}
        >
          <View style={[styles.hero, styles.heroLit, { minHeight: heroMin }]}>
            <View
              style={[
                styles.heroBody,
                { paddingTop: Math.max(insets.top, 12) + 88 },
              ]}
            >
              <View
                style={[
                  styles.heroInner,
                  isDesktop && styles.heroInnerDesktop,
                ]}
              >
                <Animated.View
                  style={[
                    styles.heroTitleCol,
                    { opacity: fade, transform: [{ translateY: rise }] },
                  ]}
                >
                  <Text
                    style={[
                      styles.title,
                      {
                        fontSize: titleSize,
                        lineHeight: Math.round(titleSize * 1.08),
                      },
                    ]}
                  >
                    {isDesktop
                      ? 'Des invitations\nnumériques vivantes'
                      : 'Des invitations numériques vivantes'}
                  </Text>
                </Animated.View>

                <Animated.View
                  style={[
                    styles.heroSideCol,
                    { opacity: visualFade, transform: [{ translateY: visualRise }] },
                  ]}
                >
                  <Text style={styles.subtitle}>
                    Créez, publiez et suivez les réponses — RSVP et pass QR inclus, sans fichier à
                    télécharger.
                  </Text>
                  <View style={styles.heroCtaRow}>
                  <LandingCta
                    label="Rejoindre"
                    withArrow
                    onPress={() => router.push('/onboarding')}
                  />
                </View>
                </Animated.View>
              </View>
            </View>

            <Animated.View
              style={[
                styles.heroMarqueeWrap,
                { opacity: cueFade, transform: [{ translateY: cueRise }] },
              ]}
            >
              <HeroMarquee />
            </Animated.View>
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
            progress={storyProgress}
            onLayout={(event) => {
              const { y, height } = event.nativeEvent.layout;
              storyYRef.current = y;
              storyHeightRef.current = Math.max(1, height);
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
      </LandingScrollProvider>
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
    paddingHorizontal: 40,
    paddingBottom: 32,
    position: 'relative',
    overflow: 'hidden',
    justifyContent: 'space-between',
    backgroundColor: '#1A0F16',
  },
  /** Illumination ambiante (pas de forme) — radial soft comme Edulex, teintes MK. */
  heroLit: Platform.OS === 'web'
    ? ({
        backgroundImage: [
          'radial-gradient(ellipse 80% 70% at 50% 38%, rgba(107, 58, 92, 0.55) 0%, transparent 68%)',
          'radial-gradient(ellipse 55% 50% at 62% 32%, rgba(224, 122, 95, 0.18) 0%, transparent 58%)',
          'radial-gradient(ellipse 100% 90% at 50% 50%, transparent 40%, rgba(12, 7, 12, 0.65) 100%)',
          'linear-gradient(180deg, #1A0F16 0%, #20141C 45%, #1A0F16 100%)',
        ].join(', '),
      } as object)
    : {},
  heroBody: {
    flex: 1,
    justifyContent: 'center',
    zIndex: 1,
    minHeight: 280,
  },
  heroInner: {
    maxWidth: 1080,
    width: '100%',
    alignSelf: 'center',
    gap: 28,
  },
  heroInnerDesktop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 48,
  },
  heroTitleCol: {
    flex: 1.15,
    maxWidth: 560,
  },
  heroSideCol: {
    flex: 0.85,
    maxWidth: 360,
    gap: 22,
    paddingTop: 10,
  },
  title: {
    ...landingFonts.bold,
    letterSpacing: -1.2,
    color: '#FFF9F5',
  },
  subtitle: {
    ...landingFonts.regular,
    fontSize: 16,
    lineHeight: 26,
    color: 'rgba(255, 249, 245, 0.72)',
  },
  heroCtaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  heroMarqueeWrap: {
    maxWidth: 1080,
    width: '100%',
    alignSelf: 'center',
    zIndex: 1,
    paddingBottom: 4,
  },
});
