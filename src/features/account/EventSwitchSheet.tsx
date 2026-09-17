/**
 * Sheet Profil — bascule d’événement (2 autres types) puis thème.
 */

import { useEffect, useMemo, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  SETUP_EVENT_TYPES,
  SETUP_THEMES,
  themeQuestionForEvent,
} from '@/features/onboarding/setupOptions';
import { fontFamilies, radii, shadows, spacing } from '@/constants/theme';
import { useAppTheme } from '@/context/ThemePreferenceContext';
import type { EventType } from '@/types';

type SheetStep = 'type' | 'theme';

export function EventSwitchSheet({
  visible,
  currentType,
  onClose,
  onConfirm,
}: {
  visible: boolean;
  currentType: EventType;
  onClose: () => void;
  onConfirm: (nextType: EventType, themeSelection: string) => void;
}) {
  const insets = useSafeAreaInsets();
  const { theme } = useAppTheme();
  const c = theme.colors;

  const [step, setStep] = useState<SheetStep>('type');
  const [pickedType, setPickedType] = useState<EventType | null>(null);
  const [pickedTheme, setPickedTheme] = useState<string | null>(null);

  const alternatives = useMemo(
    () => SETUP_EVENT_TYPES.filter((item) => item.type !== currentType),
    [currentType],
  );

  useEffect(() => {
    if (!visible) return;
    setStep('type');
    setPickedType(null);
    setPickedTheme(null);
  }, [visible, currentType]);

  const close = () => {
    onClose();
  };

  const goTheme = () => {
    if (!pickedType) return;
    setStep('theme');
  };

  const confirm = () => {
    if (!pickedType || !pickedTheme) return;
    onConfirm(pickedType, pickedTheme);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={close}>
      <View style={styles.modalRoot}>
        <Pressable style={styles.backdrop} onPress={close} accessibilityRole="button" />
        <View
          style={[
            styles.sheet,
            {
              backgroundColor: c.surface,
              paddingBottom: Math.max(insets.bottom, spacing.md) + spacing.sm,
            },
            shadows.lg,
          ]}
        >
        <View style={[styles.handle, { backgroundColor: c.borderStrong }]} />

        <View style={styles.sheetHeader}>
          <Text style={[styles.sheetTitle, { color: c.textPrimary }]}>
            {step === 'type' ? 'Changer d’événement' : themeQuestionForEvent(pickedType)}
          </Text>
          <Pressable onPress={close} hitSlop={10} accessibilityRole="button" accessibilityLabel="Fermer">
            <Ionicons name="close" size={22} color={c.textMuted} />
          </Pressable>
        </View>

        <Text style={[styles.sheetHint, { color: c.textMuted }]}>
          {step === 'type'
            ? 'Vers quel événement voulez-vous basculer ?'
            : 'Palette pour les miniatures et l’invitation. « Aucun » conserve les couleurs du modèle.'}
        </Text>

        <ScrollView
          style={styles.sheetScroll}
          contentContainerStyle={styles.sheetScrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {step === 'type'
            ? alternatives.map((item) => {
                const on = pickedType === item.type;
                return (
                  <Pressable
                    key={item.type}
                    accessibilityRole="radio"
                    accessibilityState={{ selected: on }}
                    onPress={() => setPickedType(item.type)}
                    style={[
                      styles.optionRow,
                      { borderColor: c.border, backgroundColor: c.background },
                      on && { borderColor: c.accent, backgroundColor: c.accentMuted },
                    ]}
                  >
                    <View style={[styles.optionIcon, { backgroundColor: on ? c.accent : c.accentMuted }]}>
                      <Ionicons name={item.icon} size={20} color={on ? c.onAccent : c.accent} />
                    </View>
                    <View style={styles.optionCopy}>
                      <Text style={[styles.optionLabel, { color: on ? c.accent : c.textPrimary }]}>
                        {item.label}
                      </Text>
                      <Text style={[styles.optionHint, { color: c.textMuted }]}>{item.hint}</Text>
                    </View>
                    {on ? <Ionicons name="checkmark-circle" size={22} color={c.accent} /> : null}
                  </Pressable>
                );
              })
            : (
              <View style={styles.themeGrid}>
                {SETUP_THEMES.map((item) => {
                  const on = pickedTheme === item.key;
                  return (
                    <Pressable
                      key={item.key}
                      accessibilityRole="radio"
                      accessibilityState={{ selected: on }}
                      onPress={() => setPickedTheme(item.key)}
                      style={[
                        styles.themeCard,
                        { borderColor: c.border, backgroundColor: c.background },
                        on && { borderColor: c.accent, backgroundColor: c.accentMuted },
                      ]}
                    >
                      <View style={[styles.swatch, { backgroundColor: item.swatch }]} />
                      <Text style={[styles.themeLabel, { color: c.textPrimary }]}>{item.label}</Text>
                      <Text style={[styles.themeHint, { color: c.textMuted }]} numberOfLines={2}>
                        {item.hint}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            )}
        </ScrollView>

        <View style={styles.actions}>
          {step === 'theme' ? (
            <Pressable
              accessibilityRole="button"
              onPress={() => setStep('type')}
              style={[styles.secondaryBtn, { borderColor: c.border }]}
            >
              <Text style={[styles.secondaryLabel, { color: c.textSecondary }]}>Retour</Text>
            </Pressable>
          ) : (
            <Pressable
              accessibilityRole="button"
              onPress={close}
              style={[styles.secondaryBtn, { borderColor: c.border }]}
            >
              <Text style={[styles.secondaryLabel, { color: c.textSecondary }]}>Annuler</Text>
            </Pressable>
          )}

          <Pressable
            accessibilityRole="button"
            disabled={step === 'type' ? !pickedType : !pickedTheme}
            onPress={step === 'type' ? goTheme : confirm}
            style={[
              styles.primaryBtn,
              { backgroundColor: c.accent },
              (step === 'type' ? !pickedType : !pickedTheme) && styles.disabled,
            ]}
          >
            <Text style={[styles.primaryLabel, { color: c.onAccent }]}>
              {step === 'type' ? 'Continuer' : 'Basculer'}
            </Text>
            <Ionicons name="arrow-forward" size={16} color={c.onAccent} />
          </Pressable>
        </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalRoot: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(42, 31, 36, 0.45)',
  },
  sheet: {
    maxHeight: '88%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: spacing.sm,
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 99,
    marginBottom: spacing.xs,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  sheetTitle: {
    flex: 1,
    fontFamily: fontFamilies.serifSemiBold,
    fontSize: 22,
    lineHeight: 28,
  },
  sheetHint: {
    fontFamily: fontFamilies.sans,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: spacing.xs,
  },
  sheetScroll: { flexGrow: 0 },
  sheetScrollContent: { gap: 10, paddingBottom: spacing.sm },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1.5,
    borderRadius: radii.md,
    padding: 14,
  },
  optionIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionCopy: { flex: 1, gap: 2 },
  optionLabel: { fontFamily: fontFamilies.sansSemiBold, fontSize: 16 },
  optionHint: { fontFamily: fontFamilies.sans, fontSize: 13, lineHeight: 18 },
  themeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  themeCard: {
    width: '48%',
    borderWidth: 1.5,
    borderRadius: radii.md,
    padding: 12,
    gap: 6,
  },
  swatch: { width: 24, height: 24, borderRadius: 12 },
  themeLabel: { fontFamily: fontFamilies.sansSemiBold, fontSize: 14 },
  themeHint: { fontFamily: fontFamilies.sans, fontSize: 11, lineHeight: 15 },
  actions: { flexDirection: 'row', gap: 10, marginTop: spacing.sm },
  secondaryBtn: {
    minHeight: 50,
    paddingHorizontal: 18,
    borderRadius: 14,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryLabel: { fontFamily: fontFamilies.sansSemiBold, fontSize: 14 },
  primaryBtn: {
    flex: 1,
    minHeight: 50,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  primaryLabel: { fontFamily: fontFamilies.sansSemiBold, fontSize: 15 },
  disabled: { opacity: 0.45 },
});
