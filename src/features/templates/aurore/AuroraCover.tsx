/**
 * Couverture Aurore — portrait à gauche, panneau calligraphié à droite.
 * Le fondu couvre toute la hauteur du joint. Sous le titre : accueil nominatif.
 * Date et lieu restent en bas du panneau.
 */

import { type ReactNode, useRef, useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

import { fillGuestNameToken } from '@/features/editor/guestNameToken';
import type { CouplePhoto, Guest } from '@/features/invitation/types';
import type { TemplateColors } from '@/features/templates/elegance/themes';
import { GoldText } from './chrome';

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
  guest,
  title,
  dateLabel,
  couple,
  guestSentence,
  venueName,
  venueStreet,
  venueCity,
  dressCode,
  hint,
}: {
  colors: TemplateColors;
  couplePhoto: CouplePhoto;
  guest: Guest;
  title: string;
  dateLabel: string;
  couple: string;
  guestSentence: string;
  venueName?: string;
  venueStreet?: string;
  venueCity?: string;
  dressCode?: string;
  hint?: ReactNode;
}) {
  const gradId = useRef(`auroreFade-${Math.random().toString(36).slice(2, 8)}`).current;
  const [box, setBox] = useState({ w: 0, h: 0 });
  const [photoW, setPhotoW] = useState(0);
  const panel = colors.bg;
  const gold = colors.accent;
  const muted = colors.textMuted;
  const cream = colors.text;
  const panelW = Math.max(120, box.w - photoW);
  const scale = Math.min(1.15, Math.max(0.92, panelW / 170));
  const stacked = splitTitle(title);
  const welcome = fillGuestNameToken(guestSentence, guest.firstName).trim();
  const place = [venueStreet?.trim(), venueCity?.trim()].filter(Boolean);
  const dress = (dressCode ?? '').trim();
  const fadeW = photoW > 0 ? Math.round(photoW * 0.62) : 0;

  return (
    <View
      style={[styles.fill, { backgroundColor: panel }]}
      onLayout={(event) => {
        const next = {
          w: Math.round(event.nativeEvent.layout.width),
          h: Math.round(event.nativeEvent.layout.height),
        };
        if (next.w !== box.w || next.h !== box.h) setBox(next);
      }}
    >
      <View
        style={styles.photoCol}
        onLayout={(event) => {
          const next = Math.round(event.nativeEvent.layout.width);
          if (next > 0 && next !== photoW) setPhotoW(next);
        }}
      >
        {couplePhoto.uri ? (
          <Image source={{ uri: couplePhoto.uri }} style={StyleSheet.absoluteFill} resizeMode="cover" />
        ) : (
          <View style={[StyleSheet.absoluteFill, { backgroundColor: panel }]} />
        )}
        {fadeW > 0 && box.h > 0 ? (
          <Svg
            width={fadeW}
            height={box.h}
            style={styles.fade}
            pointerEvents="none"
          >
            <Defs>
              <LinearGradient id={gradId} x1="0" y1="0" x2="1" y2="0">
                <Stop offset="0" stopColor={panel} stopOpacity="0" />
                <Stop offset="0.42" stopColor={panel} stopOpacity="0.22" />
                <Stop offset="0.72" stopColor={panel} stopOpacity="0.7" />
                <Stop offset="1" stopColor={panel} stopOpacity="1" />
              </LinearGradient>
            </Defs>
            <Rect x="0" y="0" width={fadeW} height={box.h} fill={`url(#${gradId})`} />
          </Svg>
        ) : null}
      </View>

      <View style={styles.panel}>
        <View style={[styles.copy, { paddingHorizontal: 12 * scale, paddingBottom: hint ? 28 : 16 }]}>
          <View style={styles.hero}>
            {stacked ? (
              <View style={styles.scriptBlock}>
                <GoldText gold={gold} style={[styles.scriptBig, { fontSize: 68 * scale, lineHeight: 84 * scale }]}>
                  {stacked.save}
                </GoldText>
                <GoldText
                  gold={gold}
                  style={[styles.scriptMid, { fontSize: 32 * scale, lineHeight: 40 * scale, marginTop: -26 * scale }]}
                >
                  {stacked.mid}
                </GoldText>
                <GoldText
                  gold={gold}
                  style={[styles.scriptBig, { fontSize: 68 * scale, lineHeight: 84 * scale, marginTop: -20 * scale }]}
                >
                  {stacked.date}
                </GoldText>
              </View>
            ) : (
              <GoldText gold={gold} style={[styles.scriptBig, { fontSize: 52 * scale, lineHeight: 58 * scale }]}>
                {title}
              </GoldText>
            )}

            {couple.trim() ? (
              <GoldText
                gold={gold}
                style={[styles.names, { fontSize: 30 * scale, lineHeight: 34 * scale }]}
                numberOfLines={2}
              >
                {couple.trim()}
              </GoldText>
            ) : null}

            <Text style={[styles.welcome, { color: cream, fontSize: 20 * scale, lineHeight: 26 * scale }]}>
              {`Bienvenue, ${guest.firstName}`}
            </Text>
            {welcome ? (
              <Text style={[styles.sentence, { color: cream, fontSize: 16 * scale, lineHeight: 22 * scale }]}>
                {welcome}
              </Text>
            ) : null}
          </View>

          <View style={styles.bottom}>
            {dateLabel.trim() ? (
              <View style={styles.infoRow}>
                <GoldMark gold={gold} ink={panel} icon="calendar-outline" size={20 * scale} />
                <GoldText gold={gold} style={[styles.date, { fontSize: 16 * scale }]}>{dateLabel.trim()}</GoldText>
              </View>
            ) : null}

            {venueName?.trim() ? (
              <View style={styles.venue}>
                <View style={styles.infoRow}>
                  <GoldMark gold={gold} ink={panel} icon="business-outline" size={20 * scale} />
                  <GoldText gold={gold} style={[styles.venueName, { fontSize: 18 * scale }]}>{venueName.trim()}</GoldText>
                </View>
                {place.map((line) => (
                  <Text key={line} style={[styles.address, { color: muted, fontSize: 14 * scale }]}>
                    {line}
                  </Text>
                ))}
              </View>
            ) : null}

            {dress ? (
              <Text style={[styles.dress, { color: muted, fontSize: 14 * scale }]}>{dress}</Text>
            ) : null}
          </View>
        </View>
      </View>

      {hint ? <View style={styles.hint}>{hint}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1, flexDirection: 'row', overflow: 'hidden' },
  photoCol: { flex: 1, overflow: 'hidden', position: 'relative' },
  fade: { position: 'absolute', right: 0, top: 0 },
  panel: { flex: 1 },
  copy: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 18,
  },
  hero: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10, width: '100%' },
  scriptBlock: { alignItems: 'center', paddingVertical: 10, overflow: 'visible' },
  scriptBig: { fontFamily: 'GreatVibes_400Regular', textAlign: 'center' },
  scriptMid: { fontFamily: 'GreatVibes_400Regular', textAlign: 'center' },
  names: {
    fontFamily: 'CormorantGaramond_500Medium',
    textAlign: 'center',
    marginTop: 6,
  },
  welcome: {
    fontFamily: 'CormorantGaramond_400Regular_Italic',
    textAlign: 'center',
    marginTop: 4,
  },
  sentence: {
    fontFamily: 'CormorantGaramond_400Regular',
    textAlign: 'center',
    paddingHorizontal: 4,
  },
  bottom: { alignItems: 'center', gap: 8, width: '100%', marginTop: 16 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 6 },
  mark: { alignItems: 'center', justifyContent: 'center' },
  date: {
    fontFamily: 'CormorantGaramond_600SemiBold',
    textAlign: 'center',
    flexShrink: 1,
  },
  venue: { alignItems: 'center', gap: 2 },
  venueName: {
    fontFamily: 'CormorantGaramond_600SemiBold',
    textAlign: 'center',
    flexShrink: 1,
  },
  address: {
    fontFamily: 'CormorantGaramond_400Regular',
    textAlign: 'center',
  },
  dress: {
    fontFamily: 'CormorantGaramond_400Regular_Italic',
    textAlign: 'center',
    marginTop: 4,
  },
  hint: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 4,
    alignItems: 'center',
  },
});
