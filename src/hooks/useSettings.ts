import { useState, useCallback, useEffect } from 'react';
import type { Settings } from '../types/settings';
import { DEFAULT_SETTINGS } from '../constants/defaults';
import { getItem, setItem, removeItem } from '../utils/storage';

// Bump this whenever defaults change to force a reset
const SETTINGS_VERSION = 4;

function loadSettings(): Settings {
  const savedVersion = getItem<number>('settings_version', 0);
  if (savedVersion < SETTINGS_VERSION) {
    removeItem('settings');
    setItem('settings_version', SETTINGS_VERSION);
    return DEFAULT_SETTINGS;
  }
  const saved = getItem<Partial<Settings>>('settings', {});
  return { ...DEFAULT_SETTINGS, ...saved };
}

export function useSettings() {
  const [settings, setSettings] = useState<Settings>(loadSettings);

  useEffect(() => {
    setItem('settings', settings);
  }, [settings]);

  const updateSetting = useCallback(<K extends keyof Settings>(
    key: K,
    value: Settings[K]
  ) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  }, []);

  const resetSettings = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
  }, []);

  return { settings, updateSetting, resetSettings };
}
