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
      className="toast-slide-in"
      role="button"
      tabIndex={0}
      onClick={() => onDismiss(toast.id)}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onDismiss(toast.id); } }}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '12px 16px',
        backgroundColor: style.bg,
        borderLeft: `3px solid ${style.border}`,
        borderRadius: 'var(--border-radius)',
        cursor: 'pointer',
        minWidth: '240px',
        maxWidth: '320px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
      }}
    >
      {toast.icon && (
        <span style={{ fontSize: '20px', flexShrink: 0 }}>{toast.icon}</span>
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: '12px',
          fontWeight: 600,
          color: toast.type === 'achievement' || toast.type === 'levelup'
            ? 'var(--main-color)'
            : 'var(--text-color)',
          marginBottom: '2px',
        }}>
          {toast.title}
        </div>
        <div style={{
          fontSize: '11px',
          color: 'var(--sub-color)',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}>
          {toast.message}
        </div>
      </div>
    </div>
  );
}
