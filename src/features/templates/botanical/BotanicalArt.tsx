/**
 * Fleurs à l’encre — pétales irréguliers, comme un dessin à la plume.
 * Pétales, marguerites, feuilles et bouquets de coin.
 */

import { useId } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import Svg, { Circle, Defs, ClipPath, Ellipse, G, Path, Image as SvgImage } from 'react-native-svg';

import type { PhotoFrameKey } from '@/features/invitation/types';

const PETAL =
  'M0 6C-11 -1-18-18-9-32C-3-40 7-37 10-29C18-16 11-1 0 6Z';
const INNER =
  'M0 4C-7 -1-12-12-6-21C-2-27 5-25 7-18C12-10 7-1 0 4Z';
const LEAF =
  'M0 1C12-10 30-8 40 4C28 10 12 9 0 1Z';

const OUTER_ANGLES = [-8, 36, 84, 128, 176, 214, 262, 314];
const OUTER_SCALES = [1, 0.92, 1.08, 0.88, 1.04, 0.95, 1.07, 0.9];

export function BloomGroup({
  petal,
  ink,
}: {
  petal: string;
  ink: string;
}) {
  return (
    <G>
      {OUTER_ANGLES.map((angle, index) => (
        <Path
          key={`p-${index}`}
          d={PETAL}
          fill={petal}
          fillOpacity={0.92}
          stroke={ink}
          strokeWidth={1.15}
          strokeLinejoin="round"
          strokeLinecap="round"
          transform={`rotate(${angle}) scale(${OUTER_SCALES[index]})`}
        />
      ))}
      {OUTER_ANGLES.map((angle, index) => (
        <Path
          key={`i-${index}`}
          d={INNER}
          fill={petal}
          stroke={ink}
          strokeWidth={0.85}
          strokeLinejoin="round"
          transform={`rotate(${angle + 20}) scale(0.58)`}
        />
      ))}
      <Circle r={7.2} fill={petal} stroke={ink} strokeWidth={0.9} />
      <Circle r={2.6} fill={ink} opacity={0.45} />
      <Circle cx={-3.2} cy={1.4} r={0.9} fill={ink} opacity={0.55} />
      <Circle cx={2.8} cy={-1.1} r={0.8} fill={ink} opacity={0.4} />
    </G>
  );
}

export function DaisyGroup({
  petal,
  ink,
}: {
  petal: string;
  ink: string;
}) {
  const angles = [0, 36, 72, 108, 144, 180, 216, 252, 288, 324];
  return (
    <G>
      {angles.map((angle) => (
        <Ellipse
          key={angle}
          cx={0}
          cy={-18}
          rx={4.2}
          ry={13}
          fill={petal}
          fillOpacity={0.55}
          stroke={ink}
          strokeWidth={0.85}
          transform={`rotate(${angle})`}
        />
      ))}
      <Circle r={5.5} fill={petal} stroke={ink} strokeWidth={0.8} />
      <Circle r={2} fill={ink} opacity={0.35} />
    </G>
  );
}

function LeafGroup({ ink, leaf }: { ink: string; leaf: string }) {
  return (
    <G>
      <Path d={LEAF} fill={leaf} fillOpacity={0.9} stroke={ink} strokeWidth={0.9} strokeLinejoin="round" />
      <Path d="M3 2C14-2 28-1 37 4" fill="none" stroke={ink} strokeWidth={0.6} opacity={0.7} />
    </G>
  );
}

