import { Input, type InputProps } from '@/components/ui/Input';
import { useAppTheme } from '@/context/ThemePreferenceContext';

import { useStudioChrome } from '../useStudioChrome';

/** Champ du studio — couleurs chrome app (clair ou sombre). */
export function EditorInput(props: Omit<InputProps, 'tone' | 'palette'>) {
  const { mode } = useAppTheme();
  const c = useStudioChrome();
  return (
    <Input
      {...props}
      tone={mode}
      palette={{
        surface: c.surface,
        border: c.border,
        textPrimary: c.text,
        textMuted: c.textMuted,
        accent: c.primary,
      }}
    />
  );
}
