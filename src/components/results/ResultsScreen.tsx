import { lazy, Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import type { TestResult, PersonalBest } from '../../types/stats';
import type { XpGain, KeyStats } from '../../types/gamification';
import { useIsMobile } from '../../hooks/useIsMobile';
import { StatCard } from './StatCard';
const WpmChart = lazy(() => import('./WpmChart').then(m => ({ default: m.WpmChart })));
import { ShareButton } from './ShareButton';
import { XP_SHARE_BONUS } from '../../constants/gamification';
import { XpGainDisplay } from './XpGainDisplay';
import { AchievementUnlock } from './AchievementUnlock';
import { HelpBadge } from './HelpBadge';
import { getWpmPercentile } from '../../utils/percentile';

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
}

function TipItem({ text }: { text: string }) {
  return (
    <div style={{
      display: 'flex',
      gap: '8px',
      alignItems: 'flex-start',
      fontSize: '12px',
      color: 'var(--sub-color)',
      lineHeight: 1.5,
    }}>
      <span style={{ color: 'var(--main-color)', flexShrink: 0, marginTop: '1px' }}>•</span>
      <span>{text}</span>
    </div>
  );
}

export function ResultsScreen({ result, personalBest, onRestart, isCjk, xpGain, newAchievements, weakKeys, onNavigate, challengeWpm, isLoggedIn, isSupabaseConfigured, onLoginClick, onShareClick, hasCompletedDailyToday, dailyStreak, testsCompleted, totalXp, playerLevel }: ResultsScreenProps) {
  const { t } = useTranslation();
  const isMobile = useIsMobile();

  const isNewPb = personalBest && personalBest.wpm === result.wpm && personalBest.timestamp === result.timestamp;
  const topPercent = getWpmPercentile(result.wpm);

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

      {/* Challenge result */}
      {challengeWpm && (
        <div style={{
          textAlign: 'center',
          marginBottom: '12px',
          padding: isMobile ? '16px' : '10px 20px',
          backgroundColor: 'var(--sub-alt-color)',
          borderRadius: 'var(--border-radius)',
          border: `1.5px solid ${result.wpm >= challengeWpm ? 'var(--main-color)' : 'var(--error-color)'}`,
        }}>
          {isMobile ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '12px', color: 'var(--sub-color)', marginBottom: '4px' }}>
                  {t('stats.wpm')}
                </div>
                <div style={{
                  fontSize: '32px',
                  fontWeight: 700,
                  color: result.wpm >= challengeWpm ? 'var(--main-color)' : 'var(--error-color)',
                }}>
                  {result.wpm}
                </div>
              </div>
              <span style={{ fontSize: '20px', color: 'var(--sub-color)', fontWeight: 300 }}>vs</span>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '12px', color: 'var(--sub-color)', marginBottom: '4px' }}>
                  {t('challenge.beatFriend', { wpm: '' }).split('{{wpm}}')[0].trim() || 'Friend'}
                </div>
                <div style={{
                  fontSize: '32px',
                  fontWeight: 700,
                  color: 'var(--sub-color)',
                }}>
                  {challengeWpm}
                </div>
              </div>
            </div>
          ) : (
            <span style={{
              fontSize: '16px',
              fontWeight: 700,
              color: result.wpm >= challengeWpm ? 'var(--main-color)' : 'var(--error-color)',
            }}>
              {result.wpm >= challengeWpm
                ? t('challenge.won', { wpm: challengeWpm })
                : t('challenge.lost', { wpm: challengeWpm })}
            </span>
          )}
          <div style={{
            marginTop: '8px',
            fontSize: '14px',
            fontWeight: 600,
            color: result.wpm >= challengeWpm ? 'var(--main-color)' : 'var(--error-color)',
          }}>
            {result.wpm >= challengeWpm
              ? t('challenge.won', { wpm: challengeWpm })
              : t('challenge.lost', { wpm: challengeWpm })}
          </div>
        </div>
      )}

      {/* Percentile badge */}
      <div style={{
        textAlign: 'center',
        marginBottom: '12px',
      }}>
        <span style={{
          display: 'inline-block',
          padding: '4px 14px',
          borderRadius: '999px',
          fontSize: '13px',
          fontWeight: 600,
          backgroundColor: topPercent <= 10 ? 'var(--main-color)' : 'var(--sub-alt-color)',
          color: topPercent <= 10 ? 'var(--bg-color)' : 'var(--sub-color)',
        }}>
          {t('stats.topPercent', { percent: topPercent })}
        </span>
      </div>

      {/* Main stats row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : 'auto 1fr',
        gap: isMobile ? '16px' : '24px',
        marginBottom: '24px',
        alignItems: 'start',
      }}>
        {/* Left: WPM + accuracy */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <StatCard label={t('stats.wpm')} value={result.wpm} large tooltip={t('stats.wpmDesc')} />
          <StatCard label={t('stats.accuracy')} value={`${result.accuracy}%`} tooltip={t('stats.accuracyDesc')} />
        </div>

        {/* Right: Chart */}
        <div>
          <Suspense fallback={<div style={{ height: '200px' }} />}>
            <WpmChart
              wpmHistory={result.wpmHistory}
              rawWpmHistory={result.rawWpmHistory}
              errorHistory={result.errorHistory}
            />
          </Suspense>
        </div>
      </div>

      {/* Secondary stats row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(auto-fit, minmax(${isMobile ? '100px' : '120px'}, 1fr))`,
        gap: '16px',
        marginBottom: '24px',
      }}>
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
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
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
        <HelpBadge tooltip={t('stats.charactersDesc')} />
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

      {/* Weak Keys */}
      {weakKeys && weakKeys.length > 0 && (
        <div style={{
          marginBottom: '24px',
          padding: '16px 20px',
          backgroundColor: 'var(--sub-alt-color)',
          borderRadius: 'var(--border-radius)',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '12px',
            fontSize: '13px',
            color: 'var(--sub-color)',
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 9v4M12 17h.01" />
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            </svg>
            {t('results.weakKeys')}
          </div>
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '8px',
            marginBottom: '12px',
          }}>
            {weakKeys.map(k => (
              <span key={k.key} style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '4px 10px',
                borderRadius: '6px',
                backgroundColor: 'var(--bg-color)',
                border: '1px solid var(--error-color)',
                fontSize: '13px',
              }}>
                <span style={{
                  fontWeight: 700,
                  color: 'var(--error-color)',
                  fontFamily: 'monospace',
                  textTransform: 'uppercase',
                }}>
                  {k.key}
                </span>
                <span style={{
                  fontSize: '11px',
                  color: 'var(--sub-color)',
                }}>
                  {k.errors}/{k.totalAttempts}
                </span>
              </span>
            ))}
          </div>
          {onNavigate && (
            <button
              onClick={() => onNavigate('practice')}
              style={{
                fontSize: '12px',
                color: 'var(--main-color)',
                cursor: 'pointer',
                padding: 0,
              }}
            >
              {t('results.practiceWeakKeys')} →
            </button>
          )}
        </div>
      )}

      {/* Actions + Adventure banner */}
      <div style={{
        display: 'flex',
        gap: '10px',
        alignItems: 'stretch',
      }}>
        {/* Adventure banner — fills remaining space */}
        {onNavigate && (
          <button
            onClick={() => onNavigate('adventure')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              flex: 1,
              minWidth: 0,
              padding: '14px 16px',
              border: '1.5px solid #4caf50',
              borderRadius: 'var(--border-radius)',
              background: 'var(--sub-alt-color)',
              color: 'var(--text-color)',
              fontSize: '13px',
              cursor: 'pointer',
              transition: 'filter 0.15s, border-color 0.15s',
              textAlign: 'left',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.filter = 'brightness(1.1)'; e.currentTarget.style.borderColor = '#66bb6a'; }}
            onMouseLeave={(e) => { e.currentTarget.style.filter = 'none'; e.currentTarget.style.borderColor = '#4caf50'; }}
          >
            <span style={{ fontSize: '24px', flexShrink: 0 }}>⚔️</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                <span style={{ fontWeight: 700, fontSize: '13px' }}>Adventure Mode</span>
                <span style={{
                  fontSize: '9px',
                  fontWeight: 700,
                  backgroundColor: '#4caf50',
                  color: '#fff',
                  padding: '2px 6px',
                  borderRadius: '999px',
                  letterSpacing: '0.5px',
                }}>
                  NEW
                </span>
              </div>
              <div style={{ fontSize: '11px', color: 'var(--sub-color)', lineHeight: 1.4 }}>
                {t('results.adventureBanner', { wpm: result.wpm })}
              </div>
            </div>
          </button>
        )}

        {/* Next test + Share — right-aligned column */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '6px',
          flexShrink: 0,
        }}>
          <button
            onClick={onRestart}
            style={{
              padding: '8px 20px',
              fontSize: '13px',
              color: 'var(--text-color)',
              backgroundColor: 'transparent',
              border: '1px solid var(--sub-color)',
              borderRadius: 'var(--border-radius)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              cursor: 'pointer',
              flex: 1,
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2" />
            </svg>
            {t('test.nextTest')}
          </button>
          <div style={{ position: 'relative' }}>
            <ShareButton result={result} onShareClick={onShareClick} fullWidth />
            {(!xpGain || xpGain.shareBonus === 0) && (
              <span style={{
                position: 'absolute',
                right: '-28px',
                top: '50%',
                transform: 'translateY(-50%)',
                fontSize: '10px',
                color: 'var(--main-color)',
                fontWeight: 600,
                opacity: 0.8,
                lineHeight: 1.2,
                textAlign: 'center',
              }}>
                +{XP_SHARE_BONUS}<br />XP
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Daily Challenge hook card */}
      {onNavigate && (
        <div style={{
          marginTop: '16px',
          padding: isMobile ? '14px' : '12px 20px',
          backgroundColor: 'var(--sub-alt-color)',
          borderRadius: 'var(--border-radius)',
          border: '1px solid var(--main-color)',
          display: 'flex',
          alignItems: isMobile ? 'flex-start' : 'center',
          flexDirection: isMobile ? 'column' : 'row',
          gap: isMobile ? '10px' : '16px',
          cursor: 'pointer',
        }}
          onClick={() => onNavigate('daily-challenge')}
        >
          <span style={{ fontSize: '20px', flexShrink: 0 }}>📅</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontSize: '13px',
              fontWeight: 600,
              color: 'var(--text-color)',
              marginBottom: '2px',
            }}>
              {hasCompletedDailyToday
                ? t('results.dailyHookDone', { days: dailyStreak || 0 })
                : (dailyStreak && dailyStreak > 0)
                  ? t('results.dailyHookNotDone')
                  : t('results.dailyHookStart')}
            </div>
            {hasCompletedDailyToday && (dailyStreak || 0) > 0 && (
              <div style={{
                fontSize: '11px',
                color: 'var(--main-color)',
                fontWeight: 600,
              }}>
                🔥 {dailyStreak} {t('gamification.days')} {t('gamification.streak')}
              </div>
            )}
          </div>
          <span style={{
            fontSize: '12px',
            color: 'var(--main-color)',
            fontWeight: 600,
            flexShrink: 0,
          }}>
            {hasCompletedDailyToday ? '→' : `1.5x XP →`}
          </span>
        </div>
      )}

      {/* Cloud save prompt for non-logged-in users */}
      {isSupabaseConfigured && !isLoggedIn && (
        <div style={{
          marginTop: '24px',
          padding: isMobile ? '16px' : '14px 20px',
          backgroundColor: 'var(--sub-alt-color)',
          borderRadius: 'var(--border-radius)',
          border: `1px solid ${testsCompleted === 1 ? 'var(--main-color)' : 'var(--main-color)'}`,
          display: 'flex',
          alignItems: isMobile ? 'flex-start' : 'center',
          flexDirection: isMobile ? 'column' : 'row',
          gap: isMobile ? '12px' : '16px',
          ...(testsCompleted === 1 ? { boxShadow: '0 0 12px rgba(255, 179, 71, 0.15)' } : {}),
        }}>
          <div style={{ flex: 1 }}>
            <div style={{
              fontSize: '13px',
              fontWeight: 600,
              color: 'var(--text-color)',
              marginBottom: '4px',
            }}>
              {testsCompleted === 1 ? t('auth.firstTestTitle') : t('auth.savePromptTitle')}
            </div>
            <div style={{
              fontSize: '12px',
              color: 'var(--sub-color)',
              lineHeight: 1.5,
            }}>
              {testsCompleted === 1
                ? t('auth.firstTestDesc', { xp: totalXp || 0, level: playerLevel || 1 })
                : t('auth.savePromptDesc')}
            </div>
          </div>
          <button
            onClick={onLoginClick}
            style={{
              padding: '8px 20px',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: 'var(--main-color)',
              color: 'var(--bg-color)',
              fontSize: '13px',
              fontWeight: 600,
              fontFamily: 'inherit',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}
          >
            {t('auth.login')} / {t('auth.signup')}
          </button>
        </div>
      )}

      {/* Typing improvement tips */}
      <div style={{
        marginTop: '32px',
        padding: isMobile ? '20px 16px' : '24px 28px',
        backgroundColor: 'var(--sub-alt-color)',
        borderRadius: 'var(--border-radius)',
      }}>
        <h3 style={{
          fontSize: '14px',
          fontWeight: 600,
          color: 'var(--main-color)',
          marginBottom: '12px',
        }}>
          {t('info.improveTitle')}
        </h3>
        <p style={{
          fontSize: '13px',
          color: 'var(--sub-color)',
          lineHeight: 1.6,
          marginBottom: '12px',
        }}>
          {t('info.improveDesc')}
        </p>
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
          gap: '8px',
        }}>
          <TipItem text={t('info.tip1')} />
          <TipItem text={t('info.tip2')} />
          <TipItem text={t('info.tip3')} />
          <TipItem text={t('info.tip4')} />
        </div>
      </div>
    </div>
  );
}
