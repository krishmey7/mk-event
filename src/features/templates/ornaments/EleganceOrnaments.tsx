/**
 * Ornements Élégance — feuillage SVG (sans Animated opacity :
 * l’anim sur calque plein écran créait des artefacts GPU sur Android).
 */

import { StyleSheet, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

export function EleganceOrnaments({
  accent,
  compact = false,
}: {
  accent: string;
  compact?: boolean;
}) {
  const size = compact ? 56 : 88;

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <View style={[styles.corner, styles.tl, { width: size, height: size }]}>
        <LeafSpray color={accent} size={size} flip />
      </View>
      <View style={[styles.corner, styles.tr, { width: size, height: size }]}>
        <LeafSpray color={accent} size={size} />
      </View>
      <View style={[styles.corner, styles.bl, { width: size * 0.85, height: size * 0.85 }]}>
        <LeafSpray color={accent} size={size * 0.85} flip rotate={180} />
      </View>
      <View style={[styles.corner, styles.br, { width: size * 0.85, height: size * 0.85 }]}>
        <LeafSpray color={accent} size={size * 0.85} rotate={180} />
      </View>
    </View>
  );
}

function LeafSpray({
  color,
  size,
  flip,
  rotate = 0,
}: {
  color: string;
  size: number;
  flip?: boolean;
  rotate?: number;
}) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 88 88"
      style={{ transform: [{ scaleX: flip ? -1 : 1 }, { rotate: `${rotate}deg` }] }}
    >
      <Path
        d="M12 70 C28 52 38 40 44 18 C50 40 60 52 76 70 C58 66 48 64 44 64 C40 64 30 66 12 70 Z"
        fill={color}
        opacity={0.22}
      />
      <Path
        d="M22 58 C34 46 40 36 44 22 C48 36 54 46 66 58"
        stroke={color}
        strokeWidth={1.4}
        fill="none"
        opacity={0.55}
      />
      <Path
        d="M30 64 C36 54 40 46 44 34 C48 46 52 54 58 64"
        stroke={color}
        strokeWidth={1.1}
        fill="none"
        opacity={0.4}
      />
    </Svg>
  );
}

const styles = StyleSheet.create({
  corner: { position: 'absolute' },
  tl: { top: 6, left: 4 },
  tr: { top: 6, right: 4 },
  bl: { bottom: 10, left: 6 },
  br: { bottom: 10, right: 6 },
});
