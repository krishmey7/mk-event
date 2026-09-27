/**
 * Couverture Aurore — colonne photo à gauche (couple entier visible),
 * panneau émeraude large à droite, fondu doux au joint.
 */

import { createElement, type ReactNode, useMemo, useState } from 'react';
import { Image, Platform, StyleSheet, Text, View } from 'react-native';
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

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const raw = hex.replace('#', '');
  const full = raw.length === 3 ? raw.split('').map((c) => c + c).join('') : raw;
  return {
    r: parseInt(full.slice(0, 2), 16),
    g: parseInt(full.slice(2, 4), 16),
    b: parseInt(full.slice(4, 6), 16),
  };
}

function rgba(hex: string, alpha: number): string {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/** Fondu sur le bord droit de la photo → panneau (web). */
function WebEdgeFade({ panel, width }: { panel: string; width: number }) {
  if (width <= 0) return null;
  return createElement('div', {
    'aria-hidden': true,
    style: {
      position: 'absolute',
      top: 0,
      right: 0,
      bottom: 0,
      width,
      zIndex: 2,
      pointerEvents: 'none',
      backgroundImage: `linear-gradient(90deg,
        transparent 0%,
        ${rgba(panel, 0.15)} 28%,
        ${rgba(panel, 0.45)} 52%,
        ${rgba(panel, 0.78)} 76%,
        ${panel} 100%)`,
    },
  });
}

function NativeEdgeFade({
  panel,
  width,
  height,
}: {
  panel: string;
  width: number;
  height: number;
}) {
  if (width <= 0 || height <= 0) return null;
  return (
    <Svg width={width} height={height} style={styles.edgeFade} pointerEvents="none">
      <Defs>
        <LinearGradient id="auroreEdgeFade" x1="0" y1="0" x2={width} y2="0" gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor={panel} stopOpacity="0" />
          <Stop offset="0.35" stopColor={panel} stopOpacity="0.25" />
          <Stop offset="0.7" stopColor={panel} stopOpacity="0.7" />
          <Stop offset="1" stopColor={panel} stopOpacity="1" />
        </LinearGradient>
      </Defs>
      <Rect x="0" y="0" width={width} height={height} fill="url(#auroreEdgeFade)" />
    </Svg>
  );
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
  const [box, setBox] = useState({ w: 0, h: 0 });
  const panel = colors.bg;
  const gold = colors.accent;
  const muted = colors.textMuted;
  const cream = colors.text;
  /** ~42 % photo (couple entier) / ~58 % vert. */
  const photoW = useMemo(() => (box.w > 0 ? Math.round(box.w * 0.42) : 0), [box.w]);
  const panelW = useMemo(() => (box.w > 0 ? box.w - photoW : 0), [box.w, photoW]);
  const fadeW = useMemo(() => Math.max(36, Math.round(photoW * 0.38)), [photoW]);
  const scale = Math.min(1.08, Math.max(0.9, (panelW || 190) / 190));
  const script = Math.min(52, Math.max(34, ((panelW || 190) - 20) / 2.2));
  const stacked = splitTitle(title);
  const welcome = fillGuestNameToken(guestSentence, guest.firstName).trim();
  const place = [venueStreet?.trim(), venueCity?.trim()].filter(Boolean);
  const dress = (dressCode ?? '').trim();
  const onWeb = Platform.OS === 'web';

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
      <View style={[styles.photoCol, photoW > 0 ? { width: photoW } : { flex: 0.42 }]}>
        {couplePhoto.uri ? (
          onWeb ? (
            createElement('div', {
              'aria-hidden': true,
              style: {
                position: 'absolute',
                inset: 0,
                backgroundImage: `url("${couplePhoto.uri}")`,
                backgroundSize: 'cover',
                backgroundPosition: 'center center',
                backgroundRepeat: 'no-repeat',
              },
            })
          ) : (
            <Image source={{ uri: couplePhoto.uri }} style={StyleSheet.absoluteFill} resizeMode="cover" />
          )
        ) : (
          <View style={[StyleSheet.absoluteFill, { backgroundColor: panel }]} />
        )}
        {onWeb ? (
          <WebEdgeFade panel={panel} width={fadeW} />
        ) : (
          <NativeEdgeFade panel={panel} width={fadeW} height={box.h} />
        )}
      </View>

      <View style={[styles.panel, panelW > 0 ? { width: panelW } : { flex: 0.58 }, { backgroundColor: panel }]}>
        <View style={[styles.copy, { paddingHorizontal: 10, paddingBottom: hint ? 108 : 16 }]}>
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
  photoCol: {
    position: 'relative',
    overflow: 'hidden',
    zIndex: 1,
  },
  edgeFade: {
    position: 'absolute',
    right: 0,
    top: 0,
    zIndex: 2,
  },
  panel: {
    position: 'relative',
    overflow: 'hidden',
    zIndex: 2,
  },
  copy: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    zIndex: 1,
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
