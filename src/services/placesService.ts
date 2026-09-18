/**
 * Recherche de lieux via le proxy Nominatim Django.
 */

import { apiClient } from './apiClient';

export interface PlaceHit {
  display_name: string;
  name: string;
  street: string;
  zip: string;
  city: string;
  lat: number;
  lng: number;
}

export async function searchPlaces(query: string): Promise<PlaceHit[]> {
  const q = query.trim();
  if (q.length < 3) return [];
  const data = await apiClient.get<{ results: PlaceHit[] }>(
    `/places/search/?q=${encodeURIComponent(q)}`,
  );
  return Array.isArray(data.results) ? data.results : [];
}

/** Géocode une adresse libre → premier résultat. */
export async function locateAddress(query: string): Promise<PlaceHit> {
  return apiClient.get<PlaceHit>(
    `/places/locate/?q=${encodeURIComponent(query.trim())}`,
  );
}
