import { useState, useEffect } from 'react';

export function useUrlParams() {
  const [challengeWpm, setChallengeWpm] = useState<number | null>(null);
  const [initialScreen, setInitialScreen] = useState<string | null>(null);
  const [adventureWorldId, setAdventureWorldId] = useState<number | undefined>(undefined);

  // Parse challenge URL hash on mount (e.g. #c=85-97)
  useEffect(() => {
    const hash = window.location.hash;
    const match = hash.match(/^#c=(\d+)-(\d+)$/);
    if (match) {
      setChallengeWpm(parseInt(match[1], 10));
      history.replaceState(null, '', window.location.pathname + window.location.search);
    }
  }, []);

  // Parse adventure share URL on mount (e.g. /adventure?world=2)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const worldParam = params.get('world');
    const isAdventurePath = window.location.pathname.includes('/adventure');
    if (worldParam || isAdventurePath) {
      const worldId = worldParam ? parseInt(worldParam, 10) : undefined;
      if (!worldParam || (worldId && worldId >= 1 && worldId <= 6)) {
        setInitialScreen('adventure');
        setAdventureWorldId(worldId);
      }
      history.replaceState(null, '', window.location.pathname.replace('/adventure', '/'));
    }
  }, []);

  return { challengeWpm, initialScreen, adventureWorldId };
}
