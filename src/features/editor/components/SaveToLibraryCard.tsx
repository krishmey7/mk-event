import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { ApiError } from '@/services/apiClient';
import { useEditor } from '../EditorContext';

/** Publie le studio (slug + invités Django), puis ouvre Mes invitations. */
export function SaveToLibraryCard() {
  const router = useRouter();
  const { saveToLibrary, saving, dirty, boundEventId, published, theme } = useEditor();
  const [error, setError] = useState<string | null>(null);
  const colors = theme.colors;

  const onSave = async () => {
    setError(null);
    try {
      await saveToLibrary();
      router.replace('/invitations');
    } catch (err) {
      if (err instanceof ApiError) {
        const fieldHint = err.fieldErrors[0]
          ? ` (${err.fieldErrors[0].field}: ${err.fieldErrors[0].message})`
          : '';
        setError(`${err.message}${fieldHint}`);
        return;
      }
      setError('Publication impossible. Vérifiez la connexion API et réessayez.');
    }
  };

  const done = Boolean(boundEventId) && !dirty && published;

  return (
    <View style={[styles.card, { borderColor: colors.border, backgroundColor: colors.surface }]}>
        <Text style={[styles.title, { color: colors.text }]}>Publication</Text>
      <Text style={[styles.hint, { color: colors.textMuted }]}>
        {done
          ? 'Invitation publiée (slug + invités Django). Les liens QR utilisent access_token.'
          : boundEventId
            ? 'Des changements n’ont pas encore été publiés sur l’API.'
            : 'Publiez pour enregistrer l’invitation, synchroniser les invités et activer les liens personnels.'}
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
          {saving ? 'Publication…' : done ? 'Republier' : 'Publier l’invitation'}
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
  title: { fontFamily: 'Inter_600SemiBold', fontSize: 15, color: '#1C1712' },
  hint: { fontFamily: 'Inter_400Regular', fontSize: 13, lineHeight: 18, color: '#6F675C' },
  error: { fontFamily: 'Inter_500Medium', fontSize: 12, color: '#A45A45' },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    minHeight: 46,
    borderRadius: 999,
    marginTop: 6,
  },
  btnLabel: { fontFamily: 'Inter_600SemiBold', fontSize: 13.5 },
  pressed: { opacity: 0.85 },
});
