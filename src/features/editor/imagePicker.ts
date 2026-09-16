/**
 * MK EVENT — Studio · accès à la galerie native (expo-image-picker).
 * Ouvre le sélecteur du téléphone et renvoie l'URI locale de la
 * photo choisie — pour une prévisualisation instantanée dans le
 * studio (couverture, étapes d'histoire…).
 */

import * as ImagePicker from 'expo-image-picker';

export async function pickLibraryImage(): Promise<string | null> {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    quality: 0.8,
  });

  if (result.canceled) return null;
  const asset = result.assets?.[0];
  return asset?.uri ?? null;
}

/**
 * Sélection multiple — import de plusieurs photos d'un coup
 * (galerie du studio : cérémonie, cocktail, soirée…).
 */
export async function pickLibraryImages(max = 12): Promise<string[]> {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsMultipleSelection: true,
    selectionLimit: max,
    quality: 0.8,
  });

  if (result.canceled) return [];
  return (result.assets ?? []).map((asset) => asset.uri).filter(Boolean);
}
