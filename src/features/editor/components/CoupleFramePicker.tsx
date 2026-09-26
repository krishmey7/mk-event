/**
 * Sélecteur de forme du cadre couple — aperçu live + miniatures lisibles.
 */

import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { fontFamilies } from '@/constants/theme';
import { useAppTheme } from '@/context/ThemePreferenceContext';
import { CouplePhotoFrame } from '@/features/invitation/CouplePhotoFrame';
import type { PhotoFrameKey, PhotoFrameOption } from '@/features/invitation/types';
import { WinterCouplePhotoFrame } from '@/features/templates/hiver/WinterCouplePhotoFrame';

function optionLabel(option: PhotoFrameOption): string {
  if (option.key === 'circleFloral') return 'Floral';
  if (option.key === 'heartFloral') return 'Orné';
  if (option.key === 'heart') return 'Cœur';
  if (option.key === 'circle') return 'Cercle';
  if (option.key === 'soft') return 'Doux';
  if (option.key === 'hex') return 'Hexa';
  if (option.key === 'hexFloral') return 'Rinceaux';
  const first = option.label.split(/[\s&]/)[0] ?? option.label;
  return first.length > 10 ? first.slice(0, 9) : first;
}

function FramePreview({
  uri,
  frame,
  accent,
  size,
}: {
  uri: string;
  frame: PhotoFrameKey;
  accent: string;
  size: number;
}) {
  const couplePhoto = { uri, frame };
  const isHex = frame === 'hex' || frame === 'hexFloral';

  if (isHex) {
    return (
      <WinterCouplePhotoFrame
        couplePhoto={couplePhoto}
        gold={accent}
        size={size + 20}
        compact={size < 80}
      />
    );
  }

  return <CouplePhotoFrame couplePhoto={couplePhoto} accent={accent} size={size} />;
}

export function CoupleFramePicker({
  uri,
  frame,
  options,
  accent,
  framesEnabled = true,
  onChangeFrame,
  onChangePhoto,
}: {
  uri: string;
  frame: PhotoFrameKey;
  options: PhotoFrameOption[];
  accent: string;
  framesEnabled?: boolean;
  onChangeFrame: (key: PhotoFrameKey) => void;
  onChangePhoto: () => void;
}) {
  const { theme } = useAppTheme();
  const muted = theme.colors.textMuted;
  const border = theme.colors.border;
  const surface = theme.colors.surfaceElevated;

  return (
    <View style={styles.root}>
      <View style={[styles.stage, { backgroundColor: surface, borderColor: border }]}>
        {uri && framesEnabled ? (
          <FramePreview uri={uri} frame={frame} accent={accent} size={128} />
        ) : uri ? (
          <Image source={{ uri }} style={styles.portrait} resizeMode="cover" />
        ) : (
          <View style={[styles.emptyStage, { borderColor: accent }]}>
            <Text style={[styles.emptyText, { color: muted }]}>Aperçu du cadre</Text>
          </View>
        )}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Changer la photo du couple"
          onPress={onChangePhoto}
          style={({ pressed }) => [styles.changeBtn, pressed && styles.pressed]}
        >
          <Text style={styles.changeLabel}>{uri ? 'Changer la photo' : 'Ajouter une photo'}</Text>
        </Pressable>
      </View>

      {framesEnabled ? (
        <>
      <Text style={[styles.hint, { color: muted }]}>Forme sur la couverture</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.thumbs}
      >
        {options.map((option) => {
          const selected = frame === option.key;
          return (
            <Pressable
              key={option.key}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
              accessibilityLabel={option.label}
              onPress={() => onChangeFrame(option.key)}
              style={styles.thumbItem}
            >
              <View
                style={[
                  styles.thumbWell,
                  { borderColor: border, backgroundColor: surface },
                  selected && { borderColor: accent, borderWidth: 2.5 },
                ]}
              >
                {uri ? (
                  <FramePreview uri={uri} frame={option.key} accent={accent} size={72} />
                ) : (
                  <Text style={[styles.thumbFallback, { color: accent }]}>
                    {optionLabel(option).slice(0, 1)}
                  </Text>
                )}
              </View>
              <Text
                style={[
                  styles.thumbLabel,
                  { color: muted },
                  selected && { color: accent, fontFamily: fontFamilies.sansSemiBold },
                ]}
                numberOfLines={1}
              >
                {optionLabel(option)}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
        </>
      ) : (
        <Text style={[styles.hint, { color: muted }]}>
          Plein cadre, à gauche de la couverture.
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { gap: 12, marginBottom: 4 },
  stage: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    gap: 14,
    minHeight: 200,
    borderRadius: 16,
    borderWidth: 1,
  },
  emptyStage: {
    width: 128,
    height: 118,
    borderRadius: 60,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: { fontFamily: fontFamilies.sansMedium, fontSize: 12 },
  portrait: { width: 108, height: 156, borderRadius: 2 },
  changeBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  changeLabel: { fontFamily: fontFamilies.sansSemiBold, fontSize: 13, color: '#121318' },
  hint: { fontFamily: fontFamilies.sansMedium, fontSize: 13 },
  thumbs: { gap: 12, paddingVertical: 4, paddingRight: 8 },
  thumbItem: { width: 96, alignItems: 'center', gap: 8 },
  thumbWell: {
    width: 92,
    height: 92,
    borderRadius: 16,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  thumbFallback: { fontFamily: fontFamilies.serifSemiBold, fontSize: 22 },
  thumbLabel: {
    fontFamily: fontFamilies.sansMedium,
    fontSize: 12,
    textAlign: 'center',
  },
  pressed: { opacity: 0.85 },
});
