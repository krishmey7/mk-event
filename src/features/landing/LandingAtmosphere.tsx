/**
 * Atmosphère landing / dashboard.
 * Landing = clair Edulex-like (orbes soft). Dashboard peut forcer sombre.
 */

import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View, useWindowDimensions } from 'react-native';
import Svg, { Defs, Ellipse, RadialGradient, Stop } from 'react-native-svg';

import { LANDING } from './landingTokens';

const CORAL = '#E07A5F';
const PLUM = '#6B3A5C';

export function LandingAtmosphere({
  height: heightProp,
  tone = 'light',
}: {
  height?: number;
  /** `light` = landing clair ; `dark` = header dashboard plum. */
  tone?: 'light' | 'dark';
} = {}) {
  const { width, height: windowHeight } = useWindowDimensions();
  const height = heightProp ?? windowHeight;
  const breath = useRef(new Animated.Value(0)).current;
  const isDark = tone === 'dark';

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(breath, {
          toValue: 1,
          duration: 5600,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(breath, {
          toValue: 0,
          duration: 5600,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [breath]);

  const glowScale = breath.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.08],
  });
  const glowOpacity = breath.interpolate({
    inputRange: [0, 1],
    outputRange: isDark ? [0.55, 0.85] : [0.5, 0.85],
  });

  const bg = isDark ? '#2A1824' : LANDING.bg;

  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, { backgroundColor: bg }]}>
      <Animated.View
        style={[
          styles.haloHost,
          { opacity: glowOpacity, transform: [{ scale: glowScale }] },
        ]}
      >
        <Svg width={width} height={height} style={StyleSheet.absoluteFill}>
          <Defs>
            <RadialGradient id="orbCoral" cx="28%" cy="22%" r="42%">
              <Stop offset="0%" stopColor={CORAL} stopOpacity={isDark ? '0.32' : '0.28'} />
              <Stop offset="100%" stopColor={CORAL} stopOpacity="0" />
            </RadialGradient>
            <RadialGradient id="orbPlum" cx="78%" cy="38%" r="46%">
              <Stop offset="0%" stopColor={PLUM} stopOpacity={isDark ? '0.28' : '0.16'} />
              <Stop offset="100%" stopColor={PLUM} stopOpacity="0" />
            </RadialGradient>
            <RadialGradient id="orbSoft" cx="50%" cy="78%" r="50%">
              <Stop
                offset="0%"
                stopColor={isDark ? '#3A2434' : '#E8D9CE'}
                stopOpacity={isDark ? '0.55' : '0.45'}
              />
              <Stop offset="100%" stopColor={bg} stopOpacity="0" />
            </RadialGradient>
          </Defs>
          <Ellipse
            cx={width * 0.22}
            cy={height * 0.18}
            rx={width * 0.42}
            ry={height * 0.32}
            fill="url(#orbCoral)"
          />
          <Ellipse
            cx={width * 0.82}
            cy={height * 0.36}
            rx={width * 0.4}
            ry={height * 0.34}
            fill="url(#orbPlum)"
          />
          <Ellipse
            cx={width * 0.5}
            cy={height * 0.92}
            rx={width * 0.7}
            ry={height * 0.38}
            fill="url(#orbSoft)"
          />
        </Svg>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  haloHost: {
    ...StyleSheet.absoluteFillObject,
  },
});
