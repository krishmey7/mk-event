/**
 * STUDIO — Accueil vocal + ambiance (écran stack).
 */

import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

import { EditorHeader } from '@/features/editor/components/EditorHeader';
import { VoixEditorPanel } from '@/features/editor/components/VoixEditorPanel';
import { goBackInEditor } from '@/features/editor/navigation';
import { useAppTheme } from '@/context/ThemePreferenceContext';

export default function VoixScreen() {
  const router = useRouter();
  const { theme } = useAppTheme();

  return (
    <View style={[styles.screen, { backgroundColor: theme.colors.background }]}>
      <EditorHeader title="Voix & musique" onBack={() => goBackInEditor(router)} />
      <VoixEditorPanel />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
});
