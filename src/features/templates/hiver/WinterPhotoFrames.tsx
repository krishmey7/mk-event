/**
 * Cadres photo Hiver — hexagone or épuré + rinceaux discrets.
 */

import { useEffect, useId, useState } from 'react';
import { View } from 'react-native';
import Svg, {
  Circle,
  ClipPath,
  Defs,
  G,
  Image as SvgImage,
  Path,
  Polygon,
} from 'react-native-svg';

import { HIVER_IMAGES } from './data';
import { SnowflakeSvg } from './WinterSnowflake';

const FALLBACK = HIVER_IMAGES.couple;
const RIM = 'rgba(244, 237, 224, 0.85)';

type Pt = { x: number; y: number };

/** Hexagone à plat (bords horizontaux) — comme l’affiche de référence. */
function hexVertices(cx: number, cy: number, r: number, startDeg = 0): Pt[] {
  return Array.from({ length: 6 }, (_, i) => {
    const a = (Math.PI / 180) * (60 * i + startDeg);
    return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
  });
}

function hexPolygon(cx: number, cy: number, r: number, startDeg = 0): string {
  return hexVertices(cx, cy, r, startDeg)
    .map((p) => `${p.x},${p.y}`)
    .join(' ');
}

function heartPath(cx: number, cy: number, w: number, h: number): string {
  const top = cy - h * 0.28;
  return [
    `M ${cx} ${cy + h * 0.36}`,
    `C ${cx - w * 0.5} ${cy + h * 0.04}, ${cx - w * 0.5} ${top}, ${cx - w * 0.24} ${top}`,
    `C ${cx} ${top - h * 0.14}, ${cx} ${top - h * 0.14}, ${cx + w * 0.24} ${top}`,
    `C ${cx + w * 0.5} ${top}, ${cx + w * 0.5} ${cy + h * 0.04}, ${cx} ${cy + h * 0.36}`,
    'Z',
  ].join(' ');
}

/** Double contour hexagonal — net, sans lignes entrecroisées. */
function HexGoldBorder({ cx, cy, r, gold }: { cx: number; cy: number; r: number; gold: string }) {
  return (
    <G>
      <G rotation={-7} origin={`${cx}, ${cy}`}>
        <Polygon
          points={hexPolygon(cx, cy, r + 14)}
          fill="none"
          stroke={gold}
          strokeWidth={0.9}
          opacity={0.32}
        />
      </G>
      <Polygon points={hexPolygon(cx, cy, r + 5)} fill="none" stroke={gold} strokeWidth={1} opacity={0.55} />
    </G>
  );
}

/** Deux rinceaux discrets — gauche et droite, sans surcharge. */
function HexBotanical({ cx, cy, r, gold }: { cx: number; cy: number; r: number; gold: string }) {
  const left = hexVertices(cx, cy, r, 0)[4];
  const right = hexVertices(cx, cy, r, 0)[1];

  return (
    <G stroke={gold} fill="none" strokeLinecap="round" strokeLinejoin="round">
      <Path
        d={`M ${left.x - 22} ${left.y + r * 0.52} C ${left.x - 10} ${left.y + 16}, ${left.x - 2} ${left.y - 2}, ${left.x + 6} ${left.y - r * 0.28}`}
        strokeWidth={1}
        opacity={0.82}
      />
      <Leaf x={left.x - 6} y={left.y + 10} gold={gold} rot={-28} />
      <Leaf x={left.x + 4} y={left.y - r * 0.14} gold={gold} rot={-8} />

      <Path
        d={`M ${right.x + 22} ${right.y + r * 0.18} C ${right.x + 8} ${right.y - 8}, ${right.x - 2} ${right.y - r * 0.32}, ${right.x - 10} ${right.y - r * 0.52}`}
        strokeWidth={1}
        opacity={0.82}
      />
      <Leaf x={right.x + 8} y={right.y - 4} gold={gold} rot={152} />
      <Leaf x={right.x - 4} y={right.y - r * 0.32} gold={gold} rot={178} />
    </G>
  );
}

function Leaf({ x, y, gold, rot }: { x: number; y: number; gold: string; rot: number }) {
  return (
    <G rotation={rot} origin={`${x}, ${y}`}>
      <Path
        d={`M ${x} ${y} C ${x + 6} ${y - 10}, ${x + 9} ${y - 16}, ${x} ${y - 22} C ${x - 9} ${y - 16}, ${x - 6} ${y - 10}, ${x} ${y} Z`}
        stroke={gold}
        strokeWidth={0.85}
        opacity={0.88}
      />
    </G>
  );
}

