import { themes } from '../../constants/themes';

interface ThemePickerProps {
  currentTheme: string;
  onThemeChange: (themeId: string) => void;
}

export function ThemePicker({ currentTheme, onThemeChange }: ThemePickerProps) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
      gap: '8px',
      maxHeight: '300px',
      overflowY: 'auto',
      padding: '4px',
    }}>
      {themes.map(theme => (
        <button
          key={theme.id}
          onClick={() => onThemeChange(theme.id)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 12px',
            borderRadius: '6px',
            backgroundColor: theme.colors.bg,
            border: currentTheme === theme.id
              ? `2px solid ${theme.colors.main}`
              : '2px solid transparent',
            cursor: 'pointer',
            transition: 'border-color 0.15s',
          }}
        >
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
      ))}
    </div>
  );
}
