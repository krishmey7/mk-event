/**
 * ──────────────────────────────────────────────────────────────
 *  MK EVENT — UI / GlowBackground
 * ──────────────────────────────────────────────────────────────
 *  Fond d'ambiance : orbes champagne très discrets (quiet luxury).
 *
 *  • Le flou est simulé par empilement de disques concentriques
 *    translucides — 100 % cross-platform (iOS / Android / Web),
 *    sans dépendance native (ni expo-blur, ni linear-gradient).
 *  • pointerEvents='none' : les orbes n'interceptent aucune
 *    interaction ; overflow 'hidden' : aucun scroll fantôme web.
 *  • Rendre en fond absolu dans un conteneur positionné :
 *    <View style={{flex:1}}><GlowBackground preset='auth' />…</View>
 * ──────────────────────────────────────────────────────────────
 */

import { memo } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { brandColors } from '@/constants/theme';

/** Un orbe = position + taille + couleur + intensité (0 → invisible). */
export interface GlowOrbSpec {
  top: number;
  left?: number;
  right?: number;
  size: number;
  color?: string;
  intensity?: number;
}

export type GlowPreset = 'landing' | 'auth' | 'soft';

export interface GlowBackgroundProps {
  preset?: GlowPreset;
  /** Orbes personnalisés — remplace le preset. */
  orbs?: GlowOrbSpec[];
  style?: StyleProp<ViewStyle>;
}

const DEFAULT_ORBS: Record<GlowPreset, GlowOrbSpec[]> = {
  landing: [
    { top: -120, left: -160, size: 420, color: brandColors.gold, intensity: 0.35 },
    { top: 520, right: -180, size: 380, color: brandColors.goldSoft, intensity: 0.28 },
  ],
  auth: [
    { top: -140, right: -160, size: 360, color: brandColors.gold, intensity: 0.22 },
  ],
  soft: [
    { top: -100, right: -140, size: 320, color: brandColors.goldSoft, intensity: 0.2 },
  ],
};

/** Disques concentriques translucides simulant un halo flouté. */
const GlowOrb = memo(function GlowOrb({ spec }: { spec: GlowOrbSpec }) {
  const intensity = spec.intensity ?? 1;
  const layers = [
    { scale: 1, opacity: 0.045 * intensity },
    { scale: 0.78, opacity: 0.06 * intensity },
    { scale: 0.56, opacity: 0.075 * intensity },
    { scale: 0.36, opacity: 0.09 * intensity },
  ];

  return (
    <View
      pointerEvents="none"
      style={[
        styles.orb,
        { top: spec.top, width: spec.size, height: spec.size },
        spec.left !== undefined ? { left: spec.left } : null,
        spec.right !== undefined ? { right: spec.right } : null,
      ]}
    >
      {layers.map((layer, index) => {
        const diameter = Math.round(spec.size * layer.scale);
        const offset = Math.round((spec.size - diameter) / 2);
        return (
          <View
            key={index}
            style={{
              position: 'absolute',
              top: offset,
              left: offset,
              width: diameter,
              height: diameter,
              borderRadius: diameter / 2,
              backgroundColor: spec.color ?? brandColors.gold,
              opacity: layer.opacity,
            }}
          />
        );
      })}
    </View>
  );
});

export function GlowBackground({ preset = 'landing', orbs, style }: GlowBackgroundProps) {
  const resolvedOrbs = orbs ?? DEFAULT_ORBS[preset];

  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.container, style]}>
      {resolvedOrbs.map((spec, index) => (
        <GlowOrb key={index} spec={spec} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { overflow: 'hidden' },
  orb: { position: 'absolute' },
});
