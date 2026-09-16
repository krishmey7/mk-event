/**
 * Cadre de la photo du couple — la photo est masquée dans la forme
 * (cercle, ovale, cœur). Ornements en orbites, pas d’icônes collées.
 */

import { Image, Platform, StyleSheet, View, type ViewStyle } from 'react-native';

import type { CouplePhoto } from './types';

const SIZE = 118;
const HEART_CLIP = {
  clipPath:
    'path("M0.5 0.92 C0.18 0.72 0.02 0.5 0.02 0.32 C0.02 0.16 0.16 0.06 0.32 0.06 C0.41 0.06 0.47 0.11 0.5 0.18 C0.53 0.11 0.59 0.06 0.68 0.06 C0.84 0.06 0.98 0.16 0.98 0.32 C0.98 0.5 0.82 0.72 0.5 0.92 Z")',
} as const;

export function CouplePhotoFrame({ couplePhoto, accent }: {
  couplePhoto: CouplePhoto;
  accent: string;
}) {
  const { uri, frame } = couplePhoto;
  if (!uri) return null;

  if (frame === 'soft') {
    return (
      <View style={[styles.softOuter, { borderColor: accent }]}>
        <Image source={{ uri }} style={styles.softPhoto} resizeMode="cover" />
      </View>
    );
  }

  if (frame === 'heart' || frame === 'heartFloral') {
    return (
      <View style={styles.heartStage}>
        {frame === 'heartFloral' ? <OrbitMarks accent={accent} count={6} radius={66} teardrop /> : null}
        <View style={[styles.heartShell, heartClip, { backgroundColor: accent }]}>
          <View style={[styles.heartWell, heartClip]}>
            <Image source={{ uri }} style={styles.fillPhoto} resizeMode="cover" />
          </View>
        </View>
      </View>
    );
  }

  const floral = frame === 'circleFloral';

  return (
    <View style={floral ? styles.circleStageFloral : styles.circleStage}>
      {floral ? <OrbitMarks accent={accent} count={8} radius={72} /> : null}
      <View style={[styles.circleRing, { borderColor: accent }]}>
        <View style={styles.circleWell}>
          <Image source={{ uri }} style={styles.fillPhoto} resizeMode="cover" />
        </View>
      </View>
    </View>
  );
}

function OrbitMarks({ accent, count, radius, teardrop = false }: {
  accent: string;
  count: number;
  radius: number;
  teardrop?: boolean;
}) {
  return (
    <View pointerEvents="none" style={styles.orbit}>
      {Array.from({ length: count }, (_, index) => {
        const deg = (360 / count) * index - 90;
        return (
          <View
            key={index}
            style={[
              teardrop ? styles.petal : styles.dash,
              {
                backgroundColor: accent,
                transform: [{ rotate: `${deg}deg` }, { translateY: -radius }],
              },
            ]}
          />
        );
      })}
    </View>
  );
}

const heartClip = (Platform.OS === 'web' ? HEART_CLIP : { borderRadius: 48 }) as ViewStyle;

const styles = StyleSheet.create({
  fillPhoto: { width: '100%', height: '100%' },

  circleStage: {
    width: SIZE + 12,
    height: SIZE + 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleStageFloral: {
    width: SIZE + 40,
    height: SIZE + 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleRing: {
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE / 2,
    borderWidth: 1.5,
    padding: 5,
    backgroundColor: 'rgba(18, 16, 12, 0.22)',
  },
  circleWell: {
    flex: 1,
    borderRadius: 999,
    overflow: 'hidden',
  },

  orbit: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dash: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 1.5,
    height: 10,
    marginLeft: -0.75,
    marginTop: -5,
    borderRadius: 1,
    opacity: 0.9,
  },
  petal: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 7,
    height: 12,
    marginLeft: -3.5,
    marginTop: -6,
    borderRadius: 8,
    opacity: 0.88,
  },

  softOuter: {
    width: 128,
    height: 100,
    borderRadius: 50,
    borderWidth: 1.5,
    padding: 4,
    overflow: 'hidden',
    backgroundColor: 'rgba(18, 16, 12, 0.22)',
  },
  softPhoto: { flex: 1, borderRadius: 46, width: '100%' },

  heartStage: {
    width: 136,
    height: 128,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heartShell: {
    width: 108,
    height: 100,
    padding: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heartWell: {
    width: '100%',
    height: '100%',
    overflow: 'hidden',
  },
});
