import type { LessonDef, LessonId } from '../types/gamification';

export const LESSONS: LessonDef[] = [
  {
    id: 'home-row',
    name: 'Home Row',
    description: 'Master the home row keys',
    targetKeys: ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';'],
    prerequisite: null,
  },
  {
    id: 'top-row',
    name: 'Top Row',
    description: 'Learn the top row keys',
    targetKeys: ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
    prerequisite: 'home-row',
  },
  {
    id: 'bottom-row',
    name: 'Bottom Row',
    description: 'Practice the bottom row keys',
    targetKeys: ['z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.'],
    prerequisite: 'top-row',
  },
  {
    id: 'home-top',
    name: 'Home + Top',
    description: 'Combine home and top rows',
    targetKeys: ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
    prerequisite: 'bottom-row',
  },
  {
    id: 'home-bottom',
    name: 'Home + Bottom',
    description: 'Combine home and bottom rows',
    targetKeys: ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'z', 'x', 'c', 'v', 'b', 'n', 'm'],
    prerequisite: 'home-top',
  },
  {
    id: 'all-alpha',
    name: 'All Letters',
    description: 'All alphabetical keys',
    targetKeys: 'abcdefghijklmnopqrstuvwxyz'.split(''),
    prerequisite: 'home-bottom',
  },
  {
    id: 'number-row',
    name: 'Number Row',
    description: 'Practice the number row',
    targetKeys: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
    prerequisite: 'all-alpha',
  },
  {
    id: 'full-keyboard',
    name: 'Full Keyboard',
    description: 'All keys including numbers and punctuation',
    targetKeys: [...'abcdefghijklmnopqrstuvwxyz'.split(''), '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', ',', '.', ';'],
    prerequisite: 'number-row',
  },
  {
    id: 'weak-keys',
    name: 'Weak Keys',
    description: 'Practice your weakest keys',
    targetKeys: [], // dynamically determined
    prerequisite: null, // always unlocked
  },
];

export function getLessonDef(id: LessonId): LessonDef | undefined {
  return LESSONS.find(l => l.id === id);
}

export const LESSON_WORD_COUNT = 25;
