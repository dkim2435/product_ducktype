import { useTranslation } from 'react-i18next';
import type { TestResult, PersonalBest } from '../../types/stats';
import type { XpGain } from '../../types/gamification';
import { StatCard } from './StatCard';
import { WpmChart } from './WpmChart';
import { ShareButton } from './ShareButton';
import { XpGainDisplay } from './XpGainDisplay';
import { AchievementUnlock } from './AchievementUnlock';

interface ResultsScreenProps {
  result: TestResult;
  personalBest: PersonalBest | null;
  onRestart: () => void;
  isCjk: boolean;
  xpGain?: XpGain | null;
  newAchievements?: string[];
}

export function ResultsScreen({ result, personalBest, onRestart, isCjk, xpGain, newAchievements }: ResultsScreenProps) {
  const { t } = useTranslation();

  const isNewPb = personalBest && personalBest.wpm === result.wpm && personalBest.timestamp === result.timestamp;

  const elapsed = result.wpmHistory.length > 0
    ? result.wpmHistory[result.wpmHistory.length - 1].time
    : 0;

  return (
    <div className="slide-up" style={{
      width: '100%',
      maxWidth: '900px',
      margin: '0 auto',
      padding: '20px 0',
    }}>
      {/* Personal best indicator */}
      {isNewPb && (
        <div style={{
          textAlign: 'center',
          color: 'var(--main-color)',
          fontSize: '14px',
          marginBottom: '8px',
          fontWeight: 500,
        }}>
          {t('stats.personalBest')}
        </div>
      )}

      {/* Main stats row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'auto 1fr',
        gap: '24px',
        marginBottom: '24px',
        alignItems: 'start',
      }}>
        {/* Left: WPM + accuracy */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <StatCard label={t('stats.wpm')} value={result.wpm} large />
          <StatCard label={t('stats.accuracy')} value={`${result.accuracy}%`} />
        </div>

        {/* Right: Chart */}
        <div>
          <WpmChart
            wpmHistory={result.wpmHistory}
            rawWpmHistory={result.rawWpmHistory}
            errorHistory={result.errorHistory}
          />
        </div>
      </div>

      {/* Secondary stats row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
        gap: '16px',
        marginBottom: '24px',
      }}>
        <StatCard label={t('stats.testType')} value={`${result.mode} ${result.modeValue}`} />
        <StatCard label={t('stats.rawWpm')} value={result.rawWpm} />
        <StatCard label={t('stats.consistency')} value={`${result.consistency}%`} />
        <StatCard label={t('stats.time')} value={`${elapsed}s`} />
        {isCjk && (
          <StatCard
            label={t('stats.cpm')}
            value={Math.round(result.correctChars / (elapsed / 60) || 0)}
          />
        )}
      </div>

      {/* Character breakdown */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '4px',
        fontSize: '14px',
        color: 'var(--sub-color)',
        marginBottom: '24px',
      }}>
        <span style={{ color: 'var(--text-color)' }}>{t('stats.characters')}: </span>
        <span style={{ color: 'var(--main-color)' }}>{result.correctChars}</span>/
        <span style={{ color: 'var(--error-color)' }}>{result.incorrectChars}</span>/
        <span style={{ color: 'var(--error-extra-color)' }}>{result.extraChars}</span>/
        <span>{result.missedChars}</span>
      </div>

      {/* XP Gain Display */}
      {xpGain && (
        <div style={{ marginBottom: '16px' }}>
          <XpGainDisplay xpGain={xpGain} />
        </div>
      )}

      {/* Achievement Unlocks */}
      {newAchievements && newAchievements.length > 0 && (
        <div style={{ marginBottom: '16px' }}>
          <AchievementUnlock achievementIds={newAchievements} />
        </div>
      )}

      {/* Actions */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '16px',
        alignItems: 'center',
      }}>
        <button
          onClick={onRestart}
          style={{
            padding: '10px 24px',
            fontSize: '14px',
            color: 'var(--sub-color)',
            backgroundColor: 'var(--sub-alt-color)',
            borderRadius: 'var(--border-radius)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2" />
          </svg>
          {t('test.nextTest')}
        </button>
        <ShareButton result={result} />
      </div>
    </div>
  );
}
