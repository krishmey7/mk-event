/**
 * Carte interactive OSM (Leaflet via iframe) — web + fallback natif.
 */

import { createElement, useMemo } from 'react';
import { Linking, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { fontFamilies } from '@/constants/theme';
import { useAppTheme } from '@/context/ThemePreferenceContext';

function buildMapHtml(lat: number, lng: number, interactive: boolean): string {
  const zoom = 15;
  const drag = interactive ? 'true' : 'false';
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<style>
  html, body, #map { margin: 0; padding: 0; height: 100%; width: 100%; background: #e8e4dc; }
  .leaflet-control-attribution { font-size: 10px !important; }
</style>
</head>
<body>
<div id="map"></div>
<script>
  var map = L.map('map', {
    zoomControl: ${interactive ? 'true' : 'false'},
    dragging: ${drag},
    scrollWheelZoom: ${interactive ? 'true' : 'false'},
    doubleClickZoom: ${interactive ? 'true' : 'false'},
    boxZoom: false,
    keyboard: ${interactive ? 'true' : 'false'}
  }).setView([${lat}, ${lng}], ${zoom});
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap'
  }).addTo(map);
  L.marker([${lat}, ${lng}]).addTo(map);
  setTimeout(function () { map.invalidateSize(); }, 80);
</script>
</body>
</html>`;
}

export function VenueMap({
  lat,
  lng,
  height = 200,
  interactive = true,
}: {
  lat: number;
  lng: number;
  height?: number;
  interactive?: boolean;
}) {
  const { theme } = useAppTheme();
  const c = theme.colors;
  const html = useMemo(() => buildMapHtml(lat, lng, interactive), [lat, lng, interactive]);

  if (Platform.OS === 'web') {
    return (
      <View style={[styles.wrap, { height, borderColor: c.border }]}>
        {createElement('iframe', {
          srcDoc: html,
          title: 'Carte du lieu',
          style: {
            width: '100%',
            height: '100%',
            border: '0',
            borderRadius: 12,
            display: 'block',
          },
        })}
        <Text style={[styles.attr, { color: c.textMuted }]}>© OpenStreetMap</Text>
      </View>
    );
  }

  const osmUrl = `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=16/${lat}/${lng}`;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Ouvrir la carte"
      onPress={() => void Linking.openURL(osmUrl)}
      style={[styles.nativeFallback, { height, borderColor: c.border, backgroundColor: c.surfaceElevated }]}
    >
      <Ionicons name="map-outline" size={28} color={c.accent} />
      <Text style={[styles.nativeTitle, { color: c.textPrimary }]}>Voir sur OpenStreetMap</Text>
      <Text style={[styles.attr, { color: c.textMuted }]}>
        {lat.toFixed(5)}, {lng.toFixed(5)}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
  },
  attr: {
    fontFamily: fontFamilies.sans,
    fontSize: 10,
    textAlign: 'center',
    marginTop: 4,
  },
  nativeFallback: {
    width: '100%',
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    padding: 16,
  },
  nativeTitle: {
    fontFamily: fontFamilies.sansSemiBold,
    fontSize: 14,
  },
});
