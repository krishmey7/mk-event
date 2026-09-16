/**
 * Stack « Mes invitations » — liste + page de gestion d’un événement.
 */

import { Stack } from 'expo-router';

import { useAppTheme } from '@/context/ThemePreferenceContext';

export default function InvitationsLayout() {
  const { theme } = useAppTheme();

  return (
    <Stack
      initialRouteName="index"
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: theme.colors.background },
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="[id]" />
    </Stack>
  );
}
