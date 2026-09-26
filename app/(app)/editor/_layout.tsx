/**
 * Studio d'édition d'invitation — racine (`/editor?template={key}`).
 * La session (modèle / thème / event) est figée pour ne pas
 * se réinitialiser en ouvrant « Voir » (perte des query params).
 * Avec un eventId : hydrate depuis l’API (studio_config) avant le mount.
 */

import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { Stack, useGlobalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { brandColors } from '@/constants/theme';
import { SIMULATE_BACKEND } from '@/constants/config';
import { EditorProvider } from '@/features/editor/EditorContext';
import { StudioNavModeProvider } from '@/features/editor/StudioNavModeContext';
import { useStudioChrome } from '@/features/editor/useStudioChrome';
import { useAppTheme } from '@/context/ThemePreferenceContext';
import {
  useResolvedEditorTemplate,
  useResolvedEditorTheme,
} from '@/features/editor/navigation';
import { useActiveEvent } from '@/context/ActiveEventContext';
import { resolveEditorBootSnapshot } from '@/features/editor/resolveEditorBoot';
import type { EditorSnapshot } from '@/features/editor/snapshot';

export default function EditorLayout() {
  const params = useGlobalSearchParams<{
    template?: string | string[];
    theme?: string | string[];
    event?: string | string[];
  }>();
  const templateKey = useResolvedEditorTemplate(params.template);
  const themeFromUrl = useResolvedEditorTheme(params.theme);
  const eventId = Array.isArray(params.event) ? params.event[0] : params.event;
  const { themeKey: activeThemeKey } = useActiveEvent();
  const resolvedTheme = themeFromUrl ?? activeThemeKey;

  /** Identité de session figée — ne change pas si l’URL perd ?theme=. */
  const sessionRef = useRef<{
    templateKey?: string;
    themeKey?: string;
    eventId?: string;
  } | null>(null);

  if (!sessionRef.current) {
    sessionRef.current = {
      templateKey,
      themeKey: resolvedTheme,
      eventId,
    };
  } else {
    const session = sessionRef.current;
    const templateChanged = Boolean(templateKey && templateKey !== session.templateKey);
    if (templateKey) session.templateKey = templateKey;
    // « Voir » pousse la palette résolue dans l’URL. Ne pas remonter le studio
    // pour ça : la photo choisie (souvent un blob local) serait perdue.
    if (templateChanged) {
      session.themeKey = themeFromUrl ?? resolvedTheme ?? session.themeKey;
    } else if (!session.themeKey && resolvedTheme) {
      session.themeKey = resolvedTheme;
    }
  }

  const session = sessionRef.current;
  const numericEventId = session.eventId ? Number(session.eventId) : Number.NaN;
  const needsHydrate = Number.isFinite(numericEventId) && !SIMULATE_BACKEND;

  const [bootSnap, setBootSnap] = useState<EditorSnapshot | null | undefined>(
    needsHydrate ? undefined : null,
  );
  const [hydrateKey, setHydrateKey] = useState(0);

  useEffect(() => {
    if (!needsHydrate) {
      setBootSnap(null);
      return;
    }
    let alive = true;
    setBootSnap(undefined);
    void (async () => {
      const snap = await resolveEditorBootSnapshot(numericEventId);
      if (!alive) return;
      setBootSnap(snap);
      setHydrateKey((k) => k + 1);
    })();
    return () => {
      alive = false;
    };
  }, [needsHydrate, numericEventId]);

  if (needsHydrate && bootSnap === undefined) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator color={brandColors.goldSoft} />
      </View>
    );
  }

  const providerKey = [
    session.templateKey ?? 'default',
    session.eventId ?? 'new',
    String(hydrateKey),
  ].join('-');

  return (
    <EditorProvider
      key={providerKey}
      templateKey={session.templateKey}
      initialThemeKey={session.themeKey}
      eventId={session.eventId}
      initialSnapshot={bootSnap}
    >
      <StudioNavModeProvider>
        <ThemedEditorStack />
      </StudioNavModeProvider>
    </EditorProvider>
  );
}

function ThemedEditorStack() {
  const c = useStudioChrome();
  const { mode } = useAppTheme();

  return (
    <>
      <StatusBar style={mode === 'dark' ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: c.bg },
        }}
      >
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="previsualisation"
          options={{
            animation: 'slide_from_right',
            contentStyle: { backgroundColor: c.bg },
          }}
        />
        <Stack.Screen
          name="couverture-photo"
          options={{
            presentation: 'transparentModal',
            animation: 'fade',
            contentStyle: { backgroundColor: 'transparent' },
          }}
        />
        <Stack.Screen
          name="programme-etape"
          options={{
            presentation: 'transparentModal',
            animation: 'fade',
            contentStyle: { backgroundColor: 'transparent' },
          }}
        />
        <Stack.Screen
          name="histoire-etape"
          options={{
            presentation: 'transparentModal',
            animation: 'fade',
            contentStyle: { backgroundColor: 'transparent' },
          }}
        />
      </Stack>
    </>
  );
}

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: brandColors.cream,
  },
});