export function CornerBouquet({
  width = 168,
  petal,
  ink,
  leaf,
}: {
  width?: number;
  petal: string;
  ink: string;
  leaf: string;
}) {
  const height = Math.round(width * 1.35);
  return (
    <Svg width={width} height={height} viewBox="0 0 200 270">
      <Path
        d="M124 262C112 200 92 156 74 112"
        fill="none"
        stroke={ink}
        strokeWidth={1.4}
        strokeLinecap="round"
      />
      <Path
        d="M154 262C166 206 154 168 140 132"
        fill="none"
        stroke={ink}
        strokeWidth={1.15}
        strokeLinecap="round"
      />
      <Path
        d="M96 262C72 214 60 184 54 152"
        fill="none"
        stroke={ink}
        strokeWidth={1}
        strokeLinecap="round"
      />
      <Path d="M48 248C40 232 52 228 58 240" fill="none" stroke={leaf} strokeWidth={0.8} strokeLinecap="round" />
      <Path d="M168 246C178 230 166 224 158 236" fill="none" stroke={leaf} strokeWidth={0.8} strokeLinecap="round" />
      <G transform="translate(78 168) rotate(-28) scale(0.72)">
        <LeafGroup ink={ink} leaf={leaf} />
      </G>
      <G transform="translate(128 176) rotate(36) scale(0.62)">
        <LeafGroup ink={ink} leaf={leaf} />
      </G>
      <G transform="translate(96 128) rotate(-8) scale(0.55)">
        <LeafGroup ink={ink} leaf={leaf} />
      </G>
      <G transform="translate(58 156) rotate(18) scale(0.42)">
        <Path d="M0 10C-7 4-7-6 0-12C7-6 7 4 0 10Z" fill={petal} stroke={ink} strokeWidth={0.9} />
      </G>
      <G transform="translate(74 86) scale(0.82)">
        <BloomGroup petal={petal} ink={ink} />
      </G>
      <G transform="translate(148 128) scale(0.48)">
        <DaisyGroup petal={petal} ink={ink} />
      </G>
      <G transform="translate(156 58) scale(0.4)">
        <BloomGroup petal={petal} ink={ink} />
      </G>
    </Svg>
  );
}

export function BotanicalSprig({
  width = 88,
  petal,
  ink,
  leaf,
}: {
  width?: number;
  petal: string;
  ink: string;
  leaf: string;
}) {
  const height = Math.round(width * 0.42);
  return (
    <Svg width={width} height={height} viewBox="0 0 120 50">
      <Path d="M8 28C36 26 70 30 112 22" fill="none" stroke={ink} strokeWidth={1} strokeLinecap="round" />
      <G transform="translate(28 28) rotate(-40) scale(0.42)">
        <LeafGroup ink={ink} leaf={leaf} />
      </G>
      <G transform="translate(78 26) rotate(150) scale(0.38)">
        <LeafGroup ink={ink} leaf={leaf} />
      </G>
      <G transform="translate(60 24) scale(0.28)">
        <BloomGroup petal={petal} ink={ink} />
      </G>
    </Svg>
  );
}

const HEART =
  'M50 88 C18 68 2 48 2 30 C2 16 16 6 32 6 C41 6 47 11 50 18 C53 11 59 6 68 6 C84 6 98 16 98 30 C98 48 82 68 50 88 Z';

function place(cx: number, cy: number, rx: number, ry: number, angle: number) {
  const rad = (angle * Math.PI) / 180;
  return {
    x: cx + Math.cos(rad) * rx,
    y: cy + Math.sin(rad) * ry,
    rot: angle + 90,
  };
}

