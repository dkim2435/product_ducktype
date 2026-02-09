import type { CaretStyle } from '../../types/settings';

interface CaretProps {
  left: number;
  top: number;
  height: number;
  style: CaretStyle;
  smooth: boolean;
  isBlinking: boolean;
  visible: boolean;
}

export function Caret({ left, top, height, style, smooth, isBlinking, visible }: CaretProps) {
  if (!visible) return null;

  const getCaretStyles = (): React.CSSProperties => {
    const base: React.CSSProperties = {
      position: 'absolute',
      pointerEvents: 'none',
      zIndex: 10,
      left: `${left}px`,
      top: `${top}px`,
      transition: smooth ? 'left 80ms ease-out, top 80ms ease-out' : 'none',
      backgroundColor: 'var(--caret-color)',
    };

    switch (style) {
      case 'line':
        return {
          ...base,
          width: '2px',
          height: `${height}px`,
          borderRadius: '1px',
        };
      case 'block':
        return {
          ...base,
          width: '0.6em',
          height: `${height}px`,
          opacity: 0.5,
          borderRadius: '2px',
        };
      case 'underline':
        return {
          ...base,
          width: '0.6em',
          height: '2px',
          top: `${top + height - 2}px`,
          borderRadius: '1px',
        };
      case 'outline':
        return {
          ...base,
          width: '0.6em',
          height: `${height}px`,
          backgroundColor: 'transparent',
          border: '2px solid var(--caret-color)',
          borderRadius: '2px',
        };
      default:
        return base;
    }
  };

  return (
    <div
      className={isBlinking ? 'caret-blink' : ''}
      style={getCaretStyles()}
    />
  );
}
