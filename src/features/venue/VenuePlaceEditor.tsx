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
  const [manualOpen, setManualOpen] = useState(!venueHasCoords(venue));
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
        Recherchez une adresse ou saisissez un nom et un repère manuellement. La carte est facultative.
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

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={manualOpen ? 'Masquer la saisie manuelle du lieu' : 'Saisir le lieu manuellement'}
        accessibilityState={{ expanded: manualOpen }}
        onPress={() => setManualOpen((v) => !v)}
        style={({ pressed }) => [
          styles.manualAction,
          { backgroundColor: c.accentMuted, borderColor: c.accent },
          pressed && styles.pressed,
        ]}
      >
        <View style={[styles.manualIcon, { backgroundColor: c.surface }]}>
          <Ionicons name="create-outline" size={20} color={c.accent} />
        </View>
        <View style={styles.manualActionCopy}>
          <Text style={[styles.manualActionTitle, { color: c.textPrimary }]}>
            {manualOpen ? 'Saisie manuelle du lieu' : 'Vous ne trouvez pas votre lieu ?'}
          </Text>
          <Text style={[styles.manualActionHint, { color: c.textSecondary }]}>
            {manualOpen
              ? 'Indiquez le lieu en une seule fois, sans utiliser la carte.'
              : 'Saisissez le nom, l’adresse ou un repère en un seul champ.'}
          </Text>
        </View>
        <View style={styles.manualActionCta}>
          <Text style={[styles.manualActionCtaText, { color: c.accent }]}>
            {manualOpen ? 'Masquer' : 'Saisir'}
          </Text>
          <Ionicons
            name={manualOpen ? 'chevron-up' : 'chevron-forward'}
            size={17}
            color={c.accent}
          />
        </View>
      </Pressable>

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

      {manualOpen ? (
        <View style={styles.manual}>
          <EditorInput
            value={venueFullAddress(venue)}
            onChangeText={(value) => onChange({
              name: value,
              street: '',
              zip: '',
              city: '',
              lat: null,
              lng: null,
            })}
            placeholder="Nom du lieu, adresse ou repère"
            maxLength={200}
          />
          <Text style={[styles.manualHint, { color: c.textMuted }]}>
            Le texte saisi sera affiché sur l’invitation et utilisé pour rechercher l’itinéraire.
          </Text>
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
  manualAction: {
    marginTop: 10,
    minHeight: 68,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  manualIcon: {
    width: 38,
    height: 38,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  manualActionCopy: { flex: 1, gap: 2 },
  manualActionTitle: { fontFamily: fontFamilies.sansSemiBold, fontSize: 13.5 },
  manualActionHint: { fontFamily: fontFamilies.sans, fontSize: 11.5, lineHeight: 16 },
  manualActionCta: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  manualActionCtaText: { fontFamily: fontFamilies.sansSemiBold, fontSize: 12.5 },
  manual: { marginTop: 8 },
  manualHint: { fontFamily: fontFamilies.sans, fontSize: 12, lineHeight: 17, marginTop: 8 },
  error: { fontFamily: fontFamilies.sansMedium, fontSize: 12.5, marginTop: 8, color: '#A45A45' },
  pressed: { opacity: 0.85 },
});
