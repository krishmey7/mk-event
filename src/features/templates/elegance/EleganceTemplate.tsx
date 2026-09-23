/**
 * ──────────────────────────────────────────────────────────────
 *  MK EVENTS — MODÈLE « ÉLÉGANCE » · CONTENEUR (planche 3)
 * ──────────────────────────────────────────────────────────────
 *  Orchestre les 7 vues interactives + compte à rebours :
 *  couverture, histoire, programme, compteur, RSVP, galerie,
 *  livre d'or — barre d'onglets 5 slots, feuille « Plus »,
 *  sélecteur de thème (6 palettes, bascule en direct) et
 *  transition en fondu entre les vues.
 *  Desktop (≥ 768 px) : l'invitation est présentée dans un cadre
 *  téléphone centré, comme sur la planche.
 * ──────────────────────────────────────────────────────────────
 */

import { useCallback, useRef, useState } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { shadows } from '@/constants/theme';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { TemplateHeader, TemplateTabBar } from './chrome';
import { PlusSheet } from './PlusSheet';
import { ThemePickerSheet } from './ThemePickerSheet';
import { CoverView } from './views/CoverView';
import { StoryView } from './views/StoryView';
import { ProgramView } from './views/ProgramView';
import { CountdownView } from './views/CountdownView';
import { RsvpView } from './views/RsvpView';
import { GalleryView } from './views/GalleryView';
import { GuestbookView } from './views/GuestbookView';
import { TEMPLATE_THEMES, type TemplateThemeKey, type TemplateViewKey } from './themes';

/** Vues portant la barre d'onglets (Vues 2, 3, 5, 6, 7). */
const TAB_VIEWS: TemplateViewKey[] = ['histoire', 'programme', 'rsvp', 'galerie', 'livredor'];

export function EleganceTemplate({ onExit }: { onExit?: () => void }) {
  const [themeKey, setThemeKey] = useState<TemplateThemeKey>('champagne');
  const [view, setView] = useState<TemplateViewKey>('accueil');
  const [pickerOpen, setPickerOpen] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [liked, setLiked] = useState(false);

  const theme = TEMPLATE_THEMES[themeKey];
  const insets = useSafeAreaInsets();
  const { isWide } = useBreakpoint();

  const fade = useRef(new Animated.Value(1)).current;
  const viewRef = useRef(view);
  viewRef.current = view;

  /* Changement de vue avec fondu sortant → entrant. */
  const go = useCallback(
    (next: TemplateViewKey) => {
      if (viewRef.current === next) return;
      Animated.timing(fade, { toValue: 0, duration: 110, useNativeDriver: true }).start(() => {
        setView(next);
        fade.setValue(0);
        Animated.timing(fade, { toValue: 1, duration: 170, useNativeDriver: true }).start();
      });
    },
    [fade],
  );

  const toggleLike = () => setLiked((value) => !value);

  let body: React.ReactNode = null;
  if (view === 'accueil') {
    body = <CoverView theme={theme} onThemePress={() => setPickerOpen(true)} onEnter={() => go('histoire')} />;
  } else if (view === 'compteur') {
    body = <CountdownView onBack={() => go('accueil')} liked={liked} onToggleLike={toggleLike} />;
  } else {
    body = (
      <View style={[styles.page, { backgroundColor: theme.colors.bg, paddingTop: insets.top }]}>
        <TemplateHeader theme={theme} onBack={() => go('accueil')} liked={liked} onToggleLike={toggleLike} />
        <Animated.View key={view} style={styles.pageBody}>
          {view === 'histoire' ? <StoryView theme={theme} /> : null}
          {view === 'programme' ? <ProgramView theme={theme} /> : null}
          {view === 'rsvp' ? <RsvpView theme={theme} /> : null}
          {view === 'galerie' ? <GalleryView theme={theme} /> : null}
          {view === 'livredor' ? <GuestbookView theme={theme} /> : null}
        </Animated.View>
      </View>
    );
  }

  return (
    <View style={[styles.outer, isWide && styles.outerWide]}>
      <StatusBar style={theme.isDark ? 'light' : 'dark'} />

      <View style={[styles.frame, isWide ? [styles.frameWide, shadows.lg] : null]}>
        {body}
        {TAB_VIEWS.includes(view) ? (
          <TemplateTabBar theme={theme} active={view} onSelect={go} onPlus={() => setSheetOpen(true)} />
        ) : null}
      </View>

      <ThemePickerSheet
        visible={pickerOpen}
        onClose={() => setPickerOpen(false)}
        value={themeKey}
        onChange={setThemeKey}
        theme={theme}
      />
      <PlusSheet
        visible={sheetOpen}
        onClose={() => setSheetOpen(false)}
        theme={theme}
        onGo={go}
        onTheme={() => setPickerOpen(true)}
        onExit={() => onExit?.()}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  outer: { flex: 1, backgroundColor: '#14110E' },
  outerWide: { alignItems: 'center', justifyContent: 'center' },
  frame: { flex: 1, width: '100%', overflow: 'hidden', backgroundColor: '#14110E' },
  frameWide: {
    width: 420, maxWidth: '100%', height: '88%', maxHeight: 900, minHeight: 640,
    borderRadius: 40, borderWidth: 10, borderColor: '#17181D', overflow: 'hidden',
  },
  page: { flex: 1 },
  pageBody: { flex: 1 },
});
