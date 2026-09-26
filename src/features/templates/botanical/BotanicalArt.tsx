/**
 * Décors floraux Herbier — pétales en dégradé, sans contour d’encre.
 * Couronnes, lianes et canopée pour remplir la carte.
 */

import { useId } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import Svg, {
  Circle,
  ClipPath,
  Defs,
  Ellipse,
  G,
  Image as SvgImage,
  LinearGradient,
  Path,
  RadialGradient,
  Stop,
} from 'react-native-svg';

import type { PhotoFrameKey } from '@/features/invitation/types';

const ROSE =
  'M0-4C14-28 40-20 34 6C28 26 8 30 0 16C-8 30-28 26-34 6C-40-20-14-28 0-4Z';
const ROSE_IN =
  'M0-2C9-16 22-12 18 4C14 16 4 18 0 10C-4 18-14 16-18 4C-22-12-9-16 0-2Z';

function stops(id: string, petal: string, leaf: string) {
  return (
    <Defs>
      <RadialGradient id={`${id}-rose`} cx="32%" cy="28%" r="78%">
        <Stop offset="0" stopColor="#FFFFFF" stopOpacity="0.95" />
        <Stop offset="0.38" stopColor={petal} stopOpacity="0.72" />
        <Stop offset="1" stopColor={petal} />
      </RadialGradient>
      <RadialGradient id={`${id}-deep`} cx="40%" cy="40%" r="70%">
        <Stop offset="0" stopColor={petal} stopOpacity="0.45" />
        <Stop offset="1" stopColor={petal} />
      </RadialGradient>
      <LinearGradient id={`${id}-leaf`} x1="0" y1="0" x2="1" y2="1">
        <Stop offset="0" stopColor="#FFFFFF" stopOpacity="0.7" />
        <Stop offset="0.35" stopColor={leaf} stopOpacity="0.78" />
        <Stop offset="1" stopColor={leaf} />
      </LinearGradient>
      <RadialGradient id={`${id}-bud`} cx="40%" cy="30%" r="70%">
        <Stop offset="0" stopColor="#FFFFFF" stopOpacity="0.8" />
        <Stop offset="1" stopColor={petal} stopOpacity="0.9" />
      </RadialGradient>
    </Defs>
  );
}

function Rose({ grad, deep }: { grad: string; deep: string }) {
  const outer = [-4, 48, 98, 150, 206, 262, 318];
  return (
    <G>
      {outer.map((angle, index) => (
        <Path
          key={angle}
          d={ROSE}
          fill={`url(#${grad})`}
          opacity={0.94}
          transform={`rotate(${angle}) scale(${index % 2 ? 0.96 : 1.05})`}
        />
      ))}
      {outer.map((angle) => (
        <Path
          key={`i-${angle}`}
          d={ROSE_IN}
          fill={`url(#${deep})`}
          transform={`rotate(${angle + 26}) scale(0.58)`}
        />
      ))}
      <Circle r={9} fill={`url(#${deep})`} />
      <Circle r={3.2} fill="#FFFFFF" opacity={0.45} />
    </G>
  );
}

function Leaf({ grad, rotate, rx = 13, ry = 26 }: { grad: string; rotate: number; rx?: number; ry?: number }) {
  return (
    <Ellipse
      rx={rx}
      ry={ry}
      fill={`url(#${grad})`}
      transform={`rotate(${rotate})`}
    />
  );
}

function Spray({
  leaf,
  grad,
  rotate = 0,
}: {
  leaf: string;
  grad: string;
  rotate?: number;
}) {
  return (
    <G transform={`rotate(${rotate})`}>
      <Path
        d="M0 0C8 28 4 58-6 92"
        stroke={leaf}
        strokeWidth={2.4}
        fill="none"
        strokeLinecap="round"
        opacity={0.85}
      />
      <G transform="translate(-14 22) rotate(-32)">
        <Leaf grad={grad} rotate={0} />
      </G>
      <G transform="translate(12 38) rotate(28)">
        <Leaf grad={grad} rotate={0} rx={11} ry={22} />
      </G>
      <G transform="translate(-16 58) rotate(-24)">
        <Leaf grad={grad} rotate={0} rx={10} ry={20} />
      </G>
      <G transform="translate(10 74) rotate(22)">
        <Leaf grad={grad} rotate={0} rx={9} ry={18} />
      </G>
    </G>
  );
}

