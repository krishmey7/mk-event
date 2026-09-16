/**
 * Accueil du studio — aperçu + actions.
 * En bas : Page · Thème · Récit · Invités.
 */

import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import type { ComponentProps } from 'react';

import { EditorCoverPreview } from '@/features/editor/components/EditorCoverPreview';
import { SaveToLibraryCard } from '@/features/editor/components/SaveToLibraryCard';
import { useEditor } from '@/features/editor/EditorContext';
import type { TemplateColors } from '@/features/templates/registry';

export default function EditorHomePreviewScreen() {
  const router = useRouter();
  const { guests, cover, theme } = useEditor();
  const c = theme.colors;
  const guestCount = guests.length;

  return (
    <ScrollView
      style={[styles.screen, { backgroundColor: c.bg }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Modifier la couverture"
        onPress={() => router.push('/editor/couverture')}
        style={({ pressed }) => [styles.previewWrap, pressed && styles.pressed]}
      >
        <EditorCoverPreview embedded />
        <View style={styles.previewCta}>
          <Ionicons name="create-outline" size={16} color="#F6F1E8" />
          <Text style={styles.previewCtaLabel}>Modifier la couverture</Text>
        </View>
      </Pressable>

      <Text style={[styles.kicker, { color: c.textMuted }]}>Pour commencer</Text>
      <Text style={[styles.lead, { color: c.text }]}>
        La couverture ici, puis les étapes du bas. Enregistrez dans Mes invitations quand c’est prêt.
      </Text>

      <View style={styles.steps}>
        <StepRow
          n="1"
          title="Couverture"
          hint={`${cover.couple} · ${cover.dateLabel}`}
          icon="image-outline"
          colors={c}
          onPress={() => router.push('/editor/couverture')}
        />
        <StepRow
          n="2"
          title="Thème"
          hint="Dress code et couleurs"
          icon="color-palette-outline"
          colors={c}
          onPress={() => router.push('/editor/theme')}
        />
        <StepRow
          n="3"
          title="Invités"
          hint={guestCount === 0 ? 'Personne n’est encore sur la liste' : `${guestCount} personne${guestCount > 1 ? 's' : ''} invitée${guestCount > 1 ? 's' : ''}`}
          icon="people-outline"
          colors={c}
          emphasize={guestCount === 0}
          onPress={() => router.push('/editor/plus')}
        />
        <StepRow
          n="4"
          title="Voir comme un invité"
          hint="Contrôlez le rendu avant d’envoyer les liens"
          icon="eye-outline"
          colors={c}
          onPress={() => router.push('/editor/previsualisation')}
        />
      </View>

      <Text style={[styles.kicker, { color: c.textMuted }]}>En bas d’écran</Text>
      <Text style={[styles.tabHelp, { color: c.textMuted }]}>
        1 Page — couverture. 2 Thème — dress code et couleurs. 3 Récit — histoire, journée et compteur. 4 Invités — liste, RSVP, galerie, puis enregistrement.
      </Text>

      <SaveToLibraryCard />
    </ScrollView>
  );
}

function StepRow({
  n,
  title,
  hint,
  icon,
  onPress,
  colors,
  emphasize = false,
}: {
  n: string;
  title: string;
  hint: string;
  icon: ComponentProps<typeof Ionicons>['name'];
  onPress: () => void;
  colors: TemplateColors;
  emphasize?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.step,
        {
          backgroundColor: colors.surface,
          borderColor: emphasize ? colors.primary : colors.border,
        },
        pressed && styles.pressed,
      ]}
    >
      <View style={[styles.stepNum, { backgroundColor: colors.primary }]}>
        <Text style={[styles.stepNumText, { color: colors.onPrimary }]}>{n}</Text>
      </View>
      <View style={styles.stepCopy}>
        <Text style={[styles.stepTitle, { color: colors.text }]}>{title}</Text>
        <Text style={[styles.stepHint, { color: colors.textMuted }]}>{hint}</Text>
      </View>
      <Ionicons name={icon} size={18} color={colors.textMuted} />
      <Ionicons name="chevron-forward" size={15} color={colors.accent} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { padding: 16, paddingBottom: 28 },
  previewWrap: {
    height: 320,
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: '#141210',
    marginBottom: 22,
  },
  previewCta: {
    position: 'absolute',
    alignSelf: 'center',
    bottom: 14,
    left: 14,
    right: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(28, 23, 18, 0.82)',
    borderRadius: 999,
    paddingVertical: 11,
  },
  previewCtaLabel: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13.5,
    color: '#F6F1E8',
  },
  kicker: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  lead: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  tabHelp: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 8,
  },
  steps: { gap: 8, marginBottom: 22 },
  step: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderWidth: 1,
  },
  stepNum: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumText: { fontFamily: 'Inter_600SemiBold', fontSize: 12 },
  stepCopy: { flex: 1, gap: 2 },
  stepTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 14.5 },
  stepHint: { fontFamily: 'Inter_400Regular', fontSize: 12 },
  pressed: { opacity: 0.88 },
});
