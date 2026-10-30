import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { fontFamilies } from '@/constants/theme';
import { ApiError, formatApiMessage } from '@/services/apiClient';
import { useEditor } from '../EditorContext';
import { useStudioChrome } from '../useStudioChrome';

/** Publie le studio (slug + invités Django), puis ouvre Mes invitations. */
export function SaveToLibraryCard() {
  const router = useRouter();
  const { saveToLibrary, saving, dirty, boundEventId, published, guests } = useEditor();
  const colors = useStudioChrome();
  const [error, setError] = useState<string | null>(null);
  const [quotaInput, setQuotaInput] = useState(() => (guests.length ? String(guests.length) : ''));
  const quota = /^\d+$/.test(quotaInput) ? Number(quotaInput) : 0;
  const amount = quota * 0.5;

  const onSave = async (mode: 'publish' | 'free' | 'prepare') => {
    setError(null);
    try {
      const eventId = await saveToLibrary(mode);
      if (mode === 'prepare') {
        router.push({
          pathname: '/pay/[eventId]',
          params: { eventId: String(eventId), guestQuota: String(quota) },
        });
      } else {
        router.replace(`/invitations/${eventId}?welcome=1`);
      }
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

  const hasPublishedEvent = Boolean(boundEventId) && published;

  return (
    <View style={[styles.card, { borderColor: colors.border, backgroundColor: colors.surface }]}>
      <Text style={[styles.title, { color: colors.text }]}>Publication</Text>
      <Text style={[styles.hint, { color: colors.textMuted }]}>
        {hasPublishedEvent
          ? guests.some((guest) => Boolean(guest.accessToken))
            ? 'Invitation publiée. Les liens personnels activés donnent accès au RSVP et au pass d’entrée.'
            : 'Invitation publiée en mode vitrine. Aucun lien personnel ni RSVP individuel n’est activé.'
          : boundEventId
            ? 'Vous avez des modifications non publiées. Republiez pour les rendre visibles aux invités.'
            : 'Choisissez une publication vitrine gratuite ou des liens personnels pour vos invités.'}
      </Text>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {hasPublishedEvent ? (
        <Pressable
          accessibilityRole="button"
          onPress={() => void onSave('publish')}
          disabled={saving}
          style={({ pressed }) => [
            styles.btn,
            { backgroundColor: colors.primary },
            (pressed || saving) && styles.pressed,
          ]}
        >
          {saving ? <ActivityIndicator color={colors.onPrimary} /> : (
            <Ionicons name="cloud-upload-outline" size={16} color={colors.onPrimary} />
          )}
          <Text style={[styles.btnLabel, { color: colors.onPrimary }]}>
            {saving ? 'Préparation & publication…' : dirty ? 'Republier les modifications' : 'Republier'}
          </Text>
        </Pressable>
      ) : (
        <>
          <View style={[styles.option, { borderColor: colors.border }]}>
            <Text style={[styles.optionTitle, { color: colors.text }]}>Publier sans invité</Text>
            <Text style={[styles.hint, { color: colors.textMuted }]}>
              Votre page événementielle sera en ligne, mais aucun lien personnel, QR code ni RSVP individuel ne sera activé.
            </Text>
            <Pressable
              accessibilityRole="button"
              onPress={() => void onSave('free')}
              disabled={saving}
              style={({ pressed }) => [
                styles.btn,
                { backgroundColor: colors.surfaceAlt, borderColor: colors.border, borderWidth: 1 },
                (pressed || saving) && styles.pressed,
              ]}
            >
              {saving ? <ActivityIndicator color={colors.text} /> : (
                <Ionicons name="eye-outline" size={16} color={colors.text} />
              )}
              <Text style={[styles.btnLabel, { color: colors.text }]}>Publier gratuitement</Text>
            </Pressable>
          </View>

          <View style={[styles.option, { borderColor: colors.border }]}>
            <Text style={[styles.optionTitle, { color: colors.text }]}>Liens personnels</Text>
            <Text style={[styles.hint, { color: colors.textMuted }]}>Je paie pour</Text>
            <View style={[styles.quantityField, { borderColor: colors.border }]}>
              <TextInput
                accessibilityLabel="Nombre d’invités à couvrir"
                keyboardType="number-pad"
                inputMode="numeric"
                value={quotaInput}
                onChangeText={(value) => setQuotaInput(value.replace(/[^\d]/g, ''))}
                placeholder="1"
                placeholderTextColor={colors.textMuted}
                style={[styles.quantityInput, { color: colors.text }]}
              />
              <Text style={[styles.quantitySuffix, { color: colors.textMuted }]}>invité(s)</Text>
            </View>
            <Text style={[styles.price, { color: colors.text }]}>
              {quota > 0 ? `${quota} × 0,50 $ = ${amount.toFixed(2).replace('.', ',')} $ USD` : 'Veuillez entrer un nombre d’invités supérieur à 0'}
            </Text>
            <Pressable
              accessibilityRole="button"
              onPress={() => void onSave('prepare')}
              disabled={saving || !Number.isSafeInteger(quota) || quota < 1}
              style={({ pressed }) => [
                styles.btn,
                { backgroundColor: colors.primary },
                (pressed || saving || quota < 1) && styles.pressed,
              ]}
            >
              {saving ? <ActivityIndicator color={colors.onPrimary} /> : (
                <Ionicons name="card-outline" size={16} color={colors.onPrimary} />
              )}
              <Text style={[styles.btnLabel, { color: colors.onPrimary }]}>
                {saving ? 'Enregistrement du brouillon…' : `Payer ${amount.toFixed(2).replace('.', ',')} $ et publier`}
              </Text>
            </Pressable>
          </View>
        </>
      )}
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
  option: { borderWidth: 1, borderRadius: 14, padding: 14, gap: 8 },
  optionTitle: { fontFamily: fontFamilies.sansSemiBold, fontSize: 14 },
  hint: { fontFamily: fontFamilies.sans, fontSize: 13, lineHeight: 18 },
  error: { fontFamily: fontFamilies.sansMedium, fontSize: 12, color: '#A45A45' },
  quantityField: {
    minHeight: 46,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  quantityInput: { flex: 1, minWidth: 0, fontFamily: fontFamilies.sansMedium, fontSize: 16 },
  quantitySuffix: { fontFamily: fontFamilies.sans, fontSize: 13 },
  price: { fontFamily: fontFamilies.sansMedium, fontSize: 13 },
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
