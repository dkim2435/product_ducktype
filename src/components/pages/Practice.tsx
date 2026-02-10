import { useTranslation } from 'react-i18next';
import type { LessonId, LessonProgressMap, KeyStatsMap } from '../../types/gamification';
import { LESSONS } from '../../constants/lessons';
import { getWeakKeys } from '../../utils/keyAnalysis';

interface PracticeProps {
  lessonProgress: LessonProgressMap;
  isLessonUnlocked: (id: LessonId) => boolean;
  keyStats: KeyStatsMap;
  onStartLesson: (id: LessonId) => void;
  onBack: () => void;
}

export function Practice({ lessonProgress, isLessonUnlocked, keyStats, onStartLesson, onBack }: PracticeProps) {
  const { t } = useTranslation();

  const mainLessons = LESSONS.filter(l => l.id !== 'weak-keys');
  const weakKeys = getWeakKeys(keyStats, 5);

  return (
    <div className="fade-in" style={{
      width: '100%',
      maxWidth: '600px',
      margin: '0 auto',
      padding: 'var(--page-vertical-padding) 0',
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
        {t('practice.title')}
      </button>

      {/* Lessons section */}
      <div style={{
        fontSize: '15px',
        fontWeight: 600,
        color: 'var(--text-color)',
        marginBottom: '16px',
      }}>
        {t('practice.lessons')}
      </div>

      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        marginBottom: '32px',
      }}>
        {mainLessons.map((lesson, idx) => {
          const unlocked = isLessonUnlocked(lesson.id);
          const progress = lessonProgress[lesson.id];
          const isCompleted = progress?.completedAt != null;

          return (
            <div
              key={lesson.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '14px 16px',
                backgroundColor: 'var(--sub-alt-color)',
                borderRadius: 'var(--border-radius)',
                opacity: unlocked ? 1 : 0.4,
                borderLeft: isCompleted ? '3px solid var(--main-color)' : '3px solid transparent',
              }}
            >
              {/* Number */}
              <div style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px',
                fontWeight: 700,
                backgroundColor: isCompleted ? 'var(--main-color)' : 'transparent',
                color: isCompleted ? 'var(--bg-color)' : 'var(--sub-color)',
                border: isCompleted ? 'none' : '2px solid var(--sub-color)',
                flexShrink: 0,
              }}>
                {isCompleted ? '✓' : idx + 1}
              </div>

              {/* Info */}
              <div style={{ flex: 1 }}>
                <div style={{
                  fontSize: '14px',
                  fontWeight: 600,
                  color: unlocked ? 'var(--text-color)' : 'var(--sub-color)',
                  marginBottom: '2px',
                }}>
                  {lesson.name}
                </div>
                <div style={{
                  fontSize: '11px',
                  color: 'var(--sub-color)',
                }}>
                  {unlocked ? lesson.description : t('practice.locked')}
                </div>
                {unlocked && lesson.targetKeys.length > 0 && (
                  <div style={{
                    fontSize: '10px',
                    color: 'var(--sub-color)',
                    marginTop: '4px',
                    fontFamily: 'monospace',
                  }}>
                    {lesson.targetKeys.slice(0, 12).join(' ')}
                    {lesson.targetKeys.length > 12 ? ' ...' : ''}
                  </div>
                )}
              </div>

              {/* Stats */}
              {progress && (
                <div style={{
                  textAlign: 'right',
                  fontSize: '11px',
                  color: 'var(--sub-color)',
                  flexShrink: 0,
                }}>
                  <div>{t('practice.bestWpm')}: <span style={{ color: 'var(--text-color)', fontWeight: 600 }}>{progress.bestWpm}</span></div>
                  <div>{t('practice.attempts')}: {progress.attempts}</div>
                </div>
              )}

              {/* Action */}
              {unlocked && (
                <button
                  onClick={() => onStartLesson(lesson.id)}
                  style={{
                    padding: '6px 14px',
                    fontSize: '12px',
                    fontWeight: 600,
                    color: 'var(--bg-color)',
                    backgroundColor: 'var(--main-color)',
                    borderRadius: 'var(--border-radius)',
                    flexShrink: 0,
                  }}
                >
                  {t('practice.startLesson')}
                </button>
              )}

              {/* Lock icon */}
              {!unlocked && (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--sub-color)" strokeWidth="2" style={{ flexShrink: 0 }}>
                  <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              )}
            </div>
          );
        })}
      </div>

      {/* Weak Keys section */}
      <div style={{
        fontSize: '15px',
        fontWeight: 600,
        color: 'var(--text-color)',
        marginBottom: '8px',
      }}>
        {t('practice.weakKeys')}
      </div>
      <div style={{
        fontSize: '12px',
        color: 'var(--sub-color)',
        marginBottom: '16px',
      }}>
        {t('practice.weakKeysDesc')}
      </div>

      {weakKeys.length > 0 ? (
        <div style={{
          padding: '16px',
          backgroundColor: 'var(--sub-alt-color)',
          borderRadius: 'var(--border-radius)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div>
            <div style={{
              display: 'flex',
              gap: '6px',
              marginBottom: '8px',
            }}>
              {weakKeys.map(k => (
                <span
                  key={k.key}
                  style={{
                    padding: '4px 10px',
                    backgroundColor: 'var(--error-color)',
                    color: 'var(--bg-color)',
                    borderRadius: '4px',
                    fontSize: '13px',
                    fontWeight: 600,
                    fontFamily: 'monospace',
                  }}
                >
                  {k.key.toUpperCase()}
                </span>
              ))}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--sub-color)' }}>
              {weakKeys.map(k => `${k.key.toUpperCase()}: ${(k.errorRate * 100).toFixed(0)}% error`).join(', ')}
            </div>
          </div>
          <button
            onClick={() => onStartLesson('weak-keys')}
            style={{
              padding: '8px 18px',
              fontSize: '12px',
              fontWeight: 600,
              color: 'var(--bg-color)',
              backgroundColor: 'var(--main-color)',
              borderRadius: 'var(--border-radius)',
              flexShrink: 0,
            }}
          >
            {t('practice.startLesson')}
          </button>
        </div>
      ) : (
        <div style={{
          padding: '20px',
          textAlign: 'center',
          color: 'var(--sub-color)',
          fontSize: '13px',
          backgroundColor: 'var(--sub-alt-color)',
          borderRadius: 'var(--border-radius)',
        }}>
          {t('practice.noData')}
        </div>
      )}
    </div>
  );
}
