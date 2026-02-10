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
      <div style={{
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
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
    <div className="fade-in" style={{
      width: '100%',
      maxWidth: '600px',
      margin: '0 auto',
      padding: '40px 0',
    }}>
      {/* Back button */}
      <button
        onClick={onBack}
        style={{
          color: 'var(--sub-color)',
          fontSize: '13px',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        {t('daily.title')}
      </button>

      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <div style={{ fontSize: '36px', marginBottom: '8px' }}>📋</div>
        <h2 style={{
          fontSize: '20px',
          fontWeight: 700,
          color: 'var(--text-color)',
          marginBottom: '8px',
        }}>
          {t('daily.title')}
        </h2>
        <p style={{
          fontSize: '13px',
          color: 'var(--sub-color)',
        }}>
          {t('daily.description')}
        </p>
      </div>

      {/* Streak */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '24px',
        marginBottom: '32px',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '28px', fontWeight: 700, color: 'var(--main-color)' }}>
            {dailyChallengeState.currentStreak}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--sub-color)' }}>
            {t('daily.streak')}
          </div>
        </div>
      </div>

      {/* Today's status */}
      {hasCompletedToday && todayResult ? (
        <div style={{
          textAlign: 'center',
          padding: '24px',
          backgroundColor: 'var(--sub-alt-color)',
          borderRadius: 'var(--border-radius)',
          marginBottom: '24px',
          borderLeft: '3px solid var(--main-color)',
        }}>
          <div style={{
            fontSize: '14px',
            fontWeight: 600,
            color: 'var(--main-color)',
            marginBottom: '12px',
          }}>
            {t('daily.completed')}
          </div>
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '24px',
            marginBottom: '12px',
          }}>
            <div>
              <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-color)' }}>
                {todayResult.wpm}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--sub-color)' }}>WPM</div>
            </div>
            <div>
              <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-color)' }}>
                {todayResult.accuracy}%
              </div>
              <div style={{ fontSize: '11px', color: 'var(--sub-color)' }}>ACC</div>
            </div>
          </div>
          <div style={{ fontSize: '12px', color: 'var(--sub-color)' }}>
            {t('daily.comeBack')}
          </div>
        </div>
      ) : (
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <button
            onClick={() => setStarted(true)}
            style={{
              padding: '12px 32px',
              fontSize: '15px',
              fontWeight: 600,
              color: 'var(--bg-color)',
              backgroundColor: 'var(--main-color)',
              borderRadius: 'var(--border-radius)',
              cursor: 'pointer',
            }}
          >
            {t('daily.start')}
          </button>
        </div>
      )}

      {/* Recent results */}
      {recentResults.length > 0 && (
        <div>
          <div style={{
            fontSize: '13px',
            fontWeight: 600,
            color: 'var(--sub-color)',
            marginBottom: '12px',
          }}>
            {t('daily.recentActivity')}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {recentResults.map(r => (
              <div
                key={r.date}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '10px 14px',
                  backgroundColor: 'var(--sub-alt-color)',
                  borderRadius: 'var(--border-radius)',
                  fontSize: '13px',
                }}
              >
                <span style={{ color: 'var(--sub-color)' }}>{r.date}</span>
                <div style={{ display: 'flex', gap: '16px' }}>
                  <span style={{ color: 'var(--text-color)', fontWeight: 600 }}>
                    {r.wpm} WPM
                  </span>
                  <span style={{ color: 'var(--sub-color)' }}>
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
