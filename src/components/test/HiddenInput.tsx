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
        className="absolute opacity-0 w-px h-px top-0 left-0 p-0 border-none outline-none resize-none overflow-hidden text-base pointer-events-none"
        // Must NOT be display:none — that prevents IME from working
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
