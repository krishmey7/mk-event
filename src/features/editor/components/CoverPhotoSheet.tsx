/**
 * Sheet — choisir la photo de fond (import device + grille modèle).
 */

import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { StudioBottomSheet } from '@/features/editor/components/StudioBottomSheet';
import { useEditor } from '@/features/editor/EditorContext';
import { useStudioChrome } from '@/features/editor/useStudioChrome';
import { pickLibraryImage } from '@/features/editor/imagePicker';

export function CoverPhotoSheet({
  visible,
  onClose,
  embedded = false,
}: {
  visible: boolean;
  onClose: () => void;
  embedded?: boolean;
}) {
  const { template, cover, updateCover } = useEditor();
  const colors = useStudioChrome();
  const candidates = template.galleryImages;

  const pick = (uri: string) => {
    updateCover({ photoUri: uri });
    onClose();
  };

  const importFromDevice = async () => {
    const uri = await pickLibraryImage();
    if (uri) pick(uri);
  };

  return (
    <StudioBottomSheet
      visible={visible}
      embedded={embedded}
      title="Photo de fond"
      subtitle="Importez une photo ou choisissez dans le modèle."
      onClose={onClose}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Importer une photo depuis la galerie du téléphone"
          onPress={importFromDevice}
          style={({ pressed }) => [
            styles.dropZone,
            { backgroundColor: colors.surfaceAlt, borderColor: colors.border },
            pressed && styles.pressed,
          ]}
        >
          <Ionicons name="cloud-upload-outline" size={24} color={colors.primary} />
          <Text style={[styles.dropTitle, { color: colors.text }]}>Importer depuis la galerie</Text>
          <Text style={[styles.dropHint, { color: colors.textMuted }]}>JPG, PNG · Max 10 Mo</Text>
        </Pressable>

        <Text style={[styles.galleryLabel, { color: colors.textMuted }]}>
          Ou choisir dans le modèle
        </Text>
        <View style={styles.grid}>
          {candidates.map((uri) => {
            const selected = cover.photoUri === uri;
            return (
              <Pressable
                key={uri}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                onPress={() => pick(uri)}
                style={({ pressed }) => [
                  styles.cell,
                  selected && { borderColor: colors.primary },
                  pressed && styles.pressed,
                ]}
              >
                <Image source={{ uri }} style={styles.cellImage} resizeMode="cover" />
                {selected ? (
                  <View style={[styles.check, { backgroundColor: colors.primary }]}>
                    <Ionicons name="checkmark" size={13} color="#FFFFFF" />
                  </View>
                ) : null}
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
    </StudioBottomSheet>
  );
}

const styles = StyleSheet.create({
  content: { paddingBottom: 12, gap: 4 },
  pressed: { opacity: 0.85 },
  dropZone: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    minHeight: 120,
    borderRadius: 14,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    padding: 20,
  },
  dropTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 13.5, marginTop: 4 },
  dropHint: { fontFamily: 'Inter_400Regular', fontSize: 11.5 },
  galleryLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12.5,
    marginTop: 16,
    marginBottom: 10,
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  cell: {
    flexGrow: 1,
    flexBasis: '30%',
    aspectRatio: 1,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 2.5,
    borderColor: 'transparent',
  },
  cellImage: { width: '100%', height: '100%' },
  check: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
