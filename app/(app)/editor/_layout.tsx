/**
 * Studio d'édition d'invitation — racine (`/editor?template={key}`).
 */

import { Stack, useGlobalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { EditorProvider } from '@/features/editor/EditorContext';
import { useStudioChrome } from '@/features/editor/useStudioChrome';
import { useAppTheme } from '@/context/ThemePreferenceContext';
import { useResolvedEditorTemplate } from '@/features/editor/navigation';
import { useActiveEvent } from '@/context/ActiveEventContext';

export default function EditorLayout() {
  const params = useGlobalSearchParams<{
    template?: string | string[];
    theme?: string | string[];
    event?: string | string[];
  }>();
  const templateKey = useResolvedEditorTemplate(params.template);
  const themeParam = Array.isArray(params.theme) ? params.theme[0] : params.theme;
  const eventId = Array.isArray(params.event) ? params.event[0] : params.event;
  const { themeKey: activeThemeKey } = useActiveEvent();

  return (
    <EditorProvider
      key={`${templateKey ?? 'default'}-${themeParam ?? activeThemeKey}-${eventId ?? 'new'}`}
      templateKey={templateKey}
      initialThemeKey={themeParam ?? activeThemeKey}
      eventId={eventId}
    >
      <ThemedEditorStack />
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
      />
    </>
  );
}
