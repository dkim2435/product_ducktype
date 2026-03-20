import { lazy, Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import type { TestResult, PersonalBest } from '../../types/stats';
import type { XpGain, KeyStats } from '../../types/gamification';
import type { NextAchievement } from '../../utils/achievementProgress';
import { useIsMobile } from '../../hooks/useIsMobile';
import { StatCard } from './StatCard';
const WpmChart = lazy(() => import('./WpmChart').then(m => ({ default: m.WpmChart })));
import { ShareButton } from './ShareButton';
import { XP_SHARE_BONUS } from '../../constants/gamification';
import { XpGainDisplay } from './XpGainDisplay';
import { AchievementUnlock } from './AchievementUnlock';
import { HelpBadge } from './HelpBadge';
import { CoachingCard } from './CoachingCard';
import { getWpmPercentile } from '../../utils/percentile';
import { generateCoachTips } from '../../utils/typingCoach';
import type { TestResult as TestResultType } from '../../types/stats';

interface ResultsScreenProps {
  result: TestResult;
  personalBest: PersonalBest | null;
  onRestart: () => void;
  isCjk: boolean;
  xpGain?: XpGain | null;
  newAchievements?: string[];
  weakKeys?: KeyStats[];
  onNavigate?: (page: string) => void;
  challengeWpm?: number | null;
  isLoggedIn?: boolean;
  isSupabaseConfigured?: boolean;
  onLoginClick?: () => void;
  onShareClick?: () => void;
  hasCompletedDailyToday?: boolean;
  dailyStreak?: number;
  testsCompleted?: number;
  totalXp?: number;
  playerLevel?: number;
  unlockedCount?: number;
  totalAchievements?: number;
  nextAchievement?: NextAchievement | null;
  recentHistory?: TestResultType[];
}

function TipItem({ text }: { text: string }) {
  return (
    <div className="flex gap-2 items-start text-xs text-sub leading-[1.5]">
      <span className="text-main shrink-0 mt-px">•</span>
      <span>{text}</span>
    </div>
  );
}

export function ResultsScreen({ result, personalBest, onRestart, isCjk, xpGain, newAchievements, weakKeys, onNavigate, challengeWpm, isLoggedIn, isSupabaseConfigured, onLoginClick, onShareClick, hasCompletedDailyToday, dailyStreak, testsCompleted, totalXp, playerLevel, unlockedCount = 0, totalAchievements = 0, nextAchievement, recentHistory }: ResultsScreenProps) {
  const { t } = useTranslation();
  const isMobile = useIsMobile();

  const isNewPb = personalBest && personalBest.wpm === result.wpm && personalBest.timestamp === result.timestamp;
  const topPercent = getWpmPercentile(result.wpm);

  const elapsed = result.wpmHistory.length > 0
    ? result.wpmHistory[result.wpmHistory.length - 1].time
    : 0;

  return (
    <div className="slide-up w-full max-w-[900px] mx-auto py-5">
      {/* Personal best indicator */}
      {isNewPb && (
        <div className="text-center text-main text-sm mb-2 font-medium">
          {t('stats.personalBest')}
        </div>
      )}

      {/* Challenge result */}
      {challengeWpm && (
        <div
          className="text-center mb-3 bg-sub-alt rounded-default"
          style={{
            padding: isMobile ? '16px' : '10px 20px',
            border: `1.5px solid ${result.wpm >= challengeWpm ? 'var(--main-color)' : 'var(--error-color)'}`,
          }}
        >
          {isMobile ? (
            <div className="flex items-center justify-center gap-4">
              <div className="text-center">
                <div className="text-xs text-sub mb-1">
                  {t('stats.wpm')}
                </div>
                <div className={`text-[32px] font-bold ${result.wpm >= challengeWpm ? 'text-main' : 'text-error'}`}>
                  {result.wpm}
                </div>
              </div>
              <span className="text-xl text-sub font-light">vs</span>
              <div className="text-center">
                <div className="text-xs text-sub mb-1">
                  {t('challenge.beatFriend', { wpm: '' }).split('{{wpm}}')[0].trim() || 'Friend'}
                </div>
                <div className="text-[32px] font-bold text-sub">
                  {challengeWpm}
                </div>
              </div>
            </div>
          ) : (
            <span className={`text-base font-bold ${result.wpm >= challengeWpm ? 'text-main' : 'text-error'}`}>
              {result.wpm >= challengeWpm
                ? t('challenge.won', { wpm: challengeWpm })
                : t('challenge.lost', { wpm: challengeWpm })}
            </span>
          )}
          <div className={`mt-2 text-sm font-semibold ${result.wpm >= challengeWpm ? 'text-main' : 'text-error'}`}>
            {result.wpm >= challengeWpm
              ? t('challenge.won', { wpm: challengeWpm })
              : t('challenge.lost', { wpm: challengeWpm })}
          </div>
        </div>
      )}

      {/* Percentile badge */}
      <div className="text-center mb-3">
        <span
          className={`inline-block px-[14px] py-1 rounded-full text-[13px] font-semibold ${topPercent <= 10 ? 'bg-main text-bg' : 'bg-sub-alt text-sub'}`}
        >
          {t('stats.topPercent', { percent: topPercent })}
        </span>
      </div>

      {/* Main stats row */}
      <div
        className="mb-6 items-start"
        style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : 'auto 1fr',
          gap: isMobile ? '16px' : '24px',
        }}
      >
        {/* Left: WPM + accuracy */}
        <div className="flex flex-col gap-4">
          <StatCard label={t('stats.wpm')} value={result.wpm} large tooltip={t('stats.wpmDesc')} />
          <StatCard label={t('stats.accuracy')} value={`${result.accuracy}%`} tooltip={t('stats.accuracyDesc')} />
        </div>

        {/* Right: Chart */}
        <div>
          <Suspense fallback={<div className="h-[200px]" />}>
            <WpmChart
              wpmHistory={result.wpmHistory}
              rawWpmHistory={result.rawWpmHistory}
              errorHistory={result.errorHistory}
            />
          </Suspense>
        </div>
      </div>

      {/* Secondary stats row */}
      <div
        className="gap-4 mb-6"
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(auto-fit, minmax(${isMobile ? '100px' : '120px'}, 1fr))`,
        }}
      >
        <StatCard label={t('stats.testType')} value={`${result.mode} ${result.modeValue}`} />
        <StatCard label={t('stats.rawWpm')} value={result.rawWpm} tooltip={t('stats.rawWpmDesc')} />
        <StatCard label={t('stats.consistency')} value={`${result.consistency}%`} tooltip={t('stats.consistencyDesc')} />
        <StatCard label={t('stats.time')} value={`${elapsed}s`} />
        {isCjk && (
          <StatCard
            label={t('stats.cpm')}
            value={Math.round(result.correctChars / (elapsed / 60) || 0)}
            tooltip={t('stats.cpmDesc')}
          />
        )}
      </div>

      {/* Character breakdown */}
      <div className="flex justify-center items-center gap-1 text-sm text-sub mb-6">
        <span className="text-text">{t('stats.characters')}: </span>
        <span className="text-main">{result.correctChars}</span>/
        <span className="text-error">{result.incorrectChars}</span>/
        <span className="text-error-extra">{result.extraChars}</span>/
        <span>{result.missedChars}</span>
        <HelpBadge tooltip={t('stats.charactersDesc')} />
      </div>

      {/* XP Gain Display */}
      {xpGain && (
        <div className="mb-4">
          <XpGainDisplay xpGain={xpGain} />
        </div>
      )}

      {/* Achievement Unlocks */}
      {newAchievements && newAchievements.length > 0 && (
        <div className="mb-4">
          <AchievementUnlock achievementIds={newAchievements} />
        </div>
      )}

      {/* Achievement Progress Card */}
      {totalAchievements > 0 && (
        <div
          className="mb-4 bg-sub-alt rounded-default"
          style={{ padding: isMobile ? '14px' : '14px 20px' }}
        >
          {/* Overall progress */}
          <div className="flex items-center justify-between mb-2">
            <span className="text-[13px] font-semibold text-text">
              🏆 {t('results.achievementProgress', { unlocked: unlockedCount, total: totalAchievements })}
            </span>
            <span className="text-[11px] text-sub">
              {Math.round((unlockedCount / totalAchievements) * 100)}%
            </span>
          </div>
          {/* Overall progress bar */}
          <div
            className="h-1 bg-bg rounded-sm overflow-hidden"
            style={{ marginBottom: nextAchievement ? '12px' : '0' }}
          >
            <div
              className="h-full bg-main rounded-sm transition-[width] duration-500 ease-out"
              style={{ width: `${(unlockedCount / totalAchievements) * 100}%` }}
            />
          </div>

          {/* Next goal */}
          {nextAchievement && (
            <>
              <div className="flex items-center justify-between mb-[6px]">
                <span className="text-xs text-sub">
                  {t('results.nextGoal')}: {nextAchievement.icon} {nextAchievement.name}
                  {nextAchievement.unit
                    ? ` (${nextAchievement.current}/${nextAchievement.target} ${nextAchievement.unit})`
                    : ` (${nextAchievement.current}/${nextAchievement.target})`}
                </span>
                <span className="text-[11px] text-main font-semibold">
                  {Math.round(nextAchievement.progress * 100)}%
                </span>
              </div>
              {/* Next goal progress bar */}
              <div className="h-[6px] bg-bg rounded-[3px] overflow-hidden">
                <div
                  className="h-full bg-main rounded-[3px] transition-[width] duration-500 ease-out"
                  style={{ width: `${nextAchievement.progress * 100}%` }}
                />
              </div>
            </>
          )}

          {/* View achievements link */}
          {onNavigate && (
            <div className="text-right mt-2">
              <button
                onClick={() => onNavigate('achievements')}
                className="text-[11px] text-main cursor-pointer p-0 font-semibold"
              >
                {t('results.viewAchievements')} →
              </button>
            </div>
          )}
        </div>
      )}

      {/* Weak Keys */}
      {weakKeys && weakKeys.length > 0 && (
        <div className="mb-6 p-[16px_20px] bg-sub-alt rounded-default">
          <div className="flex items-center gap-2 mb-3 text-[13px] text-sub">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 9v4M12 17h.01" />
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            </svg>
            {t('results.weakKeys')}
          </div>
          <div className="flex flex-wrap gap-2 mb-3">
            {weakKeys.map(k => (
              <span key={k.key} className="inline-flex items-center gap-1 px-[10px] py-1 rounded-[6px] bg-bg border border-error text-[13px]">
                <span className="font-bold text-error font-mono uppercase">
                  {k.key}
                </span>
                <span className="text-[11px] text-sub">
                  {k.errors}/{k.totalAttempts}
                </span>
              </span>
            ))}
          </div>
          {onNavigate && (
            <button
              onClick={() => onNavigate('practice')}
              className="text-xs text-main cursor-pointer p-0"
            >
              {t('results.practiceWeakKeys')} →
            </button>
          )}
        </div>
      )}

      {/* Actions + Adventure banner */}
      <div className="flex gap-[10px] items-stretch">
        {/* Adventure banner — fills remaining space */}
        {onNavigate && (
          <button
            onClick={() => onNavigate('adventure')}
            className="flex items-center gap-3 flex-1 min-w-0 p-[14px_16px] rounded-default bg-sub-alt text-text text-[13px] cursor-pointer text-left transition-[filter,border-color] duration-150 hover:brightness-110"
            style={{ border: '1.5px solid #4caf50' }}
          >
            <span className="text-2xl shrink-0">⚔️</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-[2px]">
                <span className="font-bold text-[13px]">Adventure Mode</span>
                <span className="text-[9px] font-bold bg-[#ff5722] text-white px-1.5 py-[2px] rounded-full tracking-[0.5px]">
                  HOT
                </span>
              </div>
              <div className="text-[11px] text-sub leading-[1.4]">
                {t('results.adventureBanner', { wpm: result.wpm })}
              </div>
            </div>
          </button>
        )}

        {/* Next test + Share — right-aligned column */}
        <div className="flex flex-col gap-[6px] shrink-0">
          <button
            onClick={onRestart}
            className="p-[8px_20px] text-[13px] text-text bg-transparent border border-sub rounded-default flex items-center justify-center gap-[6px] cursor-pointer flex-1"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2" />
            </svg>
            {t('test.nextTest')}
          </button>
          <div className="relative">
            <ShareButton result={result} onShareClick={onShareClick} fullWidth />
            {(!xpGain || xpGain.shareBonus === 0) && (
              <span className="absolute -right-7 top-1/2 -translate-y-1/2 text-[10px] text-main font-semibold opacity-80 leading-[1.2] text-center">
                +{XP_SHARE_BONUS}<br />XP
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Daily Challenge hook card */}
      {onNavigate && (
        <div
          className="mt-4 bg-sub-alt rounded-default border border-main cursor-pointer"
          style={{
            padding: isMobile ? '14px' : '12px 20px',
            display: 'flex',
            alignItems: isMobile ? 'flex-start' : 'center',
            flexDirection: isMobile ? 'column' : 'row',
            gap: isMobile ? '10px' : '16px',
          }}
          onClick={() => onNavigate('daily-challenge')}
        >
          <span className="text-xl shrink-0">📅</span>
          <div className="flex-1 min-w-0">
            <div className="text-[13px] font-semibold text-text mb-[2px]">
              {hasCompletedDailyToday
                ? t('results.dailyHookDone', { days: dailyStreak || 0 })
                : (dailyStreak && dailyStreak > 0)
                  ? t('results.dailyHookNotDone')
                  : t('results.dailyHookStart')}
            </div>
            {hasCompletedDailyToday && (dailyStreak || 0) > 0 && (
              <div className="text-[11px] text-main font-semibold">
                🔥 {dailyStreak} {t('gamification.days')} {t('gamification.streak')}
              </div>
            )}
          </div>
          <span className="text-xs text-main font-semibold shrink-0">
            {hasCompletedDailyToday ? '→' : `1.5x XP →`}
          </span>
        </div>
      )}

      {/* Leaderboard prompt */}
      {onNavigate && (
        <div
          className="mt-3 bg-sub-alt rounded-default cursor-pointer"
          style={{
            padding: isMobile ? '14px' : '12px 20px',
            display: 'flex',
            alignItems: isMobile ? 'flex-start' : 'center',
            flexDirection: isMobile ? 'column' : 'row',
            gap: isMobile ? '10px' : '16px',
          }}
          onClick={() => onNavigate('leaderboard')}
        >
          <span className="text-xl shrink-0">🏅</span>
          <div className="flex-1 min-w-0">
            <div className="text-[13px] font-semibold text-text mb-[2px]">
              {t('results.leaderboardHook', { wpm: result.wpm, percent: topPercent })}
            </div>
            <div className="text-[11px] text-sub">
              {t('results.leaderboardHookDesc')}
            </div>
          </div>
          <span className="text-xs text-main font-semibold shrink-0">
            {t('results.viewLeaderboard')} →
          </span>
        </div>
      )}

      {/* Cloud save prompt for non-logged-in users */}
      {isSupabaseConfigured && !isLoggedIn && (
        <div
          className="mt-6 bg-sub-alt rounded-default border border-main"
          style={{
            padding: isMobile ? '16px' : '14px 20px',
            display: 'flex',
            alignItems: isMobile ? 'flex-start' : 'center',
            flexDirection: isMobile ? 'column' : 'row',
            gap: isMobile ? '12px' : '16px',
            ...(testsCompleted === 1 ? { boxShadow: '0 0 12px rgba(255, 179, 71, 0.15)' } : {}),
          }}
        >
          <div className="flex-1">
            <div className="text-[13px] font-semibold text-text mb-1">
              {testsCompleted === 1 ? t('auth.firstTestTitle') : t('auth.savePromptTitle')}
            </div>
            <div className="text-xs text-sub leading-[1.5]">
              {testsCompleted === 1
                ? t('auth.firstTestDesc', { xp: totalXp || 0, level: playerLevel || 1 })
                : t('auth.savePromptDesc')}
            </div>
          </div>
          <button
            onClick={onLoginClick}
            className="p-[8px_20px] rounded-[6px] border-none bg-main text-bg text-[13px] font-semibold font-[inherit] cursor-pointer whitespace-nowrap shrink-0"
          >
            {t('auth.login')} / {t('auth.signup')}
          </button>
        </div>
      )}

      {/* AI Coaching tips */}
      <CoachingCard
        tips={generateCoachTips(result, weakKeys || [], recentHistory || [])}
        weakKeys={weakKeys || []}
      />

      {/* Typing improvement tips */}
      <div
        className="mt-8 bg-sub-alt rounded-default"
        style={{ padding: isMobile ? '20px 16px' : '24px 28px' }}
      >
        <h3 className="text-sm font-semibold text-main mb-3">
          {t('info.improveTitle')}
        </h3>
        <p className="text-[13px] text-sub leading-[1.6] mb-3">
          {t('info.improveDesc')}
        </p>
        <div
          className="gap-2"
          style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
          }}
        >
          <TipItem text={t('info.tip1')} />
          <TipItem text={t('info.tip2')} />
          <TipItem text={t('info.tip3')} />
          <TipItem text={t('info.tip4')} />
        </div>
      </div>
    </div>
  );
}
