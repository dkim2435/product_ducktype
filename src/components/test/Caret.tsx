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

  const baseClass = `absolute pointer-events-none z-10 bg-caret ${smooth ? 'transition-[left,top] duration-[80ms] ease-out' : ''}`;

  const getCaretStyles = (): { className: string; style: React.CSSProperties } => {
    const baseStyle: React.CSSProperties = {
      left: `${left}px`,
      top: `${top}px`,
    };

    switch (style) {
      case 'line':
        return {
          className: `${baseClass} w-0.5 rounded-[1px]`,
          style: { ...baseStyle, height: `${height}px` },
        };
      case 'block':
        return {
          className: `${baseClass} w-[0.6em] opacity-50 rounded-[2px]`,
          style: { ...baseStyle, height: `${height}px` },
        };
      case 'underline':
        return {
          className: `${baseClass} w-[0.6em] h-0.5 rounded-[1px]`,
          style: { ...baseStyle, top: `${top + height - 2}px` },
        };
      case 'outline':
        return {
          className: `${baseClass} w-[0.6em] !bg-transparent border-2 border-caret rounded-[2px]`,
          style: { ...baseStyle, height: `${height}px` },
        };
      default:
        return { className: baseClass, style: baseStyle };
    }
  };

  const caret = getCaretStyles();

  return (
    <div
      className={`${caret.className} ${isBlinking ? 'caret-blink' : ''}`}
      style={caret.style}
    />
  );
}
