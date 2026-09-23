/**
 * Coquille auth — fond cream / plum, accents coral.
 */

import { createContext, useContext, useState, type ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
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
import { SocialAuthRow } from './SocialAuthRow';

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
  /** Affiche la rangée Google / Apple (défaut true). */
  showSocial?: boolean;
}

export function AuthShell({
  tone = 'dark',
  title,
  subtitle,
  children,
  footer,
  showSocial = true,
}: AuthShellProps) {
  const insets = useSafeAreaInsets();
  const [notice, setNotice] = useState<string | null>(null);
  const isDark = tone === 'dark';
  const bg = isDark ? '#2A1824' : '#F7F0E8';
  const text = isDark ? '#F7F0E8' : '#2A1F24';
  const muted = isDark ? 'rgba(247, 240, 232, 0.58)' : '#6B5560';
  const accent = '#E07A5F';

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
                  {
                    maxWidth: layout.formMaxWidth,
                    borderColor: accent,
                    backgroundColor: `${accent}18`,
                  },
                ]}
              >
                <Ionicons name="information-circle-outline" size={18} color={accent} />
                <Text style={[styles.noticeText, { color: isDark ? '#F5D4C8' : '#C45D45' }]}>
                  {notice}
                </Text>
              </View>
            ) : null}

            {showSocial ? (
              <SocialAuthRow isDark={isDark} muted={muted} onNotice={setNotice} />
            ) : null}

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

  footer: { alignItems: 'center', marginTop: spacing.xl, width: '100%' },
});
