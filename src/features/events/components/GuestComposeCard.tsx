/**
 * Composition d’ajout d’invité — carte élégante, aperçu live, motion douce.
 */

import { useEffect, useMemo, useRef, type ReactNode, type RefObject } from 'react';
import {
  Animated,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { fontFamilies, shadows, type AppTheme } from '@/constants/theme';

export interface GuestComposeCardProps {
  theme: AppTheme;
  firstName: string;
  lastName: string;
  seats: number;
  canSave: boolean;
  showClose?: boolean;
  firstNameRef?: RefObject<TextInput | null>;
  tableSlot: ReactNode;
  onChangeFirstName: (value: string) => void;
  onChangeLastName: (value: string) => void;
  onChangeSeats: (value: number) => void;
  onSave: () => void;
  onClose?: () => void;
  onImport?: () => void;
}

export function GuestComposeCard({
  theme,
  firstName,
  lastName,
  seats,
  canSave,
  showClose,
  firstNameRef,
  tableSlot,
  onChangeFirstName,
  onChangeLastName,
  onChangeSeats,
  onSave,
  onClose,
  onImport,
}: GuestComposeCardProps) {
  const c = theme.colors;
  const fade = useRef(new Animated.Value(0)).current;
  const rise = useRef(new Animated.Value(16)).current;
  const monoPulse = useRef(new Animated.Value(1)).current;

  const initials = useMemo(() => {
    const a = firstName.trim().charAt(0);
    const b = lastName.trim().charAt(0);
    const pair = `${a}${b}`.toUpperCase();
    return pair || '+';
  }, [firstName, lastName]);

  const previewName = useMemo(() => {
    const full = `${firstName.trim()} ${lastName.trim()}`.trim();
    return full || 'Nouvel invité';
  }, [firstName, lastName]);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 320, useNativeDriver: true }),
      Animated.timing(rise, { toValue: 0, duration: 360, useNativeDriver: true }),
    ]).start();
  }, [fade, rise]);

  useEffect(() => {
    monoPulse.setValue(0.92);
    Animated.spring(monoPulse, {
      toValue: 1,
      friction: 5,
      tension: 120,
      useNativeDriver: true,
    }).start();
  }, [initials, monoPulse]);

  return (
    <Animated.View
      style={[
        styles.wrap,
        {
          opacity: fade,
          transform: [{ translateY: rise }],
          backgroundColor: c.surface,
          borderColor: c.border,
        },
        shadows.sm,
      ]}
    >
      <View style={[styles.accentBar, { backgroundColor: c.accent }]} />

      <View style={styles.head}>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={[styles.kicker, { color: c.accent }]}>Liste d’invités</Text>
          <Text style={[styles.title, { color: c.textPrimary }]} numberOfLines={1}>
            {previewName}
          </Text>
          <Text style={[styles.subtitle, { color: c.textMuted }]}>
            Une personne à la fois — vous enverrez l’invitation juste après.
          </Text>
        </View>
        <Animated.View
          style={[
            styles.mono,
            {
              backgroundColor: c.accentMuted,
              borderColor: c.accent,
              transform: [{ scale: monoPulse }],
            },
          ]}
        >
          <Text style={[styles.monoText, { color: c.accentSoft }]}>{initials}</Text>
        </Animated.View>
      </View>

      {showClose ? (
        <Pressable
          accessibilityRole="button"
          onPress={onClose}
          hitSlop={8}
          style={styles.closeBtn}
        >
          <Text style={[styles.closeLabel, { color: c.textMuted }]}>Fermer</Text>
        </Pressable>
      ) : null}

      <View style={styles.nameRow}>
        <ComposeField
          theme={theme}
          label="Prénom"
          value={firstName}
          onChangeText={onChangeFirstName}
          inputRef={firstNameRef}
          autoFocus={Platform.OS === 'web'}
        />
        <ComposeField
          theme={theme}
          label="Nom"
          value={lastName}
          onChangeText={onChangeLastName}
        />
      </View>

      <Text style={[styles.fieldLabel, { color: c.textMuted }]}>Places à table</Text>
      <View style={styles.seatRow}>
        {[1, 2, 3, 4].map((n) => {
          const active = seats === n;
          return (
            <Pressable
              key={n}
              onPress={() => onChangeSeats(n)}
              style={[
                styles.seatChip,
                {
                  backgroundColor: active ? c.accent : c.background,
                  borderColor: active ? c.accent : c.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.seatChipText,
                  { color: active ? c.onAccent : c.textMuted },
                ]}
              >
                {n}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {tableSlot}

      <Pressable
        disabled={!canSave}
        onPress={onSave}
        style={({ pressed }) => [
          styles.saveBtn,
          { backgroundColor: c.accent },
          !canSave && styles.disabled,
          pressed && canSave && styles.pressed,
        ]}
      >
        <Ionicons name="sparkles-outline" size={18} color={c.onAccent} />
        <Text style={[styles.saveLabel, { color: c.onAccent }]}>Ajouter à la liste</Text>
      </Pressable>

      {onImport ? (
        <Pressable onPress={onImport} hitSlop={8} style={styles.importLink}>
          <Text style={[styles.importLabel, { color: c.textMuted }]}>
            Vous avez déjà une liste ?{' '}
            <Text style={{ color: c.accent, fontFamily: fontFamilies.sansSemiBold }}>
              Importer
            </Text>
          </Text>
        </Pressable>
      ) : null}
    </Animated.View>
  );
}

function ComposeField({
  theme,
  label,
  value,
  onChangeText,
  inputRef,
  autoFocus,
}: {
  theme: AppTheme;
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  inputRef?: RefObject<TextInput | null>;
  autoFocus?: boolean;
}) {
  const c = theme.colors;
  return (
    <View style={styles.fieldCol}>
      <Text style={[styles.fieldLabel, { color: c.textMuted }]}>{label}</Text>
      <TextInput
        ref={inputRef}
        value={value}
        onChangeText={onChangeText}
        placeholder={label}
        placeholderTextColor={c.textMuted}
        autoFocus={autoFocus}
        selectionColor={c.accent}
        style={[
          styles.input,
          {
            borderColor: c.border,
            backgroundColor: c.background,
            color: c.textPrimary,
          },
          Platform.OS === 'web' ? ({ outlineStyle: 'none', outlineWidth: 0 } as object) : null,
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderWidth: 1,
    borderRadius: 22,
    padding: 18,
    gap: 12,
    overflow: 'hidden',
  },
  accentBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
  },
  head: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingTop: 4,
  },
  kicker: {
    fontFamily: fontFamilies.sansSemiBold,
    fontSize: 10,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  title: {
    fontFamily: fontFamilies.serifMedium,
    fontSize: 24,
    lineHeight: 30,
  },
  subtitle: {
    fontFamily: fontFamilies.sans,
    fontSize: 13,
    lineHeight: 18,
    marginTop: 4,
  },
  mono: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  monoText: {
    fontFamily: fontFamilies.serifSemiBold,
    fontSize: 16,
  },
  closeBtn: { alignSelf: 'flex-end', marginTop: -8 },
  closeLabel: {
    fontFamily: fontFamilies.sansMedium,
    fontSize: 13,
  },
  nameRow: {
    flexDirection: 'row',
    gap: 10,
  },
  fieldCol: { flex: 1, minWidth: 0, gap: 6 },
  fieldLabel: {
    fontFamily: fontFamilies.sansMedium,
    fontSize: 11,
    letterSpacing: 0.3,
  },
  input: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontFamily: fontFamilies.sans,
    fontSize: 15,
  },
  seatRow: {
    flexDirection: 'row',
    gap: 8,
  },
  seatChip: {
    width: 44,
    height: 44,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  seatChipText: {
    fontFamily: fontFamilies.sansSemiBold,
    fontSize: 15,
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    minHeight: 50,
    borderRadius: 16,
    marginTop: 4,
  },
  saveLabel: {
    fontFamily: fontFamilies.sansSemiBold,
    fontSize: 15,
  },
  importLink: {
    alignItems: 'center',
    paddingVertical: 4,
  },
  importLabel: {
    fontFamily: fontFamilies.sans,
    fontSize: 13,
    textAlign: 'center',
  },
  disabled: { opacity: 0.45 },
  pressed: { opacity: 0.9 },
});
