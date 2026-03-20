import { useTranslation } from 'react-i18next';
import { TypingTest } from '../test/TypingTest';
import { TypingInfo } from '../content/TypingInfo';
import type { Settings } from '../../types/settings';
import type { TestState } from '../../types/test';

interface HomeScreenProps {
  settings: Settings;
  onSettingChange: <K extends keyof Settings>(key: K, value: Settings[K]) => void;
  onFinish: (testState: TestState) => void;
  onTypingStateChange: (active: boolean) => void;
  onNavigate: (page: string) => void;
  isTypingActive: boolean;
  isMobile: boolean;
  challengeWpm: number | null;
  hasCompletedToday: boolean;
  dailyChallengeStreak: number;
  leaderboardRank: number | null;
  themeMainColor: string;
}

export function HomeScreen({
  settings,
  onSettingChange,
  onFinish,
  onTypingStateChange,
  onNavigate,
  isTypingActive,
  isMobile,
  challengeWpm,
  hasCompletedToday,
  dailyChallengeStreak,
  leaderboardRank,
  themeMainColor,
}: HomeScreenProps) {
  const { t } = useTranslation();

  return (
    <>
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-240px)] w-full">
        <div className="flex gap-2 mb-4 w-full max-w-[520px]">
          <button
            onClick={() => onNavigate('adventure')}
            className="flex items-center gap-[10px] px-[14px] py-[10px] border-[1.5px] border-[#4caf50] rounded-default bg-sub-alt text-text text-sm cursor-pointer transition-[filter] duration-150 flex-1 min-w-0 text-left hover:brightness-[1.15]"
            style={{
              animation: 'adventure-glow 3s ease-in-out infinite',
            }}
          >
            <span className="text-xl shrink-0">⚔️</span>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-[13px]">Adventure</div>
              <div className="text-[11px] text-sub mt-[1px]">Battle monsters with your keyboard!</div>
            </div>
            <span className="text-[9px] font-bold bg-[#ff5722] text-white px-[6px] py-[2px] rounded-full tracking-[0.5px] shrink-0">
              HOT
            </span>
          </button>
          <button
            onClick={() => onNavigate('daily-challenge')}
            className={`flex items-center gap-[10px] px-[14px] py-[10px] border-[1.5px] rounded-default bg-sub-alt text-text text-sm cursor-pointer transition-[filter] duration-150 flex-1 min-w-0 text-left hover:brightness-[1.15] ${hasCompletedToday ? 'opacity-70 border-sub-alt' : 'opacity-100 border-main'}`}
          >
            <span className="text-xl shrink-0">
              {hasCompletedToday ? '✅' : '📅'}
            </span>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-[13px]">
                {hasCompletedToday ? 'Challenge Done' : 'Daily Challenge'}
              </div>
              <div className="text-[11px] text-main mt-[1px]">
                {hasCompletedToday
                  ? '1.5x XP boost active!'
                  : '1.5x XP boost!'}
              </div>
            </div>
            {dailyChallengeStreak > 0 && (
              <span className="text-[11px] font-semibold text-main shrink-0">
                🔥 {dailyChallengeStreak}
              </span>
            )}
          </button>
        </div>
        {challengeWpm && (
          isMobile ? (
            <div className="flex flex-col items-center gap-2 px-6 py-4 mb-4 bg-sub-alt border-2 border-main rounded-default w-full max-w-[340px]">
              <span className="text-2xl">⚔️</span>
              <span className="text-[36px] font-bold text-main tabular-nums">
                {challengeWpm} <span className="text-base font-normal text-sub">WPM</span>
              </span>
              <span className="text-sm text-text text-center">
                {t('challenge.beatFriend', { wpm: challengeWpm })}
              </span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 px-[18px] py-2 mb-4 bg-sub-alt border-[1.5px] border-main rounded-default text-sm text-text">
              <span className="text-base">⚔️</span>
              <span>
                {t('challenge.beatFriend', { wpm: challengeWpm })}
              </span>
            </div>
          )
        )}
        <TypingTest
          key={`${settings.language}-${settings.mode}-${settings.timeLimit}-${settings.wordCount}-${settings.punctuation}-${settings.numbers}`}
          settings={settings}
          onSettingChange={onSettingChange}
          onFinish={onFinish}
          onTypingStateChange={onTypingStateChange}
          leaderboardRank={leaderboardRank}
          themeMainColor={themeMainColor}
        />
      </div>
      <TypingInfo hidden={isTypingActive} onNavigate={onNavigate} />
    </>
  );
}
