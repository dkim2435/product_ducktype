import { useTranslation } from 'react-i18next';
import { TIME_OPTIONS, WORD_OPTIONS } from '../../constants/defaults';
import type { Settings } from '../../types/settings';
import { useIsMobile } from '../../hooks/useIsMobile';

interface ModeSelectorProps {
  settings: Settings;
  onModeChange: (mode: 'time' | 'words') => void;
  onTimeLimitChange: (time: number) => void;
  onWordCountChange: (count: number) => void;
  onPunctuationToggle: () => void;
  onNumbersToggle: () => void;
  disabled: boolean;
}

export function ModeSelector({
  settings,
  onModeChange,
  onTimeLimitChange,
  onWordCountChange,
  onPunctuationToggle,
  onNumbersToggle,
  disabled,
}: ModeSelectorProps) {
  const { t } = useTranslation();
  const isMobile = useIsMobile();

  const btnClass = (active: boolean) =>
    `${isMobile ? 'py-[10px] px-[14px] min-h-[44px]' : 'py-1 px-3'} text-[length:var(--mode-selector-font)] ${active ? 'text-main' : 'text-sub'} ${disabled ? 'cursor-default opacity-50' : 'cursor-pointer'} transition-colors duration-150 font-[inherit] shrink-0 whitespace-nowrap`;

  const separatorClass = `w-0.5 h-4 ${isMobile ? 'bg-sub' : 'bg-sub-alt'} mx-1 self-center shrink-0`;

  return (
    <div
      className={`flex items-center ${isMobile ? 'justify-start flex-nowrap overflow-x-auto' : 'justify-center flex-wrap'} gap-0.5 py-2 px-4 bg-sub-alt rounded-default ${isMobile ? 'hide-scrollbar' : ''}`}
    >
      {/* Punctuation & Numbers */}
      <button
        className={btnClass(settings.punctuation)}
        onClick={() => !disabled && onPunctuationToggle()}
        title="Toggle punctuation"
      >
        @ {t('settings.punctuation').toLowerCase()}
      </button>
      <button
        className={btnClass(settings.numbers)}
        onClick={() => !disabled && onNumbersToggle()}
        title="Toggle numbers"
      >
        # {t('settings.numbers').toLowerCase()}
      </button>

      <div className={separatorClass} />

      {/* Mode selection */}
      <button
        className={btnClass(settings.mode === 'time')}
        onClick={() => !disabled && onModeChange('time')}
      >
        {t('mode.time')}
      </button>
      <button
        className={btnClass(settings.mode === 'words')}
        onClick={() => !disabled && onModeChange('words')}
      >
        {t('mode.words')}
      </button>

      <div className={separatorClass} />

      {/* Values */}
      {settings.mode === 'time'
        ? TIME_OPTIONS.map(time => (
            <button
              key={time}
              className={btnClass(settings.timeLimit === time)}
              onClick={() => !disabled && onTimeLimitChange(time)}
            >
              {time}
            </button>
          ))
        : WORD_OPTIONS.map(count => (
            <button
              key={count}
              className={btnClass(settings.wordCount === count)}
              onClick={() => !disabled && onWordCountChange(count)}
            >
              {count}
            </button>
          ))}
    </div>
  );
}
