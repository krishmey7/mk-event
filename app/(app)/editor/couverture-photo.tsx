/**
 * Route legacy — sheet photo de fond (transparentModal).
 */

import { useRouter } from 'expo-router';

import { CoverPhotoSheet } from '@/features/editor/components/CoverPhotoSheet';

export default function CouverturePhotoScreen() {
  const router = useRouter();
  return <CoverPhotoSheet visible embedded onClose={() => router.back()} />;
}