export function WinterHexFrame({
  uri,
  gold,
  size = 168,
  floral = false,
}: {
  uri: string;
  gold: string;
  size?: number;
  floral?: boolean;
}) {
  const clipId = useId().replace(/:/g, '');
  const pad = floral ? 36 : 28;
  const w = size + pad * 2;
  const h = Math.round(size * 1.06) + pad * 2;
  const cx = w / 2;
  const cy = h / 2;
  const r = size * 0.47;
  const photoClip = hexPolygon(cx, cy, r - 2);
  const [photoUri, setPhotoUri] = useState(uri.trim() || FALLBACK);

  useEffect(() => {
    setPhotoUri(uri.trim() || FALLBACK);
  }, [uri]);

  return (
    <View style={{ width: w, height: h }}>
      <Svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
        <Defs>
          <ClipPath id={clipId}>
            <Polygon points={photoClip} />
          </ClipPath>
        </Defs>

        <HexGoldBorder cx={cx} cy={cy} r={r} gold={gold} />

        {floral ? <HexBotanical cx={cx} cy={cy} r={r} gold={gold} /> : null}

        {photoUri ? (
          <SvgImage
            href={{ uri: photoUri }}
            x={cx - r}
            y={cy - r}
            width={r * 2}
            height={r * 2}
            preserveAspectRatio="xMidYMid slice"
            clipPath={`url(#${clipId})`}
          />
        ) : null}

        <Polygon points={hexPolygon(cx, cy, r - 1)} fill="none" stroke={RIM} strokeWidth={1.2} />
        <Polygon points={hexPolygon(cx, cy, r)} fill="none" stroke={gold} strokeWidth={2.2} />
      </Svg>
    </View>
  );
}

export function WinterCircleFrame({
  uri,
  gold,
  size = 118,
  frost = '#8FAEC4',
  floral = false,
}: {
  uri: string;
  gold: string;
  size?: number;
  frost?: string;
  floral?: boolean;
}) {
  const clipId = useId().replace(/:/g, '');
  const pad = floral ? 28 : 16;
  const w = size + pad * 2;
  const cx = w / 2;
  const cy = w / 2;
  const r = size / 2;
  const [photoUri, setPhotoUri] = useState(uri.trim() || FALLBACK);

  useEffect(() => {
    setPhotoUri(uri.trim() || FALLBACK);
  }, [uri]);

  return (
    <View style={{ width: w, height: w }}>
      <Svg width={w} height={w} viewBox={`0 0 ${w} ${w}`}>
        <Defs>
          <ClipPath id={clipId}>
            <Circle cx={cx} cy={cy} r={r - 6} />
          </ClipPath>
        </Defs>
        <Circle cx={cx} cy={cy} r={r + 10} fill="none" stroke={gold} strokeWidth={0.9} opacity={0.4} />
        <Circle cx={cx} cy={cy} r={r + 4} fill="none" stroke={gold} strokeWidth={1.1} opacity={0.65} />
        {floral
          ? [0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
              <G key={deg} rotation={deg} origin={`${cx}, ${cy}`}>
                <Path
                  d={`M ${cx} ${cy - r - 14} L ${cx} ${cy - r - 2}`}
                  stroke={frost}
                  strokeWidth={1.1}
                  opacity={0.8}
                />
              </G>
            ))
          : null}
        {photoUri ? (
          <SvgImage
            href={{ uri: photoUri }}
            x={cx - r + 5}
            y={cy - r + 5}
            width={r * 2 - 10}
            height={r * 2 - 10}
            preserveAspectRatio="xMidYMid slice"
            clipPath={`url(#${clipId})`}
          />
        ) : null}
        <Circle cx={cx} cy={cy} r={r} fill="none" stroke={gold} strokeWidth={2.2} />
      </Svg>
    </View>
  );
}

