/**
 * Couverture Aurore — portrait à gauche, panneau calligraphié à droite.
 * Le fondu couvre toute la hauteur du joint. Sous le titre : accueil nominatif.
 * Date et lieu restent en bas du panneau.
 */

import { type ReactNode, useRef, useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Defs, LinearGradient, RadialGradient, Rect, Stop } from 'react-native-svg';

import { fillGuestNameToken } from '@/features/editor/guestNameToken';
import type { CouplePhoto, Guest } from '@/features/invitation/types';
import type { TemplateColors } from '@/features/templates/elegance/themes';
import { GoldText } from './chrome';

function hexChannels(hex: string): [number, number, number] {
  const raw = hex.replace('#', '');
  return [0, 1, 2].map((i) => parseInt(raw.slice(i * 2, i * 2 + 2), 16)) as [number, number, number];
}

function toHex(channels: number[]): string {
  return `#${channels.map((c) => Math.max(0, Math.min(255, Math.round(c))).toString(16).padStart(2, '0')).join('')}`;
}

/** Halo plus clair au centre du panneau, plus sombre vers les bords — comme l’affiche. */
function panelGlow(hex: string): { glow: string; shade: string; deep: string } {
  const [r, g, b] = hexChannels(hex);
  const lift = [0.1, 0.34, 0.12];
  return {
    glow: toHex([r, g, b].map((c, i) => c + (255 - c) * lift[i])),
    shade: toHex([r, g, b].map((c) => c * 0.72)),
    deep: toHex([r, g, b].map((c) => c * 0.42)),
  };
}

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
  const scale = Math.min(1.08, Math.max(0.9, panelW / 190));
  const script = Math.min(52, Math.max(34, (panelW - 20) / 2.2));
  const stacked = splitTitle(title);
  const welcome = fillGuestNameToken(guestSentence, guest.firstName).trim();
  const place = [venueStreet?.trim(), venueCity?.trim()].filter(Boolean);
  const dress = (dressCode ?? '').trim();
  const tones = panelGlow(panel);
  const panelWidth = Math.max(0, box.w - photoW);
  const glowCx = photoW + panelWidth * 0.32;
  const glowCy = box.h * 0.34;

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
      </View>

      {box.h > 0 && photoW > 0 && panelWidth > 0 ? (
        <Svg
          width={box.w}
          height={box.h}
          style={{ position: 'absolute', left: 0, top: 0, zIndex: 1 }}
          pointerEvents="none"
        >
          <Defs>
            <RadialGradient
              id={`${gradId}-glow`}
              cx={glowCx}
              cy={glowCy}
              r={panelWidth * 0.95}
              gradientUnits="userSpaceOnUse"
              gradientTransform={`translate(${glowCx} ${glowCy}) scale(1 ${(box.h * 0.62) / (panelWidth * 0.95)}) translate(${-glowCx} ${-glowCy})`}
            >
              <Stop offset="0" stopColor={tones.glow} />
              <Stop offset="0.4" stopColor={panel} />
              <Stop offset="0.72" stopColor={tones.shade} />
              <Stop offset="1" stopColor={tones.deep} />
            </RadialGradient>
            <LinearGradient
              id={`${gradId}-fade`}
              x1={photoW * 0.32}
              y1="0"
              x2={photoW + 18}
              y2="0"
              gradientUnits="userSpaceOnUse"
            >
              <Stop offset="0" stopColor={tones.glow} stopOpacity="0" />
              <Stop offset="0.42" stopColor={tones.glow} stopOpacity="0.18" />
              <Stop offset="0.72" stopColor={tones.glow} stopOpacity="0.62" />
              <Stop offset="1" stopColor={tones.glow} stopOpacity="1" />
            </LinearGradient>
          </Defs>
          <Rect x={photoW - 20} y="0" width={panelWidth + 20} height={box.h} fill={`url(#${gradId}-glow)`} />
          <Rect x={photoW * 0.32} y="0" width={photoW * 0.68 + 18} height={box.h} fill={`url(#${gradId}-fade)`} />
        </Svg>
      ) : null}

      <View style={styles.panel}>
        <View style={[styles.copy, { paddingHorizontal: 8, paddingBottom: hint ? 108 : 16 }]}>
          <View style={styles.hero}>
            {stacked ? (
              <View style={styles.scriptBlock}>
                <GoldText gold={gold} style={[styles.scriptBig, { fontSize: script, lineHeight: script * 1.12 }]}>
                  {stacked.save}
                </GoldText>
                <GoldText
                  gold={gold}
                  style={[styles.scriptMid, { fontSize: script * 0.46, lineHeight: script * 0.62, marginTop: -script * 0.34 }]}
                >
                  {stacked.mid}
                </GoldText>
                <GoldText
                  gold={gold}
                  style={[styles.scriptBig, { fontSize: script, lineHeight: script * 1.12, marginTop: -script * 0.26 }]}
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
  photoCol: { flex: 1, overflow: 'hidden', position: 'relative', zIndex: 0 },
  panel: { flex: 1 },
  copy: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    zIndex: 2,
  },
  hero: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10, width: '100%' },
  scriptBlock: { alignItems: 'center', paddingVertical: 10, overflow: 'visible' },
  scriptBig: {
    fontFamily: 'GreatVibes_400Regular',
    textAlign: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  scriptMid: {
    fontFamily: 'GreatVibes_400Regular',
    textAlign: 'center',
    paddingHorizontal: 8,
  },
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
  bottom: { alignItems: 'center', gap: 8, width: '100%', marginTop: 16, marginBottom: 8 },
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
    zIndex: 3,
  },
});
