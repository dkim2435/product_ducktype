import { useTranslation } from 'react-i18next';
import type { Settings, CaretStyle, SoundVolume, SoundTheme, ProfileFrame, ParticleTier } from '../../types/settings';
import { LANGUAGE_OPTIONS, FONT_OPTIONS, CARET_UNLOCK, FONT_UNLOCK } from '../../constants/defaults';
import { SOUND_THEMES } from '../../constants/sounds';
import { PROFILE_FRAMES } from '../../constants/profileFrames';
import { PARTICLE_TIERS } from '../../constants/particles';
import { useSound } from '../../hooks/useSound';
import { ThemePicker } from './ThemePicker';
import { getEffectiveLevel, isAdminUser } from '../../utils/admin';

const NEON_SET_COLORS: Record<string, string> = {
  'neon-cyber': '#ff2d95',
  'neon-synthwave': '#ff6e27',
  'neon-toxic': '#39ff14',
  'neon-aurora': '#00fff5',
  'neon-sunset': '#ff4f81',
};

interface SettingsModalProps {
  settings: Settings;
  onSettingChange: <K extends keyof Settings>(key: K, value: Settings[K]) => void;
  onClose: () => void;
  visible: boolean;
  playerLevel?: number;
  userId?: string | null;
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
      aria-checked={value}
      role="switch"
      style={{
        padding: '11px 0',
        display: 'inline-flex',
        alignItems: 'center',
        background: 'none',
        border: 'none',
        cursor: 'pointer',
      }}
    >
      <div style={{
        width: '40px',
        height: '22px',
        borderRadius: '11px',
        backgroundColor: value ? 'var(--main-color)' : 'var(--sub-alt-color)',
        position: 'relative',
        transition: 'background-color 0.2s',
        border: '1px solid var(--sub-color)',
      }}>
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
      </div>
    </button>
  );
}

function UnlockButton({ label, unlocked, unlockLevel, isActive, onClick }: {
  label: string;
  unlocked: boolean;
  unlockLevel: number;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={() => unlocked && onClick()}
      disabled={!unlocked}
      style={{
        padding: '4px 10px',
        fontSize: '12px',
        borderRadius: '4px',
        color: !unlocked ? 'var(--sub-color)' : isActive ? 'var(--main-color)' : 'var(--sub-color)',
        backgroundColor: isActive && unlocked ? 'var(--sub-alt-color)' : 'transparent',
        opacity: unlocked ? 1 : 0.4,
        cursor: unlocked ? 'pointer' : 'not-allowed',
        display: 'flex',
        alignItems: 'center',
        gap: '3px',
        whiteSpace: 'nowrap',
      }}
    >
      {unlocked && <span style={{ fontSize: '10px', color: '#4ade80' }}>✓</span>}
      {!unlocked && <span style={{ fontSize: '10px' }}>🔒</span>}
      {label}
      {!unlocked && <span style={{ fontSize: '9px' }}>Lv.{unlockLevel}</span>}
    </button>
  );
}

