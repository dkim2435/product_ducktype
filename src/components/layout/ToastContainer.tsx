import type { ToastNotification } from '../../types/gamification';
import { useIsMobile } from '../../hooks/useIsMobile';
import { Toast } from './Toast';

interface ToastContainerProps {
  toasts: ToastNotification[];
  onDismiss: (id: string) => void;
}

export function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  const isMobile = useIsMobile();

  if (toasts.length === 0) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: '24px',
      ...(isMobile
        ? { left: '12px', right: '12px' }
        : { right: '24px' }
      ),
      display: 'flex',
      flexDirection: 'column',
      alignItems: isMobile ? 'center' : 'flex-end',
      gap: '8px',
      zIndex: 1000,
      pointerEvents: 'none',
    }}>
      {toasts.map(toast => (
        <div key={toast.id} style={{ pointerEvents: 'auto' }}>
          <Toast toast={toast} onDismiss={onDismiss} />
        </div>
      ))}
    </div>
  );
}
