/**
 * Invite d’installation PWA — Android (prompt natif) / iPhone (guide Partager).
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { Modal, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Logo } from '@/components/ui/Logo';
import { brandColors, fontFamilies, radii, shadows } from '@/constants/theme';
import { useAppTheme } from '@/context/ThemePreferenceContext';
import {
  type BeforeInstallPromptEvent,
  detectPwaPlatform,
  dismissPwaPrompt,
  isPwaInstalled,
  isWebRuntime,
  wasPwaPromptDismissed,
} from './pwaInstall';

export function PwaInstallPrompt() {
  const { theme } = useAppTheme();
  const c = theme.colors;
  const insets = useSafeAreaInsets();
  const [visible, setVisible] = useState(false);
  const [iosGuide, setIosGuide] = useState(false);
  const deferredRef = useRef<BeforeInstallPromptEvent | null>(null);
  const platform = detectPwaPlatform();

  useEffect(() => {
    if (!isWebRuntime() || isPwaInstalled() || wasPwaPromptDismissed()) return;

    const onBeforeInstall = (event: Event) => {
      event.preventDefault();
      deferredRef.current = event as BeforeInstallPromptEvent;
    };

    window.addEventListener('beforeinstallprompt', onBeforeInstall);

    const timer = window.setTimeout(() => {
      if (isPwaInstalled() || wasPwaPromptDismissed()) return;
      setVisible(true);
    }, 2200);

    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('beforeinstallprompt', onBeforeInstall);
    };
  }, []);

  const close = useCallback(() => {
    dismissPwaPrompt();
    setVisible(false);
    setIosGuide(false);
  }, []);

  const install = useCallback(async () => {
    if (platform === 'ios') {
      setIosGuide(true);
      return;
    }
    const deferred = deferredRef.current;
    if (deferred) {
      try {
        await deferred.prompt();
        await deferred.userChoice;
      } catch {
        /* ignore */
      }
      deferredRef.current = null;
      close();
      return;
    }
    setIosGuide(true);
  }, [close, platform]);

  if (Platform.OS !== 'web' || !visible) return null;

  const title =
    platform === 'ios'
      ? 'Installer sur iPhone'
      : platform === 'android'
        ? 'Installer sur Android'
        : 'Installer MK Events';

  const subtitle =
    platform === 'ios'
      ? 'Ajoutez l’app à l’écran d’accueil pour un accès rapide, comme une application.'
      : 'Installez MK Events sur votre téléphone pour l’ouvrir hors navigateur.';

  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={close}>
      <View style={styles.backdrop}>
        <View
          style={[
            styles.sheet,
            shadows.md,
            {
              backgroundColor: c.surfaceElevated,
              borderColor: c.border,
              paddingBottom: Math.max(insets.bottom, 18),
            },
          ]}
        >
          <View style={styles.handle} />

          <View style={styles.brandRow}>
            <Logo size="sm" variant={theme.mode === 'light' ? 'ink' : 'light'} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.title, { color: c.textPrimary }]}>{title}</Text>
              <Text style={[styles.subtitle, { color: c.textMuted }]}>{subtitle}</Text>
            </View>
          </View>

          {iosGuide ? (
            <View style={[styles.guide, { backgroundColor: c.background, borderColor: c.border }]}>
              {platform === 'ios' ? (
                <>
                  <GuideStep index="1" text="Appuyez sur Partager" icon="share-outline" color={c.textPrimary} />
                  <GuideStep
                    index="2"
                    text="Choisissez « Sur l’écran d’accueil »"
                    icon="add-circle-outline"
                    color={c.textPrimary}
                  />
                  <GuideStep index="3" text="Validez « Ajouter »" icon="checkmark-circle-outline" color={c.textPrimary} />
                </>
              ) : (
                <>
                  <GuideStep
                    index="1"
                    text="Ouvrez le menu du navigateur (⋮)"
                    icon="ellipsis-vertical"
                    color={c.textPrimary}
                  />
                  <GuideStep
                    index="2"
                    text="Choisissez « Installer l’application »"
                    icon="download-outline"
                    color={c.textPrimary}
                  />
                  <GuideStep
                    index="3"
                    text="Confirmez l’installation"
                    icon="checkmark-circle-outline"
                    color={c.textPrimary}
                  />
                </>
              )}
            </View>
          ) : null}

          <View style={styles.actions}>
            {!iosGuide ? (
              <Pressable
                accessibilityRole="button"
                onPress={() => { void install(); }}
                style={({ pressed }) => [
                  styles.primary,
                  { backgroundColor: brandColors.ink },
                  pressed && styles.pressed,
                ]}
              >
                <Ionicons name="download-outline" size={18} color={brandColors.coral} />
                <Text style={styles.primaryLabel}>
                  {platform === 'ios' ? 'Voir comment faire' : 'Installer'}
                </Text>
              </Pressable>
            ) : (
              <Pressable
                accessibilityRole="button"
                onPress={close}
                style={({ pressed }) => [
                  styles.primary,
                  { backgroundColor: brandColors.ink },
                  pressed && styles.pressed,
                ]}
              >
                <Text style={styles.primaryLabel}>Compris</Text>
              </Pressable>
            )}

            <Pressable
              accessibilityRole="button"
              onPress={close}
              style={({ pressed }) => [styles.secondary, pressed && styles.pressed]}
            >
              <Text style={[styles.secondaryLabel, { color: c.textMuted }]}>Plus tard</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function GuideStep({
  index,
  text,
  icon,
  color,
}: {
  index: string;
  text: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}) {
  return (
    <View style={styles.guideRow}>
      <View style={styles.guideIndex}>
        <Text style={styles.guideIndexText}>{index}</Text>
      </View>
      <Ionicons name={icon} size={18} color={color} />
      <Text style={[styles.guideText, { color }]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(18, 24, 32, 0.45)',
  },
  sheet: {
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    borderWidth: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
    gap: 16,
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(120, 130, 140, 0.35)',
    marginBottom: 4,
  },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  title: {
    fontFamily: fontFamilies.serifMedium,
    fontSize: 20,
    lineHeight: 26,
  },
  subtitle: {
    fontFamily: fontFamilies.sans,
    fontSize: 13.5,
    lineHeight: 19,
    marginTop: 4,
  },
  guide: {
    borderRadius: radii.lg,
    borderWidth: 1,
    padding: 14,
    gap: 12,
  },
  guideRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  guideIndex: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(224, 122, 95, 0.15)',
  },
  guideIndexText: {
    fontFamily: fontFamilies.sansSemiBold,
    fontSize: 11,
    color: '#E07A5F',
  },
  guideText: {
    flex: 1,
    fontFamily: fontFamilies.sansMedium,
    fontSize: 13.5,
  },
  actions: { gap: 8 },
  primary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 14,
    paddingVertical: 14,
  },
  primaryLabel: {
    fontFamily: fontFamilies.sansSemiBold,
    fontSize: 15,
    color: brandColors.coral,
  },
  secondary: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  secondaryLabel: {
    fontFamily: fontFamilies.sansMedium,
    fontSize: 13.5,
  },
  pressed: { opacity: 0.85 },
});
