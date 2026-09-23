/**
 * Onboarding premium — héro photo, vague, médaillon, typo événementielle.
 * Composition fixe cream / plum / or / coral (hors thème app).
 */

import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
  type ImageSourcePropType,
  type ViewToken,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Logo } from '@/components/ui/Logo';
import { fontFamilies, spacing } from '@/constants/theme';
import {
  BotanicalLeaf,
  OnboardingMedallion,
  OnboardingWave,
  type MedallionKind,
} from './components/OnboardingDecor';
import {
  ONBOARDING_HERO_ANNIVERSAIRE,
  ONBOARDING_HERO_CONFERENCE,
  ONBOARDING_HERO_MARIAGE,
  prefetchOnboardingHeroes,
} from './onboardingHeroes';

const PAPER = '#F7F0E8';
const INK = '#2A1824';
const INK_SOFT = '#4A3A42';
const MUTED = '#7A6A70';
const CORAL = '#E07A5F';

interface Slide {
  id: string;
  image: ImageSourcePropType;
  medallion: MedallionKind;
  title: string;
  lead: string;
  body: string;
}

const SLIDES: Slide[] = [
  {
    id: 'mariages',
    image: ONBOARDING_HERO_MARIAGE,
    medallion: 'rings',
    title: 'Mariages',
    lead: 'Créez des souvenirs inoubliables avec vos proches.',
    body: 'Organisez votre mariage facilement : invitation, programme, liste des invités, plan de table et bien plus encore.',
  },
  {
    id: 'anniversaires',
    image: ONBOARDING_HERO_ANNIVERSAIRE,
    medallion: 'cake',
    title: 'Anniversaires',
    lead: 'Fêtez chaque année comme elle le mérite.',
    body: 'Invitation élégante, RSVP, galerie et programme du jour — tout pour une célébration fluide et mémorable.',
  },
  {
    id: 'conferences',
    image: ONBOARDING_HERO_CONFERENCE,
    medallion: 'conference',
    title: 'Conférences',
    lead: 'Accueillez vos participants avec style.',
    body: 'Inscriptions, check-in à l’entrée et suivi des présences — l’expérience pro, sans la complexité.',
  },
];

