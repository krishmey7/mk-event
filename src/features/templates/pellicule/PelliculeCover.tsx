/**
 * Couverture Pellicule — bande photo à gauche, panneau calligraphié à droite.
 */

import { type ReactNode, useMemo } from 'react';
import { Image, Platform, StyleSheet, Text, View } from 'react-native';

import { fillGuestNameToken } from '@/features/editor/guestNameToken';
import type { Guest } from '@/features/invitation/types';
import type { TemplateColors } from '@/features/templates/elegance/themes';
import { PelliculeFlourish } from './chrome';
import { PELLICULE_IMAGES } from './data';

function splitCouple(couple: string): { left: string; right: string } | null {
  const parts = couple.split(/\s*&\s*/);
  if (parts.length === 2 && parts[0].trim() && parts[1].trim()) {
    return { left: parts[0].trim(), right: parts[1].trim() };
  }
  return null;
}

function paperWeb(paper: string) {
  if (Platform.OS !== 'web') return { backgroundColor: paper };
  return {
    backgroundColor: paper,
    backgroundImage:
      'radial-gradient(ellipse 100% 70% at 70% 40%, rgba(255,255,255,0.5) 0%, transparent 60%), linear-gradient(160deg, rgba(0,0,0,0.035) 0%, transparent 45%, rgba(0,0,0,0.04) 100%)',
  } as const;
}

export function PelliculeCover({
  colors,
  guest,
  title,
  dateLabel,
  timeLabel,
  couple,
  guestSentence,
  venueName,
  stripPhotos,
  hint,
}: {
  colors: TemplateColors;
  guest: Guest;
  title: string;
  dateLabel: string;
  timeLabel?: string;
  couple: string;
  guestSentence: string;
  venueName?: string;
  stripPhotos?: string[];
  hint?: ReactNode;
}) {
  const paper = colors.bg;
  const ink = colors.text;
  const frame = colors.primary;
  const muted = colors.textMuted;
  const names = splitCouple(couple);
  const welcome = fillGuestNameToken(guestSentence, guest.firstName).trim();
  const kicker = (title || 'RÉSERVEZ LA DATE!').trim().toUpperCase();
  const time = (timeLabel || '').trim();
  const meta = [dateLabel.trim(), time].filter(Boolean).join('  |  ');

  const strip = useMemo(() => {
    const source = [
      ...(stripPhotos ?? []),
      ...PELLICULE_IMAGES.strip,
    ].filter(Boolean);
    const unique = Array.from(new Set(source));
    while (unique.length < 4) unique.push(PELLICULE_IMAGES.strip[unique.length % 4]);
    return unique.slice(0, 4);
  }, [stripPhotos]);

  return (
    <View style={[styles.fill, { backgroundColor: paper }]}>
      <View style={[styles.strip, { backgroundColor: frame, borderColor: frame }]}>
        {strip.map((uri, index) => (
          <View
            key={`${uri}-${index}`}
            style={[
              styles.cell,
              { borderColor: frame, borderBottomWidth: index === strip.length - 1 ? 0 : 3 },
            ]}
          >
            <Image source={{ uri }} style={StyleSheet.absoluteFill} resizeMode="cover" />
          </View>
        ))}
      </View>

      <View style={[styles.panel, paperWeb(paper)]}>
        <View style={[styles.copy, { paddingBottom: hint ? 72 : 20 }]}>
          <PelliculeFlourish color={ink} width={200} />

          <Text style={[styles.kicker, { color: ink }]}>{kicker}</Text>

          {names ? (
            <View style={styles.namesBlock}>
              <Text style={[styles.name, { color: ink }]}>{names.left}</Text>
              <Text style={[styles.amp, { color: ink }]}>&</Text>
              <Text style={[styles.name, { color: ink }]}>{names.right}</Text>
            </View>
          ) : (
            <Text style={[styles.name, { color: ink }]}>{couple.trim()}</Text>
          )}

          {meta ? <Text style={[styles.meta, { color: ink }]}>{meta}</Text> : null}
          {venueName?.trim() ? (
            <Text style={[styles.venue, { color: ink }]}>{venueName.trim().toUpperCase()}</Text>
          ) : null}

          {welcome ? (
            <Text style={[styles.welcome, { color: muted }]}>{welcome}</Text>
          ) : null}

          <PelliculeFlourish color={ink} width={200} />
        </View>

        {hint ? <View style={styles.hint}>{hint}</View> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1, flexDirection: 'row', overflow: 'hidden' },
  strip: {
    width: '32%',
    maxWidth: 150,
    borderRightWidth: 3,
    overflow: 'hidden',
  },
  cell: {
    flex: 1,
    borderBottomWidth: 3,
    overflow: 'hidden',
  },
  panel: {
    flex: 1,
    position: 'relative',
  },
  copy: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
    gap: 12,
  },
  kicker: {
    fontFamily: 'CormorantGaramond_600SemiBold',
    fontSize: 13,
    letterSpacing: 3.4,
    textAlign: 'center',
    marginTop: 6,
  },
  namesBlock: { alignItems: 'center', marginVertical: 4 },
  name: {
    fontFamily: 'GreatVibes_400Regular',
    fontSize: 48,
    lineHeight: 56,
    textAlign: 'center',
  },
  amp: {
    fontFamily: 'GreatVibes_400Regular',
    fontSize: 28,
    lineHeight: 32,
    marginVertical: -6,
  },
  meta: {
    fontFamily: 'CormorantGaramond_500Medium',
    fontSize: 15,
    letterSpacing: 1.2,
    textAlign: 'center',
    marginTop: 4,
  },
  venue: {
    fontFamily: 'CormorantGaramond_600SemiBold',
    fontSize: 13,
    letterSpacing: 2.8,
    textAlign: 'center',
  },
  welcome: {
    fontFamily: 'CormorantGaramond_400Regular_Italic',
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    paddingHorizontal: 8,
    marginTop: 4,
  },
  hint: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 8,
    alignItems: 'center',
  },
});
