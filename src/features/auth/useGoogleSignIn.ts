/**
 * Connexion Google via expo-auth-session (activée si Client ID présent).
 */

import { useCallback, useState } from 'react';
import { Platform } from 'react-native';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { useRouter } from 'expo-router';

import { useAuth } from '@/context/AuthContext';
import { homeAfterAuth, useActiveEvent } from '@/context/ActiveEventContext';
import { GOOGLE_CLIENT_ID } from '@/constants/config';
import { ApiError } from '@/services/apiClient';
import { loginWithGoogle } from '@/services/authService';

WebBrowser.maybeCompleteAuthSession();

export const isGoogleAuthConfigured = Boolean(GOOGLE_CLIENT_ID);

export function useGoogleSignIn(onNotice: (message: string) => void) {
  const router = useRouter();
  const { signIn } = useAuth();
  const { syncFromServer } = useActiveEvent();
  const [loading, setLoading] = useState(false);

  const [request, , promptAsync] = Google.useIdTokenAuthRequest(
    isGoogleAuthConfigured
      ? {
          clientId: GOOGLE_CLIENT_ID,
          webClientId: GOOGLE_CLIENT_ID,
          ...(Platform.OS === 'ios' ? { iosClientId: GOOGLE_CLIENT_ID } : null),
          ...(Platform.OS === 'android' ? { androidClientId: GOOGLE_CLIENT_ID } : null),
        }
      : {
          clientId: 'missing.apps.googleusercontent.com',
          webClientId: 'missing.apps.googleusercontent.com',
        },
  );

  const completeWithIdToken = useCallback(
    async (idToken: string) => {
      setLoading(true);
      try {
        const session = await loginWithGoogle(idToken);
        await signIn(session);
        const needsSetup = await syncFromServer();
        router.replace(homeAfterAuth(needsSetup));
      } catch (error) {
        onNotice(
          error instanceof ApiError
            ? error.message
            : 'Connexion Google impossible. Réessayez ou utilisez votre e-mail.',
        );
      } finally {
        setLoading(false);
      }
    },
    [onNotice, router, signIn, syncFromServer],
  );

  const signInWithGoogle = useCallback(async () => {
    if (!isGoogleAuthConfigured) {
      onNotice(
        'Connexion Google bientôt disponible — ajoutez votre Client ID OAuth, ou utilisez votre e-mail.',
      );
      return;
    }
    if (!request) {
      onNotice('Google n’est pas encore prêt. Réessayez dans un instant.');
      return;
    }
    setLoading(true);
    try {
      const result = await promptAsync();
      if (result.type !== 'success') {
        if (result.type === 'error') {
          onNotice('Connexion Google annulée ou interrompue.');
        }
        return;
      }
      const idToken =
        result.params.id_token ??
        (typeof result.authentication?.idToken === 'string'
          ? result.authentication.idToken
          : null);
      if (!idToken) {
        onNotice('Google n’a pas renvoyé de jeton. Réessayez.');
        return;
      }
      await completeWithIdToken(idToken);
    } catch {
      onNotice('Connexion Google impossible. Réessayez ou utilisez votre e-mail.');
    } finally {
      setLoading(false);
    }
  }, [completeWithIdToken, onNotice, promptAsync, request]);

  return {
    signInWithGoogle,
    googleLoading: loading,
    googleReady: isGoogleAuthConfigured && Boolean(request),
    googleConfigured: isGoogleAuthConfigured,
  };
}
