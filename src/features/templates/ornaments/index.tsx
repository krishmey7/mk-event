/**
 * Catalogue d’ornements — un set par modèle, pas de mélange cross-template.
 */

import type { TemplateColors } from '@/features/templates/elegance/themes';

import { EleganceOrnaments } from './EleganceOrnaments';
import { HiverOrnaments } from './HiverOrnaments';
import { BirthdayOrnaments } from '@/features/templates/birthday/BirthdayOrnaments';
import { IconifyIcon } from '@/components/ui/IconifyIcon';
import { View, StyleSheet } from 'react-native';

export type OrnamentKey = 'elegance' | 'hiver' | 'birthday' | 'conference';

function ConferenceOrnaments({ accent, compact }: { accent: string; compact?: boolean }) {
  const size = compact ? 16 : 22;
  return (
    <View style={styles.row}>
      <IconifyIcon icon="mdi:microphone-variant" size={size} color={accent} />
      <IconifyIcon icon="mdi:account-group-outline" size={size} color={accent} />
    </View>
  );
}

export function TemplateOrnaments({
  ornamentKey,
  colors,
  compact,
}: {
  ornamentKey: OrnamentKey;
  colors: TemplateColors;
  compact?: boolean;
}) {
  if (ornamentKey === 'hiver') {
    return (
      <HiverOrnaments gold={colors.accent} frost={colors.textMuted} compact={compact} />
    );
  }
  if (ornamentKey === 'birthday') {
    return <BirthdayOrnaments gold={colors.accent} compact={compact} />;
  }
  if (ornamentKey === 'conference') {
    return <ConferenceOrnaments accent={colors.accent} compact={compact} />;
  }
  return <EleganceOrnaments accent={colors.accent} compact={compact} />;
}

export { EleganceOrnaments } from './EleganceOrnaments';
export { HiverOrnaments } from './HiverOrnaments';

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 8, justifyContent: 'center' },
});
