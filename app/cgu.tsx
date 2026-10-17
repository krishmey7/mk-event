/**
 * Conditions d’utilisation — route publique.
 */

import { LegalDocumentScreen } from '@/features/legal/LegalDocumentScreen';
import { TERMS_OF_USE } from '@/features/legal/documents';

export default function CguScreen() {
  return <LegalDocumentScreen document={TERMS_OF_USE} />;
}
