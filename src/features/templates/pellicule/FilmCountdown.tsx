/**
 * Compte à rebours Pellicule — cases encadrées, comme la bande photo.
 */

import { type ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { PelliculeFlourish } from './chrome';

function FilmCell({
  value,
  label,
  ink,
  frame,
  paper,
  large,
}: {
  value: string;
  label: string;
  ink: string;
  frame: string;
  paper: string;
  large?: boolean;
}) {
  const size = large ? 120 : 72;
  return (
    <View style={styles.unit}>
      <View
        style={[
          styles.cell,
          {
            width: size,
            height: size,
            borderColor: frame,
            backgroundColor: paper,
          },
        ]}
      >
        <Text style={[styles.value, { color: ink, fontSize: large ? 42 : 26 }]}>{value}</Text>
      </View>
      <Text style={[styles.label, { color: ink }]}>{label}</Text>
    </View>
  );
}

export function FilmCountdown({
  days,
  hours,
  minutes,
  seconds,
  ink,
  frame,
  paper,
  footer,
}: {
  days: number;
  hours: string;
  minutes: string;
  seconds: string;
  ink: string;
  frame: string;
  paper: string;
  footer?: ReactNode;
}) {
  return (
    <View style={[styles.fill, { backgroundColor: paper }]}>
      <View style={styles.body}>
        <PelliculeFlourish color={ink} width={180} />
        <Text style={[styles.kicker, { color: ink }]}>LE GRAND JOUR</Text>
        <Text style={[styles.script, { color: ink }]}>dans</Text>

        <FilmCell value={String(days)} label="Jours" ink={ink} frame={frame} paper={paper} large />

        <View style={styles.row}>
          <FilmCell value={hours} label="Heures" ink={ink} frame={frame} paper={paper} />
          <FilmCell value={minutes} label="Minutes" ink={ink} frame={frame} paper={paper} />
          <FilmCell value={seconds} label="Secondes" ink={ink} frame={frame} paper={paper} />
        </View>

        {footer}
        <PelliculeFlourish color={ink} width={180} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { width: '100%', minHeight: 420, overflow: 'hidden' },
  body: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 36,
    paddingHorizontal: 20,
    gap: 14,
  },
  kicker: {
    fontFamily: 'CormorantGaramond_600SemiBold',
    fontSize: 12,
    letterSpacing: 3.2,
  },
  script: {
    fontFamily: 'GreatVibes_400Regular',
    fontSize: 34,
    lineHeight: 40,
  },
  row: { flexDirection: 'row', gap: 12, marginTop: 4 },
  unit: { alignItems: 'center', gap: 8 },
  cell: {
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  value: {
    fontFamily: 'CormorantGaramond_600SemiBold',
    textAlign: 'center',
  },
  label: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 10,
    letterSpacing: 1.6,
    textTransform: 'uppercase',
  },
});
