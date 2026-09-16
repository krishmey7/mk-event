import { Input, type InputProps } from '@/components/ui/Input';
import { useEditor } from '../EditorContext';

/** Champ du studio : couleurs du thème d’invitation en cours. */
export function EditorInput(props: Omit<InputProps, 'tone' | 'palette'>) {
  const { theme } = useEditor();
  const c = theme.colors;
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
