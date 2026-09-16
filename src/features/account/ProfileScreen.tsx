/**
 * Profil / Paramètres — compte, apparence, déconnexion (charte atelier).
 */

import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAuth } from '@/context/AuthContext';
import {
  useAppTheme,
  type AppearancePreference,
} from '@/context/ThemePreferenceContext';
import { fontFamilies, radii, shadows, spacing } from '@/constants/theme';

const APPEARANCE: { key: AppearancePreference; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { key: 'light', label: 'Clair', icon: 'sunny-outline' },
  { key: 'dark', label: 'Sombre', icon: 'moon-outline' },
  { key: 'system', label: 'Système', icon: 'phone-portrait-outline' },
];

export function ProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, signOut } = useAuth();
  const { theme, mode, preference, setPreference } = useAppTheme();
  const c = theme.colors;

  const initials =
    user?.full_name
      ?.trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((word) => word.charAt(0).toUpperCase())
      .join('') ?? 'MK';

  const handleSignOut = () => {
    void signOut().then(() => router.replace('/login'));
  };

  return (
    <View style={[styles.screen, { backgroundColor: c.background }]}>
      <StatusBar style={mode === 'dark' ? 'light' : 'dark'} />

      <ScrollView
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: insets.top + spacing.lg,
            paddingBottom: insets.bottom + 108,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={[styles.title, { color: c.textPrimary }]}>Profil</Text>
          <Text style={[styles.subtitle, { color: c.textSecondary }]}>
            Compte et préférences d’affichage
          </Text>
        </View>

        <View style={[styles.card, { backgroundColor: c.surface, borderColor: c.border }, shadows.sm]}>
          <View style={[styles.avatar, { backgroundColor: c.accent }]}>
            <Text style={[styles.avatarText, { color: c.onAccent }]}>{initials}</Text>
          </View>
          <Text style={[styles.name, { color: c.textPrimary }]}>{user?.full_name ?? 'Organisateur'}</Text>
          <Text style={[styles.email, { color: c.textSecondary }]}>{user?.email ?? ''}</Text>
          <View style={[styles.rolePill, { backgroundColor: c.accentMuted, borderColor: c.accent }]}>
            <Ionicons name="shield-checkmark-outline" size={13} color={c.accent} />
            <Text style={[styles.roleText, { color: c.accent }]}>Organisateur</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: c.textPrimary }]}>Apparence</Text>
          <Text style={[styles.sectionHint, { color: c.textMuted }]}>
            Clair, sombre, ou selon le téléphone.
          </Text>
          <View style={styles.appearanceRow}>
            {APPEARANCE.map((item) => {
              const active = preference === item.key;
              return (
                <Pressable
                  key={item.key}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: active }}
                  onPress={() => setPreference(item.key)}
                  style={({ pressed }) => [
                    styles.appearanceChip,
                    {
                      backgroundColor: active ? c.accent : c.surface,
                      borderColor: active ? c.accent : c.border,
                    },
                    pressed && styles.pressed,
                  ]}
                >
                  <Ionicons
                    name={item.icon}
                    size={16}
                    color={active ? c.onAccent : c.textMuted}
                  />
                  <Text
                    style={[
                      styles.appearanceLabel,
                      { color: active ? c.onAccent : c.textSecondary },
                    ]}
                  >
                    {item.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.footer}>
          <Pressable
            accessibilityRole="button"
            onPress={handleSignOut}
            style={({ pressed }) => [
              styles.signOut,
              { backgroundColor: c.inkButton },
              pressed && styles.pressed,
            ]}
          >
            <Ionicons name="log-out-outline" size={18} color={c.onInkButton} />
            <Text style={[styles.signOutLabel, { color: c.onInkButton }]}>Se déconnecter</Text>
          </Pressable>

          <Text style={[styles.note, { color: c.textMuted }]}>
            Session sécurisée — jetons chiffrés sur l’appareil.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    gap: 28,
  },
  header: { gap: 6 },
  title: {
    fontFamily: fontFamilies.serifSemiBold,
    fontSize: 30,
    lineHeight: 36,
    letterSpacing: -0.4,
  },
  subtitle: {
    fontFamily: fontFamilies.sans,
    fontSize: 14.5,
    lineHeight: 21,
  },
  card: {
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderRadius: 20,
    paddingVertical: 28,
    paddingHorizontal: spacing.xl,
  },
  avatar: {
    width: 76,
    height: 76,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  avatarText: {
    fontFamily: fontFamilies.serifSemiBold,
    fontSize: 26,
    lineHeight: 32,
  },
  name: {
    fontFamily: fontFamilies.sansSemiBold,
    fontSize: 17,
    lineHeight: 23,
  },
  email: {
    fontFamily: fontFamilies.sans,
    fontSize: 13.5,
    lineHeight: 19,
  },
  rolePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginTop: 6,
  },
  roleText: {
    fontFamily: fontFamilies.sansMedium,
    fontSize: 12.5,
    lineHeight: 16,
  },
  section: { gap: 10 },
  sectionTitle: {
    fontFamily: fontFamilies.sansSemiBold,
    fontSize: 16,
  },
  sectionHint: {
    fontFamily: fontFamilies.sans,
    fontSize: 13,
    lineHeight: 19,
  },
  appearanceRow: { flexDirection: 'row', gap: 10, marginTop: 4 },
  appearanceChip: {
    flex: 1,
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 14,
  },
  appearanceLabel: {
    fontFamily: fontFamilies.sansSemiBold,
    fontSize: 12.5,
  },
  footer: {
    marginTop: 'auto',
    gap: 14,
    paddingTop: 12,
  },
  signOut: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    minHeight: 50,
    borderRadius: 14,
  },
  signOutLabel: {
    fontFamily: fontFamilies.sansSemiBold,
    fontSize: 14.5,
  },
  note: {
    fontFamily: fontFamilies.sans,
    fontSize: 12,
    lineHeight: 17,
    textAlign: 'center',
  },
  pressed: { opacity: 0.84 },
});
