/**
 * Couverture Hiver — affiche aérée :
 * marque → photo → titre → message → date/lieu → hint.
 */

import { type ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Logo } from '@/components/ui/Logo';
import type { CouplePhoto, Guest } from '@/features/invitation/types';
import type { TemplateColors } from '@/features/templates/elegance/themes';
import { WinterCouplePhotoFrame } from './WinterCouplePhotoFrame';

/** Or signature du modèle Hiver (Marine & or) — pas le thème wizard. */
const HIVER_LOGO = '#D4B45A';
const HIVER_LOGO_SOFT = '#B8953E';

export function WinterCover({
  colors,
  couplePhoto,
  guest,
  title,
  dateLabel,
  couple,
  phrase,
  kicker,
  venueName,
  venueCity,
  dressCode,
  compact = false,
  paddingTop,
  paddingBottom,
  hint,
  onHintPress,
}: {
  colors: TemplateColors;
  isDark?: boolean;
  couplePhoto: CouplePhoto;
  guest: Guest;
  title: string;
  dateLabel: string;
  couple: string;
  phrase: string;
  kicker: string;
  venueName: string;
  venueCity: string;
  dressCode?: string;
  compact?: boolean;
  paddingTop?: number;
  paddingBottom?: number;
  hint?: ReactNode;
  onHintPress?: () => void;
}) {
  const padTop = paddingTop ?? (compact ? 14 : 28);
  const padBottom = paddingBottom ?? (compact ? 10 : 18);
  const icy = colors.textMuted;
  const ink = colors.text;
  const gold = colors.accent;
  const parts = splitCouple(couple);
  const photoSize = compact ? 132 : 152;

  return (
    <View style={[styles.fill, { backgroundColor: colors.bg }]}>
      <View style={[styles.content, { paddingTop: padTop, paddingBottom: padBottom }]}>
        {/* 1 · Marque */}
        <View style={[styles.brand, compact && styles.brandCompact]}>
          <Logo size="sm" color={HIVER_LOGO} wordmarkColor={HIVER_LOGO_SOFT} />
          {kicker.trim() ? (
            <Text style={[styles.kicker, { color: icy }]}>{kicker.trim().toUpperCase()}</Text>
          ) : null}
        </View>

        {/* 2 · Photo */}
        <View style={[styles.hero, compact && styles.heroCompact]}>
          <WinterCouplePhotoFrame
            couplePhoto={couplePhoto}
            gold={gold}
            frost={icy}
            size={photoSize}
            compact={compact}
          />
        </View>

        {/* 3 · Titre (SAVE THE DATE + noms) */}
        <View style={[styles.identity, compact && styles.identityCompact]}>
          <Text style={[styles.save, { color: icy }]}>{formatSaveTheDate(title)}</Text>
          <Text
            style={[
              styles.names,
              {
                color: ink,
                fontSize: compact ? 26 : 34,
                lineHeight: compact ? 32 : 42,
              },
            ]}
          >
            {parts.left}
            {parts.amp ? <Text style={{ color: gold }}> {parts.amp} </Text> : null}
            {parts.right}
          </Text>
        </View>

        {/* 4 · Accueil personnel */}
        <View style={[styles.invite, compact && styles.inviteCompact]}>
          <Text style={[styles.welcome, { color: gold, fontSize: compact ? 13 : 15 }]}>
            Bienvenue, {guest.firstName}
          </Text>
          {phrase.trim() ? (
            <Text style={[styles.phrase, { color: icy }]} numberOfLines={compact ? 2 : 3}>
              {personalize(phrase, guest.firstName)}
            </Text>
          ) : null}
        </View>

        <View style={styles.breath} />

        {/* 5 · Date & lieu (plus bas) */}
        <View style={[styles.details, compact && styles.detailsCompact]}>
          <Text style={[styles.join, { color: gold, fontSize: compact ? 10.5 : 12 }]}>
            {formatJoinLine(dateLabel)}
          </Text>
          {venueName.trim() ? (
            <View style={styles.venueBlock}>
              <Text style={[styles.venueKicker, { color: icy }]}>Lieu du mariage</Text>
              <Text style={[styles.venueName, { color: icy }]}>
                {venueName.trim().toUpperCase()}
                {venueCity.trim() ? `, ${venueCity.trim().toUpperCase()}` : ''}
              </Text>
            </View>
          ) : null}
          {dressCode?.trim() && !compact ? (
            <Text style={[styles.dress, { color: gold }]}>{dressCode.trim()}</Text>
          ) : null}
        </View>

        {hint ? (
          onHintPress ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Faire défiler vers la suite"
              onPress={onHintPress}
              hitSlop={12}
              style={styles.scrollHint}
            >
              {hint}
            </Pressable>
          ) : (
            <View style={styles.scrollHint}>{hint}</View>
          )
        ) : null}
      </View>
    </View>
  );
}

