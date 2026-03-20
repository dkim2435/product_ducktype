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
      className={`fixed inset-0 z-[1000] flex justify-center ${isMobile ? 'items-end' : 'items-center'}`}
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)' }}
    >
      <div
        className={`slide-up flex flex-col gap-5 overflow-y-auto bg-bg ${
          isMobile ? 'w-full rounded-t-[16px]' : 'w-[420px] rounded-default'
        }`}
        onClick={(e) => e.stopPropagation()}
        style={{
          maxHeight: '80vh',
          padding: '32px 28px',
        }}
      >
        {/* Header */}
        <div className="text-center">
          <div className="text-[28px] font-bold text-main mb-[6px]">
            {t('whatsNew.title')}
          </div>
          <div className="text-[13px] text-sub">
            v{latest.version} &middot; {dateStr}
          </div>
        </div>

        {/* Items */}
        <div className="flex flex-col gap-[10px]">
          {latest.items.map((item, i) => (
            <div
              key={i}
              className="flex gap-[14px] items-start py-[14px] px-4 bg-sub-alt rounded-default"
            >
              <span className="text-[22px] leading-[1.4] shrink-0">
                {item.emoji}
              </span>
              <span className="text-sm text-text leading-[1.5]">
                {t(item.text)}
              </span>
            </div>
          ))}
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          className="self-center py-[10px] px-9 bg-main text-bg border-none rounded-default text-[15px] font-semibold cursor-pointer mt-1"
        >
          {t('whatsNew.gotIt')}
        </button>
      </div>
    </div>
  );
}
