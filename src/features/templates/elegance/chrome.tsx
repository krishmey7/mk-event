/**
 * MK EVENT — Modèle « Élégance » · chrome : header (← / ♥)
 * et barre d'onglets basse à 5 slots (4ᵉ libellé dynamique :
 * RSVP / Galerie / Livre d'or — Vues 2, 3, 5, 6, 7).
 */

import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import type { IconName } from './data';
import type { TemplateTheme, TemplateViewKey } from './themes';

/* Header intérieur : retour ← + cœur ♥. */
export function TemplateHeader({ theme, onBack, liked, onToggleLike }: {
  theme: TemplateTheme; onBack: () => void; liked: boolean; onToggleLike: () => void;
}) {
  return (
    <View style={styles.header}>
      <Pressable accessibilityRole="button" onPress={onBack} hitSlop={8} style={styles.circle}>
        <Ionicons name="chevron-back" size={20} color={theme.colors.text} />
      </Pressable>
      <View style={styles.flex} />
      <Pressable accessibilityRole="button" onPress={onToggleLike} hitSlop={8} style={styles.circle}>
        <Ionicons
          name={liked ? 'heart' : 'heart-outline'}
          size={19}
          color={liked ? '#E25555' : theme.colors.text}
        />
      </Pressable>
    </View>
  );
}

/* 4ᵉ slot — cible et libellé dépendent de la vue active. */
function slot4(active: TemplateViewKey): { key: TemplateViewKey; label: string; icon: IconName } {
  if (active === 'galerie') return { key: 'galerie', label: 'Galerie', icon: 'images-outline' };
  if (active === 'livredor') return { key: 'livredor', label: "Livre d'or", icon: 'chatbubble-ellipses-outline' };
  return { key: 'rsvp', label: 'RSVP', icon: 'mail-outline' };
}

const TABS: { key: TemplateViewKey; label: string; icon: IconName }[] = [
  { key: 'accueil', label: 'Accueil', icon: 'home-outline' },
  { key: 'histoire', label: 'Histoire', icon: 'people-outline' },
  { key: 'programme', label: 'Programme', icon: 'calendar-outline' },
];

export function TemplateTabBar({ theme, active, onSelect, onPlus }: {
  theme: TemplateTheme;
  active: TemplateViewKey;
  onSelect: (view: TemplateViewKey) => void;
  onPlus: () => void;
}) {
  const insets = useSafeAreaInsets();
  const fourth = slot4(active);
  const items: { key: TemplateViewKey | 'plus'; label: string; icon: IconName }[] = [
    ...TABS,
    fourth,
    { key: 'plus', label: 'Plus', icon: 'ellipsis-horizontal' },
  ];

  return (
    <View style={[styles.tabBar, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, paddingBottom: insets.bottom + 6 }]}>
      {items.map((item) => {
        const isActive = item.key === active;
        const color = isActive ? theme.colors.primary : theme.colors.textMuted;
        return (
          <Pressable
            key={item.key}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
            onPress={() => (item.key === 'plus' ? onPlus() : onSelect(item.key as TemplateViewKey))}
            style={styles.tab}
          >
            <Ionicons name={isActive && item.key !== 'plus' ? (item.icon.replace('-outline', '') as IconName) : item.icon} size={21} color={color} />
            <Text numberOfLines={1} style={[styles.tabLabel, { color }]}>{item.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14,
    paddingTop: 10, paddingBottom: 4,
  },
  circle: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  flex: { flex: 1 },
  tabBar: {
    flexDirection: 'row', borderTopWidth: 1,
    paddingTop: 8, paddingHorizontal: 6,
  },
  tab: { flex: 1, alignItems: 'center', gap: 3, paddingHorizontal: 2 },
  tabLabel: { fontFamily: 'Inter_500Medium', fontSize: 10, letterSpacing: 0.2 },
});