export function FloralCanopy({
  petal,
  leaf,
  height = 188,
}: {
  petal: string;
  leaf: string;
  ink?: string;
  height?: number;
}) {
  const id = `canopy-${useId().replace(/:/g, '')}`;
  return (
    <Svg width="100%" height={height} viewBox="0 0 390 210" preserveAspectRatio="xMidYMin slice">
      {stops(id, petal, leaf)}
      <G transform="translate(28 78) scale(0.95)">
        <Spray leaf={leaf} grad={`${id}-leaf`} rotate={-18} />
      </G>
      <G transform="translate(78 96) scale(0.82)">
        <Rose grad={`${id}-rose`} deep={`${id}-deep`} />
      </G>
      <G transform="translate(132 58) scale(0.48)">
        <Rose grad={`${id}-rose`} deep={`${id}-deep`} />
      </G>
      <G transform="translate(168 108) scale(0.7)">
        <Spray leaf={leaf} grad={`${id}-leaf`} rotate={8} />
      </G>
      <G transform="translate(214 70) scale(0.42)">
        <Circle r={16} fill={`url(#${id}-bud)`} />
      </G>
      <G transform="translate(248 112) scale(0.78)">
        <Spray leaf={leaf} grad={`${id}-leaf`} rotate={16} />
      </G>
      <G transform="translate(300 88) scale(0.88)">
        <Rose grad={`${id}-rose`} deep={`${id}-deep`} />
      </G>
      <G transform="translate(352 64) scale(0.5)">
        <Rose grad={`${id}-rose`} deep={`${id}-deep`} />
      </G>
      <G transform="translate(20 40) scale(0.55)">
        <Rose grad={`${id}-rose`} deep={`${id}-deep`} />
      </G>
      <G transform="translate(360 120) scale(0.62)">
        <Spray leaf={leaf} grad={`${id}-leaf`} rotate={24} />
      </G>
    </Svg>
  );
}

export function BotanicalSprig({
  width = 88,
  petal,
  leaf,
}: {
  width?: number;
  petal: string;
  ink?: string;
  leaf: string;
}) {
  const id = `sprig-${useId().replace(/:/g, '')}`;
  const height = Math.round(width * 0.38);
  return (
    <Svg width={width} height={height} viewBox="0 0 140 52">
      {stops(id, petal, leaf)}
      <Path
        d="M6 30C40 34 90 28 134 22"
        stroke={leaf}
        strokeWidth={1.6}
        fill="none"
        strokeLinecap="round"
        opacity={0.8}
      />
      <G transform="translate(36 30) rotate(-36) scale(0.42)">
        <Leaf grad={`${id}-leaf`} rotate={0} />
      </G>
      <G transform="translate(96 26) rotate(150) scale(0.38)">
        <Leaf grad={`${id}-leaf`} rotate={0} />
      </G>
      <G transform="translate(70 24) scale(0.32)">
        <Rose grad={`${id}-rose`} deep={`${id}-deep`} />
      </G>
    </Svg>
  );
}

const HEART =
  'M50 88 C18 68 2 48 2 30 C2 16 16 6 32 6 C41 6 47 11 50 18 C53 11 59 6 68 6 C84 6 98 16 98 30 C98 48 82 68 50 88 Z';