export function SettingsModal({ settings, onSettingChange, onClose, visible, playerLevel = 1, userId }: SettingsModalProps) {
  const { t, i18n } = useTranslation();
  const { playClick: previewSound } = useSound({ enabled: true, volume: settings.soundVolume, theme: settings.soundTheme });
  const effectiveLevel = getEffectiveLevel(playerLevel, userId);
  const isAdmin = isAdminUser(userId);

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

  const regularFrames = PROFILE_FRAMES.filter(f => !f.premium);
  const premiumFrames = PROFILE_FRAMES.filter(f => f.premium);
  const regularParticles = PARTICLE_TIERS.filter(p => !p.premium);
  const premiumParticles = PARTICLE_TIERS.filter(p => p.premium);

  const renderPerkButton = (
    id: string,
    name: string,
    unlocked: boolean,
    isActive: boolean,
    isPremium: boolean,
    unlockLevel: number,
    premiumSet: string | undefined,
    onClick: () => void,
  ) => {
    const neonColor = premiumSet ? NEON_SET_COLORS[premiumSet] : undefined;
    return (
      <button
        key={id}
        onClick={() => unlocked && onClick()}
        disabled={!unlocked}
        style={{
          padding: '6px 12px',
          fontSize: '12px',
          borderRadius: '6px',
          border: isActive
            ? `1.5px solid ${isPremium && neonColor ? neonColor : 'var(--main-color)'}`
            : isPremium && neonColor
              ? `1px solid ${neonColor}40`
              : '1px solid var(--sub-alt-color)',
          color: isActive
            ? isPremium && neonColor ? neonColor : 'var(--main-color)'
            : unlocked
              ? 'var(--text-color)'
              : 'var(--sub-color)',
          backgroundColor: isActive ? 'var(--sub-alt-color)' : 'transparent',
          opacity: !isPremium && !unlocked ? 0.4 : isPremium && !unlocked ? 0.75 : 1,
          cursor: unlocked ? 'pointer' : 'not-allowed',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          position: 'relative',
          textShadow: isPremium && neonColor
            ? `0 0 8px ${neonColor}, 0 0 16px ${neonColor}50`
            : undefined,
          boxShadow: isPremium && neonColor ? `0 0 8px ${neonColor}20` : undefined,
        }}
      >
        {/* Unlocked badge */}
        {unlocked && (
          <span style={{
            fontSize: '10px',
            color: isPremium && neonColor ? neonColor : '#4ade80',
            textShadow: isPremium && neonColor ? `0 0 4px ${neonColor}` : undefined,
          }}>✓</span>
        )}
        {/* Locked (level) badge */}
        {!isPremium && !unlocked && <span style={{ fontSize: '10px' }}>🔒</span>}
        {/* Locked (premium) badge */}
        {isPremium && !unlocked && (
          <span style={{
            fontSize: '10px',
            color: neonColor,
            textShadow: neonColor ? `0 0 4px ${neonColor}` : undefined,
          }}>🔒</span>
        )}

        {name}

        {/* Level requirement */}
        {!isPremium && !unlocked && (
          <span style={{ fontSize: '10px', color: 'var(--sub-color)' }}>
            Lv.{unlockLevel}
          </span>
        )}
        {/* COMING SOON badge */}
        {isPremium && !unlocked && (
          <span style={{
            fontSize: '8px',
            padding: '1px 4px',
            borderRadius: '3px',
            backgroundColor: 'rgba(0,0,0,0.5)',
            color: neonColor || 'var(--sub-color)',
            textShadow: neonColor ? `0 0 4px ${neonColor}` : undefined,
            letterSpacing: '0.5px',
            fontWeight: 600,
          }}>SOON</span>
        )}
      </button>
    );
  };

  return (
    <div
      role="presentation"
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
          overflowX: 'hidden',
          border: '1px solid var(--sub-alt-color)',
          touchAction: 'pan-y',
          WebkitOverflowScrolling: 'touch',
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
            playerLevel={playerLevel}
            userId={userId}
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
        <div style={{ padding: '10px 0', borderBottom: '1px solid var(--sub-alt-color)' }}>
          <span style={{ color: 'var(--sub-color)', fontSize: '14px', display: 'block', marginBottom: '8px' }}>
            {t('settings.font')}
          </span>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
            {FONT_OPTIONS.map(opt => {
              const unlockLv = FONT_UNLOCK[opt.value as keyof typeof FONT_UNLOCK];
              const unlocked = effectiveLevel >= unlockLv;
              const isActive = settings.fontFamily === opt.value;
              return (
                <UnlockButton
                  key={opt.value}
                  label={opt.label}
                  unlocked={unlocked}
                  unlockLevel={unlockLv}
                  isActive={isActive}
                  onClick={() => onSettingChange('fontFamily', opt.value as Settings['fontFamily'])}
                />
              );
            })}
          </div>
        </div>

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
        <div style={{ padding: '10px 0', borderBottom: '1px solid var(--sub-alt-color)' }}>
          <span style={{ color: 'var(--sub-color)', fontSize: '14px', display: 'block', marginBottom: '8px' }}>
            {t('settings.caretStyle')}
          </span>
          <div style={{ display: 'flex', gap: '4px' }}>
            {(['line', 'block', 'underline', 'outline'] as CaretStyle[]).map(style => {
              const unlockLv = CARET_UNLOCK[style];
              const unlocked = effectiveLevel >= unlockLv;
              const isActive = settings.caretStyle === style;
              return (
                <UnlockButton
                  key={style}
                  label={style}
                  unlocked={unlocked}
                  unlockLevel={unlockLv}
                  isActive={isActive}
                  onClick={() => onSettingChange('caretStyle', style)}
                />
              );
            })}
          </div>
        </div>

        {/* Smooth Caret */}
        <SettingRow label={t('settings.smoothCaret')}>
          <Toggle value={settings.smoothCaret} onChange={(v) => onSettingChange('smoothCaret', v)} />
        </SettingRow>

        {/* Profile Frame */}
        <div style={{ padding: '10px 0', borderBottom: '1px solid var(--sub-alt-color)' }}>
          <span style={{ color: 'var(--sub-color)', fontSize: '14px', display: 'block', marginBottom: '8px' }}>
            {t('settings.profileFrame')}
          </span>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {regularFrames.map(frame => {
              const unlocked = effectiveLevel >= frame.unlockLevel;
              const isActive = settings.profileFrame === frame.id;
              return renderPerkButton(
                frame.id, frame.name, unlocked, isActive, false, frame.unlockLevel, undefined,
                () => onSettingChange('profileFrame', frame.id as ProfileFrame),
              );
            })}
          </div>
          {premiumFrames.length > 0 && (
            <>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                margin: '10px 0 6px 0',
              }}>
                <span style={{
                  fontSize: '10px',
                  color: 'var(--sub-color)',
                  letterSpacing: '1.5px',
                  textTransform: 'uppercase',
                }}>Premium</span>
                <div style={{
                  flex: 1, height: '1px',
                  background: 'linear-gradient(90deg, var(--sub-alt-color), transparent)',
                }} />
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {premiumFrames.map(frame => {
                  const unlocked = isAdmin;
                  const isActive = settings.profileFrame === frame.id;
                  return renderPerkButton(
                    frame.id, frame.name, unlocked, isActive, true, frame.unlockLevel, frame.premiumSet,
                    () => onSettingChange('profileFrame', frame.id as ProfileFrame),
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* Typing Particles */}
        <div style={{ padding: '10px 0', borderBottom: '1px solid var(--sub-alt-color)' }}>
          <span style={{ color: 'var(--sub-color)', fontSize: '14px', display: 'block', marginBottom: '8px' }}>
            {t('settings.particleTier')}
          </span>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {regularParticles.map(tier => {
              const unlocked = effectiveLevel >= tier.unlockLevel;
              const isActive = settings.particleTier === tier.id;
              return renderPerkButton(
                tier.id, tier.name, unlocked, isActive, false, tier.unlockLevel, undefined,
                () => onSettingChange('particleTier', tier.id as ParticleTier),
              );
            })}
          </div>
          {premiumParticles.length > 0 && (
            <>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                margin: '10px 0 6px 0',
              }}>
                <span style={{
                  fontSize: '10px',
                  color: 'var(--sub-color)',
                  letterSpacing: '1.5px',
                  textTransform: 'uppercase',
                }}>Premium</span>
                <div style={{
                  flex: 1, height: '1px',
                  background: 'linear-gradient(90deg, var(--sub-alt-color), transparent)',
                }} />
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {premiumParticles.map(tier => {
                  const unlocked = isAdmin;
                  const isActive = settings.particleTier === tier.id;
                  return renderPerkButton(
                    tier.id, tier.name, unlocked, isActive, true, tier.unlockLevel, tier.premiumSet,
                    () => onSettingChange('particleTier', tier.id as ParticleTier),
                  );
                })}
              </div>
            </>
          )}
        </div>

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

        {settings.soundEnabled && (
          <div style={{ padding: '10px 0', borderBottom: '1px solid var(--sub-alt-color)' }}>
            <span style={{ color: 'var(--sub-color)', fontSize: '14px', display: 'block', marginBottom: '8px' }}>
              {t('settings.soundTheme')}
            </span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {SOUND_THEMES.map(themeDef => {
                const unlocked = effectiveLevel >= themeDef.unlockLevel;
                const isActive = settings.soundTheme === themeDef.id;
                return (
                  <button
                    key={themeDef.id}
                    onClick={() => {
                      if (!unlocked) return;
                      onSettingChange('soundTheme', themeDef.id as SoundTheme);
                      setTimeout(() => previewSound(), 50);
                    }}
                    disabled={!unlocked}
                    style={{
                      padding: '6px 12px',
                      fontSize: '12px',
                      borderRadius: '6px',
                      border: isActive ? '1.5px solid var(--main-color)' : '1px solid var(--sub-alt-color)',
                      color: isActive ? 'var(--main-color)' : unlocked ? 'var(--text-color)' : 'var(--sub-color)',
                      backgroundColor: isActive ? 'var(--sub-alt-color)' : 'transparent',
                      opacity: unlocked ? 1 : 0.4,
                      cursor: unlocked ? 'pointer' : 'not-allowed',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    {unlocked && <span style={{ fontSize: '10px', color: '#4ade80' }}>✓</span>}
                    {!unlocked && <span style={{ fontSize: '10px' }}>🔒</span>}
                    {themeDef.name}
                    {!unlocked && (
                      <span style={{ fontSize: '10px', color: 'var(--sub-color)' }}>
                        Lv.{themeDef.unlockLevel}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
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
