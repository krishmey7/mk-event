/**
 * Route legacy — sheet étape d’histoire (transparentModal).
 */

import { useLocalSearchParams, useRouter } from 'expo-router';

import { HistoireStepSheet } from '@/features/editor/components/HistoireStepSheet';

export default function HistoireEtapeScreen() {
  const router = useRouter();
  const { index } = useLocalSearchParams<{ index?: string }>();
  const parsed = index !== undefined && index !== '' ? Number.parseInt(index, 10) : -1;
  const editIndex = Number.isFinite(parsed) ? parsed : -1;

  return (
    <HistoireStepSheet
      visible
      embedded
      editIndex={editIndex}
      onClose={() => router.back()}
    />
  );
}
