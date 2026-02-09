import { useEffect, useCallback } from 'react';
import { themes } from '../constants/themes';
import type { Theme } from '../types/theme';

export function useTheme(themeId: string) {
  const applyTheme = useCallback((theme: Theme) => {
    const root = document.documentElement;
    root.style.setProperty('--bg-color', theme.colors.bg);
    root.style.setProperty('--main-color', theme.colors.main);
    root.style.setProperty('--caret-color', theme.colors.caret);
    root.style.setProperty('--sub-color', theme.colors.sub);
    root.style.setProperty('--sub-alt-color', theme.colors.subAlt);
    root.style.setProperty('--text-color', theme.colors.text);
    root.style.setProperty('--error-color', theme.colors.error);
    root.style.setProperty('--error-extra-color', theme.colors.errorExtra);
    root.style.setProperty('--colorful-error-color', theme.colors.colorfulError);
    root.style.setProperty('--colorful-error-extra-color', theme.colors.colorfulErrorExtra);
  }, []);

  useEffect(() => {
    const theme = themes.find(t => t.id === themeId) || themes[0];
    applyTheme(theme);
  }, [themeId, applyTheme]);

  return { themes, currentTheme: themes.find(t => t.id === themeId) || themes[0] };
}
