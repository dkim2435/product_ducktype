import { useState, useCallback, useEffect, useRef } from 'react';
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
import { Profile } from './components/pages/Profile';
import { Achievements } from './components/pages/Achievements';
import { DailyChallenge } from './components/pages/DailyChallenge';
import { Practice } from './components/pages/Practice';
import { LessonTest } from './components/practice/LessonTest';
import { Leaderboard } from './components/pages/Leaderboard';
import { Arcade } from './components/pages/Arcade';
import { DuckHuntGame } from './components/arcade/DuckHuntGame';
import { DuckRaceGame } from './components/arcade/DuckRaceGame';
import { WhatsNewModal } from './components/layout/WhatsNewModal';
import { OnboardingModal } from './components/layout/OnboardingModal';
import { TypingInfo } from './components/content/TypingInfo';
import { useLeaderboard } from './hooks/useLeaderboard';
import { setPersistProgress, clearProgressData, getItem, setItem } from './utils/storage';
import type { DuckHuntHighScore, DuckHuntResult } from './types/arcade';
import type { DuckRaceHighScore, DuckRaceResult } from './types/duckRace';

type Screen = 'test' | 'results' | 'about' | 'contact' | 'privacy' | 'terms'
  | 'achievements' | 'profile' | 'daily-challenge' | 'practice' | 'lesson' | 'leaderboard'
  | 'arcade' | 'duck-hunt' | 'duck-race';

interface AppContentProps {
  user: User | null;
  onLoginClick: () => void;
  onLogout: () => void;
  isSupabaseConfigured: boolean;
  requestSync: (userId: string) => void;
  currentUsername: string | null;
}

