/**
 * Studio — 4 étapes : Page · Thème · Récit · Invités.
 */

import { StyleSheet, View } from 'react-native';
import { Tabs, useRouter, usePathname } from 'expo-router';

import { EditorHeader } from '@/features/editor/components/EditorHeader';
import { EditorTabBar } from '@/features/editor/components/EditorTabBar';
import { useEditor } from '@/features/editor/EditorContext';
import { safeExitEditor } from '@/features/editor/navigation';

const TITLES: Record<string, string> = {
  index: 'Votre invitation',
  theme: 'Thème',
  jour: 'Récit',
  plus: 'Invités',
  histoire: 'Histoire',
  programme: 'Programme',
  compteur: 'Compte à rebours',
};

export default function EditorTabsLayout() {
  const router = useRouter();
  const pathname = usePathname();
  const { theme } = useEditor();
  const key = pathname.split('/').filter(Boolean).pop() ?? 'index';
  const title = TITLES[key] ?? TITLES.index;

  return (
    <View style={[styles.root, { backgroundColor: theme.colors.bg }]}>
      <EditorHeader
        title={title}
        onBack={() => safeExitEditor(router)}
        leftLabel="Quitter"
      />

      <Tabs
        tabBar={(props) => <EditorTabBar {...props} />}
        screenOptions={{
          headerShown: false,
          sceneStyle: { backgroundColor: theme.colors.bg },
        }}
      >
        <Tabs.Screen name="index" options={{ title: 'Page' }} />
        <Tabs.Screen name="theme" options={{ title: 'Thème' }} />
        <Tabs.Screen name="jour" options={{ title: 'Récit' }} />
        <Tabs.Screen name="plus" options={{ title: 'Invités' }} />
        <Tabs.Screen name="histoire" options={{ href: null }} />
        <Tabs.Screen name="programme" options={{ href: null }} />
        <Tabs.Screen name="compteur" options={{ href: null }} />
      </Tabs>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
