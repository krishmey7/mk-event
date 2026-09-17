import { Input, type InputProps } from '@/components/ui/Input';

import { useStudioChrome } from '../useStudioChrome';

/** Champ du studio — couleurs chrome app. */
export function EditorInput(props: Omit<InputProps, 'tone' | 'palette'>) {
  const c = useStudioChrome();
  return (
    <Input
      {...props}
      tone="light"
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
