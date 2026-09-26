/**
 * Couverture Aurore — portrait plein cadre à gauche, panneau calligraphié à droite.
 * Calquée sur l’affiche émeraude & or (Save / The / Date).
 */

import { type ReactNode, useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Defs, LinearGradient, RadialGradient, Rect, Stop } from 'react-native-svg';

import type { CouplePhoto } from '@/features/invitation/types';
import type { TemplateColors } from '@/features/templates/elegance/themes';

import { AURORE_WEDDING } from './data';

function splitTitle(title: string): { save: string; mid: string; date: string } | null {
  const parts = title.trim().split(/\s+/);
  if (parts.length === 3 && /^save$/i.test(parts[0]) && /^the$/i.test(parts[1])) {
    return { save: 'Save', mid: 'The', date: parts[2] || 'Date' };
  }
  return null;
}

function GoldMark({
  gold,
  ink,
  icon,
  size,
}: {
  gold: string;
  ink: string;
  icon: keyof typeof Ionicons.glyphMap;
  size: number;
}) {
  return (
    <View style={[styles.mark, { width: size, height: size, borderRadius: size / 2, backgroundColor: gold }]}>
      <Ionicons name={icon} size={size * 0.52} color={ink} />
    </View>
  );
}

export function AuroraCover({
  colors,
  couplePhoto,
  title,
  dateLabel,
  couple,
  kicker,
  venueName,
  venueStreet,
  venueCity,
  dressCode,
  hint,
}: {
  colors: TemplateColors;
  couplePhoto: CouplePhoto;
  title: string;
  dateLabel: string;
  couple: string;
  kicker?: string;
  venueName?: string;
  venueStreet?: string;
  venueCity?: string;
  dressCode?: string;
  hint?: ReactNode;
}) {
  const [width, setWidth] = useState(390);
  const panel = colors.bg;
  const gold = colors.accent;
  const cream = colors.text;
  const muted = colors.textMuted;
  const ink = panel;
  const panelW = Math.max(120, width * 0.44);
  const scale = Math.min(1.2, Math.max(0.82, panelW / 188));
  const stacked = splitTitle(title);
  const tagline = (kicker ?? '').trim();
  const closing = (dressCode ?? '').trim() || AURORE_WEDDING.closing;
  const place = [venueStreet?.trim(), venueCity?.trim()].filter(Boolean);

  return (
    <View
      style={[styles.fill, { backgroundColor: panel }]}
      onLayout={(event) => {
        const next = Math.round(event.nativeEvent.layout.width);
        if (next > 0 && next !== width) setWidth(next);
      }}
    >
      <View style={styles.photoCol}>
        {couplePhoto.uri ? (
          <Image source={{ uri: couplePhoto.uri }} style={StyleSheet.absoluteFill} resizeMode="cover" />
        ) : (
          <View style={[StyleSheet.absoluteFill, { backgroundColor: ink }]} />
        )}
        <Svg style={styles.fade} pointerEvents="none">
          <Defs>
            <LinearGradient id="auroreFade" x1="0" y1="0" x2="1" y2="0">
              <Stop offset="0" stopColor={panel} stopOpacity="0" />
              <Stop offset="0.55" stopColor={panel} stopOpacity="0.35" />
              <Stop offset="1" stopColor={panel} stopOpacity="1" />
            </LinearGradient>
          </Defs>
          <Rect x="0" y="0" width="100%" height="100%" fill="url(#auroreFade)" />
        </Svg>
      </View>

      <View style={styles.panel}>
        <Svg style={StyleSheet.absoluteFill} pointerEvents="none">
          <Defs>
            <RadialGradient id="auroreGlow" cx="48%" cy="38%" rx="70%" ry="42%">
              <Stop offset="0" stopColor="#FFFFFF" stopOpacity="0.07" />
              <Stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
            </RadialGradient>
          </Defs>
          <Rect x="0" y="0" width="100%" height="100%" fill="url(#auroreGlow)" />
        </Svg>

        <View style={[styles.copy, { paddingHorizontal: 10 * scale, gap: 8 * scale }]}>
          {stacked ? (
            <View style={styles.scriptBlock}>
              <Text style={[styles.scriptBig, { color: gold, fontSize: 54 * scale, lineHeight: 58 * scale }]}>
                {stacked.save}
              </Text>
              <Text
                style={[
                  styles.scriptMid,
                  { color: gold, fontSize: 26 * scale, lineHeight: 28 * scale, marginTop: -16 * scale },
                ]}
              >
                {stacked.mid}
              </Text>
              <Text
                style={[
                  styles.scriptBig,
                  { color: gold, fontSize: 54 * scale, lineHeight: 58 * scale, marginTop: -12 * scale },
                ]}
              >
                {stacked.date}
              </Text>
            </View>
          ) : (
            <Text style={[styles.scriptBig, { color: gold, fontSize: 40 * scale, lineHeight: 46 * scale }]}>
              {title}
            </Text>
          )}

          <Text
            style={[styles.names, { color: cream, fontSize: 26 * scale, lineHeight: 30 * scale }]}
            adjustsFontSizeToFit
            numberOfLines={2}
          >
            {couple}
          </Text>

          {tagline ? (
            <Text style={[styles.tagline, { color: muted, fontSize: 12 * scale }]}>{tagline}</Text>
          ) : null}

          <View style={[styles.spark, { backgroundColor: gold }]} />

          {dateLabel.trim() ? (
            <View style={styles.infoRow}>
              <GoldMark gold={gold} ink={ink} icon="calendar-outline" size={18 * scale} />
              <Text style={[styles.date, { color: gold, fontSize: 11 * scale }]}>
                {dateLabel.trim().toUpperCase()}
              </Text>
            </View>
          ) : null}

          {venueName?.trim() ? (
            <View style={styles.venue}>
              <View style={styles.infoRow}>
                <GoldMark gold={gold} ink={ink} icon="business-outline" size={18 * scale} />
                <Text style={[styles.venueName, { color: cream, fontSize: 15 * scale }]}>{venueName.trim()}</Text>
              </View>
              {place.map((line) => (
                <Text key={line} style={[styles.address, { color: muted, fontSize: 11 * scale }]}>
                  {line}
                </Text>
              ))}
            </View>
          ) : null}

          <View style={{ height: 6 * scale }} />

          <Text style={[styles.rsvp, { color: gold, fontSize: 11 * scale }]}>RSVP</Text>
          <Text style={[styles.contact, { color: muted, fontSize: 11 * scale }]}>{AURORE_WEDDING.rsvpEmail}</Text>
          <Text style={[styles.contact, { color: muted, fontSize: 11 * scale }]}>{AURORE_WEDDING.rsvpSite}</Text>

          <Text style={[styles.closing, { color: muted, fontSize: 11 * scale }]}>{closing}</Text>
        </View>
      </View>

      {hint ? <View style={styles.hint}>{hint}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1, flexDirection: 'row', overflow: 'hidden' },
  photoCol: { flex: 1.18, overflow: 'hidden' },
  fade: { position: 'absolute', top: 0, right: 0, bottom: 0, width: '28%' },
  panel: { flex: 1, justifyContent: 'center' },
  copy: { alignItems: 'center', justifyContent: 'center' },
  scriptBlock: { alignItems: 'center' },
  scriptBig: { fontFamily: 'GreatVibes_400Regular', textAlign: 'center' },
  scriptMid: { fontFamily: 'GreatVibes_400Regular', textAlign: 'center' },
  names: {
    fontFamily: 'CormorantGaramond_500Medium',
    textAlign: 'center',
    marginTop: 4,
  },
  tagline: {
    fontFamily: 'CormorantGaramond_400Regular_Italic',
    textAlign: 'center',
  },
  spark: { width: 18, height: 1.5, marginVertical: 4, opacity: 0.9 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 8 },
  mark: { alignItems: 'center', justifyContent: 'center' },
  date: {
    fontFamily: 'CormorantGaramond_600SemiBold',
    letterSpacing: 0.6,
    flexShrink: 1,
  },
  venue: { alignItems: 'center', gap: 2, marginTop: 8 },
  venueName: {
    fontFamily: 'CormorantGaramond_600SemiBold',
    textAlign: 'center',
    flexShrink: 1,
  },
  address: {
    fontFamily: 'CormorantGaramond_400Regular',
    textAlign: 'center',
  },
  rsvp: {
    fontFamily: 'CormorantGaramond_600SemiBold',
    letterSpacing: 3,
    marginTop: 8,
  },
  contact: {
    fontFamily: 'CormorantGaramond_400Regular',
    textAlign: 'center',
  },
  closing: {
    fontFamily: 'CormorantGaramond_400Regular_Italic',
    textAlign: 'center',
    marginTop: 10,
  },
  hint: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 6,
    alignItems: 'center',
  },
});
