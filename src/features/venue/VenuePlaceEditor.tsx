/**
 * Bloc lieu studio — recherche OSM + carte + affinage adresse.
 */

import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { EditorInput } from '@/features/editor/components/EditorInput';
import { VenueMap } from '@/features/venue/VenueMap';
import { fontFamilies, spacing } from '@/constants/theme';
import { useAppTheme } from '@/context/ThemePreferenceContext';
import type { Venue } from '@/features/invitation/types';
import { venueFullAddress, venueHasCoords } from '@/features/invitation/types';
import { locateAddress, searchPlaces, type PlaceHit } from '@/services/placesService';

export function VenuePlaceEditor({
  venue,
  onChange,
}: {
  venue: Venue;
  onChange: (patch: Partial<Venue>) => void;
}) {
  const { theme } = useAppTheme();
  const c = theme.colors;

  const [query, setQuery] = useState('');
  const [hits, setHits] = useState<PlaceHit[]>([]);
  const [searching, setSearching] = useState(false);
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [manualOpen, setManualOpen] = useState(!venueHasCoords(venue) && Boolean(venue.name || venue.city));
  const seq = useRef(0);

  useEffect(() => {
    const q = query.trim();
    if (q.length < 3) {
      setHits([]);
      return;
    }
    const id = ++seq.current;
    const timer = setTimeout(() => {
      setSearching(true);
      setError(null);
      void searchPlaces(q)
        .then((results) => {
          if (seq.current !== id) return;
          setHits(results);
        })
        .catch(() => {
          if (seq.current !== id) return;
          setHits([]);
          setError('Recherche indisponible. Réessayez.');
        })
        .finally(() => {
          if (seq.current === id) setSearching(false);
        });
    }, 320);
    return () => clearTimeout(timer);
  }, [query]);

  const applyHit = (hit: PlaceHit) => {
    onChange({
      name: hit.name || venue.name,
      street: hit.street || venue.street,
      zip: hit.zip || venue.zip,
      city: hit.city || venue.city,
      lat: hit.lat,
      lng: hit.lng,
    });
    setQuery('');
    setHits([]);
    setManualOpen(false);
    setError(null);
  };

  const locateCurrent = async () => {
    const address = venueFullAddress(venue);
    if (address.trim().length < 3) {
      setError('Indiquez d’abord un nom ou une adresse.');
      setManualOpen(true);
      return;
    }
    setLocating(true);
    setError(null);
    try {
      const hit = await locateAddress(address);
      applyHit(hit);
    } catch {
      setError('Impossible de localiser cette adresse.');
    } finally {
      setLocating(false);
    }
  };

  return (
    <View style={styles.root}>
      <Text style={[styles.heading, { color: c.textPrimary }]}>Lieu</Text>
      <Text style={[styles.lead, { color: c.textMuted }]}>
        Recherchez un lieu — la carte se place automatiquement.
      </Text>

      <EditorInput
        value={query}
        onChangeText={setQuery}
        placeholder="Ex. Sheraton Kauai, Château de Versailles…"
        autoCorrect={false}
        rightElement={
          searching ? (
            <ActivityIndicator size="small" color={c.accent} />
          ) : (
            <Ionicons name="search-outline" size={18} color={c.textMuted} />
          )
        }
      />

      {hits.length > 0 ? (
        <View style={[styles.hits, { borderColor: c.border, backgroundColor: c.surface }]}>
          {hits.map((hit) => (
            <Pressable
              key={`${hit.lat}-${hit.lng}-${hit.display_name}`}
              accessibilityRole="button"
              onPress={() => applyHit(hit)}
              style={({ pressed }) => [
                styles.hitRow,
                { borderBottomColor: c.border },
                pressed && styles.pressed,
              ]}
            >
              <Ionicons name="location-outline" size={16} color={c.accent} />
              <Text style={[styles.hitText, { color: c.textPrimary }]} numberOfLines={2}>
                {hit.display_name}
              </Text>
            </Pressable>
          ))}
        </View>
      ) : null}

      {venueHasCoords(venue) ? (
        <View style={styles.mapBlock}>
          <VenueMap lat={venue.lat!} lng={venue.lng!} height={200} />
          {(venue.name || venue.city) ? (
            <Text style={[styles.selected, { color: c.textSecondary }]}>
              {[venue.name, venue.city].filter(Boolean).join(' · ')}
            </Text>
          ) : null}
        </View>
      ) : (
        <Pressable
          accessibilityRole="button"
          disabled={locating}
          onPress={() => void locateCurrent()}
          style={({ pressed }) => [
            styles.locateBtn,
            { borderColor: c.border, backgroundColor: c.surface },
            pressed && styles.pressed,
          ]}
        >
          {locating ? (
            <ActivityIndicator color={c.accent} />
          ) : (
            <>
              <Ionicons name="navigate-outline" size={16} color={c.accent} />
              <Text style={[styles.locateLabel, { color: c.accent }]}>Localiser sur la carte</Text>
            </>
          )}
        </Pressable>
      )}

      <Pressable
        accessibilityRole="button"
        onPress={() => setManualOpen((v) => !v)}
        style={styles.manualToggle}
        hitSlop={8}
      >
        <Text style={[styles.manualToggleLabel, { color: c.textMuted }]}>
          {manualOpen ? 'Masquer l’adresse' : 'Modifier l’adresse'}
        </Text>
        <Ionicons
          name={manualOpen ? 'chevron-up' : 'chevron-down'}
          size={16}
          color={c.textMuted}
        />
      </Pressable>

      {manualOpen ? (
        <View style={styles.manual}>
          <EditorInput
            value={venue.name}
            onChangeText={(value) => onChange({ name: value })}
            placeholder="Nom du lieu"
          />
          <View style={styles.gap} />
          <EditorInput
            value={venue.street}
            onChangeText={(value) => onChange({ street: value })}
            placeholder="Rue"
          />
          <View style={styles.gap} />
          <EditorInput
            value={venue.zip}
            onChangeText={(value) => onChange({ zip: value })}
            placeholder="Code postal"
          />
          <View style={styles.gap} />
          <EditorInput
            value={venue.city}
            onChangeText={(value) => onChange({ city: value })}
            placeholder="Ville"
          />
        </View>
      ) : null}

      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { gap: 4 },
  heading: {
    fontFamily: fontFamilies.sansSemiBold,
    fontSize: 15,
    marginTop: spacing.md,
    marginBottom: 4,
  },
  lead: { fontFamily: fontFamilies.sans, fontSize: 13, lineHeight: 18, marginBottom: 8 },
  hits: {
    marginTop: 8,
    borderWidth: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  hitRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  hitText: { flex: 1, fontFamily: fontFamilies.sans, fontSize: 13, lineHeight: 18 },
  mapBlock: { marginTop: 12, gap: 6 },
  selected: { fontFamily: fontFamilies.sansMedium, fontSize: 12.5 },
  locateBtn: {
    marginTop: 10,
    minHeight: 44,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  locateLabel: { fontFamily: fontFamilies.sansSemiBold, fontSize: 13.5 },
  manualToggle: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
  },
  manualToggleLabel: { fontFamily: fontFamilies.sansMedium, fontSize: 13 },
  manual: { marginTop: 8 },
  gap: { height: 10 },
  error: { fontFamily: fontFamilies.sansMedium, fontSize: 12.5, marginTop: 8, color: '#A45A45' },
  pressed: { opacity: 0.85 },
});
