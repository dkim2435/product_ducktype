import { forwardRef } from 'react';

interface HiddenInputProps {
  onFocus?: () => void;
  onBlur?: () => void;
}

export const HiddenInput = forwardRef<HTMLTextAreaElement, HiddenInputProps>(
  ({ onFocus, onBlur }, ref) => {
    return (
      <textarea
        ref={ref}
        style={{
          position: 'absolute',
          opacity: 0,
          width: '1px',
          height: '1px',
          top: 0,
          left: 0,
          padding: 0,
          border: 'none',
          outline: 'none',
          resize: 'none',
          overflow: 'hidden',
          fontSize: '16px', // Prevents iOS auto-zoom on focus
          // Must NOT be display:none — that prevents IME from working
          pointerEvents: 'none',
        }}
        autoCapitalize="off"
        autoComplete="off"
        autoCorrect="off"
        spellCheck={false}
        tabIndex={-1}
        onFocus={onFocus}
        onBlur={onBlur}
        aria-label="Typing input"
      />
    );
  }
);

HiddenInput.displayName = 'HiddenInput';
