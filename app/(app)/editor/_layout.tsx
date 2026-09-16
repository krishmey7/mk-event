/**
 * Studio d'édition d'invitation — racine (`/editor?template={key}`).
 */

import { Stack, useGlobalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { EditorProvider, useEditor } from '@/features/editor/EditorContext';
import { useResolvedEditorTemplate } from '@/features/editor/navigation';

export default function EditorLayout() {
  const params = useGlobalSearchParams<{
    template?: string | string[];
    theme?: string | string[];
    event?: string | string[];
  }>();
  const templateKey = useResolvedEditorTemplate(params.template);
  const themeKey = Array.isArray(params.theme) ? params.theme[0] : params.theme;
  const eventId = Array.isArray(params.event) ? params.event[0] : params.event;

  return (
    <EditorProvider
      key={`${templateKey ?? 'default'}-${themeKey ?? 'default'}-${eventId ?? 'new'}`}
      templateKey={templateKey}
      initialThemeKey={themeKey}
      eventId={eventId}
    >
      <ThemedEditorStack />
    </EditorProvider>
  );
}

function ThemedEditorStack() {
  const { theme } = useEditor();
  const c = theme.colors;

  return (
    <>
      <StatusBar style={theme.isDark ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: c.bg },
        }}
      />
    </>
  );
}
