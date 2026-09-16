/**
 * Couverture du modèle actif — Élégance ou Hiver.
 */

import { type ReactNode } from 'react';

import { InvitationCover } from '@/features/invitation/InvitationCover';
import type { CouplePhoto, Guest } from '@/features/invitation/types';
import type { TemplateColors } from '@/features/templates/elegance/themes';
import { WinterCover } from '@/features/templates/hiver/WinterCover';

export function TemplateCover({
  layout = 'classic',
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
}: {
  layout?: 'classic' | 'winterPoster';
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
}) {
  if (layout === 'winterPoster') {
    return (
      <WinterCover
        colors={colors}
        isDark={isDark}
        couplePhoto={couplePhoto}
        guest={guest}
        title={title}
        dateLabel={dateLabel}
        couple={couple}
        phrase={phrase || guestSentence}
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
    );
  }

  return (
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
}
