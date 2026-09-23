/**
 * Décor (anniversaire) / Lieu & pratiques (conférence).
 */

import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { EditorInput } from '@/features/editor/components/EditorInput';
import { EditorHint } from '@/features/editor/components/EditorHint';
import { useEditor } from '@/features/editor/EditorContext';
import { studioStepHint } from '@/features/editor/studioSteps';
import { VenuePlaceEditor } from '@/features/venue/VenuePlaceEditor';
import { useActiveEvent } from '@/context/ActiveEventContext';
import { useAppTheme } from '@/context/ThemePreferenceContext';
import { fontFamilies } from '@/constants/theme';

export default function ThemeTabScreen() {
  const {
    dressCode,
    setDressCode,
    theme,
    template,
    practical,
    updatePractical,
    venue,
    updateVenue,
  } = useEditor();
  const { type: activeType } = useActiveEvent();
  const eventType = activeType || template.category;
  const { theme: appTheme } = useAppTheme();
  const c = appTheme.colors;
  const hint = studioStepHint('theme', eventType);

  if (eventType === 'birthday') {
    return (
      <ScrollView
        style={{ backgroundColor: c.background }}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {hint ? <EditorHint>{hint}</EditorHint> : null}
        <Text style={[styles.heading, { color: c.textPrimary }]}>Palette</Text>
        <Text style={[styles.lead, { color: c.textMuted }]}>{theme.label}</Text>
        <View style={[styles.swatch, { backgroundColor: theme.swatch || c.accent }]} />
      </ScrollView>
    );
  }

  if (eventType === 'corporate') {
    return (
      <ScrollView
        style={{ backgroundColor: c.background }}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {hint ? <EditorHint>{hint}</EditorHint> : null}
        <VenuePlaceEditor venue={venue} onChange={updateVenue} />
        <Text style={[styles.heading, { color: c.textPrimary }]}>Accès</Text>
        <EditorInput
          value={practical.access}
          onChangeText={(value) => updatePractical({ access: value })}
          placeholder="Métro, bus, indications…"
        />
        <Text style={[styles.heading, { color: c.textPrimary }]}>Parking</Text>
        <EditorInput
          value={practical.parking}
          onChangeText={(value) => updatePractical({ parking: value })}
          placeholder="Parking sur place…"
        />
        <Text style={[styles.heading, { color: c.textPrimary }]}>Hébergement</Text>
        <EditorInput
          value={practical.hotel}
          onChangeText={(value) => updatePractical({ hotel: value })}
          placeholder="Hôtels partenaires…"
        />
        <Text style={[styles.heading, { color: c.textPrimary }]}>Dress code</Text>
        <EditorInput
          value={dressCode}
          onChangeText={setDressCode}
          placeholder="Business casual"
        />
      </ScrollView>
    );
  }

  /* Mariage : dress code déjà dans Infos — cet écran n’est pas dans le parcours. */
  return (
    <ScrollView
      style={{ backgroundColor: c.background }}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Text style={[styles.lead, { color: c.textMuted }]}>
        Le dress code se règle à l’étape Infos.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, paddingBottom: 36 },
  heading: { fontFamily: fontFamilies.sansSemiBold, fontSize: 16, marginTop: 8, marginBottom: 6 },
  lead: { fontFamily: fontFamilies.sans, fontSize: 13.5, lineHeight: 19, marginBottom: 10 },
  swatch: { width: 48, height: 48, borderRadius: 24, marginTop: 8 },
});
