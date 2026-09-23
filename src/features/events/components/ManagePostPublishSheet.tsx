/**
 * Sheet post-publish — 3 missions orga (invités → partage → check-in).
 */

import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { fontFamilies, radii, spacing, type AppTheme } from '@/constants/theme';

const MISSIONS = [
  {
    n: 1,
    title: 'Ajoutez les personnes',
    hint: 'Écrivez leurs noms, une par une.',
    icon: 'people-outline' as const,
  },
  {
    n: 2,
    title: 'Envoyez l’invitation',
    hint: 'Bouton vert WhatsApp à côté de chaque nom.',
    icon: 'logo-whatsapp' as const,
  },
  {
    n: 3,
    title: 'Le jour de la fête',
    hint: 'Onglet Entrée : scannez le code de l’invité.',
    icon: 'qr-code-outline' as const,
  },
];

export interface ManagePostPublishSheetProps {
  visible: boolean;
  theme: AppTheme;
  onStart: () => void;
  onLater: () => void;
}

export function ManagePostPublishSheet({
  visible,
  theme,
  onStart,
  onLater,
}: ManagePostPublishSheetProps) {
  const c = theme.colors;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onLater}>
      <View style={styles.backdrop}>
        <Pressable style={StyleSheet.absoluteFillObject} onPress={onLater} accessibilityLabel="Fermer" />
        <View
          style={[
            styles.sheet,
            {
              backgroundColor: c.surface,
              borderColor: c.border,
            },
          ]}
        >
          <View style={[styles.badge, { backgroundColor: c.accentMuted }]}>
            <Ionicons name="sparkles-outline" size={18} color={c.accent} />
          </View>
          <Text style={[styles.title, { color: c.textPrimary }]}>C’est publié !</Text>
          <Text style={[styles.subtitle, { color: c.textMuted }]}>
            Voici quoi faire maintenant — simplement, dans l’ordre.
          </Text>

          <View style={styles.missions}>
            {MISSIONS.map((mission) => (
              <View
                key={mission.n}
                style={[
                  styles.missionRow,
                  { backgroundColor: c.background, borderColor: c.border },
                ]}
              >
                <View style={[styles.missionNum, { backgroundColor: c.accent }]}>
                  <Text style={[styles.missionNumText, { color: c.onAccent }]}>{mission.n}</Text>
                </View>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text style={[styles.missionTitle, { color: c.textPrimary }]}>{mission.title}</Text>
                  <Text style={[styles.missionHint, { color: c.textMuted }]}>{mission.hint}</Text>
                </View>
                <Ionicons name={mission.icon} size={18} color={c.accent} />
              </View>
            ))}
          </View>

          <Pressable
            accessibilityRole="button"
            onPress={onStart}
            style={({ pressed }) => [
              styles.primaryBtn,
              { backgroundColor: c.accent },
              pressed && styles.pressed,
            ]}
          >
            <Text style={[styles.primaryLabel, { color: c.onAccent }]}>Ajouter les invités</Text>
            <Ionicons name="arrow-forward" size={16} color={c.onAccent} />
          </Pressable>

          <Pressable accessibilityRole="button" onPress={onLater} hitSlop={8}>
            <Text style={[styles.laterLabel, { color: c.textMuted }]}>Plus tard</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(42, 31, 36, 0.45)',
    justifyContent: 'flex-end',
    padding: spacing.md,
  },
  sheet: {
    borderRadius: 22,
    borderWidth: 1,
    padding: 22,
    gap: 12,
    maxWidth: 440,
    width: '100%',
    alignSelf: 'center',
  },
  badge: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
  },
  title: {
    fontFamily: fontFamilies.serifMedium,
    fontSize: 22,
    lineHeight: 28,
  },
  subtitle: {
    fontFamily: fontFamilies.sans,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 4,
  },
  missions: { gap: 8, marginVertical: 4 },
  missionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  missionNum: {
    width: 28,
    height: 28,
    borderRadius: radii.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  missionNumText: {
    fontFamily: fontFamilies.sansSemiBold,
    fontSize: 13,
  },
  missionTitle: {
    fontFamily: fontFamilies.sansSemiBold,
    fontSize: 14,
  },
  missionHint: {
    fontFamily: fontFamilies.sans,
    fontSize: 12,
    lineHeight: 16,
    marginTop: 2,
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    minHeight: 48,
    borderRadius: 14,
    marginTop: 6,
  },
  primaryLabel: {
    fontFamily: fontFamilies.sansSemiBold,
    fontSize: 15,
  },
  laterLabel: {
    fontFamily: fontFamilies.sansMedium,
    fontSize: 13,
    textAlign: 'center',
    paddingVertical: 8,
  },
  pressed: { opacity: 0.88 },
});
