/**
 * Couverture Aurore — photo pleine colonne à gauche (couple visible),
 * panneau émeraude à droite, fondu doux au joint (pas de bande verte à gauche).
 */

import { createElement, type ReactNode, useMemo, useState } from 'react';
import { Image, Platform, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

import { fillGuestNameToken } from '@/features/editor/guestNameToken';
import type { CouplePhoto, Guest } from '@/features/invitation/types';
import type { TemplateColors } from '@/features/templates/elegance/themes';
import { GoldText, AuroreAtmosphere } from './chrome';

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

/** Fondu sur le bord droit de la photo → panneau. */
function WebEdgeFade({ panel }: { panel: string }) {
  return createElement('div', {
    'aria-hidden': true,
    style: {
      position: 'absolute',
      top: 0,
      right: 0,
      bottom: 0,
      width: '42%',
      zIndex: 2,
      pointerEvents: 'none',
      backgroundImage: `linear-gradient(90deg,
        transparent 0%,
        ${rgba(panel, 0.12)} 30%,
        ${rgba(panel, 0.42)} 55%,
        ${rgba(panel, 0.78)} 78%,
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
  const [photoBox, setPhotoBox] = useState({ w: 0, h: 0 });
  const panel = colors.bg;
  const gold = colors.accent;
  const muted = colors.textMuted;
  const cream = colors.text;
  const panelScale = 1;
  const script = 44;
  const scale = panelScale;
  const stacked = splitTitle(title);
  const welcome = fillGuestNameToken(guestSentence, guest.firstName).trim();
  const place = [venueStreet?.trim(), venueCity?.trim()].filter(Boolean);
  const dress = (dressCode ?? '').trim();
  const onWeb = Platform.OS === 'web';
  const fadeW = useMemo(() => Math.max(40, Math.round(photoBox.w * 0.4)), [photoBox.w]);

  return (
    <View style={[styles.fill, { backgroundColor: panel }]}>
      {/* Colonne photo : Image plein cadre, pas de trou vert à gauche. */}
      <View
        style={styles.photoCol}
        onLayout={(event) => {
          const next = {
            w: Math.round(event.nativeEvent.layout.width),
            h: Math.round(event.nativeEvent.layout.height),
          };
          if (next.w !== photoBox.w || next.h !== photoBox.h) setPhotoBox(next);
        }}
      >
        {couplePhoto.uri ? (
          <Image
            source={{ uri: couplePhoto.uri }}
            style={StyleSheet.absoluteFill}
            resizeMode="cover"
          />
        ) : (
          <View style={[StyleSheet.absoluteFill, { backgroundColor: panel }]} />
        )}
        {onWeb ? (
          <WebEdgeFade panel={panel} />
        ) : (
          <NativeEdgeFade panel={panel} width={fadeW} height={photoBox.h} />
        )}
      </View>

      <View style={[styles.panel, { backgroundColor: panel }]}>
        <AuroreAtmosphere panel={panel} cover />
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
              <GoldText gold={gold} style={[styles.scriptBig, { fontSize: 48 * scale, lineHeight: 54 * scale }]}>
                {title}
              </GoldText>
            )}

            {couple.trim() ? (
              <GoldText
                gold={gold}
                style={[styles.names, { fontSize: 28 * scale, lineHeight: 32 * scale }]}
                numberOfLines={2}
              >
                {couple.trim()}
              </GoldText>
            ) : null}

            <Text style={[styles.welcome, { color: cream, fontSize: 18 * scale, lineHeight: 24 * scale }]}>
              {`Bienvenue, ${guest.firstName}`}
            </Text>
            {welcome ? (
              <Text style={[styles.sentence, { color: cream, fontSize: 15 * scale, lineHeight: 21 * scale }]}>
                {welcome}
              </Text>
            ) : null}
          </View>

          <View style={styles.bottom}>
            {dateLabel.trim() ? (
              <View style={styles.infoRow}>
                <GoldMark gold={gold} ink={panel} icon="calendar-outline" size={18 * scale} />
                <GoldText gold={gold} style={[styles.date, { fontSize: 15 * scale }]}>{dateLabel.trim()}</GoldText>
              </View>
            ) : null}

            {venueName?.trim() ? (
              <View style={styles.venue}>
                <View style={styles.infoRow}>
                  <GoldMark gold={gold} ink={panel} icon="business-outline" size={18 * scale} />
                  <GoldText gold={gold} style={[styles.venueName, { fontSize: 16 * scale }]}>{venueName.trim()}</GoldText>
                </View>
                {place.map((line) => (
                  <Text key={line} style={[styles.address, { color: muted, fontSize: 13 * scale }]}>
                    {line}
                  </Text>
                ))}
              </View>
            ) : null}

            {dress ? (
              <Text style={[styles.dress, { color: muted, fontSize: 13 * scale }]}>{dress}</Text>
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
  /** ~46 % photo / ~54 % texte — photo collée au bord gauche. */
  photoCol: {
    flex: 0.46,
    position: 'relative',
    overflow: 'hidden',
    alignSelf: 'stretch',
    backgroundColor: '#0A0A0A',
  },
  edgeFade: {
    position: 'absolute',
    right: 0,
    top: 0,
    zIndex: 2,
  },
  panel: {
    flex: 0.54,
    position: 'relative',
    overflow: 'hidden',
    alignSelf: 'stretch',
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
