/**
 * Héro onboarding — photo pleine largeur, bas net.
 * Aucune vague / mask / SVG : jointure gérée par le panneau (radius).
 */

import { Image, Platform, StyleSheet, View, type ImageSourcePropType } from 'react-native';

const PAPER = '#F7F0E8';

export function OnboardingHeroPhoto({
  width,
  height,
  source,
}: {
  width: number;
  height: number;
  source: ImageSourcePropType;
}) {
  const w = Math.max(1, Math.round(width));
  const h = Math.max(1, Math.round(height));

  return (
    <View style={[styles.root, { width: w, height: h }]} collapsable={false}>
      <Image
        source={source}
        style={styles.image}
        resizeMode="cover"
        fadeDuration={0}
        {...(Platform.OS === 'android' ? { progressiveRenderingEnabled: false } : null)}
      />
      <View style={styles.scrim} pointerEvents="none" />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    backgroundColor: PAPER,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  scrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(42, 24, 36, 0.22)',
  },
});
