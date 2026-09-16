/**
 * Aperçu couverture du studio — fidèle au modèle (Élégance ou Hiver).
 */

import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { STUDIO_PREVIEW_GUEST } from '@/features/invitation/guestRegistry';
import { TemplateCover } from '@/features/invitation/TemplateCover';
import { normalizePhotoFrame } from '@/features/invitation/types';
import { useEditor } from '../EditorContext';

export function EditorCoverPreview({ embedded = false }: { embedded?: boolean }) {
  const { cover, theme, dressCode, template, venue, guests } = useEditor();
  const insets = useSafeAreaInsets();
  /** Premier invité de la liste — sinon échantillon (pas le compte organisateur). */
  const guest = guests[0] ?? STUDIO_PREVIEW_GUEST;

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.bg }}>
      <TemplateCover
        layout={template.coverLayout}
        colors={theme.colors}
        isDark={theme.isDark}
        coverUri={cover.photoUri}
        couplePhoto={{ uri: cover.couplePhotoUri, frame: normalizePhotoFrame(cover.coupleFrame) }}
        guest={guest}
        title={cover.title}
        dateLabel={cover.dateLabel}
        couple={cover.couple}
        phrase={cover.guestLine}
        guestSentence={cover.guestLine}
        kicker={cover.kicker}
        venueName={venue.name}
        venueCity={venue.city}
        dressCode={dressCode}
        compact={embedded}
        paddingTop={embedded ? 14 : insets.top + 12}
        paddingBottom={embedded ? 10 : insets.bottom + 12}
      />
    </View>
  );
}
