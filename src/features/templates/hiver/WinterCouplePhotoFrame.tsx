/**
 * Cadres photo du couple — modèle Hiver (SVG).
 */

import { CouplePhotoFrame } from '@/features/invitation/CouplePhotoFrame';
import type { CouplePhoto } from '@/features/invitation/types';
import {
  WinterCircleFloralFrame,
  WinterCircleFrame,
  WinterHeartFrame,
  WinterHexFrame,
  WinterSoftFrame,
} from './WinterPhotoFrames';

export function WinterCouplePhotoFrame({
  couplePhoto,
  gold,
  frost = '#8FAEC4',
  size = 168,
  compact = false,
}: {
  couplePhoto: CouplePhoto;
  gold: string;
  frost?: string;
  size?: number;
  compact?: boolean;
}) {
  const dim = compact ? Math.round(size * 0.76) : size;
  const frame = mapWinterFrame(couplePhoto.frame);
  const uri = couplePhoto.uri;

  if (frame === 'hex') {
    return <WinterHexFrame uri={uri} gold={gold} size={dim} floral={false} />;
  }
  if (frame === 'hexFloral') {
    return <WinterHexFrame uri={uri} gold={gold} size={dim} floral />;
  }
  if (frame === 'circle') {
    return <WinterCircleFrame uri={uri} gold={gold} size={Math.round(dim * 0.68)} />;
  }
  if (frame === 'circleFloral') {
    return (
      <WinterCircleFloralFrame
        uri={uri}
        gold={gold}
        frost={frost}
        size={Math.round(dim * 0.62)}
      />
    );
  }
  if (frame === 'soft') {
    return (
      <WinterSoftFrame
        uri={uri}
        gold={gold}
        width={Math.round(dim * 0.88)}
        height={Math.round(dim * 0.7)}
      />
    );
  }
  if (frame === 'heart' || frame === 'heartFloral') {
    return <WinterHeartFrame uri={uri} gold={gold} size={Math.round(dim * 0.64)} />;
  }

  return (
    <CouplePhotoFrame couplePhoto={{ ...couplePhoto, frame }} accent={gold} />
  );
}

function mapWinterFrame(frame: CouplePhoto['frame']): CouplePhoto['frame'] {
  if (frame === 'heartFloral') return 'heart';
  return frame;
}
