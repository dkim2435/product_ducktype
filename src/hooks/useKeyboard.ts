import { useEffect, useRef, useCallback, useState } from 'react';

interface UseKeyboardOptions {
  onChar: (char: string) => void;
  onSpace: () => void;
  onBackspace: (ctrlKey: boolean) => void;
  onCjkInput: (text: string) => void;
  onTab: () => void;
  onEscape: () => void;
  enabled: boolean;
}

export function useKeyboard({
  onChar,
  onSpace,
  onBackspace,
  onCjkInput,
  onTab,
  onEscape,
  enabled,
}: UseKeyboardOptions) {
  const [isComposing, setIsComposing] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const tabPressedRef = useRef(false);

  const onCharRef = useRef(onChar);
  const onSpaceRef = useRef(onSpace);
  const onBackspaceRef = useRef(onBackspace);
  const onCjkInputRef = useRef(onCjkInput);
  const onTabRef = useRef(onTab);
  const onEscapeRef = useRef(onEscape);

  onCharRef.current = onChar;
  onSpaceRef.current = onSpace;
  onBackspaceRef.current = onBackspace;
  onCjkInputRef.current = onCjkInput;
  onTabRef.current = onTab;
  onEscapeRef.current = onEscape;

  const focusInput = useCallback(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  useEffect(() => {
    const textarea = inputRef.current;
    if (!textarea || !enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // IME guard - keyCode 229 is the generic IME key
      if (e.keyCode === 229) return;

      if (isComposing) return;

      if (e.key === 'Tab') {
        e.preventDefault();
        tabPressedRef.current = true;
        // Wait for potential Enter after Tab
        setTimeout(() => {
          tabPressedRef.current = false;
        }, 500);
        return;
      }

      if (e.key === 'Enter') {
        e.preventDefault();
        if (tabPressedRef.current) {
          tabPressedRef.current = false;
          onTabRef.current();
        }
        return;
      }

      if (e.key === 'Escape') {
        e.preventDefault();
        onEscapeRef.current();
        return;
      }

      if (e.key === 'Backspace') {
        e.preventDefault();
        onBackspaceRef.current(e.ctrlKey || e.metaKey);
        return;
      }

      if (e.key === ' ') {
        e.preventDefault();
        onSpaceRef.current();
        return;
      }

      // Ignore modifier keys alone, function keys, etc.
      if (e.key.length > 1) return;
      if (e.ctrlKey || e.metaKey || e.altKey) return;

      e.preventDefault();
      onCharRef.current(e.key);
    };

    const handleCompositionStart = () => {
      setIsComposing(true);
    };

    const handleCompositionUpdate = () => {
      // Preview: we don't evaluate during composition
    };

    const handleCompositionEnd = (e: CompositionEvent) => {
      setIsComposing(false);
      const text = e.data;
      if (text) {
        onCjkInputRef.current(text);
      }
      // Clear the textarea value after composition
      if (textarea) {
        textarea.value = '';
      }
    };

    const handleInput = (e: Event) => {
      // Clear input value to prevent accumulation
      // But only when not composing (composition handles its own cleanup)
      const inputEvent = e as InputEvent;
      if (!inputEvent.isComposing && textarea) {
        textarea.value = '';
      }
    };

    textarea.addEventListener('keydown', handleKeyDown);
    textarea.addEventListener('compositionstart', handleCompositionStart);
    textarea.addEventListener('compositionupdate', handleCompositionUpdate);
    textarea.addEventListener('compositionend', handleCompositionEnd);
    textarea.addEventListener('input', handleInput);

    return () => {
      textarea.removeEventListener('keydown', handleKeyDown);
      textarea.removeEventListener('compositionstart', handleCompositionStart);
      textarea.removeEventListener('compositionupdate', handleCompositionUpdate);
      textarea.removeEventListener('compositionend', handleCompositionEnd);
      textarea.removeEventListener('input', handleInput);
    };
  }, [enabled, isComposing]);

  return { inputRef, focusInput, isComposing };
}
