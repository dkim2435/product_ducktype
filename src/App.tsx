import { useState, useCallback, useEffect, useRef, lazy, Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import type { TestState } from './types/test';
import type { TestResult } from './types/stats';
import type { Settings } from './types/settings';
import type { LessonId, KeyStats } from './types/gamification';
import { extractKeyStats } from './utils/keyAnalysis';
import { useSettings } from './hooks/useSettings';
import { useTheme } from './hooks/useTheme';
import { useStats } from './hooks/useStats';
import { useGamification } from './hooks/useGamification';
import { useToast } from './hooks/useToast';
import { useDailyChallenge } from './hooks/useDailyChallenge';
import { useLessons } from './hooks/useLessons';
import { useIsMobile } from './hooks/useIsMobile';
import { useNavigation } from './hooks/useNavigation';
import { useAuthContext, AuthProvider } from './contexts/AuthContext';
import { AppLayout } from './components/AppLayout';
import { ResultsScreen } from './components/results/ResultsScreen';
import { About } from './components/pages/About';
import { Contact } from './components/pages/Contact';
import { PrivacyPolicy } from './components/pages/PrivacyPolicy';
import { TermsOfService } from './components/pages/TermsOfService';
import { HomeScreen } from './components/pages/HomeScreen';
import { NotFound } from './components/pages/NotFound';

// Lazy-loaded pages (code-split for smaller initial bundle)
const Profile = lazy(() => import('./components/pages/Profile').then(m => ({ default: m.Profile })));
const Achievements = lazy(() => import('./components/pages/Achievements').then(m => ({ default: m.Achievements })));
const Leaderboard = lazy(() => import('./components/pages/Leaderboard').then(m => ({ default: m.Leaderboard })));
const AdventurePage = lazy(() => import('./components/adventure/AdventurePage').then(m => ({ default: m.AdventurePage })));
const DailyChallenge = lazy(() => import('./components/pages/DailyChallenge').then(m => ({ default: m.DailyChallenge })));
const Practice = lazy(() => import('./components/pages/Practice').then(m => ({ default: m.Practice })));
const LessonTest = lazy(() => import('./components/practice/LessonTest').then(m => ({ default: m.LessonTest })));
import { useLeaderboard } from './hooks/useLeaderboard';
import { useFontLoader } from './hooks/useFontLoader';
import { useUrlParams } from './hooks/useUrlParams';
import { validateSettings } from './utils/settingsValidation';
import { getNextAchievement } from './utils/achievementProgress';
import { ACHIEVEMENTS } from './constants/achievements';

function AppContent() {
  const { user, currentUsername, isSupabaseConfigured, requestSync, openLogin, handleLogout, updateUsername } = useAuthContext();
  const { settings, updateSetting } = useSettings();
  const { t, i18n } = useTranslation();
  const { challengeWpm, adventureWorldId } = useUrlParams();
  const { screen, setScreen, handleNavigate } = useNavigation(adventureWorldId);
  const [lastResult, setLastResult] = useState<TestResult | null>(null);
  const [activeLessonId, setActiveLessonId] = useState<LessonId | null>(null);
  const [lastWeakKeys, setLastWeakKeys] = useState<KeyStats[]>([]);
  const [isTypingActive, setIsTypingActive] = useState(false);
  const isMobile = useIsMobile();
  const { currentTheme } = useTheme(settings.theme);
  useFontLoader(settings.fontFamily, settings.language);

  const { history: testHistory, saveResult, getPersonalBest } = useStats();
  const { toasts, addToast, removeToast } = useToast();
  const gamification = useGamification();

  // Validate settings against player level (fallback locked items to defaults)
  useEffect(() => {
    const validated = validateSettings(settings, gamification.profile.level, user?.id);
    const keys = Object.keys(validated) as (keyof typeof validated)[];
    for (const key of keys) {
      if (validated[key] !== settings[key]) {
        updateSetting(key, validated[key]);
      }
    }
  }, [gamification.profile.level, user?.id]); // eslint-disable-line react-hooks/exhaustive-deps
  const dailyChallenge = useDailyChallenge();
  const lessons = useLessons();
  const leaderboard = useLeaderboard();

  // Fetch leaderboard on mount to get user rank for particle effects
  useEffect(() => {
    leaderboard.fetchLeaderboard(settings.timeLimit, user?.id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings.timeLimit, user?.id]);

  // Store last test state for key analysis
  const lastTestStateRef = useRef<TestState | null>(null);

  // Daily challenge reminder for returning users (once per session)
  useEffect(() => {
    if (sessionStorage.getItem('daily_reminder_shown')) return;
    if (!gamification.profile || gamification.profile.testsCompleted < 1) return;
    if (dailyChallenge.hasCompletedToday) return;

    const timer = setTimeout(() => {
      addToast({
        type: 'info',
        title: t('daily.reminderTitle'),
        message: t('daily.reminderMessage'),
        icon: '📅',
      });
      sessionStorage.setItem('daily_reminder_shown', '1');
    }, 2000);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync UI language
  useEffect(() => {
    if (i18n.language !== settings.uiLanguage) {
      i18n.changeLanguage(settings.uiLanguage);
    }
  }, [settings.uiLanguage, i18n]);

  const triggerSync = useCallback(() => {
    if (user?.id) requestSync(user.id);
  }, [user, requestSync]);

  // Shared test completion logic: save result, extract weak keys, process gamification
  const processTestCompletion = useCallback((testState: TestState, isDailyChallenge: boolean, hasBoost: boolean) => {
    const result = saveResult(testState, settings);
    lastTestStateRef.current = testState;
    setLastResult(result);

    const testKeyStats = extractKeyStats(testState);
    const weak = Object.values(testKeyStats)
      .filter(s => s.errors > 0)
      .sort((a, b) => b.errorRate - a.errorRate || b.errors - a.errors)
      .slice(0, 8);
    setLastWeakKeys(weak);

    gamification.processTestResult(
      result,
      testState,
      isDailyChallenge,
      addToast,
      dailyChallenge.dailyChallengeState,
      lessons.lessonProgress,
      user?.id,
      hasBoost,
    );

    setScreen('results');
    triggerSync();
    return result;
  }, [settings, saveResult, gamification, addToast, dailyChallenge.dailyChallengeState, lessons.lessonProgress, user?.id, triggerSync, setScreen]);

  const handleTestFinish = useCallback((testState: TestState) => {
    const result = processTestCompletion(testState, false, dailyChallenge.hasCompletedToday);

    // Auto-submit to leaderboard for logged-in users (time mode only)
    if (user?.id && currentUsername && settings.mode === 'time') {
      leaderboard.submitScore(user.id, currentUsername, result.wpm, result.accuracy, 'time', settings.timeLimit);
    }
  }, [processTestCompletion, dailyChallenge.hasCompletedToday, user, currentUsername, settings.mode, settings.timeLimit, leaderboard]);

  const handleDailyChallengeFinish = useCallback((testState: TestState) => {
    const result = processTestCompletion(testState, true, true);
    dailyChallenge.saveDailyChallengeResult(result.wpm, result.accuracy);
  }, [processTestCompletion, dailyChallenge]);

  const handleLessonFinish = useCallback((testState: TestState, lessonId: LessonId) => {
    const result = processTestCompletion(testState, false, dailyChallenge.hasCompletedToday);
    lessons.saveLessonResult(lessonId, result.wpm, result.accuracy);
  }, [processTestCompletion, dailyChallenge.hasCompletedToday, lessons]);

  const handleRestart = useCallback(() => {
    handleNavigate('test');
    setLastResult(null);
  }, [handleNavigate]);

  const handleStartLesson = useCallback((lessonId: LessonId) => {
    setActiveLessonId(lessonId);
    setScreen('lesson');
  }, [setScreen]);

  const handleSettingChange = useCallback(<K extends keyof Settings>(key: K, value: Settings[K]) => {
    updateSetting(key, value);
    if (key === 'language' || key === 'mode' || key === 'timeLimit' || key === 'wordCount' ||
        key === 'punctuation' || key === 'numbers') {
      handleNavigate('test');
      setLastResult(null);
    }
    triggerSync();
  }, [updateSetting, triggerSync, handleNavigate]);

  const isCjk = ['ko', 'zh', 'ja'].includes(settings.language);

  const handleLoginClick = useCallback(() => {
    sessionStorage.setItem('ducktype_return_screen', screen);
    openLogin();
  }, [screen, openLogin]);

  return (
    <AppLayout
      profile={gamification.profile}
      streak={gamification.streak}
      isTypingActive={isTypingActive}
      onNavigate={handleNavigate}
      settings={settings}
      onSettingChange={handleSettingChange}
      playerLevel={gamification.profile.level}
      toasts={toasts}
      onDismissToast={removeToast}
      isCenteredPage={screen === 'results'}
      onLoginClick={handleLoginClick}
    >
      {screen === 'test' && (
        <HomeScreen
          settings={settings}
          onSettingChange={handleSettingChange}
          onFinish={handleTestFinish}
          onTypingStateChange={setIsTypingActive}
          onNavigate={handleNavigate}
          isTypingActive={isTypingActive}
          isMobile={isMobile}
          challengeWpm={challengeWpm}
          hasCompletedToday={dailyChallenge.hasCompletedToday}
          dailyChallengeStreak={dailyChallenge.dailyChallengeState.currentStreak}
          leaderboardRank={leaderboard.userRank}
          themeMainColor={currentTheme.colors.main}
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
          xpGain={gamification.lastXpGain}
          newAchievements={gamification.lastNewAchievements}
          weakKeys={lastWeakKeys}
          onNavigate={handleNavigate}
          challengeWpm={challengeWpm}
          isLoggedIn={!!user}
          isSupabaseConfigured={isSupabaseConfigured}
          onLoginClick={handleLoginClick}
          onShareClick={() => gamification.awardShareBonus(addToast)}
          hasCompletedDailyToday={dailyChallenge.hasCompletedToday}
          dailyStreak={dailyChallenge.dailyChallengeState.currentStreak}
          testsCompleted={gamification.profile.testsCompleted}
          totalXp={gamification.profile.totalXp}
          playerLevel={gamification.profile.level}
          unlockedCount={gamification.achievements.unlocked.length}
          totalAchievements={ACHIEVEMENTS.length}
          nextAchievement={getNextAchievement(
            lastResult,
            gamification.profile.testsCompleted,
            gamification.streak,
            gamification.achievements.unlocked.map(a => a.id),
          )}
          recentHistory={testHistory}
        />
      )}

      <Suspense fallback={null}>
        {screen === 'profile' && (
          <Profile
            profile={gamification.profile}
            streak={gamification.streak}
            keyStats={gamification.keyStats}
            history={testHistory}
            onBack={() => handleNavigate('test')}
            user={user}
            isSupabaseConfigured={isSupabaseConfigured}
            onLoginClick={handleLoginClick}
            onLogout={handleLogout}
            currentUsername={currentUsername}
            onUpdateUsername={updateUsername}
            profileFrame={settings.profileFrame}
          />
        )}

        {screen === 'leaderboard' && (
          <Leaderboard
            entries={leaderboard.entries}
            loading={leaderboard.loading}
            onFetch={leaderboard.fetchLeaderboard}
            onBack={() => handleNavigate('test')}
            currentUserId={user?.id}
            currentUsername={currentUsername}
            currentUserLevel={gamification.profile.level}
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

        {screen === 'adventure' && (
          <AdventurePage
            settings={settings}
            onBack={() => handleNavigate('test')}
            addXp={gamification.addXp}
            addToast={addToast}
            unlockAchievements={gamification.unlockAchievements}
            triggerSync={triggerSync}
            initialWorldId={adventureWorldId}
            isLoggedIn={!!user}
            onLoginClick={handleLoginClick}
            onShareClick={() => gamification.awardShareBonus(addToast)}
            onTypingStateChange={setIsTypingActive}
            userId={user?.id}
            playerLevel={gamification.profile.level}
          />
        )}
      </Suspense>

      {screen === 'about' && <About onBack={() => handleNavigate('test')} />}
      {screen === 'contact' && <Contact onBack={() => handleNavigate('test')} />}
      {screen === 'privacy' && <PrivacyPolicy onBack={() => handleNavigate('test')} />}
      {screen === 'terms' && <TermsOfService onBack={() => handleNavigate('test')} />}
      {screen === 'not-found' && <NotFound onBack={() => handleNavigate('test')} />}
    </AppLayout>
  );
}

function App() {
  const [syncKey, setSyncKey] = useState(0);

  return (
    <AuthProvider onSyncReload={() => setSyncKey(k => k + 1)}>
      <AppContent key={syncKey} />
    </AuthProvider>
  );
}

export default App;
