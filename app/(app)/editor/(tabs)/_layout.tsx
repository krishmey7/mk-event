/**
 * Studio — parcours guidé dynamique selon le type d’événement.
 */

import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { Tabs, useRouter, usePathname } from 'expo-router';

import { EditorHeader } from '@/features/editor/components/EditorHeader';
import { EditorTabBar } from '@/features/editor/components/EditorTabBar';
import { safeExitEditor } from '@/features/editor/navigation';
import { useAppTheme } from '@/context/ThemePreferenceContext';
import { useActiveEvent } from '@/context/ActiveEventContext';
import { useEditor } from '@/features/editor/EditorContext';
import { getStudioSteps, isStudioRouteVisible } from '@/features/editor/studioSteps';

export default function EditorTabsLayout() {
  const router = useRouter();
  const pathname = usePathname();
  const { theme } = useAppTheme();
  const { type: activeType } = useActiveEvent();
  const { template } = useEditor();
  const eventType = activeType || template.category;
  const steps = getStudioSteps(eventType);
  const c = theme.colors;
  const key = pathname.split('/').filter(Boolean).pop() ?? 'index';
  const title =
    steps.find((step) => step.route === key)?.headerTitle
    ?? steps[0]?.headerTitle
    ?? 'Studio';

  const hrefFor = useMemo(
    () => (route: string) => (isStudioRouteVisible(route, eventType) ? undefined : null),
    [eventType],
  );

  return (
    <View style={[styles.root, { backgroundColor: c.background }]}>
      <EditorHeader
        title={title}
        onBack={() => safeExitEditor(router)}
        leftLabel="Quitter"
      />

      <Tabs
        tabBar={(props) => <EditorTabBar {...props} />}
        screenOptions={{
          headerShown: false,
          sceneStyle: { backgroundColor: c.background },
        }}
      >
        <Tabs.Screen name="index" options={{ title: 'Infos', href: hrefFor('index') }} />
        <Tabs.Screen name="photos" options={{ title: 'Photos', href: hrefFor('photos') }} />
        <Tabs.Screen name="jour" options={{ title: 'Récit', href: hrefFor('jour') }} />
        <Tabs.Screen name="programme" options={{ title: 'Agenda', href: hrefFor('programme') }} />
        <Tabs.Screen name="histoire" options={{ title: 'Speakers', href: hrefFor('histoire') }} />
        <Tabs.Screen name="theme" options={{ title: 'Décor', href: hrefFor('theme') }} />
        <Tabs.Screen name="plus" options={{ title: 'Invités', href: hrefFor('plus') }} />
        <Tabs.Screen name="publier" options={{ title: 'Publier', href: hrefFor('publier') }} />
        <Tabs.Screen name="voix" options={{ title: 'Voix', href: null }} />
        <Tabs.Screen name="compteur" options={{ href: null }} />
      </Tabs>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
