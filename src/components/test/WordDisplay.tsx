import { memo } from 'react';
import type { WordData } from '../../types/test';

interface WordDisplayProps {
  words: WordData[];
  currentWordIndex: number;
}

const Letter = memo(function Letter({ char, state }: { char: string; state: string }) {
  return (
    <span
      className={`letter letter--${state} transition-colors duration-100`}
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
      className={`inline-block mr-2 mb-1 ${hasError ? 'border-b-2 border-error' : ''}`}
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
