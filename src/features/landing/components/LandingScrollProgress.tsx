/**
 * Repère de lecture de la landing.
 * Un rail discret indique la section active et la progression globale.
 */

import { Pressable, StyleSheet, Text, View } from 'react-native';

import { fontFamilies } from '@/constants/theme';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { LANDING } from '../landingTokens';

export type LandingSectionId = 'hero' | 'experience' | 'parcours' | 'modeles';

export const LANDING_SECTIONS: Array<{ id: LandingSectionId; label: string }> = [
  { id: 'hero', label: 'Découvrir' },
  { id: 'experience', label: 'Expérience' },
  { id: 'parcours', label: 'Parcours' },
  { id: 'modeles', label: 'Modèles' },
];

export function LandingScrollProgress({
  active,
  progress,
  onSelect,
}: {
  active: LandingSectionId;
  progress: number;
  onSelect: (id: LandingSectionId) => void;
}) {
  const { isDesktop } = useBreakpoint();
  const clamped = Math.max(0, Math.min(1, progress));

  return (
    <>
      <View pointerEvents="none" style={styles.topTrack}>
        <View style={[styles.topFill, { width: `${clamped * 100}%` }]} />
      </View>

      {isDesktop ? (
        <View style={styles.rail}>
          <View style={styles.railLine}>
            <View style={[styles.railFill, { height: `${clamped * 100}%` }]} />
          </View>
          <View style={styles.items}>
            {LANDING_SECTIONS.map((section, index) => {
              const selected = section.id === active;
              return (
                <Pressable
                  key={section.id}
                  accessibilityRole="button"
                  accessibilityLabel={`Aller à ${section.label}`}
                  onPress={() => onSelect(section.id)}
                  style={({ pressed }) => [styles.item, pressed && styles.pressed]}
                >
                  <View style={[styles.dot, selected && styles.dotActive]}>
                    {selected ? <View style={styles.dotCore} /> : null}
                  </View>
                  <Text style={[styles.label, selected && styles.labelActive]}>
                    {String(index + 1).padStart(2, '0')} · {section.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  topTrack: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    zIndex: 40,
    backgroundColor: 'rgba(42, 31, 36, 0.06)',
  },
  topFill: {
    height: '100%',
    borderTopRightRadius: 99,
    borderBottomRightRadius: 99,
    backgroundColor: LANDING.coral,
  },
  rail: {
    position: 'absolute',
    right: 22,
    top: '38%',
    zIndex: 30,
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: LANDING.border,
    backgroundColor: 'rgba(255, 255, 255, 0.86)',
    shadowColor: '#2A1F24',
    shadowOpacity: 0.08,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  railLine: {
    width: 2,
    height: 112,
    borderRadius: 99,
    overflow: 'hidden',
    backgroundColor: LANDING.borderStrong,
    marginTop: 4,
  },
  railFill: {
    width: '100%',
    borderRadius: 99,
    backgroundColor: LANDING.coral,
  },
  items: { gap: 10 },
  item: {
    height: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: LANDING.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: LANDING.surface,
  },
  dotActive: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderColor: LANDING.coral,
  },
  dotCore: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: LANDING.coral,
  },
  label: {
    fontFamily: fontFamilies.sansMedium,
    fontSize: 11,
    color: LANDING.textFaint,
    minWidth: 90,
  },
  labelActive: {
    color: LANDING.text,
  },
  pressed: { opacity: 0.68 },
});