function personalize(text: string, firstName: string): string {
  return text.replace(/\{\{\s*Nom\s*\}\}/gi, firstName);
}

function formatSaveTheDate(title: string): string {
  const clean = title.replace(/\s+/g, ' ').trim() || 'Save the Date';
  if (/save\s*the\s*date/i.test(clean) || clean.length > 18) return 'SAVE THE DATE';
  return clean.toUpperCase();
}

function formatJoinLine(dateLabel: string): string {
  const raw = dateLabel.replace(/\s+/g, ' ').trim();
  if (/rejoignez|join/i.test(raw)) return raw.toUpperCase();
  return `REJOIGNEZ-NOUS LE ${raw.toUpperCase()}`;
}

function splitCouple(couple: string): { left: string; amp: string; right: string } {
  const parts = couple.split(/\s*&\s*|\s+et\s+/i);
  if (parts.length >= 2) {
    return { left: parts[0].trim(), amp: '&', right: parts.slice(1).join(' & ').trim() };
  }
  return { left: couple.trim(), amp: '', right: '' };
}

const styles = StyleSheet.create({
  fill: { flex: 1, width: '100%', height: '100%' },
  content: {
    flex: 1,
    paddingHorizontal: 26,
    alignItems: 'center',
  },
  brand: {
    alignItems: 'center',
    gap: 14,
    marginBottom: 22,
  },
  brandCompact: {
    gap: 8,
    marginBottom: 12,
  },
  kicker: {
    fontFamily: 'Inter_500Medium',
    fontSize: 9.5,
    letterSpacing: 3.6,
    textAlign: 'center',
  },
  hero: {
    alignItems: 'center',
    marginBottom: 22,
  },
  heroCompact: {
    marginBottom: 12,
  },
  identity: {
    alignItems: 'center',
    gap: 10,
    marginBottom: 20,
  },
  identityCompact: {
    gap: 6,
    marginBottom: 12,
  },
  save: {
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
    letterSpacing: 4.8,
    textAlign: 'center',
  },
  names: {
    fontFamily: 'Fraunces_400Regular_Italic',
    textAlign: 'center',
  },
  invite: {
    alignItems: 'center',
    gap: 10,
    maxWidth: 280,
  },
  inviteCompact: {
    gap: 6,
  },
  welcome: {
    fontFamily: 'Fraunces_400Regular_Italic',
    textAlign: 'center',
    letterSpacing: 0.4,
  },
  phrase: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    lineHeight: 17,
    textAlign: 'center',
    opacity: 0.92,
  },
  breath: {
    flex: 1,
    minHeight: 16,
  },
  details: {
    alignItems: 'center',
    gap: 12,
    marginBottom: 10,
  },
  detailsCompact: {
    gap: 8,
    marginBottom: 6,
  },
  join: {
    fontFamily: 'Inter_600SemiBold',
    letterSpacing: 1.8,
    textAlign: 'center',
  },
  venueBlock: { alignItems: 'center', gap: 6 },
  venueKicker: {
    fontFamily: 'Inter_500Medium',
    fontSize: 8.5,
    letterSpacing: 2.8,
    textTransform: 'uppercase',
  },
  venueName: {
    fontFamily: 'Inter_500Medium',
    fontSize: 10,
    letterSpacing: 1.4,
    textAlign: 'center',
    paddingHorizontal: 10,
    lineHeight: 15,
  },
  dress: {
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
    textAlign: 'center',
  },
  scrollHint: { alignSelf: 'center', alignItems: 'center', padding: 4 },
});
