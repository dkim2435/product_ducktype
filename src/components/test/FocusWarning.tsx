import { useTranslation } from 'react-i18next';

interface FocusWarningProps {
  visible: boolean;
  onClick: () => void;
}

export function FocusWarning({ visible, onClick }: FocusWarningProps) {
  if (!visible) return null;

  const { t } = useTranslation();

  return (
    <div
      onClick={onClick}
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(4px)',
        borderRadius: 'var(--border-radius)',
        cursor: 'pointer',
        zIndex: 20,
      }}
    >
      <span style={{ color: 'var(--sub-color)', fontSize: '16px' }}>
        {t('test.clickToFocus')}
      </span>
    </div>
  );
}
