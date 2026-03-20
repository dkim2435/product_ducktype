import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import type { Settings } from '../../types/settings';
import type { TestState } from '../../types/test';
import type { DailyChallengeState, DailyChallengeResult } from '../../types/gamification';
import { TypingTest } from '../test/TypingTest';

interface DailyChallengeProps {
  settings: Settings;
  dailyChallengeState: DailyChallengeState;
  hasCompletedToday: boolean;
  todayResult: DailyChallengeResult | undefined;
  getWords: (date?: string) => string[];
  onFinish: (testState: TestState) => void;
  onBack: () => void;
}

export function DailyChallenge({
  settings,
  dailyChallengeState,
  hasCompletedToday,
  todayResult,
  getWords,
  onFinish,
  onBack,
}: DailyChallengeProps) {
  const { t } = useTranslation();
  const [started, setStarted] = useState(false);

  const handleFinish = useCallback((testState: TestState) => {
    onFinish(testState);
  }, [onFinish]);

  // Override settings for daily challenge: time mode, 60s, english, punctuation
  const dailySettings: Settings = {
    ...settings,
    mode: 'time',
    timeLimit: 60,
    language: 'en',
    punctuation: true,
    numbers: false,
  };

  if (started && !hasCompletedToday) {
    return (
      <div className="w-full flex flex-col items-center justify-center min-h-[calc(100vh-240px)]">
        <TypingTest
          key="daily-challenge"
          settings={dailySettings}
          onSettingChange={() => {}}
          onFinish={handleFinish}
          customWords={getWords()}
          hideModeSwitcher
        />
      </div>
    );
  }

  // Recent 7 days of results
  const recentResults = dailyChallengeState.results.slice(-7).reverse();

  return (
    <div className="fade-in w-full max-w-[600px] mx-auto" style={{ padding: 'var(--page-vertical-padding) 0' }}>
      {/* Back button */}
      <button
        onClick={onBack}
        className="text-sub text-[13px] mb-6 flex items-center gap-[6px]"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        {t('daily.title')}
      </button>

      {/* Header */}
      <div className="text-center mb-8">
        <div className="text-[36px] mb-2">📋</div>
        <h2 className="text-xl font-bold text-text mb-2">
          {t('daily.title')}
        </h2>
        <p className="text-[13px] text-sub">
          {t('daily.description')}
        </p>
        {hasCompletedToday ? (
          <div className="inline-flex items-center gap-[6px] mt-[10px] px-3 py-1 text-xs font-semibold text-main rounded-full" style={{ backgroundColor: 'color-mix(in srgb, var(--main-color) 12%, transparent)' }}>
            <span>⚡</span>
            {t('daily.boostActive')}
          </div>
        ) : (
          <p className="text-xs text-main mt-[6px] font-medium">
            ⚡ {t('daily.boostDescription')}
          </p>
        )}
      </div>

      {/* Streak */}
      <div className="flex justify-center gap-6 mb-8">
        <div className="text-center">
          <div className="text-[28px] font-bold text-main">
            {dailyChallengeState.currentStreak}
          </div>
          <div className="text-[11px] text-sub">
            {t('daily.streak')}
          </div>
        </div>
      </div>

      {/* Today's status */}
      {hasCompletedToday && todayResult ? (
        <div className="text-center p-6 bg-sub-alt rounded-default mb-6 border-l-[3px] border-main">
          <div className="text-sm font-semibold text-main mb-3">
            {t('daily.completed')}
          </div>
          <div className="flex justify-center gap-6 mb-3">
            <div>
              <div className="text-xl font-bold text-text">
                {todayResult.wpm}
              </div>
              <div className="text-[11px] text-sub">WPM</div>
            </div>
            <div>
              <div className="text-xl font-bold text-text">
                {todayResult.accuracy}%
              </div>
              <div className="text-[11px] text-sub">ACC</div>
            </div>
          </div>
          <div className="text-xs text-sub mb-2">
            {t('daily.comeBack')}
          </div>
          <div className="inline-flex items-center gap-[6px] px-3 py-1 text-[11px] font-semibold text-main rounded-full" style={{ backgroundColor: 'color-mix(in srgb, var(--main-color) 12%, transparent)' }}>
            <span>⚡</span>
            {t('daily.boostActive')}
          </div>
        </div>
      ) : (
        <div className="text-center mb-6">
          <button
            onClick={() => setStarted(true)}
            className="px-8 py-3 text-[15px] font-semibold text-bg bg-main rounded-default cursor-pointer"
          >
            {t('daily.start')}
          </button>
        </div>
      )}

      {/* Recent results */}
      {recentResults.length > 0 && (
        <div>
          <div className="text-[13px] font-semibold text-sub mb-3">
            {t('daily.recentActivity')}
          </div>
          <div className="flex flex-col gap-[6px]">
            {recentResults.map(r => (
              <div
                key={r.date}
                className="flex justify-between items-center px-[14px] py-[10px] bg-sub-alt rounded-default text-[13px]"
              >
                <span className="text-sub">{r.date}</span>
                <div className="flex gap-4">
                  <span className="text-text font-semibold">
                    {r.wpm} WPM
                  </span>
                  <span className="text-sub">
                    {r.accuracy}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