function AppContent({ user, onLoginClick, onLogout, isSupabaseConfigured, requestSync, currentUsername }: AppContentProps) {
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
  const [challengeWpm, setChallengeWpm] = useState<number | null>(null);
  const [isTypingActive, setIsTypingActive] = useState(false);
  const [duckHuntHighScore, setDuckHuntHighScore] = useState<DuckHuntHighScore | null>(
    () => getItem<DuckHuntHighScore | null>('duck_hunt_high_score', null)
  );
  const [duckRaceHighScore, setDuckRaceHighScore] = useState<DuckRaceHighScore | null>(
    () => getItem<DuckRaceHighScore | null>('duck_race_high_score', null)
  );

  const isMobile = useIsMobile();
  useTheme(settings.theme);
  const { saveResult, getPersonalBest } = useStats();
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

  // Parse challenge URL hash on mount (e.g. #c=85-97)
  useEffect(() => {
    const hash = window.location.hash;
    const match = hash.match(/^#c=(\d+)-(\d+)$/);
    if (match) {
      setChallengeWpm(parseInt(match[1], 10));
      // Clear hash without triggering navigation
      history.replaceState(null, '', window.location.pathname + window.location.search);
    }
  }, []);

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

  const triggerSync = useCallback(() => {
    if (user?.id) requestSync(user.id);
  }, [user, requestSync]);

  const handleTestFinish = useCallback((testState: TestState) => {
    const result = saveResult(testState, settings);
    lastTestStateRef.current = testState;
    setLastResult(result);
    setScreen('results');

    // Extract weak keys from this test (any key with errors, min 1 attempt)
    const testKeyStats = extractKeyStats(testState);
    const weak = Object.values(testKeyStats)
      .filter(s => s.errors > 0)
      .sort((a, b) => b.errorRate - a.errorRate || b.errors - a.errors)
      .slice(0, 8);
    setLastWeakKeys(weak);

    // Process gamification
    gamification.processTestResult(
      result,
      testState,
      false,
      addToast,
      dailyChallenge.dailyChallengeState,
      lessons.lessonProgress,
    );

    triggerSync();

    // Auto-submit to leaderboard for logged-in users (time mode only)
    if (user?.id && currentUsername && settings.mode === 'time') {
      leaderboard.submitScore(user.id, currentUsername, result.wpm, result.accuracy, 'time', settings.timeLimit);
    }
  }, [settings, saveResult, gamification, addToast, dailyChallenge.dailyChallengeState, lessons.lessonProgress, triggerSync, user, currentUsername, leaderboard]);

  const handleDailyChallengeFinish = useCallback((testState: TestState) => {
    const result = saveResult(testState, settings);
    lastTestStateRef.current = testState;
    setLastResult(result);
    setScreen('results');

    const testKeyStats = extractKeyStats(testState);
    const weak = Object.values(testKeyStats)
      .filter(s => s.errors > 0)
      .sort((a, b) => b.errorRate - a.errorRate || b.errors - a.errors)
      .slice(0, 8);
    setLastWeakKeys(weak);

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

    triggerSync();
  }, [settings, saveResult, gamification, addToast, dailyChallenge, lessons.lessonProgress, triggerSync]);

  const handleLessonFinish = useCallback((testState: TestState, lessonId: LessonId) => {
    const result = saveResult(testState, settings);
    lastTestStateRef.current = testState;
    setLastResult(result);

    const testKeyStats = extractKeyStats(testState);
    const weak = Object.values(testKeyStats)
      .filter(s => s.errors > 0)
      .sort((a, b) => b.errorRate - a.errorRate || b.errors - a.errors)
      .slice(0, 8);
    setLastWeakKeys(weak);

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
    triggerSync();
  }, [settings, saveResult, gamification, addToast, dailyChallenge.dailyChallengeState, lessons, triggerSync]);

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

  const handleDuckHuntGameOver = useCallback((result: DuckHuntResult) => {
    // Save high score
    const isNew = !duckHuntHighScore || result.score > duckHuntHighScore.score;
    if (isNew) {
      const newHS: DuckHuntHighScore = {
        score: result.score,
        ducksShot: result.ducksShot,
        maxCombo: result.maxCombo,
        timestamp: Date.now(),
      };
      setDuckHuntHighScore(newHS);
      setItem('duck_hunt_high_score', newHS);
    }

    // XP reward: score / 25 (balanced for arcade)
    const xpAmount = Math.max(1, Math.floor(result.score / 25));
    if (gamification.profile) {
      gamification.addXp(xpAmount);
    }
    addToast({
      type: 'xp',
      title: t('duckHunt.gameOver'),
      message: `+${xpAmount} XP`,
      icon: '🦆',
    });
    triggerSync();
  }, [duckHuntHighScore, gamification, addToast, t, triggerSync]);

  const handleDuckRaceGameOver = useCallback((result: DuckRaceResult) => {
    // Update high score
    const prev = duckRaceHighScore;
    const isNewBestWpm = !prev || result.playerWpm > prev.bestWpm;
    const isNewBestPlace = !prev || result.placement < prev.bestPlacement;
    const newHS: DuckRaceHighScore = {
      bestPlacement: isNewBestPlace ? result.placement : (prev?.bestPlacement ?? result.placement),
      bestWpm: isNewBestWpm ? result.playerWpm : (prev?.bestWpm ?? result.playerWpm),
      racesCompleted: (prev?.racesCompleted ?? 0) + 1,
      winsCount: (prev?.winsCount ?? 0) + (result.placement === 1 ? 1 : 0),
      timestamp: Date.now(),
    };
    setDuckRaceHighScore(newHS);
    setItem('duck_race_high_score', newHS);

    // XP: base (WPM * 0.5) + placement bonus (1st: +100, 2nd: +50, 3rd: +25)
    const baseXp = Math.max(1, Math.floor(result.playerWpm * 0.5));
    const placeBonus = result.placement === 1 ? 100 : result.placement === 2 ? 50 : result.placement === 3 ? 25 : 0;
    const xpAmount = baseXp + placeBonus;
    if (gamification.profile) {
      gamification.addXp(xpAmount);
    }
    addToast({
      type: 'xp',
      title: t('duckRace.raceOver'),
      message: `+${xpAmount} XP`,
      icon: '\uD83C\uDFC1',
    });
    triggerSync();
  }, [duckRaceHighScore, gamification, addToast, t, triggerSync]);

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
            <TypingInfo hidden={isTypingActive} />
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

        {screen === 'profile' && (
          <Profile
            profile={gamification.profile}
            streak={gamification.streak}
            keyStats={gamification.keyStats}
            onBack={() => handleNavigate('test')}
            user={user}
            isSupabaseConfigured={isSupabaseConfigured}
            onLoginClick={handleLoginClick}
            onLogout={onLogout}
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

        {screen === 'arcade' && (
          <Arcade
            onBack={() => handleNavigate('test')}
            onPlayDuckHunt={() => handleNavigate('duck-hunt')}
            onPlayDuckRace={() => handleNavigate('duck-race')}
            duckHuntHighScore={duckHuntHighScore}
            duckRaceHighScore={duckRaceHighScore}
            isLoggedIn={!!user}
            onLoginClick={handleLoginClick}
          />
        )}

        {screen === 'duck-hunt' && (
          <DuckHuntGame
            settings={settings}
            onBack={() => handleNavigate('arcade')}
            onGameOver={handleDuckHuntGameOver}
            highScore={duckHuntHighScore}
            isLoggedIn={!!user}
            isSupabaseConfigured={isSupabaseConfigured}
            onLoginClick={handleLoginClick}
          />
        )}

        {screen === 'duck-race' && (
          <DuckRaceGame
            settings={settings}
            onBack={() => handleNavigate('arcade')}
            onGameOver={handleDuckRaceGameOver}
            highScore={duckRaceHighScore}
            isLoggedIn={!!user}
            isSupabaseConfigured={isSupabaseConfigured}
            onLoginClick={handleLoginClick}
          />
        )}

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
  const { user, loading, signUp, signIn, signInWithGoogle, signOut, isSupabaseConfigured } = useAuth();
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
      />
      <AuthModal
        visible={showAuth}
        onClose={() => setShowAuth(false)}
        onSignUp={signUp}
        onSignIn={signIn}
        onGoogleSignIn={signInWithGoogle}
      />
      <WhatsNewModal
        visible={showWhatsNew}
        onClose={handleWhatsNewClose}
      />
    </>
  );
}

export default App;
