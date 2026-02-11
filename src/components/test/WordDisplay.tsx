import { memo } from 'react';
import type { WordData } from '../../types/test';

interface WordDisplayProps {
  words: WordData[];
  currentWordIndex: number;
}

const Letter = memo(function Letter({ char, state }: { char: string; state: string }) {
  return (
    <span
      className={`letter letter--${state}`}
      style={{ transition: 'color 0.1s' }}
    >
      {char}
    </span>
  );
});

const Word = memo(function Word({
  word,
  wordIdx,
}: {
  word: WordData;
  wordIdx: number;
}) {
  const hasError = word.isCompleted &&
    word.letters.some(l => l.state === 'incorrect' || l.state === 'extra');

  return (
    <span
      data-word={wordIdx}
      style={{
        display: 'inline-block',
        margin: '0 8px 4px 0',
        borderBottom: hasError ? '2px solid var(--error-color)' : 'none',
      }}
    >
      {word.letters.map((letter, letterIdx) => (
        <Letter
          key={letterIdx}
          char={letter.char}
          state={letter.state}
        />
      ))}
    </span>
  );
});

export function WordDisplay({ words, currentWordIndex }: WordDisplayProps) {
  return (
    <>
      {words.map((word, wordIdx) => (
        <Word
          key={wordIdx}
          word={word}
          wordIdx={wordIdx}
        />
      ))}
    </>
  );
}
