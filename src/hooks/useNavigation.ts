import { useState, useCallback, useEffect } from 'react';

export type Screen = 'test' | 'results' | 'about' | 'contact' | 'privacy' | 'terms'
  | 'achievements' | 'profile' | 'daily-challenge' | 'practice' | 'lesson' | 'leaderboard'
  | 'adventure' | 'not-found';

const pathToScreen: Record<string, Screen> = {
  '/': 'test',
  '/adventure': 'adventure',
  '/daily-challenge': 'daily-challenge',
  '/practice': 'practice',
  '/leaderboard': 'leaderboard',
  '/about': 'about',
  '/achievements': 'achievements',
  '/profile': 'profile',
  '/contact': 'contact',
  '/privacy': 'privacy',
  '/terms': 'terms',
};

const screenToPath: Record<Screen, string> = {
  'test': '/',
  'results': '/',
  'about': '/about',
  'contact': '/contact',
  'privacy': '/privacy',
  'terms': '/terms',
  'achievements': '/achievements',
  'profile': '/profile',
  'daily-challenge': '/daily-challenge',
  'practice': '/practice',
  'lesson': '/practice',
  'leaderboard': '/leaderboard',
  'adventure': '/adventure',
  'not-found': '/404',
};

function getInitialScreen(adventureWorldId?: number): Screen {
  if (adventureWorldId !== undefined) return 'adventure';
  const saved = sessionStorage.getItem('ducktype_return_screen');
  if (saved) {
    sessionStorage.removeItem('ducktype_return_screen');
    return saved as Screen;
  }
  const path = window.location.pathname.replace(/\/$/, '') || '/';
  return pathToScreen[path] || 'not-found';
}

export function useNavigation(adventureWorldId?: number) {
  const [screen, setScreen] = useState<Screen>(() => getInitialScreen(adventureWorldId));

  // Update canonical tag and URL path when screen changes (SEO)
  useEffect(() => {
    const path = screenToPath[screen] || '/';
    const canonicalUrl = `https://ducktype.xyz${path}`;

    const link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (link) link.href = canonicalUrl;

    if (window.location.pathname !== path) {
      window.history.replaceState(null, '', path);
    }
  }, [screen]);

  const handleNavigate = useCallback((page: string) => {
    if (page === 'test') {
      setScreen('test');
    } else {
      setScreen(page as Screen);
    }
    window.scrollTo(0, 0);
  }, []);

  return { screen, setScreen, handleNavigate };
}
