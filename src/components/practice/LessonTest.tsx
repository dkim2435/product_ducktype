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
      <div className="fade-in" style={{
        width: '100%',
        maxWidth: '500px',
        margin: '0 auto',
        padding: '40px 0',
        textAlign: 'center',
      }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎉</div>
        <h2 style={{
          fontSize: '20px',
          fontWeight: 700,
          color: 'var(--main-color)',
          marginBottom: '8px',
        }}>
          {t('practice.lessonComplete')}
        </h2>
        <div style={{
          fontSize: '14px',
          color: 'var(--sub-color)',
          marginBottom: '32px',
        }}>
          {lesson?.name}
        </div>

        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '12px',
          flexWrap: 'wrap',
        }}>
          <button
            onClick={onBack}
            style={{
              padding: '10px 20px',
              fontSize: '13px',
              color: 'var(--sub-color)',
              backgroundColor: 'var(--sub-alt-color)',
              borderRadius: 'var(--border-radius)',
            }}
          >
            {t('practice.backToLessons')}
          </button>
          {nextLesson && (
            <button
              onClick={() => onStartLesson(nextLesson)}
              style={{
                padding: '10px 20px',
                fontSize: '13px',
                fontWeight: 600,
                color: 'var(--bg-color)',
                backgroundColor: 'var(--main-color)',
                borderRadius: 'var(--border-radius)',
              }}
            >
              {t('practice.nextLesson')}
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div style={{
      width: '100%',
      maxWidth: '900px',
      margin: '0 auto',
    }}>
      {/* Lesson header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        marginBottom: '16px',
      }}>
        <button
          onClick={onBack}
          style={{
            color: 'var(--sub-color)',
            display: 'flex',
            alignItems: 'center',
            padding: '4px',
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </button>
        <div>
          <div style={{
            fontSize: '15px',
            fontWeight: 600,
            color: 'var(--text-color)',
          }}>
            {lesson?.name || lessonId}
          </div>
          {lesson && lesson.targetKeys.length > 0 && (
            <div style={{
              fontSize: '11px',
              color: 'var(--sub-color)',
            }}>
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
