import type { WordData } from '../../types/test';

interface WordDisplayProps {
  words: WordData[];
  currentWordIndex: number;
}

function getLetterColor(state: string): string {
  switch (state) {
    case 'correct':
      return 'var(--text-color)';
    case 'incorrect':
      return 'var(--error-color)';
    case 'extra':
      return 'var(--error-extra-color)';
    case 'pending':
    default:
      return 'var(--sub-color)';
  }
}

export function WordDisplay({ words, currentWordIndex }: WordDisplayProps) {
  return (
    <>
      {words.map((word, wordIdx) => {
        const hasError = word.isCompleted &&
          word.letters.some(l => l.state === 'incorrect' || l.state === 'extra');

        return (
          <span
            key={wordIdx}
            data-word={wordIdx}
            style={{
              display: 'inline-block',
              margin: '0 8px 4px 0',
              borderBottom: hasError ? '2px solid var(--error-color)' : 'none',
            }}
          >
            {word.letters.map((letter, letterIdx) => (
              <span
                key={letterIdx}
                data-letter={letterIdx}
                style={{
                  color: getLetterColor(letter.state),
                  transition: 'color 0.1s',
                }}
              >
                {letter.char}
              </span>
            ))}
          </span>
        );
      })}
    </>
  );
}