function Wreath({
  width,
  height,
  petal,
  leaf,
}: {
  width: number;
  height: number;
  petal: string;
  leaf: string;
}) {
  const id = `wreath-${useId().replace(/:/g, '')}`;
  const cx = width / 2;
  const cy = height / 2;
  const rx = width * 0.4;
  const ry = height * 0.4;
  const marks = [
    { kind: 'rose', a: -100, s: 0.42 },
    { kind: 'leaf', a: -58, s: 1 },
    { kind: 'rose', a: -12, s: 0.36 },
    { kind: 'leaf', a: 34, s: 0.9 },
    { kind: 'rose', a: 78, s: 0.4 },
    { kind: 'leaf', a: 124, s: 1 },
    { kind: 'rose', a: 168, s: 0.34 },
    { kind: 'leaf', a: 214, s: 0.85 },
    { kind: 'rose', a: 250, s: 0.38 },
  ];

  return (
    <Svg width={width} height={height}>
      {stops(id, petal, leaf)}
      {marks.map((mark) => {
        const rad = (mark.a * Math.PI) / 180;
        const x = cx + Math.cos(rad) * rx;
        const y = cy + Math.sin(rad) * ry;
        return (
          <G key={mark.a} transform={`translate(${x} ${y}) rotate(${mark.a + 90}) scale(${mark.s})`}>
            {mark.kind === 'leaf' ? (
              <Leaf grad={`${id}-leaf`} rotate={0} rx={12} ry={24} />
            ) : (
              <Rose grad={`${id}-rose`} deep={`${id}-deep`} />
            )}
          </G>
        );
      })}
    </Svg>
  );
}

export function BotanicalPortrait({
  uri,
  frame,
  petal,
  leaf,
  width,
}: {
  uri: string;
  frame: PhotoFrameKey | string;
  petal: string;
  ink?: string;
  leaf: string;
  width: number;
}) {
  const heart = frame === 'heart' || frame === 'heartFloral';
  const arch = frame === 'soft';
  const wreath = frame !== 'heart';
  const photoW = Math.round(width * (heart ? 0.7 : arch ? 0.74 : 0.62));
  const photoH = Math.round(photoW * (heart ? 0.96 : arch ? 1.15 : 1.22));
  const stageH = photoH + 64;

  return (
    <View style={{ width, height: stageH, alignItems: 'center', justifyContent: 'center' }}>
      {wreath ? (
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
          <Wreath width={width} height={stageH} petal={petal} leaf={leaf} />
        </View>
      ) : null}
      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          width: photoW,
          height: photoH,
          borderRadius: arch ? 12 : photoW / 2,
          backgroundColor: '#000',
          opacity: 0.08,
          transform: [{ translateY: 10 }],
        }}
      />
      {heart ? (
        <HeartPlate uri={uri} size={photoW} petal={petal} leaf={leaf} />
      ) : (
        <View
          style={{
            width: photoW,
            height: photoH,
            overflow: 'hidden',
            backgroundColor: '#E7E0D4',
            borderTopLeftRadius: arch ? photoW / 2 : photoW / 2,
            borderTopRightRadius: arch ? photoW / 2 : photoW / 2,
            borderBottomLeftRadius: arch ? 16 : photoW / 2,
            borderBottomRightRadius: arch ? 16 : photoW / 2,
          }}
        >
          {uri ? <Image source={{ uri }} style={StyleSheet.absoluteFill} resizeMode="cover" /> : null}
        </View>
      )}
    </View>
  );
}

function HeartPlate({
  uri,
  size,
  petal,
  leaf,
}: {
  uri: string;
  size: number;
  petal: string;
  leaf: string;
}) {
  const clipId = `herb-heart-${useId().replace(/:/g, '')}`;
  const id = `heart-rose-${clipId}`;
  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} viewBox="0 0 100 100">
        {stops(id, petal, leaf)}
        <Defs>
          <ClipPath id={clipId}>
            <Path d={HEART} />
          </ClipPath>
        </Defs>
        <Path d={HEART} fill="#E7E0D4" />
        {uri ? (
          <SvgImage
            href={{ uri }}
            x={0}
            y={0}
            width={100}
            height={100}
            preserveAspectRatio="xMidYMid slice"
            clipPath={`url(#${clipId})`}
          />
        ) : null}
        <G transform="translate(50 18) scale(0.28)">
          <Rose grad={`${id}-rose`} deep={`${id}-deep`} />
        </G>
      </Svg>
    </View>
  );
}
