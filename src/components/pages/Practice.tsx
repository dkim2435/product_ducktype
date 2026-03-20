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
    <div className="fade-in w-full max-w-[600px] mx-auto" style={{ padding: 'var(--page-vertical-padding) 0' }}>
      {/* Back button */}
      <button
        onClick={onBack}
        className="text-sub text-[13px] mb-6 flex items-center gap-[6px]"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        {t('practice.title')}
      </button>

      {/* Lessons section */}
      <div className="text-[15px] font-semibold text-text mb-4">
        {t('practice.lessons')}
      </div>

      <div className="flex flex-col gap-2 mb-8">
        {mainLessons.map((lesson, idx) => {
          const unlocked = isLessonUnlocked(lesson.id);
          const progress = lessonProgress[lesson.id];
          const isCompleted = progress?.completedAt != null;

          return (
            <div
              key={lesson.id}
              className={`flex items-center gap-3 px-4 py-[14px] bg-sub-alt rounded-default ${isCompleted ? 'border-l-[3px] border-main' : 'border-l-[3px] border-transparent'}`}
              style={{ opacity: unlocked ? 1 : 0.4 }}
            >
              {/* Number */}
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${isCompleted ? 'bg-main text-bg border-none' : 'bg-transparent text-sub border-2 border-sub'}`}
              >
                {isCompleted ? '✓' : idx + 1}
              </div>

              {/* Info */}
              <div className="flex-1">
                <div className={`text-sm font-semibold mb-[2px] ${unlocked ? 'text-text' : 'text-sub'}`}>
                  {lesson.name}
                </div>
                <div className="text-[11px] text-sub">
                  {unlocked ? lesson.description : t('practice.locked')}
                </div>
                {unlocked && lesson.targetKeys.length > 0 && (
                  <div className="text-[10px] text-sub mt-1 font-mono">
                    {lesson.targetKeys.slice(0, 12).join(' ')}
                    {lesson.targetKeys.length > 12 ? ' ...' : ''}
                  </div>
                )}
              </div>

              {/* Stats */}
              {progress && (
                <div className="text-right text-[11px] text-sub shrink-0">
                  <div>{t('practice.bestWpm')}: <span className="text-text font-semibold">{progress.bestWpm}</span></div>
                  <div>{t('practice.attempts')}: {progress.attempts}</div>
                </div>
              )}

              {/* Action */}
              {unlocked && (
                <button
                  onClick={() => onStartLesson(lesson.id)}
                  className="px-[14px] py-[6px] text-xs font-semibold text-bg bg-main rounded-default shrink-0"
                >
                  {t('practice.startLesson')}
                </button>
              )}

              {/* Lock icon */}
              {!unlocked && (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--sub-color)" strokeWidth="2" className="shrink-0">
                  <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              )}
            </div>
          );
        })}
      </div>

      {/* Weak Keys section */}
      <div className="text-[15px] font-semibold text-text mb-2">
        {t('practice.weakKeys')}
      </div>
      <div className="text-xs text-sub mb-4">
        {t('practice.weakKeysDesc')}
      </div>

      {weakKeys.length > 0 ? (
        <div className="p-4 bg-sub-alt rounded-default flex items-center justify-between">
          <div>
            <div className="flex gap-[6px] mb-2">
              {weakKeys.map(k => (
                <span
                  key={k.key}
                  className="px-[10px] py-1 bg-error text-bg rounded-[4px] text-[13px] font-semibold font-mono"
                >
                  {k.key.toUpperCase()}
                </span>
              ))}
            </div>
            <div className="text-[11px] text-sub">
              {weakKeys.map(k => `${k.key.toUpperCase()}: ${(k.errorRate * 100).toFixed(0)}% error`).join(', ')}
            </div>
          </div>
          <button
            onClick={() => onStartLesson('weak-keys')}
            className="px-[18px] py-2 text-xs font-semibold text-bg bg-main rounded-default shrink-0"
          >
            {t('practice.startLesson')}
          </button>
        </div>
      ) : (
        <div className="p-5 text-center text-sub text-[13px] bg-sub-alt rounded-default">
          {t('practice.noData')}
        </div>
      )}
    </div>
  );
}
