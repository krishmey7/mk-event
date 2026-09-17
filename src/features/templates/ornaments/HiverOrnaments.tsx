/**
 * Ornements Hiver — réutilise le décor flocon / arcs (design figé du modèle).
 */

import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet } from 'react-native';

import { WinterPageDecor } from '@/features/templates/hiver/WinterArt';

export function HiverOrnaments({
  gold,
  frost,
  compact = false,
}: {
  gold: string;
  frost: string;
  compact?: boolean;
}) {
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.96)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: compact ? 400 : 650,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 1,
        duration: compact ? 450 : 720,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [compact, opacity, scale]);

  return (
    <Animated.View
      pointerEvents="none"
      style={[StyleSheet.absoluteFill, { opacity, transform: [{ scale }] }]}
    >
      <WinterPageDecor gold={gold} frost={frost} compact={compact} />
    </Animated.View>
  );
}
