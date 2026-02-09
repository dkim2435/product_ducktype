import { useTranslation } from 'react-i18next';
import type { Settings, CaretStyle, SoundVolume } from '../../types/settings';
import { LANGUAGE_OPTIONS, FONT_OPTIONS } from '../../constants/defaults';
import { ThemePicker } from './ThemePicker';

interface SettingsModalProps {
  settings: Settings;
  onSettingChange: <K extends keyof Settings>(key: K, value: Settings[K]) => void;
  onClose: () => void;
  visible: boolean;
}

function SettingRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '10px 0',
      borderBottom: '1px solid var(--sub-alt-color)',
    }}>
      <span style={{ color: 'var(--sub-color)', fontSize: '14px' }}>{label}</span>
      <div>{children}</div>
    </div>
  );
}

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!value)}
      style={{
        width: '40px',
        height: '22px',
        borderRadius: '11px',
        backgroundColor: value ? 'var(--main-color)' : 'var(--sub-alt-color)',
        position: 'relative',
        transition: 'background-color 0.2s',
        border: '1px solid var(--sub-color)',
      }}
    >
      <div style={{
        width: '16px',
        height: '16px',
        borderRadius: '50%',
        backgroundColor: value ? 'var(--bg-color)' : 'var(--sub-color)',
        position: 'absolute',
        top: '2px',
        left: value ? '20px' : '2px',
        transition: 'left 0.2s, background-color 0.2s',
      }} />
    </button>
  );
}

export function SettingsModal({ settings, onSettingChange, onClose, visible }: SettingsModalProps) {
  const { t, i18n } = useTranslation();

  if (!visible) return null;

  const selectStyle: React.CSSProperties = {
    background: 'var(--sub-alt-color)',
    color: 'var(--text-color)',
    border: 'none',
    padding: '6px 10px',
    borderRadius: '4px',
    fontFamily: 'inherit',
    fontSize: '13px',
    outline: 'none',
    cursor: 'pointer',
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0,0,0,0.6)',
        zIndex: 100,
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="slide-up"
        style={{
          backgroundColor: 'var(--bg-color)',
          borderRadius: '12px',
          padding: '24px',
          width: '90%',
          maxWidth: '550px',
          maxHeight: '85vh',
          overflowY: 'auto',
          border: '1px solid var(--sub-alt-color)',
        }}
      >
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
        }}>
          <h2 style={{
            color: 'var(--main-color)',
            fontSize: '20px',
            fontWeight: 400,
          }}>
            {t('settings.title')}
          </h2>
          <button
            onClick={onClose}
            style={{ color: 'var(--sub-color)', fontSize: '20px', padding: '4px' }}
          >
            ×
          </button>
        </div>

        {/* Theme */}
        <div style={{ marginBottom: '16px' }}>
          <div style={{ color: 'var(--sub-color)', fontSize: '14px', marginBottom: '8px' }}>
            {t('settings.theme')}
          </div>
          <ThemePicker
            currentTheme={settings.theme}
            onThemeChange={(id) => onSettingChange('theme', id)}
          />
        </div>

        {/* UI Language */}
        <SettingRow label={t('settings.uiLanguage')}>
          <select
            value={settings.uiLanguage}
            onChange={(e) => {
              onSettingChange('uiLanguage', e.target.value);
              i18n.changeLanguage(e.target.value);
            }}
            style={selectStyle}
          >
            {LANGUAGE_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </SettingRow>

        {/* Font */}
        <SettingRow label={t('settings.font')}>
          <select
            value={settings.fontFamily}
            onChange={(e) => onSettingChange('fontFamily', e.target.value as Settings['fontFamily'])}
            style={selectStyle}
          >
            {FONT_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </SettingRow>

        {/* Font Size */}
        <SettingRow label={t('settings.fontSize')}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={() => onSettingChange('fontSize', Math.max(16, settings.fontSize - 2))}
              style={{ color: 'var(--sub-color)', fontSize: '16px', padding: '2px 8px' }}
            >-</button>
            <span style={{ color: 'var(--text-color)', fontSize: '14px', minWidth: '24px', textAlign: 'center' }}>
              {settings.fontSize}
            </span>
            <button
              onClick={() => onSettingChange('fontSize', Math.min(40, settings.fontSize + 2))}
              style={{ color: 'var(--sub-color)', fontSize: '16px', padding: '2px 8px' }}
            >+</button>
          </div>
        </SettingRow>

        {/* Caret Style */}
        <SettingRow label={t('settings.caretStyle')}>
          <div style={{ display: 'flex', gap: '4px' }}>
            {(['line', 'block', 'underline', 'outline'] as CaretStyle[]).map(style => (
              <button
                key={style}
                onClick={() => onSettingChange('caretStyle', style)}
                style={{
                  padding: '4px 10px',
                  fontSize: '12px',
                  borderRadius: '4px',
                  color: settings.caretStyle === style ? 'var(--main-color)' : 'var(--sub-color)',
                  backgroundColor: settings.caretStyle === style ? 'var(--sub-alt-color)' : 'transparent',
                }}
              >
                {style}
              </button>
            ))}
          </div>
        </SettingRow>

        {/* Smooth Caret */}
        <SettingRow label={t('settings.smoothCaret')}>
          <Toggle value={settings.smoothCaret} onChange={(v) => onSettingChange('smoothCaret', v)} />
        </SettingRow>

        {/* Sound */}
        <SettingRow label={t('settings.sound')}>
          <Toggle value={settings.soundEnabled} onChange={(v) => onSettingChange('soundEnabled', v)} />
        </SettingRow>

        {settings.soundEnabled && (
          <SettingRow label={t('settings.soundVolume')}>
            <div style={{ display: 'flex', gap: '4px' }}>
              {([0.25, 0.5, 0.75, 1] as SoundVolume[]).map(vol => (
                <button
                  key={vol}
                  onClick={() => onSettingChange('soundVolume', vol)}
                  style={{
                    padding: '4px 8px',
                    fontSize: '12px',
                    borderRadius: '4px',
                    color: settings.soundVolume === vol ? 'var(--main-color)' : 'var(--sub-color)',
                    backgroundColor: settings.soundVolume === vol ? 'var(--sub-alt-color)' : 'transparent',
                  }}
                >
                  {Math.round(vol * 100)}%
                </button>
              ))}
            </div>
          </SettingRow>
        )}

        {/* Live WPM */}
        <SettingRow label={t('settings.liveWpm')}>
          <Toggle value={settings.showLiveWpm} onChange={(v) => onSettingChange('showLiveWpm', v)} />
        </SettingRow>

        {/* Live Accuracy */}
        <SettingRow label={t('settings.liveAccuracy')}>
          <Toggle value={settings.showLiveAccuracy} onChange={(v) => onSettingChange('showLiveAccuracy', v)} />
        </SettingRow>

        {/* Show Timer */}
        <SettingRow label={t('settings.showTimer')}>
          <Toggle value={settings.showTimer} onChange={(v) => onSettingChange('showTimer', v)} />
        </SettingRow>

        {/* Freedom Mode */}
        <SettingRow label={t('settings.freedomMode')}>
          <Toggle value={settings.freedomMode} onChange={(v) => onSettingChange('freedomMode', v)} />
        </SettingRow>
      </div>
    </div>
  );
}
