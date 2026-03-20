import { useState, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import type { Settings } from '../../types/settings';
import type { TestState } from '../../types/test';
import type { LessonId, KeyStatsMap } from '../../types/gamification';
import { getLessonDef } from '../../constants/lessons';
import { TypingTest } from '../test/TypingTest';

interface LessonTestProps {
  lessonId: LessonId;
  settings: Settings;
  getLessonWords: (lessonId: LessonId, keyStats?: KeyStatsMap) => string[];
  keyStats: KeyStatsMap;
  onFinish: (testState: TestState) => void;
  onBack: () => void;
  getNextLesson: () => LessonId | null;
  onStartLesson: (id: LessonId) => void;
}

export function LessonTest({
  lessonId,
  settings,
  getLessonWords,
  keyStats,
  onFinish,
  onBack,
  getNextLesson,
  onStartLesson,
}: LessonTestProps) {
  const { t } = useTranslation();
  const [finished, setFinished] = useState(false);
  const lesson = getLessonDef(lessonId);

  // Generate lesson words once
  const words = useMemo(
    () => getLessonWords(lessonId, keyStats),
    [lessonId, getLessonWords, keyStats]
  );

  // Override settings for lesson: words mode, 25 words
  const lessonSettings: Settings = {
    ...settings,
    mode: 'words',
    wordCount: 25,
    language: 'en',
    punctuation: false,
    numbers: false,
  };

  const handleFinish = useCallback((testState: TestState) => {
    setFinished(true);
    onFinish(testState);
  }, [onFinish]);

  const nextLesson = getNextLesson();

  if (finished) {
    return (
      <div className="fade-in w-full max-w-[500px] mx-auto text-center" style={{ padding: 'var(--page-vertical-padding) 0' }}>
        <div className="text-[48px] mb-4">🎉</div>
        <h2 className="text-xl font-bold text-main mb-2">
          {t('practice.lessonComplete')}
        </h2>
        <div className="text-sm text-sub mb-8">
          {lesson?.name}
        </div>

        <div className="flex justify-center gap-3 flex-wrap">
          <button
            onClick={onBack}
            className="px-5 py-[10px] text-[13px] text-sub bg-sub-alt rounded-default"
          >
            {t('practice.backToLessons')}
          </button>
          {nextLesson && (
            <button
              onClick={() => onStartLesson(nextLesson)}
              className="px-5 py-[10px] text-[13px] font-semibold text-bg bg-main rounded-default"
            >
              {t('practice.nextLesson')}
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[900px] mx-auto flex flex-col justify-center min-h-[calc(100vh-240px)]">
      {/* Lesson header */}
      <div className="flex items-center gap-3 mb-4">
        <button
          onClick={onBack}
          className="text-sub flex items-center p-1"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </button>
        <div>
          <div className="text-[15px] font-semibold text-text">
            {lesson?.name || lessonId}
          </div>
          {lesson && lesson.targetKeys.length > 0 && (
            <div className="text-[11px] text-sub">
              {t('practice.targetKeys')}: {lesson.targetKeys.join(' ')}
            </div>
          )}
        </div>
      </div>

      <TypingTest
        key={`lesson-${lessonId}`}
        settings={lessonSettings}
        onSettingChange={() => {}}
        onFinish={handleFinish}
        customWords={words}
        hideModeSwitcher
      />
    </div>
  );
}
