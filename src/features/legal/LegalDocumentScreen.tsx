/**
 * Écran document légal — composition éditoriale soignée.
 */

import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Logo } from '@/components/ui/Logo';
import { LANDING } from '@/features/landing/landingTokens';
import { fontFamilies, spacing } from '@/constants/theme';
import { LEGAL_CONTACT_EMAIL, type LegalDocument } from './documents';

function splitHeading(title: string): { num: string; label: string } {
  const match = title.match(/^(\d+)\.\s*(.+)$/);
  if (!match) return { num: '', label: title };
  return { num: match[1], label: match[2] };
}

export function LegalDocumentScreen({ document }: { document: LegalDocument }) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const L = LANDING;

  const goBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/');
  };

  return (
    <View style={[styles.screen, { backgroundColor: L.bg }]}>
      <StatusBar style="dark" />

      <View
        style={[
          styles.topBar,
          {
            paddingTop: insets.top + 10,
            borderBottomColor: L.border,
            backgroundColor: L.bg,
          },
        ]}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Retour"
          onPress={goBack}
          hitSlop={10}
          style={styles.backBtn}
        >
          <Ionicons name="chevron-back" size={20} color={L.text} />
          <Text style={[styles.backLabel, { color: L.text }]}>Retour</Text>
        </Pressable>
        <Logo size="sm" variant="ink" />
        <View style={styles.topSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingBottom: insets.bottom + 56 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.article}>
          <View style={styles.hero}>
            <Text style={[styles.kicker, { color: L.coral }]}>
              Document officiel · v{document.version}
            </Text>
            <Text style={[styles.title, { color: L.text }]}>{document.title}</Text>
            <View style={[styles.rule, { backgroundColor: L.coral }]} />
            <Text style={[styles.meta, { color: L.textFaint }]}>
              Dernière mise à jour — {document.updatedAt}
            </Text>
          </View>

          <Text style={[styles.intro, { color: L.textMuted }]}>{document.intro}</Text>

          <View style={styles.sections}>
            {document.sections.map((section, index) => {
              const { num, label } = splitHeading(section.title);
              return (
                <View
                  key={section.title}
                  style={[
                    styles.section,
                    index > 0 && { borderTopColor: L.border, borderTopWidth: StyleSheet.hairlineWidth },
                  ]}
                >
                  <View style={styles.sectionHead}>
                    {num ? (
                      <Text style={[styles.sectionNum, { color: L.coral }]}>
                        {num.padStart(2, '0')}
                      </Text>
                    ) : null}
                    <Text style={[styles.sectionTitle, { color: L.text }]}>{label}</Text>
                  </View>
                  <View style={styles.sectionBody}>
                    {section.paragraphs.map((paragraph) => (
                      <Text
                        key={paragraph.slice(0, 56)}
                        style={[styles.paragraph, { color: L.textMuted }]}
                      >
                        {paragraph}
                      </Text>
                    ))}
                  </View>
                </View>
              );
            })}
          </View>

          <View style={[styles.footer, { borderTopColor: L.border }]}>
            <Text style={[styles.footerBrand, { color: L.text }]}>MK Events</Text>
            <Text style={[styles.footerNote, { color: L.textFaint }]}>
              Une question sur ces documents ? Écrivez à{' '}
              <Text style={{ color: L.plum }}>{LEGAL_CONTACT_EMAIL}</Text>
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  topBar: {
    paddingHorizontal: spacing.lg,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 2, minWidth: 84 },
  backLabel: { fontFamily: fontFamilies.sansMedium, fontSize: 14.5 },
  topSpacer: { minWidth: 84 },
  scroll: {
    paddingHorizontal: 22,
    paddingTop: 36,
    width: '100%',
    alignItems: 'center',
  },
  article: {
    width: '100%',
    maxWidth: 640,
  },
  hero: { marginBottom: 28 },
  kicker: {
    fontFamily: fontFamilies.sansSemiBold,
    fontSize: 11,
    letterSpacing: 1.6,
    textTransform: 'uppercase',
    marginBottom: 14,
  },
  title: {
    fontFamily: fontFamilies.serifSemiBold,
    fontSize: 34,
    lineHeight: 40,
    letterSpacing: -0.5,
    marginBottom: 16,
  },
  rule: {
    width: 44,
    height: 2,
    borderRadius: 1,
    marginBottom: 14,
  },
  meta: {
    fontFamily: fontFamilies.sans,
    fontSize: 13,
    letterSpacing: 0.2,
  },
  intro: {
    fontFamily: fontFamilies.sans,
    fontSize: 16.5,
    lineHeight: 27,
    marginBottom: 12,
  },
  sections: { marginTop: 8 },
  section: {
    paddingTop: 28,
    paddingBottom: 8,
  },
  sectionHead: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
    marginBottom: 14,
  },
  sectionNum: {
    fontFamily: fontFamilies.sansSemiBold,
    fontSize: 13,
    letterSpacing: 1,
    marginTop: 4,
    minWidth: 28,
  },
  sectionTitle: {
    flex: 1,
    fontFamily: fontFamilies.serifSemiBold,
    fontSize: 20,
    lineHeight: 26,
    letterSpacing: -0.2,
  },
  sectionBody: { gap: 14, paddingLeft: 42 },
  paragraph: {
    fontFamily: fontFamilies.sans,
    fontSize: 15,
    lineHeight: 26,
  },
  footer: {
    marginTop: 36,
    paddingTop: 24,
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: 8,
  },
  footerBrand: {
    fontFamily: fontFamilies.serifSemiBold,
    fontSize: 16,
  },
  footerNote: {
    fontFamily: fontFamilies.sans,
    fontSize: 13.5,
    lineHeight: 20,
  },
});