function Wreath({
  width,
  height,
  petal,
  ink,
  leaf,
}: {
  width: number;
  height: number;
  petal: string;
  ink: string;
  leaf: string;
}) {
  const marks = [
    { kind: 'bloom', a: -96, s: 0.36 },
    { kind: 'leaf', a: -48, s: 0.55 },
    { kind: 'daisy', a: -4, s: 0.34 },
    { kind: 'leaf', a: 42, s: 0.5 },
    { kind: 'bloom', a: 92, s: 0.34 },
    { kind: 'daisy', a: 142, s: 0.32 },
    { kind: 'leaf', a: 188, s: 0.52 },
    { kind: 'bloom', a: 236, s: 0.3 },
  ];
  const cx = width / 2;
  const cy = height / 2;
  const rx = width * 0.44;
  const ry = height * 0.44;

  return (
    <Svg width={width} height={height}>
      <Ellipse
        cx={cx}
        cy={cy + 1}
        rx={rx * 0.78}
        ry={ry * 0.78}
        fill="none"
        stroke={ink}
        strokeWidth={0.8}
        opacity={0.45}
      />
      {marks.map((mark) => {
        const spot = place(cx, cy, rx, ry, mark.a);
        const inner =
          mark.kind === 'leaf' ? (
            <LeafGroup ink={ink} leaf={leaf} />
          ) : mark.kind === 'daisy' ? (
            <DaisyGroup petal={petal} ink={ink} />
          ) : (
            <BloomGroup petal={petal} ink={ink} />
          );
        return (
          <G key={mark.a} transform={`translate(${spot.x} ${spot.y}) rotate(${spot.rot}) scale(${mark.s})`}>
            {inner}
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
  ink,
  leaf,
  width,
}: {
  uri: string;
  frame: PhotoFrameKey | string;
  petal: string;
  ink: string;
  leaf: string;
  width: number;
}) {
  const heart = frame === 'heart' || frame === 'heartFloral';
  const arch = frame === 'soft';
  const wreath = frame === 'circleFloral' || frame === 'heartFloral';
  const photoW = Math.round(width * (heart ? 0.62 : arch ? 0.7 : 0.58));
  const photoH = Math.round(photoW * (heart ? 0.96 : arch ? 1.18 : 1.24));
  const stageW = width;
  const stageH = photoH + (wreath ? 78 : 28);

  return (
    <View style={{ width: stageW, height: stageH, alignItems: 'center', justifyContent: 'center' }}>
      {wreath && !heart ? (
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
          <Wreath width={stageW} height={stageH} petal={petal} ink={ink} leaf={leaf} />
        </View>
      ) : null}
      {heart ? (
        <HeartPlate uri={uri} size={photoW} ink={ink} petal={petal} leaf={leaf} floral={wreath} />
      ) : (
        <View
          style={[
            {
              width: photoW,
              height: photoH,
              overflow: 'hidden',
              borderWidth: 1,
              borderColor: ink,
              backgroundColor: '#E7E0D4',
            },
            arch
              ? { borderTopLeftRadius: photoW / 2, borderTopRightRadius: photoW / 2, borderBottomLeftRadius: 10, borderBottomRightRadius: 10 }
              : { borderRadius: photoW / 2 },
          ]}
        >
          {uri ? <Image source={{ uri }} style={StyleSheet.absoluteFill} resizeMode="cover" /> : null}
        </View>
      )}
      {!wreath && !heart ? (
        <View style={{ position: 'absolute', top: 0 }} pointerEvents="none">
          <BotanicalSprig width={72} petal={petal} ink={ink} leaf={leaf} />
        </View>
      ) : null}
    </View>
  );
}

function HeartPlate({
  uri,
  size,
  ink,
  petal,
  leaf,
  floral,
}: {
  uri: string;
  size: number;
  ink: string;
  petal: string;
  leaf: string;
  floral: boolean;
}) {
  const clipId = `herb-heart-${useId().replace(/:/g, '')}`;
  return (
    <View style={{ width: size, height: size, alignItems: 'center' }}>
      {floral ? (
        <View style={{ position: 'absolute', top: -6, left: size * 0.28 }} pointerEvents="none">
          <Svg width={size * 0.46} height={size * 0.46} viewBox="-40 -40 80 80">
            <BloomGroup petal={petal} ink={ink} />
          </Svg>
        </View>
      ) : null}
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <Defs>
          <ClipPath id={clipId}>
            <Path d={HEART} />
          </ClipPath>
        </Defs>
        <Path d={HEART} fill="#E7E0D4" stroke={ink} strokeWidth={1.2} />
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
      </Svg>
      {floral ? (
        <View style={{ position: 'absolute', bottom: 8, right: 0 }} pointerEvents="none">
          <Svg width={36} height={36} viewBox="-20 -20 40 40">
            <LeafGroup ink={ink} leaf={leaf} />
          </Svg>
        </View>
      ) : null}
    </View>
  );
}
