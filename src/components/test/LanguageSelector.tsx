import { LANGUAGE_OPTIONS } from '../../constants/defaults';

interface LanguageSelectorProps {
  currentLanguage: string;
  onChange: (lang: string) => void;
  disabled: boolean;
}

export function LanguageSelector({ currentLanguage, onChange, disabled }: LanguageSelectorProps) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="var(--sub-color)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="10" />
        <line x1="2" y1="12" x2="22" y2="12" />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </svg>
      <select
        value={currentLanguage}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        style={{
          background: 'var(--sub-alt-color)',
          color: 'var(--sub-color)',
          border: 'none',
          padding: '4px 8px',
          borderRadius: '4px',
          fontFamily: 'inherit',
          fontSize: '14px',
          cursor: disabled ? 'default' : 'pointer',
          outline: 'none',
        }}
      >
        {LANGUAGE_OPTIONS.map(opt => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
