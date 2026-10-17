/**
 * Coquille auth — Dark Luxury (plum + coral), atmosphère et hiérarchie marque.
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
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

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
  /** Affiche la rangée Google (défaut true). */
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
  const bg = isDark ? '#1F121C' : '#F7F0E8';
  const text = isDark ? '#F7F0E8' : '#2A1F24';
  const muted = isDark ? 'rgba(247, 240, 232, 0.55)' : '#6B5560';
  const accent = '#E07A5F';

  return (
    <AuthNoticeContext.Provider value={setNotice}>
      <View style={[styles.screen, { backgroundColor: bg }]}>
        <StatusBar style={isDark ? 'light' : 'dark'} />

        {isDark ? (
          <View pointerEvents="none" style={StyleSheet.absoluteFill}>
            <View style={styles.glowCoral} />
            <View style={styles.glowPlum} />
            <View style={styles.glowBottom} />
            <View style={styles.grain} />
          </View>
        ) : (
          <View pointerEvents="none" style={StyleSheet.absoluteFill}>
            <View style={styles.glowLight} />
          </View>
        )}

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.flex}
        >
          <ScrollView
            contentContainerStyle={[
              styles.content,
              {
                paddingTop: Math.max(insets.top, spacing.md) + spacing.xl,
                paddingBottom: insets.bottom + spacing.xxl,
              },
            ]}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <Animated.View entering={FadeIn.duration(500)} style={styles.brandBlock}>
              <Logo size="xl" variant={isDark ? 'light' : 'ink'} />
              <View style={[styles.brandRule, { backgroundColor: `${accent}55` }]} />
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(80).duration(480)} style={styles.headingBlock}>
              <Text style={[styles.title, { color: text }]}>{title}</Text>
              <Text style={[styles.subtitle, { color: muted }]}>{subtitle}</Text>
            </Animated.View>

            <Animated.View
              entering={FadeInDown.delay(160).duration(480)}
              style={[styles.panel, { maxWidth: layout.formMaxWidth }]}
            >
              {notice ? (
                <View
                  style={[
                    styles.notice,
                    {
                      borderColor: `${accent}66`,
                      backgroundColor: `${accent}14`,
                    },
                  ]}
                >
                  <Ionicons name="information-circle-outline" size={18} color={accent} />
                  <Text style={[styles.noticeText, { color: isDark ? '#F5D4C8' : '#C45D45' }]}>
                    {notice}
                  </Text>
                </View>
              ) : null}

              <View style={styles.form}>{children}</View>

              {showSocial ? (
                <SocialAuthRow isDark={isDark} muted={muted} onNotice={setNotice} />
              ) : null}
            </Animated.View>

            <Animated.View
              entering={FadeInDown.delay(240).duration(420)}
              style={[styles.footer, { maxWidth: layout.formMaxWidth }]}
            >
              {footer}
            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </AuthNoticeContext.Provider>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, overflow: 'hidden' },
  flex: { flex: 1 },
  content: {
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    flexGrow: 1,
    justifyContent: 'center',
  },

  glowCoral: {
    position: 'absolute',
    top: -120,
    right: -80,
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: 'rgba(224, 122, 95, 0.18)',
    ...Platform.select({
      web: { filter: 'blur(48px)' } as object,
      default: { opacity: 0.85 },
    }),
  },
  glowPlum: {
    position: 'absolute',
    top: '28%',
    left: -140,
    width: 360,
    height: 360,
    borderRadius: 180,
    backgroundColor: 'rgba(107, 58, 92, 0.35)',
    ...Platform.select({
      web: { filter: 'blur(56px)' } as object,
      default: { opacity: 0.9 },
    }),
  },
  glowBottom: {
    position: 'absolute',
    bottom: -160,
    alignSelf: 'center',
    left: '15%',
    width: '70%',
    height: 280,
    borderRadius: 140,
    backgroundColor: 'rgba(224, 122, 95, 0.08)',
    ...Platform.select({
      web: { filter: 'blur(40px)' } as object,
      default: {},
    }),
  },
  glowLight: {
    position: 'absolute',
    top: -80,
    right: -40,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: 'rgba(224, 122, 95, 0.12)',
  },
  grain: {
    ...StyleSheet.absoluteFillObject,
    opacity: Platform.OS === 'web' ? 0.04 : 0.03,
    backgroundColor: 'transparent',
    ...Platform.select({
      web: {
        backgroundImage:
          'radial-gradient(rgba(247,240,232,0.35) 0.6px, transparent 0.6px)',
        backgroundSize: '3px 3px',
      } as object,
      default: {},
    }),
  },

  brandBlock: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  brandRule: {
    width: 40,
    height: 2,
    borderRadius: 1,
    marginTop: spacing.md,
  },
  headingBlock: {
    alignItems: 'center',
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.sm,
  },
  title: {
    fontFamily: fontFamilies.serifSemiBold,
    fontSize: 34,
    lineHeight: 40,
    textAlign: 'center',
    letterSpacing: -0.6,
  },
  subtitle: {
    fontFamily: fontFamilies.sans,
    fontSize: 15,
    lineHeight: 23,
    textAlign: 'center',
    marginTop: spacing.sm,
    maxWidth: 360,
  },

  panel: {
    width: '100%',
    gap: spacing.lg,
  },
  form: {
    width: '100%',
    gap: spacing.md,
  },

  notice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    width: '100%',
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + spacing.xs,
  },
  noticeText: {
    flex: 1,
    fontFamily: fontFamilies.sansMedium,
    fontSize: 13,
    lineHeight: 18,
  },

  footer: { alignItems: 'center', marginTop: spacing.xl, width: '100%' },
});
