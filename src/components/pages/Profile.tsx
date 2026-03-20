import React, { useState, useCallback, Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import type { User } from '@supabase/supabase-js';
import type { PlayerProfile, StreakState, KeyStatsMap } from '../../types/gamification';
import type { TestResult } from '../../types/stats';
import type { ProfileFrame } from '../../types/settings';
import { xpToNextLevel, getRank, RANKS, CREATOR_RANK } from '../../constants/gamification';
import { PROFILE_FRAMES } from '../../constants/profileFrames';
import { isAdminUser } from '../../utils/admin';
import { KeyboardHeatmap } from '../profile/KeyboardHeatmap';
import { StreakCalendar } from '../profile/StreakCalendar';

const WpmTrendChart = React.lazy(() =>
  import('../profile/WpmTrendChart').then(m => ({ default: m.WpmTrendChart }))
);

interface ProfileProps {
  profile: PlayerProfile;
  streak: StreakState;
  keyStats: KeyStatsMap;
  history?: TestResult[];
  onBack: () => void;
  user?: User | null;
  isSupabaseConfigured?: boolean;
  onLoginClick?: () => void;
  onLogout?: () => void;
  currentUsername?: string | null;
  onUpdateUsername?: (newUsername: string) => Promise<void>;
  profileFrame?: ProfileFrame;
}

function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  if (hours > 0) return `${hours}h ${mins}m`;
  return `${mins}m`;
}

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString();
}

