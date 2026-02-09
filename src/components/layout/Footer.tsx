import { useTranslation } from 'react-i18next';

export function Footer() {
  const { t } = useTranslation();

  return (
    <footer style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      gap: '24px',
      padding: '16px 32px',
      flexShrink: 0,
      fontSize: '12px',
    }}>
      <span style={{ color: 'var(--sub-color)' }}>
        {t('footer.contact')}
      </span>
      <span style={{ color: 'var(--sub-alt-color)' }}>|</span>
      <span style={{ color: 'var(--sub-color)' }}>
        {t('footer.github')}
      </span>
      <span style={{ color: 'var(--sub-alt-color)' }}>|</span>
      <span style={{ color: 'var(--sub-color)' }}>
        {t('footer.privacy')}
      </span>
      <span style={{ color: 'var(--sub-alt-color)' }}>|</span>
      <span style={{ color: 'var(--sub-color)', opacity: 0.5 }}>
        Tab + Enter = restart
      </span>
    </footer>
  );
}
