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
    <div className="flex justify-between items-center py-2.5 border-b border-sub-alt">
      <span className="text-sub text-sm">{label}</span>
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
      className="inline-flex items-center bg-none border-0 cursor-pointer"
      style={{ padding: '11px 0' }}
    >
      <div className="w-10 h-[22px] rounded-[11px] relative transition-[background-color] duration-200 border border-sub" style={{
        backgroundColor: value ? 'var(--main-color)' : 'var(--sub-alt-color)',
      }}>
        <div className="w-4 h-4 rounded-full absolute top-0.5 transition-[left,background-color] duration-200" style={{
          backgroundColor: value ? 'var(--bg-color)' : 'var(--sub-color)',
          left: value ? '20px' : '2px',
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
      className="flex items-center gap-[3px] whitespace-nowrap text-xs rounded-[4px]"
      style={{
        padding: '4px 10px',
        color: !unlocked ? 'var(--sub-color)' : isActive ? 'var(--main-color)' : 'var(--sub-color)',
        backgroundColor: isActive && unlocked ? 'var(--sub-alt-color)' : 'transparent',
        opacity: unlocked ? 1 : 0.4,
        cursor: unlocked ? 'pointer' : 'not-allowed',
      }}
    >
      {unlocked && <span className="text-[10px]" style={{ color: '#4ade80' }}>✓</span>}
      {!unlocked && <span className="text-[10px]">🔒</span>}
      {label}
      {!unlocked && <span className="text-[9px]">Lv.{unlockLevel}</span>}
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
        className="flex items-center gap-1 rounded-[6px] text-xs relative"
        style={{
          padding: '6px 12px',
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
          textShadow: isPremium && neonColor
            ? `0 0 8px ${neonColor}, 0 0 16px ${neonColor}50`
            : undefined,
          boxShadow: isPremium && neonColor ? `0 0 8px ${neonColor}20` : undefined,
        }}
      >
        {/* Unlocked badge */}
        {unlocked && (
          <span className="text-[10px]" style={{
            color: isPremium && neonColor ? neonColor : '#4ade80',
            textShadow: isPremium && neonColor ? `0 0 4px ${neonColor}` : undefined,
          }}>✓</span>
        )}
        {/* Locked (level) badge */}
        {!isPremium && !unlocked && <span className="text-[10px]">🔒</span>}
        {/* Locked (premium) badge */}
        {isPremium && !unlocked && (
          <span className="text-[10px]" style={{
            color: neonColor,
            textShadow: neonColor ? `0 0 4px ${neonColor}` : undefined,
          }}>🔒</span>
        )}

        {name}

        {/* Level requirement */}
        {!isPremium && !unlocked && (
          <span className="text-[10px] text-sub">
            Lv.{unlockLevel}
          </span>
        )}
        {/* COMING SOON badge */}
        {isPremium && !unlocked && (
          <span className="text-[8px] rounded-[3px] font-semibold tracking-[0.5px]" style={{
            padding: '1px 4px',
            backgroundColor: 'rgba(0,0,0,0.5)',
            color: neonColor || 'var(--sub-color)',
            textShadow: neonColor ? `0 0 4px ${neonColor}` : undefined,
          }}>SOON</span>
        )}
      </button>
    );
  };

  return (
    <div
      role="presentation"
      className="fixed inset-0 flex items-center justify-center z-[100]"
      style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="slide-up bg-bg rounded-[12px] p-6 overflow-y-auto overflow-x-hidden border border-sub-alt"
        style={{
          width: '90%',
          maxWidth: '550px',
          maxHeight: '85vh',
          touchAction: 'pan-y',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-main text-xl font-normal">
            {t('settings.title')}
          </h2>
          <button
            onClick={onClose}
            className="text-sub text-xl p-1"
          >
            ×
          </button>
        </div>

        {/* Theme */}
        <div className="mb-4">
          <div className="text-sub text-sm mb-2">
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
        <div className="py-2.5 border-b border-sub-alt">
          <span className="text-sub text-sm block mb-2">
            {t('settings.font')}
          </span>
          <div className="flex flex-wrap gap-1">
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
          <div className="flex items-center gap-2">
            <button
              onClick={() => onSettingChange('fontSize', Math.max(16, settings.fontSize - 2))}
              className="text-sub text-base"
              style={{ padding: '2px 8px' }}
            >-</button>
            <span className="text-text text-sm min-w-[24px] text-center">
              {settings.fontSize}
            </span>
            <button
              onClick={() => onSettingChange('fontSize', Math.min(40, settings.fontSize + 2))}
              className="text-sub text-base"
              style={{ padding: '2px 8px' }}
            >+</button>
          </div>
        </SettingRow>

        {/* Caret Style */}
        <div className="py-2.5 border-b border-sub-alt">
          <span className="text-sub text-sm block mb-2">
            {t('settings.caretStyle')}
          </span>
          <div className="flex gap-1">
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
        <div className="py-2.5 border-b border-sub-alt">
          <span className="text-sub text-sm block mb-2">
            {t('settings.profileFrame')}
          </span>
          <div className="flex flex-wrap gap-1.5">
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
              <div className="flex items-center gap-2" style={{ margin: '10px 0 6px 0' }}>
                <span className="text-[10px] text-sub tracking-[1.5px] uppercase">Premium</span>
                <div className="flex-1 h-px" style={{ background: 'linear-gradient(90deg, var(--sub-alt-color), transparent)' }} />
              </div>
              <div className="flex flex-wrap gap-1.5">
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
        <div className="py-2.5 border-b border-sub-alt">
          <span className="text-sub text-sm block mb-2">
            {t('settings.particleTier')}
          </span>
          <div className="flex flex-wrap gap-1.5">
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
              <div className="flex items-center gap-2" style={{ margin: '10px 0 6px 0' }}>
                <span className="text-[10px] text-sub tracking-[1.5px] uppercase">Premium</span>
                <div className="flex-1 h-px" style={{ background: 'linear-gradient(90deg, var(--sub-alt-color), transparent)' }} />
              </div>
              <div className="flex flex-wrap gap-1.5">
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
            <div className="flex gap-1">
              {([0.25, 0.5, 0.75, 1] as SoundVolume[]).map(vol => (
                <button
                  key={vol}
                  onClick={() => onSettingChange('soundVolume', vol)}
                  className="text-xs rounded-[4px]"
                  style={{
                    padding: '4px 8px',
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
          <div className="py-2.5 border-b border-sub-alt">
            <span className="text-sub text-sm block mb-2">
              {t('settings.soundTheme')}
            </span>
            <div className="flex flex-wrap gap-1.5">
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
                    className="flex items-center gap-1 rounded-[6px] text-xs"
                    style={{
                      padding: '6px 12px',
                      border: isActive ? '1.5px solid var(--main-color)' : '1px solid var(--sub-alt-color)',
                      color: isActive ? 'var(--main-color)' : unlocked ? 'var(--text-color)' : 'var(--sub-color)',
                      backgroundColor: isActive ? 'var(--sub-alt-color)' : 'transparent',
                      opacity: unlocked ? 1 : 0.4,
                      cursor: unlocked ? 'pointer' : 'not-allowed',
                    }}
                  >
                    {unlocked && <span className="text-[10px]" style={{ color: '#4ade80' }}>✓</span>}
                    {!unlocked && <span className="text-[10px]">🔒</span>}
                    {themeDef.name}
                    {!unlocked && (
                      <span className="text-[10px] text-sub">
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

        {/* Zen Mode */}
        <SettingRow label={t('settings.zenMode')}>
          <Toggle value={settings.zenMode} onChange={(v) => onSettingChange('zenMode', v)} />
        </SettingRow>
      </div>
    </div>
  );
}