export function WinterSoftFrame({
  uri,
  gold,
  width = 148,
  height = 118,
}: {
  uri: string;
  gold: string;
  width?: number;
  height?: number;
}) {
  const clipId = useId().replace(/:/g, '');
  const r = 18;
  const [photoUri, setPhotoUri] = useState(uri.trim() || FALLBACK);

  useEffect(() => {
    setPhotoUri(uri.trim() || FALLBACK);
  }, [uri]);

  const outer = `M ${r} 0 H ${width - r} Q ${width} 0 ${width} ${r} V ${height - r} Q ${width} ${height} ${width - r} ${height} H ${r} Q 0 ${height} 0 ${height - r} V ${r} Q 0 0 ${r} 0 Z`;
  const inner = `M ${r + 2} 2 H ${width - r - 2} Q ${width - 2} 2 ${width - 2} ${r + 2} V ${height - r - 2} Q ${width - 2} ${height - 2} ${width - r - 2} ${height - 2} H ${r + 2} Q 2 ${height - 2} 2 ${height - r - 2} V ${r + 2} Q 2 2 ${r + 2} 2 Z`;

  return (
    <View style={{ width, height }}>
      <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        <Defs>
          <ClipPath id={clipId}>
            <Path d={inner} />
          </ClipPath>
        </Defs>
        {photoUri ? (
          <SvgImage
            href={{ uri: photoUri }}
            width={width}
            height={height}
            preserveAspectRatio="xMidYMid slice"
            clipPath={`url(#${clipId})`}
          />
        ) : null}
        <Path d={outer} fill="none" stroke={gold} strokeWidth={1.4} opacity={0.55} />
        <Path d={outer} fill="none" stroke={gold} strokeWidth={2} />
      </Svg>
    </View>
  );
}

export function WinterHeartFrame({
  uri,
  gold,
  size = 108,
}: {
  uri: string;
  gold: string;
  size?: number;
}) {
  const clipId = useId().replace(/:/g, '');
  const pad = 14;
  const w = size + pad * 2;
  const h = Math.round(size * 0.94) + pad * 2;
  const cx = w / 2;
  const cy = h / 2 + 4;
  const hw = size * 0.46;
  const hh = size * 0.42;
  const shape = heartPath(cx, cy, hw * 2, hh * 2);
  const [photoUri, setPhotoUri] = useState(uri.trim() || FALLBACK);

  useEffect(() => {
    setPhotoUri(uri.trim() || FALLBACK);
  }, [uri]);

  return (
    <View style={{ width: w, height: h }}>
      <Svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
        <Defs>
          <ClipPath id={clipId}>
            <Path d={shape} />
          </ClipPath>
        </Defs>
        <Path
          d={heartPath(cx, cy, hw * 2 + 10, hh * 2 + 10)}
          fill="none"
          stroke={gold}
          strokeWidth={1}
          opacity={0.45}
        />
        {photoUri ? (
          <SvgImage
            href={{ uri: photoUri }}
            x={cx - hw}
            y={cy - hh}
            width={hw * 2}
            height={hw * 2}
            preserveAspectRatio="xMidYMid slice"
            clipPath={`url(#${clipId})`}
          />
        ) : null}
        <Path d={shape} fill="none" stroke={gold} strokeWidth={2.2} />
      </Svg>
    </View>
  );
}

export function WinterHexThumb({
  uri,
  gold,
  size = 52,
}: {
  uri: string;
  gold: string;
  size?: number;
}) {
  const clipId = useId().replace(/:/g, '');
  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.4;
  const pts = hexPolygon(cx, cy, r);

  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <Defs>
        <ClipPath id={clipId}>
          <Polygon points={pts} />
        </ClipPath>
      </Defs>
      {uri ? (
        <SvgImage
          href={{ uri }}
          width={size}
          height={size}
          preserveAspectRatio="xMidYMid slice"
          clipPath={`url(#${clipId})`}
        />
      ) : null}
      <Polygon points={hexPolygon(cx, cy, r + 3)} fill="none" stroke={gold} strokeWidth={0.7} opacity={0.45} />
      <Polygon points={pts} fill="none" stroke={gold} strokeWidth={1.4} />
    </Svg>
  );
}

export function WinterCircleFloralFrame({
  uri,
  gold,
  frost,
  size = 118,
}: {
  uri: string;
  gold: string;
  frost: string;
  size?: number;
}) {
  const pad = 24;
  const w = size + pad * 2;
  return (
    <View style={{ width: w, height: w, alignItems: 'center', justifyContent: 'center' }}>
      {[0, 60, 120, 180, 240, 300].map((deg) => {
        const rad = (deg * Math.PI) / 180;
        const orbit = size / 2 + 14;
        return (
          <View
            key={deg}
            style={{
              position: 'absolute',
              left: w / 2 + Math.sin(rad) * orbit - 7,
              top: w / 2 - Math.cos(rad) * orbit - 7,
            }}
          >
            <SnowflakeSvg color={frost} size={14} />
          </View>
        );
      })}
      <WinterCircleFrame uri={uri} gold={gold} frost={frost} size={size} floral={false} />
    </View>
  );
}
