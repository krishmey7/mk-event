/**
 * Décor (anniversaire) / Lieu & pratiques (conférence) / Dress code (mariage).
 */

import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { EditorInput } from '@/features/editor/components/EditorInput';
import { EditorHint } from '@/features/editor/components/EditorHint';
import { useEditor } from '@/features/editor/EditorContext';
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

  if (eventType === 'birthday') {
    return (
      <ScrollView
        style={{ backgroundColor: c.background }}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <EditorHint>
          Le décor de l’affiche suit le thème choisi à la création. Affinez l’ambiance ici.
        </EditorHint>
        <Text style={[styles.heading, { color: c.textPrimary }]}>Ambiance</Text>
        <Text style={[styles.lead, { color: c.textMuted }]}>
          Palette active : {theme.label}. Les couleurs d’origine du modèle s’appliquent si vous
          avez choisi « Aucun ».
        </Text>
        <EditorInput
          value={dressCode}
          onChangeText={setDressCode}
          placeholder="Ex. À 21h · tenue chic festive"
        />
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
      >
        <EditorHint>
          Infos pratiques affichées aux participants : accès, parking, hébergement.
        </EditorHint>
        <Text style={[styles.heading, { color: c.textPrimary }]}>Lieu</Text>
        <EditorInput
          value={venue.name}
          onChangeText={(value) => updateVenue({ name: value })}
          placeholder="Nom du lieu"
        />
        <View style={styles.gap} />
        <EditorInput
          value={venue.street}
          onChangeText={(value) => updateVenue({ street: value })}
          placeholder="Adresse"
        />
        <View style={styles.gap} />
        <EditorInput
          value={venue.city}
          onChangeText={(value) => updateVenue({ city: value })}
          placeholder="Ville"
        />
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

  return (
    <ScrollView
      style={{ backgroundColor: c.background }}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <EditorHint>
        Le design et les couleurs viennent du thème choisi à la création. Ici : dress code uniquement.
      </EditorHint>
      <Text style={[styles.heading, { color: c.textPrimary }]}>Dress code ou ambiance</Text>
      <Text style={[styles.lead, { color: c.textMuted }]}>
        Palette active : {theme.label}. Non modifiable dans le studio.
      </Text>
      <EditorInput
        value={dressCode}
        onChangeText={setDressCode}
        placeholder="Ex. Tenue de cocktail, champagne et ivoire"
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, paddingBottom: 36 },
  heading: { fontFamily: fontFamilies.sansSemiBold, fontSize: 16, marginTop: 8, marginBottom: 6 },
  lead: { fontFamily: fontFamilies.sans, fontSize: 13.5, lineHeight: 19, marginBottom: 10 },
  gap: { height: 10 },
  swatch: { width: 36, height: 36, borderRadius: 18, marginTop: 16 },
});
