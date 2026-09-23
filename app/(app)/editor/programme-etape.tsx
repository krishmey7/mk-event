/**
 * Route legacy — sheet moment du programme (transparentModal).
 */

import { useLocalSearchParams, useRouter } from 'expo-router';

import { ProgrammeStepSheet } from '@/features/editor/components/ProgrammeStepSheet';

export default function ProgrammeEtapeScreen() {
  const router = useRouter();
  const { index } = useLocalSearchParams<{ index?: string }>();
  const editIndex =
    index !== undefined && index !== '' ? Number.parseInt(index, 10) : -1;

  return (
    <ProgrammeStepSheet
      visible
      embedded
      editIndex={Number.isFinite(editIndex) ? editIndex : -1}
      onClose={() => router.back()}
    />
  );
}
