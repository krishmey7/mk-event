/**
 * Invitation conférence — multi-sections scrollables.
 */

import { useState, type ReactNode } from 'react';
import { Linking, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { fontFamilies, spacing } from '@/constants/theme';
import type { TemplateColors } from '@/features/templates/elegance/themes';
import type { ProgramStep } from '@/features/templates/elegance/data';
import type { ConferenceSpeaker } from './data';
import type { Guest, Venue } from '@/features/invitation/types';
import { venueDirectionsUrl, venueHasCoords } from '@/features/invitation/types';
import { VenueMap } from '@/features/venue/VenueMap';
import { IconifyIcon } from '@/components/ui/IconifyIcon';

export function ConferenceInvitation({
  colors,
  isDark,
  title,
  tagline,
  dateLabel,
  venue,
  access,
  parking,
  hotel,
  dressCode,
  program,
  speakers,
  guest,
  onRsvp,
}: {
  colors: TemplateColors;
  isDark?: boolean;
  title: string;
  tagline?: string;
  dateLabel: string;
  venue: Venue;
  access?: string;
  parking?: string;
  hotel?: string;
  dressCode?: string;
  program: ProgramStep[];
  speakers: ConferenceSpeaker[];
  guest: Guest;
  onRsvp?: (yes: boolean) => void;
}) {
  const insets = useSafeAreaInsets();
  const [answer, setAnswer] = useState<'yes' | 'no' | null>(null);
  const c = colors;

  const confirm = (yes: boolean) => {
    setAnswer(yes ? 'yes' : 'no');
    onRsvp?.(yes);
  };

  return (
    <View style={[styles.fill, { backgroundColor: c.bg }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Accueil */}
        <View style={[styles.hero, { backgroundColor: c.primary, paddingTop: insets.top + 28 }]}>
          <IconifyIcon icon="mdi:microphone-variant" size={28} color={c.onPrimary} />
          <Text style={[styles.heroKicker, { color: c.onPrimary }]}>Événement pro</Text>
          <Text style={[styles.heroTitle, { color: c.onPrimary }]}>{title}</Text>
          {tagline ? (
            <Text style={[styles.heroTag, { color: c.onPrimary }]}>{tagline}</Text>
          ) : null}
          <Text style={[styles.heroDate, { color: c.onPrimary }]}>{dateLabel}</Text>
          <Text style={[styles.heroVenue, { color: c.onPrimary }]}>
            {venue.name}
            {venue.city ? ` · ${venue.city}` : ''}
          </Text>
          <Text style={[styles.heroGuest, { color: c.onPrimary }]}>
            Bonjour {guest.firstName}
          </Text>
        </View>

        {/* Agenda */}
        <Section title="Programme" colors={c}>
          {program.map((item) => (
            <View
              key={`${item.time}-${item.title}`}
              style={[styles.row, { borderColor: c.border, backgroundColor: c.surface }]}
            >
              <Text style={[styles.time, { color: c.accent }]}>{item.time}</Text>
              <View style={{ flex: 1 }}>
                <Text style={[styles.rowTitle, { color: c.text }]}>{item.title}</Text>
                <Text style={[styles.rowMeta, { color: c.textMuted }]}>{item.place}</Text>
              </View>
            </View>
          ))}
        </Section>

        {/* Speakers */}
        <Section title="Intervenants" colors={c}>
          {speakers.map((speaker) => (
            <View
              key={speaker.id}
              style={[styles.speaker, { borderColor: c.border, backgroundColor: c.surface }]}
            >
              <View style={[styles.avatar, { backgroundColor: c.chip }]}>
                <Text style={[styles.avatarText, { color: c.accent }]}>
                  {speaker.name
                    .split(/\s+/)
                    .slice(0, 2)
                    .map((w) => w[0])
                    .join('')}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.rowTitle, { color: c.text }]}>{speaker.name}</Text>
                <Text style={[styles.rowMeta, { color: c.accent }]}>{speaker.role}</Text>
                <Text style={[styles.bio, { color: c.textMuted }]}>{speaker.bio}</Text>
              </View>
            </View>
          ))}
        </Section>

        {/* Pratiques */}
        <Section title="Infos pratiques" colors={c}>
          <InfoLine icon="location-outline" label={venueFull(venue)} colors={c} />
          {venueHasCoords(venue) ? (
            <View style={{ gap: 8 }}>
              <VenueMap lat={venue.lat!} lng={venue.lng!} height={160} />
              <Pressable
                accessibilityRole="button"
                onPress={() => {
                  const platform =
                    Platform.OS === 'ios' ? 'ios' : Platform.OS === 'android' ? 'android' : 'web';
                  void Linking.openURL(venueDirectionsUrl(venue, platform));
                }}
                style={[styles.rsvpBtn, { backgroundColor: c.primary }]}
              >
                <Text style={[styles.rsvpLabel, { color: c.onPrimary }]}>Y aller</Text>
              </Pressable>
            </View>
          ) : null}
          {access ? <InfoLine icon="subway-outline" label={access} colors={c} /> : null}
          {parking ? <InfoLine icon="car-outline" label={parking} colors={c} /> : null}
          {hotel ? <InfoLine icon="bed-outline" label={hotel} colors={c} /> : null}
          {dressCode ? <InfoLine icon="shirt-outline" label={dressCode} colors={c} /> : null}
        </Section>

        {/* Inscription */}
        <Section title="Inscription" colors={c}>
          {answer === null ? (
            <View style={styles.rsvpRow}>
              <Pressable
                onPress={() => confirm(true)}
                style={[styles.rsvpBtn, { backgroundColor: c.primary }]}
              >
                <Text style={[styles.rsvpLabel, { color: c.onPrimary }]}>Je participe</Text>
              </Pressable>
              <Pressable
                onPress={() => confirm(false)}
                style={[styles.rsvpBtn, { borderColor: c.border, borderWidth: 1.5 }]}
              >
                <Text style={[styles.rsvpLabel, { color: c.text }]}>Je ne peux pas</Text>
              </Pressable>
            </View>
          ) : (
            <Text style={[styles.thanks, { color: c.text }]}>
              {answer === 'yes'
                ? `Merci ${guest.firstName}, votre place est notée.`
                : `C’est noté, ${guest.firstName}. À une prochaine !`}
            </Text>
          )}
        </Section>
      </ScrollView>
    </View>
  );
}

