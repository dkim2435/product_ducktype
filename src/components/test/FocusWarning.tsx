import { useTranslation } from 'react-i18next';

interface FocusWarningProps {
  visible: boolean;
  onClick: () => void;
  mode?: 'start' | 'refocus';
  isMobile?: boolean;
}

export function FocusWarning({ visible, onClick, mode = 'refocus', isMobile = false }: FocusWarningProps) {
  if (!visible) return null;

  const { t } = useTranslation();

  const label = isMobile
    ? (mode === 'start' ? t('test.tapToStart') : t('test.tapToResume'))
    : t('test.clickToFocus');

  return (
    <div
      onClick={onClick}
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(4px)',
        borderRadius: 'var(--border-radius)',
        cursor: 'pointer',
        zIndex: 20,
      }}
    >
      {isMobile && mode === 'start' && (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--sub-color)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="4" width="20" height="16" rx="2" />
          <path d="M6 8h.01M10 8h.01M14 8h.01M18 8h.01M8 12h.01M12 12h.01M16 12h.01M6 16h12" />
        </svg>
      )}
      <span style={{ color: 'var(--sub-color)', fontSize: '16px' }}>
        {label}
      </span>
    </div>
  );
}
