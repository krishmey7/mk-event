/**
 * Compte à rebours Aurore — losanges dorés, à la place des pastilles rondes.
 */

import { type ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg';

function GoldDiamond({
  size,
  gold,
  value,
  label,
}: {
  size: number;
  gold: string;
  value: string;
  label: string;
}) {
  const outer = size * 0.72;
  const inner = size * 0.56;
  return (
    <View style={[styles.unit, { width: size + 8 }]}>
      <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
        <View
          style={[
            styles.diamond,
            {
              width: outer,
              height: outer,
              borderColor: gold,
              borderWidth: 1.5,
            },
          ]}
        />
        <View
          style={[
            styles.diamond,
            {
              width: inner,
              height: inner,
              borderColor: gold,
              borderWidth: 0.6,
              opacity: 0.65,
            },
          ]}
        />
        <Text
          style={[
            styles.value,
            { color: gold, fontSize: size * 0.26, lineHeight: size * 0.32 },
          ]}
        >
          {value}
        </Text>
      </View>
      <Text style={[styles.unitLabel, { color: gold }]}>{label}</Text>
    </View>
  );
}

export function SealCountdown({
  days,
  hours,
  minutes,
  seconds,
  gold,
  panel,
  footer,
}: {
  days: number;
  hours: string;
  minutes: string;
  seconds: string;
  gold: string;
  panel: string;
  footer?: ReactNode;
}) {
  return (
    <View style={[styles.fill, { backgroundColor: panel }]}>
      <Svg style={StyleSheet.absoluteFill} pointerEvents="none">
        <Defs>
          <RadialGradient id="auroreSealGlow" cx="50%" cy="42%" rx="48%" ry="36%">
            <Stop offset="0" stopColor="#FFFFFF" stopOpacity="0.1" />
            <Stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
          </RadialGradient>
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" fill="url(#auroreSealGlow)" />
      </Svg>

      <View style={styles.body}>
        <Text style={[styles.kicker, { color: gold }]}>LE GRAND JOUR</Text>
        <Text style={[styles.script, { color: gold }]}>dans</Text>

        <GoldDiamond size={132} gold={gold} value={String(days)} label="Jours" />

        <View style={styles.row}>
          <GoldDiamond size={78} gold={gold} value={hours} label="Heures" />
          <GoldDiamond size={78} gold={gold} value={minutes} label="Minutes" />
          <GoldDiamond size={78} gold={gold} value={seconds} label="Secondes" />
        </View>

        {footer}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1, overflow: 'hidden' },
  body: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingBottom: 8,
  },
  kicker: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
    letterSpacing: 3.2,
  },
  script: {
    fontFamily: 'GreatVibes_400Regular',
    fontSize: 36,
    lineHeight: 40,
    marginTop: -4,
    marginBottom: 4,
  },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 6, marginTop: 8 },
  unit: { alignItems: 'center' },
  diamond: {
    position: 'absolute',
    transform: [{ rotate: '45deg' }],
  },
  value: {
    fontFamily: 'CormorantGaramond_600SemiBold',
  },
  unitLabel: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 8,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    marginTop: 2,
  },
});
