import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { fontFamilies } from '@/constants/theme';
import { ApiError, formatApiMessage } from '@/services/apiClient';
import { useEditor } from '../EditorContext';
import { useStudioChrome } from '../useStudioChrome';

/** Publie le studio (slug + invités Django), puis ouvre Mes invitations. */
export function SaveToLibraryCard() {
  const router = useRouter();
  const { saveToLibrary, saving, dirty, boundEventId, published } = useEditor();
  const colors = useStudioChrome();
  const [error, setError] = useState<string | null>(null);

  const onSave = async () => {
    setError(null);
    try {
      const eventId = await saveToLibrary();
      router.replace(`/invitations/${eventId}?welcome=1`);
    } catch (err) {
      const readable =
        formatApiMessage(err instanceof ApiError ? (err.fieldErrors[0]?.message ?? err.message) : err)
        ?? (err instanceof ApiError ? err.message : null)
        ?? 'Publication impossible. Vérifiez votre connexion et réessayez.';
      setError(readable === '[object Object]'
        ? 'Publication impossible. Vérifiez votre connexion et réessayez.'
        : readable);
    }
  };

  const done = Boolean(boundEventId) && !dirty && published;

  return (
    <View style={[styles.card, { borderColor: colors.border, backgroundColor: colors.surface }]}>
      <Text style={[styles.title, { color: colors.text }]}>Publication</Text>
      <Text style={[styles.hint, { color: colors.textMuted }]}>
        {done
          ? 'Invitation publiée. Chaque invité a son lien personnel et pourra afficher son pass d’entrée après confirmation.'
          : boundEventId
            ? 'Vous avez des modifications non publiées. Republiez pour les rendre visibles aux invités.'
            : 'Publiez pour enregistrer l’invitation et activer les liens personnels de vos invités.'}
      </Text>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Pressable
        accessibilityRole="button"
        onPress={() => void onSave()}
        disabled={saving}
        style={({ pressed }) => [
          styles.btn,
          { backgroundColor: colors.primary },
          (pressed || saving) && styles.pressed,
        ]}
      >
        {saving ? (
          <ActivityIndicator color={colors.onPrimary} />
        ) : (
          <Ionicons name={done ? 'checkmark' : 'cloud-upload-outline'} size={16} color={colors.onPrimary} />
        )}
        <Text style={[styles.btnLabel, { color: colors.onPrimary }]}>
        {saving ? 'Préparation & publication…' : done ? 'Republier' : 'Publier l’invitation'}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    gap: 8,
    marginBottom: 20,
  },
  title: { fontFamily: fontFamilies.sansSemiBold, fontSize: 15 },
  hint: { fontFamily: fontFamilies.sans, fontSize: 13, lineHeight: 18 },
  error: { fontFamily: fontFamilies.sansMedium, fontSize: 12, color: '#A45A45' },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    minHeight: 46,
    borderRadius: 14,
    marginTop: 6,
  },
  btnLabel: { fontFamily: fontFamilies.sansSemiBold, fontSize: 13.5 },
  pressed: { opacity: 0.85 },
});
