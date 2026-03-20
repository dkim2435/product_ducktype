import { themes } from '../../constants/themes';
import { getEffectiveLevel, isAdminUser } from '../../utils/admin';

interface ThemePickerProps {
  currentTheme: string;
  onThemeChange: (themeId: string) => void;
  playerLevel?: number;
  userId?: string | null;
}

export function ThemePicker({ currentTheme, onThemeChange, playerLevel = 1, userId }: ThemePickerProps) {
  const effectiveLevel = getEffectiveLevel(playerLevel, userId);
  const isAdmin = isAdminUser(userId);

  const regularThemes = themes.filter(t => !t.premium);
  const premiumThemes = themes.filter(t => t.premium);

  const renderThemeButton = (theme: typeof themes[0]) => {
    const isPremium = !!theme.premium;
    const unlocked = isPremium ? isAdmin : effectiveLevel >= theme.unlockLevel;
    const isSelected = currentTheme === theme.id;

    return (
      <button
        key={theme.id}
        onClick={() => unlocked && onThemeChange(theme.id)}
        disabled={!unlocked}
        className="flex items-center gap-2 rounded-[6px] relative transition-[border-color] duration-150"
        style={{
          padding: '8px 12px',
          backgroundColor: theme.colors.bg,
          border: isSelected
            ? `2px solid ${theme.colors.main}`
            : isPremium
              ? `1px solid ${theme.colors.main}40`
              : '2px solid transparent',
          cursor: unlocked ? 'pointer' : 'not-allowed',
          opacity: !isPremium && !unlocked ? 0.4 : isPremium && !unlocked ? 0.75 : 1,
          boxShadow: isPremium ? `0 0 10px ${theme.colors.main}25` : undefined,
        }}
      >
        {/* Badge: unlocked ✓ */}
        {unlocked && (
          <span className="absolute top-0.5 right-1 text-[9px]" style={{
            color: isPremium ? theme.colors.main : '#4ade80',
            textShadow: isPremium ? `0 0 4px ${theme.colors.main}` : undefined,
          }}>✓</span>
        )}
        {/* Badge: locked level */}
        {!isPremium && !unlocked && (
          <span className="absolute top-0.5 right-1 text-[9px]" style={{ color: theme.colors.sub }}>
            🔒 Lv.{theme.unlockLevel}
          </span>
        )}
        {/* Badge: premium COMING SOON */}
        {isPremium && !unlocked && (
          <span className="absolute top-0.5 right-1 text-[7px] rounded-[3px] font-semibold tracking-[0.5px]" style={{
            padding: '1px 4px',
            backgroundColor: 'rgba(0,0,0,0.7)',
            color: theme.colors.main,
            textShadow: `0 0 6px ${theme.colors.main}`,
          }}>COMING SOON</span>
        )}

        {/* Color palette dots */}
        <div className="flex gap-[3px]">
          <div className="w-2.5 h-2.5 rounded-full" style={{
            backgroundColor: theme.colors.main,
            boxShadow: isPremium ? `0 0 6px ${theme.colors.main}` : undefined,
          }} />
          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: theme.colors.text }} />
          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: theme.colors.sub }} />
        </div>

        {/* Theme name */}
        <span className="text-[11px] whitespace-nowrap overflow-hidden text-ellipsis" style={{
          color: theme.colors.text,
          textShadow: isPremium
            ? `0 0 8px ${theme.colors.main}, 0 0 20px ${theme.colors.main}50`
            : undefined,
        }}>
          {theme.name}
        </span>
      </button>
    );
  };

  return (
    <div>
      {/* Regular themes */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
        gap: '8px',
        maxHeight: '300px',
        overflowY: 'auto',
        padding: '4px',
      }}>
        {regularThemes.map(renderThemeButton)}
      </div>

      {/* Premium themes section */}
      {premiumThemes.length > 0 && (
        <>
          <div className="flex items-center gap-2" style={{ margin: '16px 0 8px 4px' }}>
            <span className="text-[11px] text-sub tracking-[1.5px] uppercase">
              Premium Sets
            </span>
            <div className="flex-1 h-px" style={{ background: 'linear-gradient(90deg, var(--sub-alt-color), transparent)' }} />
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
            gap: '8px',
            padding: '4px',
          }}>
            {premiumThemes.map(renderThemeButton)}
          </div>
        </>
      )}
    </div>
  );
}
