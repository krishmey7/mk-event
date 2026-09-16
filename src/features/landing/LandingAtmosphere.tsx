/**
 * Atmosphère — halo eucalyptus + grain (landing / header dashboard).
 */

import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View, useWindowDimensions } from 'react-native';
import Svg, { Defs, Ellipse, Line, RadialGradient, Stop } from 'react-native-svg';

const INK = '#0F1419';
const TEAL = '#5BA89F';

export function LandingAtmosphere({
  height: heightProp,
}: {
  /** Hauteur du panneau (sinon plein écran). */
  height?: number;
} = {}) {
  const { width, height: windowHeight } = useWindowDimensions();
  const height = heightProp ?? windowHeight;
  const breath = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(breath, {
          toValue: 1,
          duration: 5200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(breath, {
          toValue: 0,
          duration: 5200,
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
    outputRange: [1, 1.06],
  });
  const glowOpacity = breath.interpolate({
    inputRange: [0, 1],
    outputRange: [0.6, 0.9],
  });

  const cx = width * 0.5;
  const cy = height * 0.45;
  const grainCount = Math.max(10, Math.round(height / 28));

  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, { backgroundColor: INK }]}>
      <Animated.View
        style={[
          styles.haloHost,
          {
            opacity: glowOpacity,
            transform: [{ scale: glowScale }],
          },
        ]}
      >
        <Svg width={width} height={height} style={StyleSheet.absoluteFill}>
          <Defs>
            <RadialGradient id="halo" cx="50%" cy="40%" r="62%">
              <Stop offset="0%" stopColor={TEAL} stopOpacity="0.24" />
              <Stop offset="40%" stopColor={TEAL} stopOpacity="0.08" />
              <Stop offset="75%" stopColor="#141A22" stopOpacity="0.3" />
              <Stop offset="100%" stopColor={INK} stopOpacity="1" />
            </RadialGradient>
            <RadialGradient id="floor" cx="50%" cy="100%" r="55%">
              <Stop offset="0%" stopColor="#0B0F14" stopOpacity="0.85" />
              <Stop offset="100%" stopColor={INK} stopOpacity="0" />
            </RadialGradient>
          </Defs>
          <Ellipse
            cx={cx}
            cy={cy - height * 0.06}
            rx={width * 0.72}
            ry={height * 0.55}
            fill="url(#halo)"
          />
          <Ellipse
            cx={cx}
            cy={height}
            rx={width * 0.75}
            ry={height * 0.35}
            fill="url(#floor)"
          />
        </Svg>
      </Animated.View>

      <Svg width={width} height={height} style={StyleSheet.absoluteFill}>
        {Array.from({ length: grainCount }).map((_, index) => {
          const y = (height / grainCount) * index + 6;
          return (
            <Line
              key={index}
              x1={0}
              y1={y}
              x2={width}
              y2={y}
              stroke="#F2F4F7"
              strokeOpacity={index % 4 === 0 ? 0.028 : 0.01}
              strokeWidth={1}
            />
          );
        })}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  haloHost: {
    ...StyleSheet.absoluteFillObject,
  },
});