export function OnboardingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const listRef = useRef<FlatList<Slide>>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const isLast = activeIndex === SLIDES.length - 1;

  const heroH = Math.min(Math.max(height * 0.44, 260), 400);
  const footerH = 120 + insets.bottom;

  const contentFade = useRef(new Animated.Value(1)).current;
  const contentRise = useRef(new Animated.Value(0)).current;
  const medallionScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    prefetchOnboardingHeroes();
  }, []);

  useEffect(() => {
    contentFade.setValue(0);
    contentRise.setValue(14);
    medallionScale.setValue(0.88);
    Animated.parallel([
      Animated.timing(contentFade, {
        toValue: 1,
        duration: 480,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(contentRise, {
        toValue: 0,
        duration: 520,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.spring(medallionScale, {
        toValue: 1,
        friction: 7,
        tension: 90,
        useNativeDriver: true,
      }),
    ]).start();
  }, [activeIndex, contentFade, contentRise, medallionScale]);

  const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    const first = viewableItems[0];
    if (first?.index != null) setActiveIndex(first.index);
  }).current;

  const viewabilityConfig = useRef({ viewAreaCoveragePercentThreshold: 55 }).current;

  const goTo = (index: number) => {
    const clamped = Math.min(Math.max(index, 0), SLIDES.length - 1);
    listRef.current?.scrollToIndex({ index: clamped, animated: true });
  };

  return (
    <View style={styles.screen}>
      <StatusBar style="light" />

      <View style={[styles.topBar, { paddingTop: insets.top + spacing.sm }]} pointerEvents="box-none">
        <Logo size="sm" variant="light" style={styles.logo} />
        <Pressable
          accessibilityRole="button"
          onPress={() => router.push('/login')}
          hitSlop={10}
          style={({ pressed }) => [styles.skipHit, pressed && styles.pressed]}
        >
          <Text style={styles.skip}>Passer</Text>
        </Pressable>
      </View>

      <FlatList
        ref={listRef}
        data={SLIDES}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        getItemLayout={(_data, index) => ({ length: width, offset: width * index, index })}
        contentContainerStyle={{ paddingBottom: footerH }}
        renderItem={({ item, index }) => {
          const isActive = index === activeIndex;
          return (
            <View style={{ width }}>
              <View style={[styles.hero, { height: heroH }]}>
                <Image source={item.image} style={styles.heroImage} resizeMode="cover" />
                <View style={styles.heroScrim} />
                <OnboardingWave width={width} height={62} />
              </View>

              <View style={styles.panel}>
                <Animated.View
                  style={[
                    styles.medallionWrap,
                    isActive
                      ? { transform: [{ scale: medallionScale }], opacity: contentFade }
                      : { opacity: 1 },
                  ]}
                >
                  <OnboardingMedallion kind={item.medallion} />
                </Animated.View>

                <View style={styles.leafLeft} pointerEvents="none">
                  <BotanicalLeaf width={58} height={80} opacity={0.48} />
                </View>
                <View style={styles.leafRight} pointerEvents="none">
                  <BotanicalLeaf width={64} height={88} flip opacity={0.4} />
                </View>

                <Animated.View
                  style={[
                    styles.copy,
                    isActive
                      ? { opacity: contentFade, transform: [{ translateY: contentRise }] }
                      : null,
                  ]}
                >
                  <Text style={styles.title}>{item.title}</Text>
                  <Text style={styles.lead}>{item.lead}</Text>
                  <Text style={styles.body}>{item.body}</Text>
                </Animated.View>
              </View>
            </View>
          );
        }}
      />

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 14) + 6 }]}>
        {isLast ? (
          <>
            <View style={styles.dots}>
              {SLIDES.map((item, index) => (
                <View
                  key={item.id}
                  style={[styles.dot, index === activeIndex ? styles.dotActive : styles.dotIdle]}
                />
              ))}
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Créer un compte"
              onPress={() => router.push('/register')}
              style={({ pressed }) => [styles.ctaWide, pressed && styles.pressed]}
            >
              <Text style={styles.ctaLabel}>Créer un compte</Text>
              <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
            </Pressable>
          </>
        ) : (
          <View style={styles.navRow}>
            <View style={styles.dotsInRow}>
              {SLIDES.map((item, index) => (
                <View
                  key={item.id}
                  style={[styles.dot, index === activeIndex ? styles.dotActive : styles.dotIdle]}
                />
              ))}
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Suivant"
              onPress={() => goTo(activeIndex + 1)}
              style={({ pressed }) => [styles.ctaRound, pressed && styles.pressed]}
            >
              <Ionicons name="arrow-forward" size={22} color="#FFFFFF" />
            </Pressable>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: PAPER,
  },
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
  },
  logo: { alignItems: 'flex-start' },
  skipHit: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(42, 24, 36, 0.32)',
  },
  skip: {
    fontFamily: fontFamilies.sansMedium,
    fontSize: 13,
    lineHeight: 17,
    color: 'rgba(247, 240, 232, 0.95)',
  },
  hero: {
    width: '100%',
    overflow: 'hidden',
    backgroundColor: INK,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroScrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(42, 24, 36, 0.2)',
  },
  panel: {
    flexGrow: 1,
    backgroundColor: PAPER,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
    minHeight: 280,
    paddingBottom: spacing.lg,
  },
  medallionWrap: {
    marginTop: -42,
    zIndex: 3,
    marginBottom: spacing.md,
  },
  leafLeft: {
    position: 'absolute',
    left: 6,
    top: 78,
  },
  leafRight: {
    position: 'absolute',
    right: 2,
    bottom: 24,
  },
  copy: {
    alignItems: 'center',
    maxWidth: 360,
    gap: 10,
    paddingHorizontal: spacing.sm,
  },
  title: {
    fontFamily: fontFamilies.serifSemiBold,
    fontSize: 34,
    lineHeight: 40,
    letterSpacing: -0.6,
    color: INK,
    textAlign: 'center',
  },
  lead: {
    fontFamily: fontFamilies.sansMedium,
    fontSize: 16,
    lineHeight: 23,
    color: INK_SOFT,
    textAlign: 'center',
  },
  body: {
    fontFamily: fontFamilies.sans,
    fontSize: 14,
    lineHeight: 21,
    color: MUTED,
    textAlign: 'center',
    marginTop: 2,
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 8,
    paddingHorizontal: spacing.xl,
    backgroundColor: PAPER,
    gap: spacing.md,
  },
  dots: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  dotsInRow: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    pointerEvents: 'none',
  },
  dot: {
    height: 7,
    borderRadius: 999,
  },
  dotIdle: {
    width: 7,
    backgroundColor: 'rgba(42, 24, 36, 0.16)',
  },
  dotActive: {
    width: 22,
    backgroundColor: CORAL,
  },
  navRow: {
    height: 56,
    width: '100%',
    justifyContent: 'center',
  },
  ctaRound: {
    position: 'absolute',
    right: 0,
    top: 0,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: CORAL,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: CORAL,
    shadowOpacity: 0.3,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  ctaWide: {
    alignSelf: 'stretch',
    minHeight: 54,
    borderRadius: 999,
    backgroundColor: CORAL,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingHorizontal: 28,
    shadowColor: CORAL,
    shadowOpacity: 0.28,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  ctaLabel: {
    fontFamily: fontFamilies.sansSemiBold,
    fontSize: 15,
    color: '#FFFFFF',
  },
  pressed: { opacity: 0.82 },
});
