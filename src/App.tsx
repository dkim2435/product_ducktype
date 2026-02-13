import { useState, useCallback, useEffect, useRef, lazy, Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import type { User } from '@supabase/supabase-js';
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
import { useAuth } from './hooks/useAuth';
import { useCloudSync } from './hooks/useCloudSync';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { ToastContainer } from './components/layout/ToastContainer';
import { TypingTest } from './components/test/TypingTest';
import { ResultsScreen } from './components/results/ResultsScreen';
import { SettingsModal } from './components/settings/SettingsModal';
import { AuthModal } from './components/auth/AuthModal';
import { About } from './components/pages/About';
import { Contact } from './components/pages/Contact';
import { PrivacyPolicy } from './components/pages/PrivacyPolicy';
import { TermsOfService } from './components/pages/TermsOfService';
import { WhatsNewModal } from './components/layout/WhatsNewModal';
import { OnboardingModal } from './components/layout/OnboardingModal';
import { TypingInfo } from './components/content/TypingInfo';

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
import { setPersistProgress, clearProgressData } from './utils/storage';

type Screen = 'test' | 'results' | 'about' | 'contact' | 'privacy' | 'terms'
  | 'achievements' | 'profile' | 'daily-challenge' | 'practice' | 'lesson' | 'leaderboard'
  | 'adventure';

interface AppContentProps {
  user: User | null;
  onLoginClick: () => void;
  onLogout: () => void;
  isSupabaseConfigured: boolean;
  requestSync: (userId: string) => void;
  currentUsername: string | null;
  onUpdateUsername: (newUsername: string) => Promise<void>;
}

function AppContent({ user, onLoginClick, onLogout, isSupabaseConfigured, requestSync, currentUsername, onUpdateUsername }: AppContentProps) {
  const { settings, updateSetting } = useSettings();
  const { t, i18n } = useTranslation();
  const [screen, setScreen] = useState<Screen>(() => {
    const saved = sessionStorage.getItem('ducktype_return_screen');
    if (saved) {
      sessionStorage.removeItem('ducktype_return_screen');
      return saved as Screen;
    }
    return 'test';
  });
  const [showSettings, setShowSettings] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [lastResult, setLastResult] = useState<TestResult | null>(null);
  const [activeLessonId, setActiveLessonId] = useState<LessonId | null>(null);
  const [lastWeakKeys, setLastWeakKeys] = useState<KeyStats[]>([]);
  const [isTypingActive, setIsTypingActive] = useState(false);
  const isMobile = useIsMobile();
  useTheme(settings.theme);
  useFontLoader(settings.fontFamily, settings.language);
  const { challengeWpm, adventureWorldId } = useUrlParams();
  const { history: testHistory, saveResult, getPersonalBest } = useStats();
  const { toasts, addToast, removeToast } = useToast();
  const gamification = useGamification();
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

  // Auto-show onboarding for first-time non-logged-in visitors (skip if already typing)
  useEffect(() => {
    if (user) return;
    if (localStorage.getItem('ducktype_onboarding_seen')) return;
    const timer = setTimeout(() => {
      if (!isTypingActive) setShowOnboarding(true);
    }, 2000);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  // Navigate to adventure if URL params indicate it
  useEffect(() => {
    if (adventureWorldId !== undefined) setScreen('adventure');
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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
  }, [settings, saveResult, gamification, addToast, dailyChallenge.dailyChallengeState, lessons.lessonProgress, user?.id, triggerSync]);

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
    triggerSync();
  }, [updateSetting, triggerSync]);

  const isCjk = ['ko', 'zh', 'ja'].includes(settings.language);

  const handleLoginClick = useCallback(() => {
    sessionStorage.setItem('ducktype_return_screen', screen);
    onLoginClick();
  }, [screen, onLoginClick]);

  const isCenteredPage = screen === 'results';

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh',
      maxWidth: '100vw',
      overflowX: 'hidden',
    }}>
      <Header
        onSettingsClick={() => {
          if (!user && !localStorage.getItem('ducktype_onboarding_seen')) {
            setShowOnboarding(true);
          } else {
            setShowSettings(true);
          }
        }}
        onNavigate={handleNavigate}
        profile={gamification.profile}
        streak={gamification.streak}
        hidden={isTypingActive}
        user={user}
        onLoginClick={handleLoginClick}
        onLogout={onLogout}
        isSupabaseConfigured={isSupabaseConfigured}
      />

      <main style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: isCenteredPage ? 'center' : 'flex-start',
        padding: '0 var(--page-padding)',
      }}>
        {screen === 'test' && (
          <>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: 'calc(100vh - 240px)',
              width: '100%',
            }}>
            <div style={{
              display: 'flex',
              gap: '8px',
              marginBottom: '16px',
              width: '100%',
              maxWidth: '520px',
            }}>
              <button
                onClick={() => handleNavigate('adventure')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '10px 14px',
                  border: '1.5px solid #4caf50',
                  borderRadius: 'var(--border-radius)',
                  background: 'var(--sub-alt-color)',
                  color: 'var(--text-color)',
                  fontSize: '14px',
                  cursor: 'pointer',
                  transition: 'filter 0.15s',
                  flex: 1,
                  minWidth: 0,
                  textAlign: 'left',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.filter = 'brightness(1.15)')}
                onMouseLeave={(e) => (e.currentTarget.style.filter = 'none')}
              >
                <span style={{ fontSize: '20px', flexShrink: 0 }}>⚔️</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: '13px' }}>Adventure</div>
                  <div style={{ fontSize: '11px', color: 'var(--sub-color)', marginTop: '1px' }}>Type to fight monsters!</div>
                </div>
                <span style={{
                  fontSize: '9px',
                  fontWeight: 700,
                  backgroundColor: '#4caf50',
                  color: '#fff',
                  padding: '2px 6px',
                  borderRadius: '999px',
                  letterSpacing: '0.5px',
                  flexShrink: 0,
                }}>
                  NEW
                </span>
              </button>
              <button
                onClick={() => handleNavigate('daily-challenge')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '10px 14px',
                  border: `1.5px solid ${dailyChallenge.hasCompletedToday ? 'var(--sub-alt-color)' : 'var(--main-color)'}`,
                  borderRadius: 'var(--border-radius)',
                  background: 'var(--sub-alt-color)',
                  color: 'var(--text-color)',
                  fontSize: '14px',
                  cursor: 'pointer',
                  transition: 'filter 0.15s',
                  opacity: dailyChallenge.hasCompletedToday ? 0.7 : 1,
                  flex: 1,
                  minWidth: 0,
                  textAlign: 'left',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.filter = 'brightness(1.15)')}
                onMouseLeave={(e) => (e.currentTarget.style.filter = 'none')}
              >
                <span style={{ fontSize: '20px', flexShrink: 0 }}>
                  {dailyChallenge.hasCompletedToday ? '✅' : '📅'}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: '13px' }}>
                    {dailyChallenge.hasCompletedToday ? 'Challenge Done' : 'Daily Challenge'}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--main-color)', marginTop: '1px' }}>
                    {dailyChallenge.hasCompletedToday
                      ? '1.5x XP boost active!'
                      : '1.5x XP boost!'}
                  </div>
                </div>
                {dailyChallenge.dailyChallengeState.currentStreak > 0 && (
                  <span style={{
                    fontSize: '11px',
                    fontWeight: 600,
                    color: 'var(--main-color)',
                    flexShrink: 0,
                  }}>
                    🔥 {dailyChallenge.dailyChallengeState.currentStreak}
                  </span>
                )}
              </button>
            </div>
            {challengeWpm && (
              isMobile ? (
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '16px 24px',
                  marginBottom: '16px',
                  backgroundColor: 'var(--sub-alt-color)',
                  border: '2px solid var(--main-color)',
                  borderRadius: 'var(--border-radius)',
                  width: '100%',
                  maxWidth: '340px',
                }}>
                  <span style={{ fontSize: '24px' }}>⚔️</span>
                  <span style={{
                    fontSize: '36px',
                    fontWeight: 700,
                    color: 'var(--main-color)',
                    fontVariantNumeric: 'tabular-nums',
                  }}>
                    {challengeWpm} <span style={{ fontSize: '16px', fontWeight: 400, color: 'var(--sub-color)' }}>WPM</span>
                  </span>
                  <span style={{
                    fontSize: '14px',
                    color: 'var(--text-color)',
                    textAlign: 'center',
                  }}>
                    {t('challenge.beatFriend', { wpm: challengeWpm })}
                  </span>
                </div>
              ) : (
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 18px',
                  marginBottom: '16px',
                  backgroundColor: 'var(--sub-alt-color)',
                  border: '1.5px solid var(--main-color)',
                  borderRadius: 'var(--border-radius)',
                  fontSize: '14px',
                  color: 'var(--text-color)',
                }}>
                  <span style={{ fontSize: '16px' }}>⚔️</span>
                  <span>
                    {t('challenge.beatFriend', { wpm: challengeWpm })}
                  </span>
                </div>
              )
            )}
            <TypingTest
              key={`${settings.language}-${settings.mode}-${settings.timeLimit}-${settings.wordCount}-${settings.punctuation}-${settings.numbers}`}
              settings={settings}
              onSettingChange={handleSettingChange}
              onFinish={handleTestFinish}
              onTypingStateChange={setIsTypingActive}
              leaderboardRank={leaderboard.userRank}
            />
            </div>
            <TypingInfo hidden={isTypingActive} onNavigate={handleNavigate} />
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
            weakKeys={lastWeakKeys}
            onNavigate={handleNavigate}
            challengeWpm={challengeWpm}
            isLoggedIn={!!user}
            isSupabaseConfigured={isSupabaseConfigured}
            onLoginClick={handleLoginClick}
            onShareClick={() => gamification.awardShareBonus(addToast)}
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
            onLogout={onLogout}
            currentUsername={currentUsername}
            onUpdateUsername={onUpdateUsername}
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
          />
        )}

        </Suspense>

        {screen === 'about' && <About onBack={() => handleNavigate('test')} />}
        {screen === 'contact' && <Contact onBack={() => handleNavigate('test')} />}
        {screen === 'privacy' && <PrivacyPolicy onBack={() => handleNavigate('test')} />}
        {screen === 'terms' && <TermsOfService onBack={() => handleNavigate('test')} />}
      </main>

      <Footer onNavigate={handleNavigate} hidden={isTypingActive} />

      <SettingsModal
        settings={settings}
        onSettingChange={handleSettingChange}
        onClose={() => setShowSettings(false)}
        visible={showSettings}
        playerLevel={gamification.profile.level}
        userId={user?.id}
      />

      <OnboardingModal
        visible={showOnboarding}
        onClose={() => {
          setShowOnboarding(false);
          localStorage.setItem('ducktype_onboarding_seen', '1');
          setShowSettings(true);
        }}
      />

      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </div>
  );
}

