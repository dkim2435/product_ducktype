import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useIsMobile } from '../../hooks/useIsMobile';
import { releaseNotes } from '../../data/releaseNotes';

interface WhatsNewModalProps {
  visible: boolean;
  onClose: () => void;
}

export function WhatsNewModal({ visible, onClose }: WhatsNewModalProps) {
  const { t } = useTranslation();
  const isMobile = useIsMobile();

  // ESC to close
  useEffect(() => {
    if (!visible) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [visible, onClose]);

  if (!visible) return null;

  const latest = releaseNotes[0];
  if (!latest) return null;

  const dateStr = new Date(latest.date).toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric',
  });

  return (
    <div
      role="presentation"
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        display: 'flex',
        alignItems: isMobile ? 'flex-end' : 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
      }}
    >
      <div
        className="slide-up"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: isMobile ? '100%' : '420px',
          maxHeight: '80vh',
          overflowY: 'auto',
          backgroundColor: 'var(--bg-color)',
          borderRadius: isMobile ? '16px 16px 0 0' : 'var(--border-radius)',
          padding: '32px 28px',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
        }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center' }}>
          <div style={{
            fontSize: '28px',
            fontWeight: 700,
            color: 'var(--main-color)',
            marginBottom: '6px',
          }}>
            {t('whatsNew.title')}
          </div>
          <div style={{
            fontSize: '13px',
            color: 'var(--sub-color)',
          }}>
            v{latest.version} &middot; {dateStr}
          </div>
        </div>

        {/* Items */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {latest.items.map((item, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                gap: '14px',
                alignItems: 'flex-start',
                padding: '14px 16px',
                backgroundColor: 'var(--sub-alt-color)',
                borderRadius: 'var(--border-radius)',
              }}
            >
              <span style={{ fontSize: '22px', lineHeight: 1.4, flexShrink: 0 }}>
                {item.emoji}
              </span>
              <span style={{
                fontSize: '14px',
                color: 'var(--text-color)',
                lineHeight: 1.5,
              }}>
                {t(item.text)}
              </span>
            </div>
          ))}
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            alignSelf: 'center',
            padding: '10px 36px',
            backgroundColor: 'var(--main-color)',
            color: 'var(--bg-color)',
            border: 'none',
            borderRadius: 'var(--border-radius)',
            fontSize: '15px',
            fontWeight: 600,
            cursor: 'pointer',
            marginTop: '4px',
          }}
        >
          {t('whatsNew.gotIt')}
        </button>
      </div>
    </div>
  );
}
