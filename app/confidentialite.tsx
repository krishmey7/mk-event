/**
 * Politique de confidentialité — route publique.
 */

import { LegalDocumentScreen } from '@/features/legal/LegalDocumentScreen';
import { PRIVACY_POLICY } from '@/features/legal/documents';

export default function ConfidentialiteScreen() {
  return <LegalDocumentScreen document={PRIVACY_POLICY} />;
}
