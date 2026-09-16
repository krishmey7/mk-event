/**
 * Hook de chargement des invitations de l'organisateur
 * (consommé par le tableau de bord et l'écran « Mes invitations »).
 */

import { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';

import { eventsService } from '@/services/eventsService';
import type { Event } from '@/types';

export function useEvents() {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await eventsService.getEvents();
      setEvents(response.results);
    } catch {
      setError('Impossible de charger vos invitations. Réessayez plus tard.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  return { events, isLoading, error, reload: load };
}