export function Profile({ profile, streak, keyStats, history, onBack, user, isSupabaseConfigured, onLoginClick, onLogout, currentUsername, onUpdateUsername, profileFrame = 'none' }: ProfileProps) {
  const { t } = useTranslation();
  const isAdmin = isAdminUser(user?.id);
  const rank = getRank(profile.level, isAdmin);
  const { current, needed, progress } = xpToNextLevel(profile.totalXp);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editName, setEditName] = useState('');
  const [nameError, setNameError] = useState('');
  const [nameSaving, setNameSaving] = useState(false);

  const handleStartEdit = useCallback(() => {
    setEditName(currentUsername || '');
    setNameError('');
    setIsEditingName(true);
  }, [currentUsername]);

  const handleSaveName = useCallback(async () => {
    const trimmed = editName.trim();
    if (trimmed.length < 3 || trimmed.length > 16) {
      setNameError(t('auth.errorUsernameLength'));
      return;
    }
    if (!/^[a-zA-Z0-9_]+$/.test(trimmed)) {
      setNameError(t('auth.errorUsernameChars'));
      return;
    }
    if (trimmed === currentUsername) {
      setIsEditingName(false);
      return;
    }
    setNameSaving(true);
    try {
      await onUpdateUsername?.(trimmed);
      setIsEditingName(false);
    } catch (err) {
      const msg = err instanceof Error && err.message === 'USERNAME_TAKEN'
        ? t('auth.errorUsernameTaken')
        : t('auth.errorGeneric');
      setNameError(msg);
    } finally {
      setNameSaving(false);
    }
  }, [editName, currentUsername, onUpdateUsername, t]);

  return (
    <div className="fade-in w-full max-w-[700px] mx-auto" style={{ padding: 'var(--page-vertical-padding) 0' }}>
      {/* Back button */}
      <button
        onClick={onBack}
        className="text-sub text-[13px] mb-6 flex items-center gap-[6px]"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        {t('profile.title')}
      </button>

      {/* Account section */}
      {isSupabaseConfigured && (
        <div className="mb-6 px-5 py-4 bg-sub-alt rounded-default flex items-center justify-between gap-3">
          {user ? (
            <>
              <div className="min-w-0 flex-1">
                <div className="text-xs text-sub mb-[2px]">
                  {t('auth.syncedToCloud')}
                </div>
                <div className="text-[13px] text-text overflow-hidden text-ellipsis whitespace-nowrap mb-[6px]">
                  {user.email}
                </div>

                {/* Username display / edit */}
                {isEditingName ? (
                  <div className="flex flex-col gap-1">
                    <div className="flex gap-[6px] items-center">
                      <input
                        type="text"
                        value={editName}
                        onChange={e => { setEditName(e.target.value); setNameError(''); }}
                        onKeyDown={e => { if (e.key === 'Enter') handleSaveName(); if (e.key === 'Escape') setIsEditingName(false); }}
                        autoFocus
                        maxLength={16}
                        className="px-2 py-1 text-[13px] font-semibold font-[inherit] text-text bg-bg rounded-[4px] outline-none w-[140px]"
                        style={{
                          border: `1.5px solid ${nameError ? 'var(--error-color)' : 'var(--main-color)'}`,
                        }}
                      />
                      <button
                        onClick={handleSaveName}
                        disabled={nameSaving}
                        className={`px-[10px] py-1 text-[11px] font-semibold font-[inherit] text-bg bg-main rounded-[4px] ${nameSaving ? 'cursor-default opacity-60' : 'cursor-pointer opacity-100'}`}
                      >
                        {nameSaving ? '...' : t('profile.save')}
                      </button>
                      <button
                        onClick={() => setIsEditingName(false)}
                        className="px-2 py-1 text-[11px] font-[inherit] text-sub bg-none cursor-pointer"
                      >
                        {t('profile.cancel')}
                      </button>
                    </div>
                    {nameError && (
                      <div className="text-[11px] text-error">
                        {nameError}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center gap-[6px]">
                    <span className="text-sm font-semibold text-main">
                      {currentUsername || user.email?.split('@')[0]}
                    </span>
                    {onUpdateUsername && (
                      <button
                        onClick={handleStartEdit}
                        title={t('profile.editUsername')}
                        className="p-[2px] bg-none text-sub cursor-pointer flex items-center opacity-60 transition-opacity duration-150 hover:opacity-100"
                      >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                      </button>
                    )}
                  </div>
                )}
              </div>
              <button
                onClick={onLogout}
                className="px-[14px] py-[6px] rounded-[6px] border border-sub-alt bg-none text-sub text-xs font-[inherit] cursor-pointer shrink-0 self-start"
              >
                {t('auth.logout')}
              </button>
            </>
          ) : (
            <>
              <div>
                <div className="text-[13px] font-semibold text-text mb-[2px]">
                  {t('auth.savePromptTitle')}
                </div>
                <div className="text-xs text-sub">
                  {t('auth.savePromptDesc')}
                </div>
              </div>
              <button
                onClick={onLoginClick}
                className="px-[18px] py-2 rounded-[6px] border-none bg-main text-bg text-[13px] font-semibold font-[inherit] cursor-pointer shrink-0 whitespace-nowrap"
              >
                {t('auth.login')}
              </button>
            </>
          )}
        </div>
      )}

      {/* Level + Rank header */}
      <div className="flex items-center gap-4 mb-6">
        {(() => {
          const frameConfig = PROFILE_FRAMES.find(f => f.id === profileFrame);
          const hasFrame = frameConfig && frameConfig.id !== 'none';
          return (
            <div
              className="text-[48px] w-[72px] h-[72px] flex items-center justify-center rounded-full shrink-0"
              style={{
                border: hasFrame ? frameConfig.border : 'none',
                boxShadow: hasFrame && frameConfig.glow ? frameConfig.glow : 'none',
                animation: hasFrame && frameConfig.animation ? frameConfig.animation : 'none',
              }}
            >
              {rank.emoji}
            </div>
          );
        })()}
        <div>
          <div className="text-2xl font-bold text-main">
            {t('gamification.level')} {isAdmin ? 'MAX' : profile.level}
          </div>
          <div className="text-sm text-sub">
            {rank.name}
          </div>
        </div>
      </div>

      {/* XP Progress bar */}
      <div className="mb-8">
        <div className="flex justify-between text-xs text-sub mb-1">
          <span>{isAdmin ? 'MAX' : `${current} / ${needed} XP`}</span>
          <span>{t('gamification.totalXp')}: {profile.totalXp}</span>
        </div>
        <div className="w-full h-2 bg-sub-alt rounded-[4px] overflow-hidden">
          <div
            className="h-full bg-main rounded-[4px] transition-[width] duration-500 ease-out"
            style={{ width: isAdmin ? '100%' : `${Math.round(progress * 100)}%` }}
          />
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-[repeat(auto-fit,minmax(140px,1fr))] gap-3 mb-8">
        <StatItem label={t('gamification.testsCompleted')} value={profile.testsCompleted.toString()} />
        <StatItem label={t('gamification.totalTime')} value={formatTime(profile.totalTimeTyping)} />
        <StatItem
          label={t('gamification.currentStreak')}
          value={streak.currentStreak > 0 ? `${streak.currentStreak} ${t('gamification.days')}` : t('gamification.noStreak')}
        />
        <StatItem
          label={t('gamification.longestStreak')}
          value={`${streak.longestStreak} ${t('gamification.days')}`}
        />
        <StatItem label={t('gamification.joined')} value={formatDate(profile.joinedAt)} />
      </div>

      {/* Keyboard Heatmap */}
      <div className="bg-sub-alt rounded-default p-6 mb-6">
        <div className="text-sm font-semibold text-text mb-1">
          {t('profile.keyboardHeatmap')}
        </div>
        <div className="text-[11px] text-sub mb-4">
          {t('profile.heatmapDesc')}
        </div>
        <KeyboardHeatmap keyStats={keyStats} />
      </div>

      {/* Streak Calendar */}
      <div className="bg-sub-alt rounded-default p-6 mb-6">
        <StreakCalendar streak={streak} />
      </div>

      {/* WPM Trend Chart */}
      {history && history.length > 0 && (
        <div className="bg-sub-alt rounded-default p-6 mb-6">
          <div className="text-sm font-semibold text-text mb-1">
            {t('profile.wpmTrend')}
          </div>
          <div className="text-[11px] text-sub mb-4">
            {t('profile.wpmTrendDesc')}
          </div>
          <Suspense fallback={
            <div className="h-[220px] flex items-center justify-center text-sub text-[13px]">
              Loading...
            </div>
          }>
            <WpmTrendChart history={history} />
          </Suspense>
        </div>
      )}

      {/* Rank Roadmap */}
      <div className="bg-sub-alt rounded-default p-6">
        <div className="text-sm font-semibold text-text mb-1">
          {t('profile.rankRoadmap')}
        </div>
        <div className="text-[11px] text-sub mb-5">
          {t('profile.rankUnlocksAt')}
        </div>

        <div className="relative pl-8">
          {/* Vertical line */}
          <div className="absolute left-[11px] top-1 bottom-1 w-[2px] bg-sub-alt border-l-2 border-sub opacity-30" />

          {(isAdmin ? [...RANKS, CREATOR_RANK] : RANKS).map((r) => {
            const isCurrent = rank.name === r.name;
            const isPast = profile.level >= r.minLevel && !isCurrent;
            const isFuture = profile.level < r.minLevel;

            return (
              <div
                key={r.name}
                className={`flex items-center gap-3 py-2 relative ${isFuture ? 'opacity-50' : 'opacity-100'}`}
              >
                {/* Timeline dot */}
                <div
                  className="absolute -left-[25px] w-3 h-3 rounded-full flex items-center justify-center"
                  style={{
                    backgroundColor: isCurrent || isPast ? 'var(--main-color)' : 'var(--sub-alt-color)',
                    border: isCurrent ? '2px solid var(--main-color)' : '2px solid var(--sub-color)',
                  }}
                />

                {/* Emoji */}
                <span className="text-xl min-w-7 text-center">
                  {r.emoji}
                </span>

                {/* Name + level */}
                <div className="flex-1">
                  <span className={`text-[13px] ${isCurrent ? 'font-bold text-main' : 'font-normal text-text'}`}>
                    {r.name}
                  </span>
                  <span className="text-[11px] text-sub ml-2">
                    Lv.{r.minLevel}
                  </span>
                </div>

                {/* Status */}
                {isCurrent && (
                  <span className="text-[10px] px-2 py-[2px] rounded-full bg-main text-bg font-semibold">
                    {t('profile.currentRank')}
                  </span>
                )}
                {isPast && (
                  <span className="text-sm text-main">✓</span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function StatItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-3 bg-sub-alt rounded-default">
      <div className="text-[11px] text-sub mb-1">
        {label}
      </div>
      <div className="text-base font-semibold text-text">
        {value}
      </div>
    </div>
  );
}
