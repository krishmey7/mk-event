/**
 * Couverture du modèle actif — Élégance, Hiver, Anniversaire…
 */

import { type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { InvitationCover } from '@/features/invitation/InvitationCover';
import type { CouplePhoto, Guest } from '@/features/invitation/types';
import type { TemplateColors } from '@/features/templates/elegance/themes';
import { WinterCover } from '@/features/templates/hiver/WinterCover';
import { BirthdayPoster } from '@/features/templates/birthday/BirthdayPoster';
import { TemplateOrnaments, type OrnamentKey } from '@/features/templates/ornaments';
import type { CoverLayout } from '@/features/templates/registry';

export function TemplateCover({
  layout = 'classic',
  ornaments = 'elegance',
  colors,
  isDark,
  coverUri,
  couplePhoto,
  guest,
  title,
  dateLabel,
  couple,
  phrase,
  guestSentence,
  kicker,
  venueName,
  venueCity,
  dressCode,
  compact,
  paddingTop,
  paddingBottom,
  hint,
  onHintPress,
  ageLine,
  scriptLine,
  timePlace,
  address,
  closing,
}: {
  layout?: CoverLayout;
  ornaments?: OrnamentKey;
  colors: TemplateColors;
  isDark?: boolean;
  coverUri: string;
  couplePhoto: CouplePhoto;
  guest: Guest;
  title: string;
  dateLabel: string;
  couple: string;
  phrase?: string;
  guestSentence: string;
  kicker?: string;
  venueName?: string;
  venueCity?: string;
  dressCode?: string;
  compact?: boolean;
  paddingTop?: number;
  paddingBottom?: number;
  hint?: ReactNode;
  onHintPress?: () => void;
  ageLine?: string;
  scriptLine?: string;
  timePlace?: string;
  address?: string;
  closing?: string;
}) {
  if (layout === 'birthdayPoster') {
    return (
      <View style={styles.fill}>
        <BirthdayPoster
          colors={colors}
          isDark={isDark}
          title={title}
          subtitle={phrase || guestSentence}
          ageLine={ageLine || kicker || 'happy birthday'}
          headline="birthday"
          scriptLine={scriptLine || 'celebration'}
          dateLabel={dateLabel}
          timePlace={timePlace || dressCode}
          address={address || [venueName, venueCity].filter(Boolean).join(' · ')}
          closing={closing || 'see you!'}
          celebrant={couple}
          compact={compact}
        />
      </View>
    );
  }

  if (layout === 'conference') {
    return (
      <View style={[styles.fill, styles.conferencePreview, { backgroundColor: colors.primary }]}>
        <InvitationCover
          colors={colors}
          coverUri={coverUri}
          couplePhoto={couplePhoto}
          guest={guest}
          dateLabel={dateLabel}
          couple={couple}
          phrase={phrase}
          guestSentence={guestSentence}
          dressCode={dressCode}
          compact={compact}
          paddingTop={paddingTop}
          paddingBottom={paddingBottom}
          hint={hint}
          onHintPress={onHintPress}
        />
        <TemplateOrnaments ornamentKey={ornaments} colors={colors} compact={compact} />
      </View>
    );
  }

  const shell =
    layout === 'winterPoster' ? (
      <WinterCover
        colors={colors}
        isDark={isDark}
        couplePhoto={couplePhoto}
        guest={guest}
        title={title}
        dateLabel={dateLabel}
        couple={couple}
        phrase={guestSentence || phrase || ''}
        kicker={kicker ?? ''}
        venueName={venueName ?? ''}
        venueCity={venueCity ?? ''}
        dressCode={dressCode}
        compact={compact}
        paddingTop={paddingTop}
        paddingBottom={paddingBottom}
        hint={hint}
        onHintPress={onHintPress}
      />
    ) : (
      <InvitationCover
        colors={colors}
        coverUri={coverUri}
        couplePhoto={couplePhoto}
        guest={guest}
        dateLabel={dateLabel}
        couple={couple}
        phrase={phrase}
        guestSentence={guestSentence}
        dressCode={dressCode}
        compact={compact}
        paddingTop={paddingTop}
        paddingBottom={paddingBottom}
        hint={hint}
        onHintPress={onHintPress}
      />
    );

  return (
    <View style={styles.fill}>
      {shell}
      <TemplateOrnaments ornamentKey={ornaments} colors={colors} compact={compact} />
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1, overflow: 'hidden' },
  conferencePreview: { position: 'relative' },
});
