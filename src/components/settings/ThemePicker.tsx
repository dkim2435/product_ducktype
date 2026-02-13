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
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 12px',
          borderRadius: '6px',
          backgroundColor: theme.colors.bg,
          border: isSelected
            ? `2px solid ${theme.colors.main}`
            : isPremium
              ? `1px solid ${theme.colors.main}40`
              : '2px solid transparent',
          cursor: unlocked ? 'pointer' : 'not-allowed',
          transition: 'border-color 0.15s',
          opacity: !isPremium && !unlocked ? 0.4 : isPremium && !unlocked ? 0.75 : 1,
          position: 'relative',
          boxShadow: isPremium ? `0 0 10px ${theme.colors.main}25` : undefined,
        }}
      >
        {/* Badge: unlocked ✓ */}
        {unlocked && (
          <span style={{
            position: 'absolute',
            top: '2px',
            right: '4px',
            fontSize: '9px',
            color: isPremium ? theme.colors.main : '#4ade80',
            textShadow: isPremium ? `0 0 4px ${theme.colors.main}` : undefined,
          }}>✓</span>
        )}
        {/* Badge: locked level */}
        {!isPremium && !unlocked && (
          <span style={{
            position: 'absolute',
            top: '2px',
            right: '4px',
            fontSize: '9px',
            color: theme.colors.sub,
          }}>
            🔒 Lv.{theme.unlockLevel}
          </span>
        )}
        {/* Badge: premium COMING SOON */}
        {isPremium && !unlocked && (
          <span style={{
            position: 'absolute',
            top: '2px',
            right: '4px',
            fontSize: '7px',
            padding: '1px 4px',
            borderRadius: '3px',
            backgroundColor: 'rgba(0,0,0,0.7)',
            color: theme.colors.main,
            textShadow: `0 0 6px ${theme.colors.main}`,
            letterSpacing: '0.5px',
            fontWeight: 600,
          }}>COMING SOON</span>
        )}

        {/* Color palette dots */}
        <div style={{ display: 'flex', gap: '3px' }}>
          <div style={{
            width: '10px',
            height: '10px',
            borderRadius: '50%',
            backgroundColor: theme.colors.main,
            boxShadow: isPremium ? `0 0 6px ${theme.colors.main}` : undefined,
          }} />
          <div style={{
            width: '10px',
            height: '10px',
            borderRadius: '50%',
            backgroundColor: theme.colors.text,
          }} />
          <div style={{
            width: '10px',
            height: '10px',
            borderRadius: '50%',
            backgroundColor: theme.colors.sub,
          }} />
        </div>

        {/* Theme name */}
        <span style={{
          fontSize: '11px',
          color: theme.colors.text,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
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
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            margin: '16px 0 8px 4px',
          }}>
            <span style={{
              fontSize: '11px',
              color: 'var(--sub-color)',
              letterSpacing: '1.5px',
              textTransform: 'uppercase',
            }}>
              Premium Sets
            </span>
            <div style={{
              flex: 1,
              height: '1px',
              background: 'linear-gradient(90deg, var(--sub-alt-color), transparent)',
            }} />
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
