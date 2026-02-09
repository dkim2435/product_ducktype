import { useTranslation } from 'react-i18next';
import { TIME_OPTIONS, WORD_OPTIONS } from '../../constants/defaults';
import type { Settings } from '../../types/settings';

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

  const btnStyle = (active: boolean): React.CSSProperties => ({
    padding: '4px 12px',
    fontSize: '14px',
    color: active ? 'var(--main-color)' : 'var(--sub-color)',
    cursor: disabled ? 'default' : 'pointer',
    opacity: disabled ? 0.5 : 1,
    transition: 'color 0.15s',
    fontFamily: 'inherit',
  });

  const separatorStyle: React.CSSProperties = {
    width: '2px',
    height: '16px',
    backgroundColor: 'var(--sub-alt-color)',
    margin: '0 4px',
    alignSelf: 'center',
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '2px',
        padding: '8px 16px',
        backgroundColor: 'var(--sub-alt-color)',
        borderRadius: 'var(--border-radius)',
        flexWrap: 'wrap',
      }}
    >
      {/* Punctuation & Numbers */}
      <button
        style={btnStyle(settings.punctuation)}
        onClick={() => !disabled && onPunctuationToggle()}
        title="Toggle punctuation"
      >
        @ {t('settings.punctuation').toLowerCase()}
      </button>
      <button
        style={btnStyle(settings.numbers)}
        onClick={() => !disabled && onNumbersToggle()}
        title="Toggle numbers"
      >
        # {t('settings.numbers').toLowerCase()}
      </button>

      <div style={separatorStyle} />

      {/* Mode selection */}
      <button
        style={btnStyle(settings.mode === 'time')}
        onClick={() => !disabled && onModeChange('time')}
      >
        {t('mode.time')}
      </button>
      <button
        style={btnStyle(settings.mode === 'words')}
        onClick={() => !disabled && onModeChange('words')}
      >
        {t('mode.words')}
      </button>

      <div style={separatorStyle} />

      {/* Values */}
      {settings.mode === 'time'
        ? TIME_OPTIONS.map(time => (
            <button
              key={time}
              style={btnStyle(settings.timeLimit === time)}
              onClick={() => !disabled && onTimeLimitChange(time)}
            >
              {time}
            </button>
          ))
        : WORD_OPTIONS.map(count => (
            <button
              key={count}
              style={btnStyle(settings.wordCount === count)}
              onClick={() => !disabled && onWordCountChange(count)}
            >
              {count}
            </button>
          ))}
    </div>
  );
}
