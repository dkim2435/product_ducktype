import { useState, useEffect } from 'react';

interface UrlParamsState {
  challengeWpm: number | null;
  initialScreen: string | null;
  adventureWorldId: number | undefined;
}

function parseUrlParams(): UrlParamsState {
  let challengeWpm: number | null = null;
  let initialScreen: string | null = null;
  let adventureWorldId: number | undefined;

  const hash = window.location.hash;
  const hashMatch = hash.match(/^#c=(\d+)-(\d+)$/);
  if (hashMatch) {
    challengeWpm = parseInt(hashMatch[1], 10);
  }

  const params = new URLSearchParams(window.location.search);
  const worldParam = params.get('world');
  const isAdventurePath = window.location.pathname.includes('/adventure');
  if (worldParam || isAdventurePath) {
    const worldId = worldParam ? parseInt(worldParam, 10) : undefined;
    if (!worldParam || (worldId && worldId >= 1 && worldId <= 6)) {
      initialScreen = 'adventure';
      adventureWorldId = worldId;
    }
  }

  return { challengeWpm, initialScreen, adventureWorldId };
}

export function useUrlParams() {
  const [params] = useState(parseUrlParams);

  useEffect(() => {
    // Clean URL after initial parse so reloads land on a canonical path
    const hasHash = /^#c=(\d+)-(\d+)$/.test(window.location.hash);
    if (hasHash) {
      history.replaceState(null, '', window.location.pathname + window.location.search);
    }
    const worldParam = new URLSearchParams(window.location.search).get('world');
    if (worldParam) {
      history.replaceState(null, '', window.location.pathname);
    }
  }, []);

  return params;
}
