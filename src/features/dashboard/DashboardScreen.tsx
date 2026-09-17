/**
 * Accueil — header atmosphère landing + contenu atelier.
 */

import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Logo } from '@/components/ui/Logo';
import { EventCard } from '@/features/events/components/EventCard';
import { useEvents } from '@/features/events/useEvents';
import { useAuth } from '@/context/AuthContext';
import { openEventManage } from '@/features/editor/navigation';
import { LandingAtmosphere } from '@/features/landing/LandingAtmosphere';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import {
  fontFamilies,
  shadows,
  spacing,
} from '@/constants/theme';
import { useAppTheme } from '@/context/ThemePreferenceContext';

export function DashboardScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { events, isLoading, error } = useEvents();
  const { isDesktop, isWide } = useBreakpoint();
  const { theme } = useAppTheme();
  const c = theme.colors;
  const isDark = theme.mode === 'dark';
  const [headerHeight, setHeaderHeight] = useState(260);

  const recent = events.slice(0, isDesktop ? 4 : 2);
  const firstName = useMemo(() => {
    const name = user?.full_name?.trim();
    return name ? name.split(/\s+/)[0] : 'Sarah';
  }, [user?.full_name]);

  const sent = events.reduce((sum, event) => sum + event.rsvp_summary.confirmed, 0);
  const totalGuests = events.reduce((sum, event) => sum + event.guests_count, 0);

  return (
    <View style={[styles.screen, { backgroundColor: c.background }]}>
      <StatusBar style="light" />

      <View
        style={[
          styles.header,
          { paddingTop: insets.top + (isDesktop ? 20 : 14) },
          isDark && styles.headerDark,
        ]}
        onLayout={(event) => {
          const next = event.nativeEvent.layout.height;
          if (next > 0 && Math.abs(next - headerHeight) > 1) setHeaderHeight(next);
        }}
      >
        <LandingAtmosphere height={headerHeight} />

        <View style={[styles.headerInner, isDesktop && styles.headerInnerDesktop]}>
          <View style={styles.topBar}>
            {isDesktop ? (
              <View />
            ) : (
              <Logo size="sm" variant="light" style={styles.logoLeft} />
            )}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Mon profil"
              onPress={() => router.push('/profil')}
              hitSlop={8}
              style={({ pressed }) => [
                styles.profileButton,
                isDark && styles.profileButtonDark,
                pressed && styles.pressed,
              ]}
            >
              <Ionicons name="person-outline" size={18} color="rgba(242,244,247,0.88)" />
            </Pressable>
          </View>

          <View style={styles.hero}>
            <Text style={styles.greeting}>Bonjour {firstName}</Text>
            <Text style={[styles.subtitle, isDark && styles.subtitleDark]}>
              Créez et envoyez vos invitations en quelques minutes.
            </Text>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Créer une invitation"
              onPress={() => router.push('/modeles')}
              style={({ pressed }) => [styles.primaryCta, pressed && styles.pressed]}
            >
              <Ionicons name="add" size={18} color="#FFFFFF" />
              <Text style={styles.primaryCtaLabel}>Nouvelle invitation</Text>
            </Pressable>
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.content,
          isDesktop && styles.contentDesktop,
          { paddingBottom: insets.bottom + (isDesktop ? 40 : 108) },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.shortcuts, isWide && styles.shortcutsWide]}>
          <Shortcut
            icon="mail-outline"
            label="Invitations"
            hint={`${events.length} en cours`}
            color={c.textPrimary}
            muted={c.textMuted}
            border={c.border}
            surface={c.surface}
            onPress={() => router.push('/invitations')}
          />
          <Shortcut
            icon="people-outline"
            label="Réponses"
            hint={totalGuests ? `${sent}/${totalGuests} confirmés` : 'À venir'}
            color={c.textPrimary}
            muted={c.textMuted}
            border={c.border}
            surface={c.surface}
            onPress={() => router.push('/reponses')}
          />
        </View>

        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: c.textPrimary }]}>Récents</Text>
          <Pressable
            accessibilityRole="link"
            onPress={() => router.push('/invitations')}
            hitSlop={8}
            style={({ pressed }) => [styles.seeAllBtn, pressed && styles.pressed]}
          >
            <Text style={[styles.seeAll, { color: c.accent }]}>Tout voir</Text>
            <Ionicons name="arrow-forward" size={14} color={c.accent} />
          </Pressable>
        </View>

        {isLoading ? (
          <ActivityIndicator color={c.accent} style={styles.loader} />
        ) : error ? (
          <Text style={[styles.errorText, { color: theme.semantic.danger }]}>{error}</Text>
        ) : recent.length === 0 ? (
          <View style={[styles.empty, { backgroundColor: c.surface, borderColor: c.border }]}>
            <Ionicons name="mail-open-outline" size={26} color={c.accent} />
            <Text style={[styles.emptyTitle, { color: c.textPrimary }]}>
              Aucune invitation pour l’instant
            </Text>
            <Text style={[styles.emptyHint, { color: c.textMuted }]}>
              Choisissez un modèle pour commencer.
            </Text>
          </View>
        ) : (
          <View style={[styles.cards, isWide && styles.cardsWide]}>
            {recent.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                onPress={() => openEventManage(router, event)}
                style={isWide ? styles.cardWide : undefined}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

function Shortcut({
  icon,
  label,
  hint,
  color,
  muted,
  border,
  surface,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  hint: string;
  color: string;
  muted: string;
  border: string;
  surface: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.shortcut,
        { backgroundColor: surface, borderColor: border },
        pressed && styles.pressed,
      ]}
    >
      <Ionicons name={icon} size={18} color={muted} />
      <View style={styles.shortcutCopy}>
        <Text style={[styles.shortcutLabel, { color }]}>{label}</Text>
        <Text style={[styles.shortcutHint, { color: muted }]}>{hint}</Text>
      </View>
      <Ionicons name="chevron-forward" size={16} color={muted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: {
    overflow: 'hidden',
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    paddingBottom: 22,
  },
  headerDark: {
    borderBottomLeftRadius: 22,
    borderBottomRightRadius: 22,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(224, 122, 95, 0.22)',
  },
  headerInner: {
    paddingHorizontal: spacing.lg,
    gap: 18,
    zIndex: 1,
  },
  headerInnerDesktop: {
    maxWidth: 980,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: 36,
  },
  scroll: { flex: 1 },
  content: {
    paddingHorizontal: spacing.lg,
    gap: 22,
    paddingTop: 20,
  },
  contentDesktop: {
    maxWidth: 980,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: 36,
    gap: 28,
  },

  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logoLeft: { alignItems: 'flex-start' },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(242, 244, 247, 0.14)',
    backgroundColor: 'rgba(242, 244, 247, 0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileButtonDark: {
    borderColor: 'rgba(224, 122, 95, 0.28)',
    backgroundColor: 'rgba(224, 122, 95, 0.1)',
  },

  hero: {
    gap: 10,
    paddingBottom: 4,
  },
  greeting: {
    fontFamily: fontFamilies.serifSemiBold,
    fontSize: 32,
    lineHeight: 38,
    letterSpacing: -0.5,
    color: '#F2F4F7',
  },
  subtitle: {
    fontFamily: fontFamilies.sans,
    fontSize: 15,
    lineHeight: 22,
    maxWidth: 340,
    marginBottom: 6,
    color: 'rgba(242, 244, 247, 0.58)',
  },
  subtitleDark: {
    color: 'rgba(242, 244, 247, 0.68)',
  },
  primaryCta: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 13,
    backgroundColor: '#E07A5F',
    ...shadows.sm,
  },
  primaryCtaLabel: {
    fontFamily: fontFamilies.sansSemiBold,
    fontSize: 14.5,
    color: '#FFFFFF',
  },

  shortcuts: { gap: 10 },
  shortcutsWide: {
    flexDirection: 'row',
    gap: 12,
  },
  shortcut: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 16,
    flex: 1,
  },
  shortcutCopy: { flex: 1, gap: 3, justifyContent: 'center' },
  shortcutLabel: {
    fontFamily: fontFamilies.sansSemiBold,
    fontSize: 14.5,
  },
  shortcutHint: {
    fontFamily: fontFamilies.sans,
    fontSize: 12.5,
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  sectionTitle: {
    fontFamily: fontFamilies.sansSemiBold,
    fontSize: 18,
    letterSpacing: -0.2,
  },
  seeAllBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  seeAll: {
    fontFamily: fontFamilies.sansMedium,
    fontSize: 13.5,
  },

  loader: { marginVertical: spacing.xl },
  errorText: {
    fontFamily: fontFamilies.sansMedium,
    fontSize: 13,
  },
  cards: { gap: 12 },
  cardsWide: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    alignItems: 'flex-start',
  },
  cardWide: {
    width: '48.5%',
    flexGrow: 0,
    minWidth: 280,
  },

  empty: {
    alignItems: 'center',
    gap: 8,
    paddingVertical: 36,
    paddingHorizontal: 20,
    borderRadius: 18,
    borderWidth: 1,
  },
  emptyTitle: {
    fontFamily: fontFamilies.sansSemiBold,
    fontSize: 15,
    marginTop: 4,
  },
  emptyHint: {
    fontFamily: fontFamilies.sans,
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
  },
  pressed: { opacity: 0.84 },
});
