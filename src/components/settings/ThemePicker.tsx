import { themes } from '../../constants/themes';
import { getEffectiveLevel } from '../../utils/admin';

interface ThemePickerProps {
  currentTheme: string;
  onThemeChange: (themeId: string) => void;
  playerLevel?: number;
  userId?: string | null;
}

export function ThemePicker({ currentTheme, onThemeChange, playerLevel = 1, userId }: ThemePickerProps) {
  const effectiveLevel = getEffectiveLevel(playerLevel, userId);

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
      gap: '8px',
      maxHeight: '300px',
      overflowY: 'auto',
      padding: '4px',
    }}>
      {themes.map(theme => {
        const unlocked = effectiveLevel >= theme.unlockLevel;
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
                : '2px solid transparent',
              cursor: unlocked ? 'pointer' : 'not-allowed',
              transition: 'border-color 0.15s',
              opacity: unlocked ? 1 : 0.4,
              position: 'relative',
            }}
          >
            {!unlocked && (
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
            <div style={{
              display: 'flex',
              gap: '3px',
            }}>
              <div style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                backgroundColor: theme.colors.main,
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
            <span style={{
              fontSize: '11px',
              color: theme.colors.text,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}>
              {theme.name}
            </span>
          </button>
        );
      })}
    </div>
  );
}
