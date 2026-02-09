import { useState, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import type { TestState } from './types/test';
import type { TestResult } from './types/stats';
import type { Settings } from './types/settings';
import { useSettings } from './hooks/useSettings';
import { useTheme } from './hooks/useTheme';
import { useStats } from './hooks/useStats';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { TypingTest } from './components/test/TypingTest';
import { ResultsScreen } from './components/results/ResultsScreen';
import { SettingsModal } from './components/settings/SettingsModal';

type Screen = 'test' | 'results';

function App() {
  const { settings, updateSetting } = useSettings();
  const { i18n } = useTranslation();
  const [screen, setScreen] = useState<Screen>('test');
  const [showSettings, setShowSettings] = useState(false);
  const [lastResult, setLastResult] = useState<TestResult | null>(null);

  useTheme(settings.theme);
  const { saveResult, getPersonalBest } = useStats();

  // Sync UI language
  useEffect(() => {
    if (i18n.language !== settings.uiLanguage) {
      i18n.changeLanguage(settings.uiLanguage);
    }
  }, [settings.uiLanguage, i18n]);

  // Apply font family
  useEffect(() => {
    const fontMap: Record<string, string> = {
      default: "'Roboto Mono', 'Noto Sans KR', 'Noto Sans JP', 'Noto Sans SC', monospace",
      mono: "monospace",
      'roboto-mono': "'Roboto Mono', monospace",
      'fira-code': "'Fira Code', monospace",
      'source-code-pro': "'Source Code Pro', monospace",
    };
    document.documentElement.style.setProperty(
      '--font-family',
      fontMap[settings.fontFamily] || fontMap.default
    );
  }, [settings.fontFamily]);

  const handleTestFinish = useCallback((testState: TestState) => {
    const result = saveResult(testState, settings);
    setLastResult(result);
    setScreen('results');
  }, [settings, saveResult]);

  const handleRestart = useCallback(() => {
    setScreen('test');
    setLastResult(null);
  }, []);

  const handleSettingChange = useCallback(<K extends keyof Settings>(key: K, value: Settings[K]) => {
    updateSetting(key, value);
    if (key === 'language' || key === 'mode' || key === 'timeLimit' || key === 'wordCount' ||
        key === 'punctuation' || key === 'numbers') {
      setScreen('test');
      setLastResult(null);
    }
  }, [updateSetting]);

  const isCjk = ['ko', 'zh', 'ja'].includes(settings.language);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh',
    }}>
      <Header onSettingsClick={() => setShowSettings(true)} />

      <main style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0 32px',
      }}>
        {screen === 'test' && (
          <TypingTest
            key={`${settings.language}-${settings.mode}-${settings.timeLimit}-${settings.wordCount}-${settings.punctuation}-${settings.numbers}`}
            settings={settings}
            onSettingChange={handleSettingChange}
            onFinish={handleTestFinish}
          />
        )}

        {screen === 'results' && lastResult && (
          <ResultsScreen
            result={lastResult}
            personalBest={getPersonalBest(
              settings.language,
              settings.mode,
              settings.mode === 'time' ? settings.timeLimit : settings.wordCount
            )}
            onRestart={handleRestart}
            isCjk={isCjk}
          />
        )}
      </main>

      <Footer />

      <SettingsModal
        settings={settings}
        onSettingChange={handleSettingChange}
        onClose={() => setShowSettings(false)}
        visible={showSettings}
      />
    </div>
  );
}

export default App;
