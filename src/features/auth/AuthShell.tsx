/**
 * Coquille auth — fond cream / plum, accents coral.
 */

import { createContext, useContext, useState, type ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Logo } from '@/components/ui/Logo';
import { fontFamilies, layout, spacing } from '@/constants/theme';

const AuthNoticeContext = createContext<(message: string) => void>(() => undefined);

export function useAuthNotice() {
  return useContext(AuthNoticeContext);
}

export type AuthShellTone = 'dark' | 'light';

export interface AuthShellProps {
  tone?: AuthShellTone;
  title: string;
  subtitle: string;
  children: ReactNode;
  footer: ReactNode;
}

export function AuthShell({ tone = 'dark', title, subtitle, children, footer }: AuthShellProps) {
  const insets = useSafeAreaInsets();
  const [notice, setNotice] = useState<string | null>(null);
  const isDark = tone === 'dark';
  const bg = isDark ? '#2A1824' : '#F7F0E8';
  const text = isDark ? '#F7F0E8' : '#2A1F24';
  const muted = isDark ? 'rgba(247, 240, 232, 0.58)' : '#6B5560';
  const accent = isDark ? '#E07A5F' : '#E07A5F';

  const handleSocial = (provider: 'Google' | 'Apple') => {
    setNotice(
      `La connexion ${provider} sera disponible prochainement — utilisez votre e-mail en attendant.`,
    );
  };

  return (
    <AuthNoticeContext.Provider value={setNotice}>
      <View style={[styles.screen, { backgroundColor: bg }]}>
        <StatusBar style={isDark ? 'light' : 'dark'} />

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.flex}
        >
          <ScrollView
            contentContainerStyle={[
              styles.content,
              {
                paddingTop: insets.top + spacing.xl,
                paddingBottom: insets.bottom + spacing.xl,
              },
            ]}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <Logo size="xl" variant={isDark ? 'light' : 'ink'} />

            <Text style={[styles.title, { color: text }]}>{title}</Text>
            <Text style={[styles.subtitle, { color: muted }]}>{subtitle}</Text>

            <View style={[styles.form, { maxWidth: layout.formMaxWidth }]}>{children}</View>

            {notice ? (
              <View
                style={[
                  styles.notice,
                  { maxWidth: layout.formMaxWidth, borderColor: accent, backgroundColor: `${accent}18` },
                ]}
              >
                <Ionicons name="information-circle-outline" size={18} color={accent} />
                <Text style={[styles.noticeText, { color: isDark ? '#F5D4C8' : '#C45D45' }]}>
                  {notice}
                </Text>
              </View>
            ) : null}

            <View style={[styles.dividerRow, { maxWidth: layout.formMaxWidth }]}>
              <View style={[styles.divider, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : '#E8D9CE' }]} />
              <Text style={[styles.dividerText, { color: muted }]}>ou</Text>
              <View style={[styles.divider, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : '#E8D9CE' }]} />
            </View>

            <View style={[styles.socialRow, { maxWidth: layout.formMaxWidth }]}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Continuer avec Google"
                onPress={() => handleSocial('Google')}
                style={({ pressed }) => [
                  styles.socialCircle,
                  isDark ? styles.socialCircleDark : styles.socialCircleLight,
                  pressed && styles.pressed,
                ]}
              >
                <Ionicons name="logo-google" size={22} color={isDark ? '#F7F0E8' : '#2A1F24'} />
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Continuer avec Apple"
                onPress={() => handleSocial('Apple')}
                style={({ pressed }) => [
                  styles.socialCircle,
                  isDark ? styles.socialCircleDark : styles.socialCircleLight,
                  pressed && styles.pressed,
                ]}
              >
                <Ionicons name="logo-apple" size={24} color={isDark ? '#F7F0E8' : '#2A1F24'} />
              </Pressable>
            </View>

            <View style={[styles.footer, { maxWidth: layout.formMaxWidth }]}>{footer}</View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </AuthNoticeContext.Provider>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  flex: { flex: 1 },
  content: { alignItems: 'center', paddingHorizontal: spacing.lg, gap: 0 },
  pressed: { opacity: 0.75 },
  title: {
    fontFamily: fontFamilies.serifSemiBold,
    fontSize: 30,
    lineHeight: 36,
    textAlign: 'center',
    marginTop: spacing.xl,
    letterSpacing: -0.4,
  },
  subtitle: {
    fontFamily: fontFamilies.sans,
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    marginTop: spacing.sm,
    maxWidth: 380,
  },
  form: { width: '100%', gap: spacing.md, marginTop: spacing.xl },

  notice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    width: '100%',
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + spacing.xs,
    marginTop: spacing.md,
  },
  noticeText: {
    flex: 1,
    fontFamily: fontFamilies.sansMedium,
    fontSize: 13,
    lineHeight: 18,
  },

  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginTop: spacing.lg,
  },
  divider: { flex: 1, height: StyleSheet.hairlineWidth },
  dividerText: {
    fontFamily: fontFamilies.sansMedium,
    fontSize: 12,
    lineHeight: 16,
    marginHorizontal: spacing.md,
  },

  socialRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.md,
    width: '100%',
    marginTop: spacing.md,
  },
  socialCircle: {
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  socialCircleDark: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  socialCircleLight: {
    backgroundColor: '#FFFCFA',
    borderWidth: 1,
    borderColor: '#E8D9CE',
  },

  footer: { alignItems: 'center', marginTop: spacing.xl, width: '100%' },
});
