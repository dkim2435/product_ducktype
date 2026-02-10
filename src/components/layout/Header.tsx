interface HeaderProps {
  onSettingsClick: () => void;
  onNavigate: (page: string) => void;
}

export function Header({ onSettingsClick, onNavigate }: HeaderProps) {
  return (
    <header style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '16px 32px',
      flexShrink: 0,
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        cursor: 'pointer',
      }}
        onClick={() => onNavigate('test')}
      >
        {/* Cute duck icon */}
        <svg width="32" height="32" viewBox="0 0 100 100" fill="none">
          {/* Body */}
          <ellipse cx="50" cy="62" rx="32" ry="26" fill="var(--main-color)" />
          {/* Head */}
          <circle cx="50" cy="34" r="20" fill="var(--main-color)" />
          {/* Eye left */}
          <circle cx="43" cy="30" r="4" fill="var(--bg-color)" />
          <circle cx="44" cy="29" r="1.5" fill="var(--text-color)" />
          {/* Eye right */}
          <circle cx="57" cy="30" r="4" fill="var(--bg-color)" />
          <circle cx="58" cy="29" r="1.5" fill="var(--text-color)" />
          {/* Beak */}
          <ellipse cx="50" cy="40" rx="10" ry="5" fill="#ff8c42" />
          {/* Wing */}
          <ellipse cx="35" cy="62" rx="12" ry="16" fill="var(--main-color)" opacity="0.7" transform="rotate(-10, 35, 62)" />
          {/* Cheek blush */}
          <circle cx="38" cy="36" r="3" fill="#ff8c42" opacity="0.3" />
          <circle cx="62" cy="36" r="3" fill="#ff8c42" opacity="0.3" />
        </svg>
        <span style={{
          fontSize: '22px',
          fontWeight: 700,
          color: 'var(--main-color)',
          letterSpacing: '0.5px',
        }}>
          duck
          <span style={{ color: 'var(--text-color)', fontWeight: 300 }}>type</span>
        </span>
      </div>

      <nav style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button
          onClick={onSettingsClick}
          style={{
            padding: '6px',
            color: 'var(--sub-color)',
            display: 'flex',
            alignItems: 'center',
          }}
          title="Settings"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        </button>
      </nav>
    </header>
  );
}