function App() {
  const { user, loading, signUp, signIn, signInWithGoogle, signOut, updateUsername, checkUsernameAvailable, isSupabaseConfigured } = useAuth();
  const { loadFromCloud, requestSync, cancelSync } = useCloudSync();
  const [syncKey, setSyncKey] = useState(0);
  const [showAuth, setShowAuth] = useState(false);
  const [showWhatsNew, setShowWhatsNew] = useState(false);
  const prevUserIdRef = useRef<string | null>(null);

  // When user changes (login/logout), load cloud data
  useEffect(() => {
    if (loading) return;
    const userId = user?.id ?? null;

    // Enable/disable progress data persistence based on login state
    setPersistProgress(!!userId);

    if (userId === prevUserIdRef.current) return;
    prevUserIdRef.current = userId;

    if (!userId) {
      cancelSync();
      return;
    }

    loadFromCloud(userId).then((shouldReload) => {
      if (shouldReload) {
        setSyncKey((k) => k + 1);
      }
    });
  }, [user, loading, loadFromCloud, cancelSync]);

  // Show "What's New" modal if user hasn't seen this version
  useEffect(() => {
    const seen = localStorage.getItem('ducktype_whats_new_seen');
    if (seen === __APP_VERSION__) return;
    const timer = setTimeout(() => setShowWhatsNew(true), 500);
    return () => clearTimeout(timer);
  }, []);

  const handleWhatsNewClose = useCallback(() => {
    setShowWhatsNew(false);
    localStorage.setItem('ducktype_whats_new_seen', __APP_VERSION__);
  }, []);

  const handleLogout = useCallback(async () => {
    cancelSync();
    await signOut();
    clearProgressData();
    setSyncKey((k) => k + 1);
  }, [signOut, cancelSync]);

  // Derive username from user metadata (set during signUp) or email prefix for Google users
  const currentUsername = user
    ? (user.user_metadata?.display_name as string) || user.email?.split('@')[0] || null
    : null;

  if (loading) return null;

  return (
    <>
      <AppContent
        key={syncKey}
        user={user}
        onLoginClick={() => setShowAuth(true)}
        onLogout={handleLogout}
        isSupabaseConfigured={isSupabaseConfigured}
        requestSync={requestSync}
        currentUsername={currentUsername}
        onUpdateUsername={updateUsername}
      />
      <AuthModal
        visible={showAuth}
        onClose={() => setShowAuth(false)}
        onSignUp={signUp}
        onSignIn={signIn}
        onGoogleSignIn={signInWithGoogle}
        onCheckUsername={checkUsernameAvailable}
      />
      <WhatsNewModal
        visible={showWhatsNew}
        onClose={handleWhatsNewClose}
      />
    </>
  );
}

export default App;
