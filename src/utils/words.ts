import wordsEn from '../data/words-en.json';

const wordLists: Record<string, string[]> = {
  en: wordsEn,
};

let loadedLists: Record<string, string[]> = {};

export async function loadWordList(language: string): Promise<string[]> {
  if (wordLists[language]) return wordLists[language];
  if (loadedLists[language]) return loadedLists[language];

  try {
    let module: { default: string[] };
    switch (language) {
      case 'ko':
        module = await import('../data/words-ko.json');
        break;
      case 'zh':
        module = await import('../data/words-zh.json');
        break;
      case 'ja':
        module = await import('../data/words-ja.json');
        break;
      default:
        module = await import('../data/words-en.json');
    }
    loadedLists[language] = module.default;
    return module.default;
  } catch {
    return wordsEn;
  }
}

export function getWordListSync(language: string): string[] {
  return wordLists[language] || loadedLists[language] || wordsEn;
}

/**
 * Fisher-Yates shuffle
 */
function shuffle<T>(arr: T[]): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Generate a list of words for the typing test
 */
export function generateWords(
  language: string,
  count: number,
  options?: { punctuation?: boolean; numbers?: boolean }
): string[] {
  const wordList = getWordListSync(language);
  const words: string[] = [];

  while (words.length < count) {
    const shuffled = shuffle(wordList);
    words.push(...shuffled);
  }

  let result = words.slice(0, count);

  if (options?.punctuation) {
    result = addPunctuation(result);
  }

  if (options?.numbers) {
    result = addNumbers(result);
  }

  return result;
}

function addPunctuation(words: string[]): string[] {
  const punctuationMarks = ['.', ',', '!', '?', ';', ':'];
  return words.map((word, i) => {
    const rand = Math.random();
    if (rand < 0.1 && i > 0) {
      // Capitalize
      word = word.charAt(0).toUpperCase() + word.slice(1);
    }
    if (rand < 0.15 && i < words.length - 1) {
      // Add trailing punctuation
      const mark = punctuationMarks[Math.floor(Math.random() * punctuationMarks.length)];
      word = word + mark;
    }
    if (rand > 0.95 && word.length > 2) {
      // Wrap in quotes
      word = '"' + word + '"';
    }
    return word;
  });
}

function addNumbers(words: string[]): string[] {
  return words.map(word => {
    if (Math.random() < 0.1) {
      return String(Math.floor(Math.random() * 1000));
    }
    return word;
  });
}