function venueFull(venue: Venue): string {
  return [venue.name, venue.street, `${venue.zip} ${venue.city}`.trim()]
    .filter(Boolean)
    .join(' · ');
}

function Section({
  title,
  colors,
  children,
}: {
  title: string;
  colors: TemplateColors;
  children: ReactNode;
}) {
  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>{title}</Text>
      <View style={{ gap: 10 }}>{children}</View>
    </View>
  );
}

function InfoLine({
  icon,
  label,
  colors,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  colors: TemplateColors;
}) {
  return (
    <View style={[styles.info, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Ionicons name={icon} size={18} color={colors.accent} />
      <Text style={[styles.infoText, { color: colors.text }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  hero: {
    paddingHorizontal: spacing.lg,
    paddingBottom: 32,
    gap: 8,
    alignItems: 'flex-start',
  },
  heroKicker: {
    fontFamily: fontFamilies.sansMedium,
    fontSize: 11,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    opacity: 0.85,
  },
  heroTitle: { fontFamily: fontFamilies.serifSemiBold, fontSize: 32, lineHeight: 38 },
  heroTag: { fontFamily: fontFamilies.sans, fontSize: 14, opacity: 0.9 },
  heroDate: { fontFamily: fontFamilies.sansSemiBold, fontSize: 15, marginTop: 8 },
  heroVenue: { fontFamily: fontFamilies.sans, fontSize: 14, opacity: 0.9 },
  heroGuest: { fontFamily: fontFamilies.sansMedium, fontSize: 13, marginTop: 12, opacity: 0.85 },
  section: { paddingHorizontal: spacing.lg, paddingTop: 28, gap: 12 },
  sectionTitle: { fontFamily: fontFamilies.serifSemiBold, fontSize: 22 },
  row: {
    flexDirection: 'row',
    gap: 12,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'flex-start',
  },
  time: { fontFamily: fontFamilies.sansSemiBold, fontSize: 13, minWidth: 48 },
  rowTitle: { fontFamily: fontFamilies.sansSemiBold, fontSize: 15 },
  rowMeta: { fontFamily: fontFamilies.sans, fontSize: 12.5, marginTop: 2 },
  speaker: {
    flexDirection: 'row',
    gap: 12,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontFamily: fontFamilies.sansSemiBold, fontSize: 13 },
  bio: { fontFamily: fontFamilies.sans, fontSize: 12.5, lineHeight: 18, marginTop: 4 },
  info: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  infoText: { flex: 1, fontFamily: fontFamilies.sans, fontSize: 13.5, lineHeight: 19 },
  rsvpRow: { gap: 10 },
  rsvpBtn: {
    minHeight: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  rsvpLabel: { fontFamily: fontFamilies.sansSemiBold, fontSize: 15 },
  thanks: { fontFamily: fontFamilies.sans, fontSize: 15, lineHeight: 22 },
});
