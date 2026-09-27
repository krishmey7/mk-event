/**
 * Compte à rebours Néon — cœur filigrane, chiffres, alliances.
 */

import { type ReactNode } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

import { NeonHeartOutline } from './chrome';

function Unit({
  value,
  label,
  ink,
  muted,
}: {
  value: string;
  label: string;
  ink: string;
  muted: string;
}) {
  return (
    <View style={styles.unit}>
      <Text style={[styles.value, { color: ink }]}>{value}</Text>
      <Text style={[styles.label, { color: muted }]}>{label}</Text>
    </View>
  );
}

export function HeartCountdown({
  days,
  hours,
  minutes,
  seconds,
  ink,
  gold,
  muted,
  paper,
  ringsUri,
  closing,
  footer,
}: {
  days: number;
  hours: string;
  minutes: string;
  seconds: string;
  ink: string;
  gold: string;
  muted: string;
  paper: string;
  ringsUri?: string;
  closing?: string;
  footer?: ReactNode;
}) {
  return (
    <View style={[styles.fill, { backgroundColor: paper }]}>
      <View style={styles.heartBg} pointerEvents="none">
        <NeonHeartOutline color={gold} size={280} />
      </View>

      <View style={styles.body}>
        <Text style={[styles.kicker, { color: gold }]}>LE COMPTE À REBOURS</Text>
        <Text style={[styles.script, { color: ink }]}>dans</Text>

        <View style={styles.row}>
          <Unit value={String(days)} label="Jours" ink={ink} muted={muted} />
          <Text style={[styles.sep, { color: gold }]}>:</Text>
          <Unit value={hours} label="Heures" ink={ink} muted={muted} />
          <Text style={[styles.sep, { color: gold }]}>:</Text>
          <Unit value={minutes} label="Minutes" ink={ink} muted={muted} />
          <Text style={[styles.sep, { color: gold }]}>:</Text>
          <Unit value={seconds} label="Secondes" ink={ink} muted={muted} />
        </View>

        {ringsUri ? (
          <Image source={{ uri: ringsUri }} style={styles.rings} resizeMode="cover" />
        ) : null}

        {closing ? (
          <Text style={[styles.closing, { color: ink }]}>{closing}</Text>
        ) : null}

        {footer}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: {
    width: '100%',
    minHeight: 440,
    overflow: 'hidden',
    position: 'relative',
  },
  heartBg: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
    gap: 12,
    zIndex: 1,
  },
  kicker: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
    letterSpacing: 3.2,
    textTransform: 'uppercase',
  },
  script: {
    fontFamily: 'Allura_400Regular',
    fontSize: 40,
    lineHeight: 46,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'center',
    gap: 6,
    marginTop: 8,
  },
  unit: { alignItems: 'center', minWidth: 58 },
  value: {
    fontFamily: 'PlayfairDisplay_600SemiBold',
    fontSize: 34,
    lineHeight: 40,
    textAlign: 'center',
  },
  label: {
    fontFamily: 'Inter_500Medium',
    fontSize: 9,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    marginTop: 4,
  },
  sep: {
    fontFamily: 'PlayfairDisplay_600SemiBold',
    fontSize: 28,
    lineHeight: 40,
    marginTop: 2,
  },
  rings: {
    width: 72,
    height: 72,
    borderRadius: 36,
    marginTop: 18,
  },
  closing: {
    fontFamily: 'Allura_400Regular',
    fontSize: 30,
    lineHeight: 36,
    textAlign: 'center',
    marginTop: 10,
  },
});
