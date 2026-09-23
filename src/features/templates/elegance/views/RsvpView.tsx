/**
 * MK EVENTS — Modèle « Élégance » · formulaire RSVP.
 * Présence + choix de la boisson uniquement.
 */

import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { IconBubble, LabeledField, PillButton, SectionHeader } from '../widgets';
import { SelectField } from '../SelectField';
import { WEDDING } from '../data';
import type { TemplateTheme } from '../themes';
import { DEFAULT_DRINKS } from '@/features/invitation/guestRegistry';

type Answer = 'yes' | 'no';

export function RsvpView({ theme }: { theme: TemplateTheme }) {
  const [answer, setAnswer] = useState<Answer | null>(null);
  const [drink, setDrink] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const c = theme.colors;
  const canSubmit = answer === 'no' || (answer === 'yes' && drink !== null);

  if (submitted) {
    return (
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.success, { backgroundColor: c.surface, borderColor: c.border }]}>
          <IconBubble name="checkmark" theme={theme} size={54} />
          <Text style={[styles.successTitle, { color: c.text }]}>
            Merci {WEDDING.guestName} !
          </Text>
          <Text style={[styles.successText, { color: c.textMuted }]}>
            {answer === 'yes'
              ? `Ta présence est confirmée${drink ? ` · ${drink}` : ''}.`
              : 'C\u2019est noté, tu nous manqueras…'}
          </Text>
          <PillButton label="Modifier ma réponse" onPress={() => setSubmitted(false)} theme={theme} variant="outline" />
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <SectionHeader
        title="Confirme ta présence 💍"
        subtitle="On a hâte de partager ce moment avec toi !"
        theme={theme}
      />

      <View style={styles.answers}>
        <PillButton
          label="Je confirme ma présence"
          icon={answer === 'yes' ? 'checkmark' : undefined}
          onPress={() => setAnswer('yes')}
          theme={theme}
        />
        <PillButton
          label="Je ne peux pas être présent(e)"
          onPress={() => setAnswer('no')}
          theme={theme}
          variant="outline"
          style={answer === 'no' ? { borderColor: c.primary, borderWidth: 1.6 } : null}
        />
      </View>

      {answer === 'yes' ? (
        <LabeledField label="Choix de la boisson" theme={theme}>
          <SelectField
            value={drink}
            placeholder="Sélectionner une boisson"
            options={DEFAULT_DRINKS}
            onSelect={setDrink}
            theme={theme}
          />
        </LabeledField>
      ) : null}

      {answer === 'no' ? (
        <View style={[styles.decline, { backgroundColor: c.surfaceAlt }]}>
          <Text style={[styles.declineText, { color: c.textMuted }]}>
            {"C\u2019est dommage… on pense très fort à toi 💛"}
          </Text>
        </View>
      ) : null}

      <PillButton
        label="Valider ma réponse"
        onPress={() => setSubmitted(true)}
        disabled={!canSubmit}
        theme={theme}
        style={styles.submit}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 22, paddingTop: 6, paddingBottom: 36, gap: 18 },
  answers: { gap: 10 },
  decline: { borderRadius: 14, padding: 14 },
  declineText: { fontFamily: 'Fraunces_400Regular_Italic', fontSize: 14, textAlign: 'center' },
  submit: { marginTop: 2 },
  success: {
    borderRadius: 18, borderWidth: 1, padding: 24, alignItems: 'center', gap: 10, marginTop: 20,
  },
  successTitle: { fontFamily: 'Fraunces_500Medium', fontSize: 21 },
  successText: { fontFamily: 'Inter_400Regular', fontSize: 13.5, textAlign: 'center', marginBottom: 6 },
});
