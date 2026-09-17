/**
 * Onboarding — 3 slides Coral + Plum + Cream.
 */

import { useRef, useState } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Logo } from '@/components/ui/Logo';
import { useAppTheme } from '@/context/ThemePreferenceContext';
import { fontFamilies, radii, shadows, spacing } from '@/constants/theme';
import { SlideIllustration } from './components/OnboardingIllustrations';

interface Slide {
  id: string;
  title: string;
  description: string;
  illustration: 1 | 2 | 3;
}

const SLIDES: Slide[] = [
  {
    id: 'templates',
    illustration: 1,
    title: 'Des modèles prêts à personnaliser',
    description:
      'Choisissez un style, puis adaptez textes, photos et couleurs à votre événement.',
  },
  {
    id: 'editor',
    illustration: 2,
    title: 'Un studio simple et vivant',
    description:
      'Modifiez l’invitation en direct : RSVP, programme, galerie, boissons… tout est là.',
  },
  {
    id: 'share',
    illustration: 3,
    title: 'Publiez et suivez les réponses',
    description:
      'Envoyez un lien personnel à chaque invité, puis voyez confirmations et check-in en temps réel.',
  },
];

export function OnboardingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { theme } = useAppTheme();
  const c = theme.colors;
  const listRef = useRef<FlatList<Slide>>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const isLast = activeIndex === SLIDES.length - 1;

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const safeWidth = Math.max(width, 1);
    const index = Math.round(event.nativeEvent.contentOffset.x / safeWidth);
    if (index !== activeIndex && index >= 0 && index < SLIDES.length) {
      setActiveIndex(index);
    }
  };

  const goTo = (index: number) => {
    const clamped = Math.min(Math.max(index, 0), SLIDES.length - 1);
    listRef.current?.scrollToIndex({ index: clamped, animated: true });
  };

  return (
    <View style={[styles.screen, { backgroundColor: c.background }]}>
      <View style={[styles.topBar, { paddingTop: insets.top + spacing.sm }]}>
        <Logo size="md" variant="ink" style={styles.logo} />
        <Pressable
          accessibilityRole="button"
          onPress={() => router.push('/login')}
          hitSlop={8}
          style={({ pressed }) => [pressed && styles.pressed]}
        >
          <Text style={[styles.skip, { color: c.textMuted }]}>Passer</Text>
        </Pressable>
      </View>

      <View style={styles.carousel}>
        <FlatList
          ref={listRef}
          data={SLIDES}
          keyExtractor={(item) => item.id}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          getItemLayout={(_data, index) => ({ length: width, offset: width * index, index })}
          renderItem={({ item }) => (
            <View style={[styles.slide, { width }]}>
              <View style={styles.illustrationStage}>
                <SlideIllustration variant={item.illustration} />
              </View>
              <Text style={[styles.slideTitle, { color: c.textPrimary }]}>{item.title}</Text>
              <Text style={[styles.slideDescription, { color: c.textSecondary }]}>
                {item.description}
              </Text>
            </View>
          )}
        />
      </View>

      <View style={styles.dots}>
        {SLIDES.map((slide, index) => (
          <View
            key={slide.id}
            style={[
              styles.dot,
              index === activeIndex
                ? [styles.dotActive, { backgroundColor: c.accent }]
                : { backgroundColor: c.borderStrong },
            ]}
          />
        ))}
      </View>

      <View style={[styles.actions, { paddingBottom: insets.bottom + spacing.lg }]}>
        {isLast ? (
          <View style={styles.lastActions}>
            <Pressable
              accessibilityRole="button"
              onPress={() => goTo(activeIndex - 1)}
              hitSlop={8}
              style={({ pressed }) => [pressed && styles.pressed]}
            >
              <Text style={[styles.backLink, { color: c.textPrimary }]}>{'< Retour'}</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              onPress={() => router.push('/register')}
              style={({ pressed }) => [
                styles.cta,
                styles.lastButton,
                { backgroundColor: c.accent },
                pressed && styles.pressed,
              ]}
            >
              <Text style={[styles.ctaLabel, { color: c.onAccent }]}>Créer un compte</Text>
            </Pressable>
          </View>
        ) : (
          <Pressable
            accessibilityRole="button"
            onPress={() => goTo(activeIndex + 1)}
            style={({ pressed }) => [
              styles.cta,
              { backgroundColor: c.inkButton },
              pressed && styles.pressed,
            ]}
          >
            <Text style={[styles.ctaLabel, { color: c.onInkButton }]}>Suivant</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
  },
  logo: { alignItems: 'flex-start' },
  skip: {
    fontFamily: fontFamilies.sansMedium,
    fontSize: 14,
    lineHeight: 18,
  },
  pressed: { opacity: 0.78 },
  carousel: { flex: 1 },
  slide: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    gap: 12,
  },
  illustrationStage: {
    height: 320,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  slideTitle: {
    fontFamily: fontFamilies.serifSemiBold,
    fontSize: 26,
    lineHeight: 32,
    textAlign: 'center',
    letterSpacing: -0.3,
    maxWidth: 340,
  },
  slideDescription: {
    fontFamily: fontFamilies.sans,
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    maxWidth: 340,
  },
  dots: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  dot: { width: 8, height: 8, borderRadius: radii.full },
  dotActive: { width: 24, borderRadius: 4 },
  actions: { paddingHorizontal: spacing.lg, gap: spacing.md },
  lastActions: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  backLink: {
    fontFamily: fontFamilies.sansSemiBold,
    fontSize: 14,
    lineHeight: 19,
  },
  cta: {
    minHeight: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.sm,
  },
  lastButton: { flex: 1 },
  ctaLabel: {
    fontFamily: fontFamilies.sansSemiBold,
    fontSize: 15,
  },
});
