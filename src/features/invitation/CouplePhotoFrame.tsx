/**
 * Cadre de la photo du couple — cercle, cœur, soft.
 * Cœur : SVG + ClipPath partout (mask CSS Android = artefacts GPU sur la page).
 */

import { useId } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import Svg, { ClipPath, Defs, Image as SvgImage, Path } from 'react-native-svg';

import type { CouplePhoto } from './types';

const DEFAULT_SIZE = 118;

/** Cœur en viewBox 0–100 (rempli). */
const HEART_D =
  'M50 88 C18 68 2 48 2 30 C2 16 16 6 32 6 C41 6 47 11 50 18 C53 11 59 6 68 6 C84 6 98 16 98 30 C98 48 82 68 50 88 Z';

/** Contour légèrement élargi pour la bordure. */
const HEART_RING_D =
  'M50 92 C14 70 -2 48 -2 29 C-2 13 14 2 32 2 C42 2 48 8 50 16 C52 8 58 2 68 2 C86 2 102 13 102 29 C102 48 86 70 50 92 Z';

function HeartPhoto({
  uri,
  accent,
  floral,
  size,
}: {
  uri: string;
  accent: string;
  floral?: boolean;
  size: number;
}) {
  const clipId = `heart-${useId().replace(/:/g, '')}`;
  const pad = floral ? Math.round(size * 0.2) : Math.round(size * 0.08);
  const stage = size + pad * 2;
  const photoSize = size;

  return (
    <View style={{ width: stage, height: stage, alignItems: 'center', justifyContent: 'center' }}>
      {floral ? (
        <OrbitMarks accent={accent} count={6} radius={size * 0.52} teardrop stage={stage} />
      ) : null}
      <Svg width={photoSize} height={photoSize} viewBox="0 0 100 100">
        <Defs>
          <ClipPath id={clipId}>
            <Path d={HEART_D} />
          </ClipPath>
        </Defs>
        <Path d={HEART_RING_D} fill="none" stroke={accent} strokeWidth={1.6} opacity={0.9} />
        <SvgImage
          href={uri}
          x={0}
          y={0}
          width={100}
          height={100}
          preserveAspectRatio="xMidYMid slice"
          clipPath={`url(#${clipId})`}
        />
      </Svg>
    </View>
  );
}

export function CouplePhotoFrame({
  couplePhoto,
  accent,
  size = DEFAULT_SIZE,
}: {
  couplePhoto: CouplePhoto;
  accent: string;
  size?: number;
}) {
  const { uri, frame } = couplePhoto;
  if (!uri) return null;

  if (frame === 'soft') {
    const softW = Math.round(size * 1.08);
    const softH = Math.round(size * 0.85);
    return (
      <View
        style={[
          styles.softOuter,
          {
            width: softW,
            height: softH,
            borderColor: accent,
            borderRadius: softH / 2,
            padding: Math.max(3, size * 0.03),
          },
        ]}
      >
        <Image
          source={{ uri }}
          style={[styles.softPhoto, { borderRadius: softH / 2 - 4 }]}
          resizeMode="cover"
        />
      </View>
    );
  }

  if (frame === 'heart' || frame === 'heartFloral') {
    return (
      <HeartPhoto uri={uri} accent={accent} floral={frame === 'heartFloral'} size={size} />
    );
  }

  const floral = frame === 'circleFloral';
  const ring = size;
  const stage = floral ? size + 36 : size + 12;

  return (
    <View style={{ width: stage, height: stage, alignItems: 'center', justifyContent: 'center' }}>
      {floral ? <OrbitMarks accent={accent} count={8} radius={size * 0.58} stage={stage} /> : null}
      <View
        style={[
          styles.circleRing,
          {
            width: ring,
            height: ring,
            borderRadius: ring / 2,
            borderColor: accent,
            padding: Math.max(3, size * 0.04),
          },
        ]}
      >
        <View style={styles.circleWell}>
          <Image source={{ uri }} style={styles.fillPhoto} resizeMode="cover" />
        </View>
      </View>
    </View>
  );
}

function OrbitMarks({
  accent,
  count,
  radius,
  teardrop = false,
  stage,
}: {
  accent: string;
  count: number;
  radius: number;
  teardrop?: boolean;
  stage: number;
}) {
  return (
    <View pointerEvents="none" style={[styles.orbit, { width: stage, height: stage }]}>
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

const styles = StyleSheet.create({
  fillPhoto: { width: '100%', height: '100%' },
  circleRing: {
    borderWidth: 1.5,
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
    borderWidth: 1.5,
    overflow: 'hidden',
    backgroundColor: 'rgba(18, 16, 12, 0.22)',
  },
  softPhoto: { flex: 1, width: '100%' },
});
