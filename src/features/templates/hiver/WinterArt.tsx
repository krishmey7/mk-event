/**
 * Décors Hiver — flocons, arcs et brindilles de coin.
 */

import { StyleSheet, View } from 'react-native';

import { SnowflakeSvg } from './WinterSnowflake';

export { WinterHexFrame as WinterHexPhoto } from './WinterPhotoFrames';
export { SnowflakeSvg } from './WinterSnowflake';

/** Décors de page — flocons + grands arcs discrets + brindilles de coin. */
export function WinterPageDecor({
  gold,
  frost,
  compact = false,
}: {
  gold: string;
  frost: string;
  compact?: boolean;
}) {
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {/* Grands arcs dorés (fond, comme l’affiche) */}
      <View
        style={[
          styles.sweep,
          {
            borderColor: gold,
            width: compact ? 220 : 320,
            height: compact ? 220 : 320,
            top: compact ? -90 : -120,
            left: compact ? -70 : -90,
            opacity: 0.22,
          },
        ]}
      />
      <View
        style={[
          styles.sweep,
          {
            borderColor: gold,
            width: compact ? 200 : 280,
            height: compact ? 200 : 280,
            bottom: compact ? -80 : -100,
            right: compact ? -60 : -80,
            opacity: 0.18,
          },
        ]}
      />

      <View style={[styles.flake, { top: compact ? 52 : 72, left: compact ? 10 : 16 }]}>
        <SnowflakeSvg color={frost} size={compact ? 20 : 30} />
      </View>
      <View style={[styles.flake, { top: compact ? 88 : 128, right: compact ? 12 : 18 }]}>
        <SnowflakeSvg color={frost} size={compact ? 14 : 20} />
      </View>
      <View style={[styles.flake, { bottom: compact ? 100 : 140, left: compact ? 14 : 20 }]}>
        <SnowflakeSvg color={frost} size={compact ? 16 : 24} />
      </View>
      <View style={[styles.flake, { bottom: compact ? 72 : 100, right: compact ? 16 : 24 }]}>
        <SnowflakeSvg color={frost} size={compact ? 12 : 18} />
      </View>

      <CornerBotanical frost={frost} gold={gold} compact={compact} corner="bl" />
      <CornerBotanical frost={frost} gold={gold} compact={compact} corner="br" />
      <CornerBotanical frost={frost} gold={gold} compact={compact} corner="tl" />
    </View>
  );
}

function CornerBotanical({
  frost,
  gold,
  compact,
  corner,
}: {
  frost: string;
  gold: string;
  compact: boolean;
  corner: 'bl' | 'br' | 'tl';
}) {
  const scale = compact ? 0.65 : 1;
  const pos =
    corner === 'bl'
      ? { left: 0, bottom: compact ? 16 : 28 }
      : corner === 'br'
        ? { right: 0, bottom: compact ? 16 : 28 }
        : { left: 0, top: compact ? 120 : 180 };
  const flip = corner === 'br';

  return (
    <View
      style={[
        styles.cornerBotanical,
        pos,
        { transform: [{ scale }, ...(flip ? [{ scaleX: -1 as const }] : [])] },
      ]}
    >
      <View style={[styles.botStem, { borderColor: frost }]} />
      <View style={[styles.botStem2, { borderColor: frost }]} />
      <View style={[styles.botLeaf, { borderColor: gold }]} />
      <View style={[styles.botLeaf, { borderColor: gold, top: 18, left: 14, transform: [{ rotate: '35deg' }] }]} />
    </View>
  );
}

export { WinterHexThumb } from './WinterPhotoFrames';

const styles = StyleSheet.create({
  flake: { position: 'absolute', opacity: 0.75 },
  sweep: {
    position: 'absolute',
    borderWidth: 1,
    borderRadius: 999,
  },
  cornerBotanical: { position: 'absolute', width: 56, height: 72 },
  botStem: {
    position: 'absolute',
    left: 8,
    bottom: 0,
    width: 1,
    height: 52,
    backgroundColor: 'transparent',
    borderLeftWidth: 1,
    opacity: 0.5,
  },
  botStem2: {
    position: 'absolute',
    left: 8,
    bottom: 20,
    width: 28,
    height: 1,
    borderTopWidth: 1,
    opacity: 0.45,
    transform: [{ rotate: '-35deg' }],
  },
  botLeaf: {
    position: 'absolute',
    left: 22,
    top: 8,
    width: 10,
    height: 16,
    borderWidth: 1,
    borderRadius: 8,
    opacity: 0.75,
  },
});
