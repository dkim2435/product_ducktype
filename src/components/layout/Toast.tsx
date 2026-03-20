import type { ToastNotification } from '../../types/gamification';

interface ToastProps {
  toast: ToastNotification;
  onDismiss: (id: string) => void;
}

const typeStyles: Record<string, { bg: string; border: string }> = {
  achievement: { bg: 'var(--sub-alt-color)', border: 'var(--main-color)' },
  levelup: { bg: 'var(--sub-alt-color)', border: 'var(--main-color)' },
  xp: { bg: 'var(--sub-alt-color)', border: 'var(--sub-color)' },
  streak: { bg: 'var(--sub-alt-color)', border: '#ff6b35' },
  info: { bg: 'var(--sub-alt-color)', border: 'var(--sub-color)' },
};

export function Toast({ toast, onDismiss }: ToastProps) {
  const style = typeStyles[toast.type] || typeStyles.info;

  return (
    <div
      className="toast-slide-in flex items-center gap-3 py-3 px-4 rounded-default cursor-pointer min-w-[240px] max-w-[320px]"
      role="button"
      tabIndex={0}
      onClick={() => onDismiss(toast.id)}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onDismiss(toast.id); } }}
      style={{
        backgroundColor: style.bg,
        borderLeft: `3px solid ${style.border}`,
        boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
      }}
    >
      {toast.icon && (
        <span className="text-xl shrink-0">{toast.icon}</span>
      )}
      <div className="flex-1 min-w-0">
        <div className={`text-xs font-semibold mb-[2px] ${
          toast.type === 'achievement' || toast.type === 'levelup'
            ? 'text-main'
            : 'text-text'
        }`}>
          {toast.title}
        </div>
        <div className="text-[11px] text-sub whitespace-nowrap overflow-hidden text-ellipsis">
          {toast.message}
        </div>
      </div>
    </div>
  );
}
