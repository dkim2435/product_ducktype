import { useState, useCallback, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import type { TestState } from './types/test';
import type { TestResult } from './types/stats';
import type { Settings } from './types/settings';
import type { LessonId } from './types/gamification';
import { useSettings } from './hooks/useSettings';
import { useTheme } from './hooks/useTheme';
import { useStats } from './hooks/useStats';
import { useGamification } from './hooks/useGamification';
import { useToast } from './hooks/useToast';
import { useDailyChallenge } from './hooks/useDailyChallenge';
import { useLessons } from './hooks/useLessons';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { ToastContainer } from './components/layout/ToastContainer';
import { TypingTest } from './components/test/TypingTest';
import { ResultsScreen } from './components/results/ResultsScreen';
import { SettingsModal } from './components/settings/SettingsModal';
import { About } from './components/pages/About';
import { Contact } from './components/pages/Contact';
import { PrivacyPolicy } from './components/pages/PrivacyPolicy';
import { TermsOfService } from './components/pages/TermsOfService';
import { Profile } from './components/pages/Profile';
import { Achievements } from './components/pages/Achievements';
import { DailyChallenge } from './components/pages/DailyChallenge';
import { Practice } from './components/pages/Practice';
import { LessonTest } from './components/practice/LessonTest';

type Screen = 'test' | 'results' | 'about' | 'contact' | 'privacy' | 'terms'
  | 'achievements' | 'profile' | 'daily-challenge' | 'practice' | 'lesson';

function App() {
  const { settings, updateSetting } = useSettings();
  const { i18n } = useTranslation();
  const [screen, setScreen] = useState<Screen>('test');
  const [showSettings, setShowSettings] = useState(false);
  const [lastResult, setLastResult] = useState<TestResult | null>(null);
  const [activeLessonId, setActiveLessonId] = useState<LessonId | null>(null);

  useTheme(settings.theme);
  const { saveResult, getPersonalBest } = useStats();
  const { toasts, addToast, removeToast } = useToast();
  const gamification = useGamification();
  const dailyChallenge = useDailyChallenge();
  const lessons = useLessons();

  // Store last test state for key analysis
  const lastTestStateRef = useRef<TestState | null>(null);

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
    lastTestStateRef.current = testState;
    setLastResult(result);
    setScreen('results');

    // Process gamification
    gamification.processTestResult(
      result,
      testState,
      false,
      addToast,
      dailyChallenge.dailyChallengeState,
      lessons.lessonProgress,
    );
  }, [settings, saveResult, gamification, addToast, dailyChallenge.dailyChallengeState, lessons.lessonProgress]);

  const handleDailyChallengeFinish = useCallback((testState: TestState) => {
    const result = saveResult(testState, settings);
    lastTestStateRef.current = testState;
    setLastResult(result);
    setScreen('results');

    // Save daily challenge result
    dailyChallenge.saveDailyChallengeResult(result.wpm, result.accuracy);

    // Process gamification with daily challenge flag
    gamification.processTestResult(
      result,
      testState,
      true,
      addToast,
      dailyChallenge.dailyChallengeState,
      lessons.lessonProgress,
    );
  }, [settings, saveResult, gamification, addToast, dailyChallenge, lessons.lessonProgress]);

  const handleLessonFinish = useCallback((testState: TestState, lessonId: LessonId) => {
    const result = saveResult(testState, settings);
    lastTestStateRef.current = testState;
    setLastResult(result);

    // Save lesson result
    lessons.saveLessonResult(lessonId, result.wpm, result.accuracy);

    // Process gamification
    gamification.processTestResult(
      result,
      testState,
      false,
      addToast,
      dailyChallenge.dailyChallengeState,
      lessons.lessonProgress,
    );

    setScreen('results');
  }, [settings, saveResult, gamification, addToast, dailyChallenge.dailyChallengeState, lessons]);

  const handleRestart = useCallback(() => {
    setScreen('test');
    setLastResult(null);
  }, []);

  const handleNavigate = useCallback((page: string) => {
    if (page === 'test') {
      setScreen('test');
      setLastResult(null);
    } else {
      setScreen(page as Screen);
    }
    window.scrollTo(0, 0);
  }, []);

  const handleStartLesson = useCallback((lessonId: LessonId) => {
    setActiveLessonId(lessonId);
    setScreen('lesson');
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

  const isContentPage = screen === 'test' || screen === 'results';

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh',
    }}>
      <Header
        onSettingsClick={() => setShowSettings(true)}
        onNavigate={handleNavigate}
        profile={gamification.profile}
        streak={gamification.streak}
      />

      <main style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: isContentPage ? 'center' : 'flex-start',
        padding: '0 32px',
      }}>
        {screen === 'test' && (
          <>
            <button
              onClick={() => !dailyChallenge.hasCompletedToday && handleNavigate('daily-challenge')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 14px',
                marginBottom: '16px',
                border: `1.5px solid ${dailyChallenge.hasCompletedToday ? 'var(--sub-alt-color)' : 'var(--main-color)'}`,
                borderRadius: '999px',
                background: 'transparent',
                color: dailyChallenge.hasCompletedToday ? 'var(--sub-color)' : 'var(--main-color)',
                fontSize: '13px',
                cursor: dailyChallenge.hasCompletedToday ? 'default' : 'pointer',
                opacity: dailyChallenge.hasCompletedToday ? 0.7 : 1,
                transition: 'opacity 0.15s, border-color 0.15s',
              }}
            >
              <span style={{ fontSize: '15px' }}>
                {dailyChallenge.hasCompletedToday ? '✓' : '📅'}
              </span>
              {dailyChallenge.hasCompletedToday
                ? "Today's challenge completed"
                : 'Daily Challenge'}
              {dailyChallenge.dailyChallengeState.currentStreak > 0 && (
                <span style={{
                  fontSize: '12px',
                  opacity: 0.8,
                }}>
                  🔥 {dailyChallenge.dailyChallengeState.currentStreak}
                </span>
              )}
            </button>
            <TypingTest
              key={`${settings.language}-${settings.mode}-${settings.timeLimit}-${settings.wordCount}-${settings.punctuation}-${settings.numbers}`}
              settings={settings}
              onSettingChange={handleSettingChange}
              onFinish={handleTestFinish}
            />
          </>
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
            xpGain={gamification.lastXpGain}
            newAchievements={gamification.lastNewAchievements}
          />
        )}

        {screen === 'profile' && (
          <Profile
            profile={gamification.profile}
            streak={gamification.streak}
            keyStats={gamification.keyStats}
            onBack={() => handleNavigate('test')}
          />
        )}

        {screen === 'achievements' && (
          <Achievements
            achievements={gamification.achievements}
            onBack={() => handleNavigate('test')}
          />
        )}

        {screen === 'daily-challenge' && (
          <DailyChallenge
            settings={settings}
            dailyChallengeState={dailyChallenge.dailyChallengeState}
            hasCompletedToday={dailyChallenge.hasCompletedToday}
            todayResult={dailyChallenge.todayResult}
            getWords={dailyChallenge.getWords}
            onFinish={handleDailyChallengeFinish}
            onBack={() => handleNavigate('test')}
          />
        )}

        {screen === 'practice' && (
          <Practice
            lessonProgress={lessons.lessonProgress}
            isLessonUnlocked={lessons.isLessonUnlocked}
            keyStats={gamification.keyStats}
            onStartLesson={handleStartLesson}
            onBack={() => handleNavigate('test')}
          />
        )}

        {screen === 'lesson' && activeLessonId && (
          <LessonTest
            lessonId={activeLessonId}
            settings={settings}
            getLessonWords={lessons.getLessonWords}
            keyStats={gamification.keyStats}
            onFinish={(testState) => handleLessonFinish(testState, activeLessonId)}
            onBack={() => handleNavigate('practice')}
            getNextLesson={lessons.getNextLesson}
            onStartLesson={handleStartLesson}
          />
        )}

        {screen === 'about' && <About onBack={() => handleNavigate('test')} />}
        {screen === 'contact' && <Contact onBack={() => handleNavigate('test')} />}
        {screen === 'privacy' && <PrivacyPolicy onBack={() => handleNavigate('test')} />}
        {screen === 'terms' && <TermsOfService onBack={() => handleNavigate('test')} />}
      </main>

      <Footer onNavigate={handleNavigate} />

      <SettingsModal
        settings={settings}
        onSettingChange={handleSettingChange}
        onClose={() => setShowSettings(false)}
        visible={showSettings}
      />

      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </div>
  );
}

export default App;
