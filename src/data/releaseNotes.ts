export interface ReleaseNoteItem {
  emoji: string;
  text: string; // i18n key
}

export interface ReleaseNote {
  version: string;
  date: string;
  title: string; // i18n key
  items: ReleaseNoteItem[];
}

// Newest first — add new releases at the top
export const releaseNotes: ReleaseNote[] = [
  {
    version: '2.6.3',
    date: '2026-02-18',
    title: 'whatsNew.v263.title',
    items: [
      { emoji: '🔧', text: 'whatsNew.v263.item1' },
      { emoji: '🇩🇪', text: 'whatsNew.v263.item2' },
      { emoji: '⏱️', text: 'whatsNew.v263.item3' },
    ],
  },
  {
    version: '2.6.2',
    date: '2026-02-17',
    title: 'whatsNew.v262.title',
    items: [
      { emoji: '♿', text: 'whatsNew.v262.item1' },
      { emoji: '🔒', text: 'whatsNew.v262.item2' },
      { emoji: '📱', text: 'whatsNew.v262.item3' },
    ],
  },
  {
    version: '2.6.1',
    date: '2026-02-16',
    title: 'whatsNew.v261.title',
    items: [
      { emoji: '🏆', text: 'whatsNew.v261.item1' },
      { emoji: '🏅', text: 'whatsNew.v261.item2' },
    ],
  },
  {
    version: '2.6.0',
    date: '2026-02-16',
    title: 'whatsNew.v260.title',
    items: [
      { emoji: '📅', text: 'whatsNew.v260.item1' },
      { emoji: '🔥', text: 'whatsNew.v260.item2' },
      { emoji: '🎯', text: 'whatsNew.v260.item3' },
      { emoji: '✨', text: 'whatsNew.v260.item4' },
    ],
  },
  {
    version: '2.5.1',
    date: '2026-02-14',
    title: 'whatsNew.v251.title',
    items: [
      { emoji: '\uD83D\uDD04', text: 'whatsNew.v251.item1' },
    ],
  },
  {
    version: '2.5.0',
    date: '2026-02-12',
    title: 'whatsNew.v250.title',
    items: [
      { emoji: '\u26A1', text: 'whatsNew.v250.item1' },
      { emoji: '\uD83D\uDCC2', text: 'whatsNew.v250.item2' },
      { emoji: '\uD83E\uDDE9', text: 'whatsNew.v250.item3' },
    ],
  },
  {
    version: '2.4.0',
    date: '2026-02-12',
    title: 'whatsNew.v240.title',
    items: [
      { emoji: '📝', text: 'whatsNew.v240.item1' },
      { emoji: '🔍', text: 'whatsNew.v240.item2' },
    ],
  },
  {
    version: '2.3.0',
    date: '2026-02-12',
    title: 'whatsNew.v230.title',
    items: [
      { emoji: '🐤', text: 'whatsNew.v230.item1' },
      { emoji: '🎭', text: 'whatsNew.v230.item2' },
      { emoji: '💜', text: 'whatsNew.v230.item3' },
    ],
  },
  {
    version: '2.2.0',
    date: '2026-02-12',
    title: 'whatsNew.v220.title',
    items: [
      { emoji: '📈', text: 'whatsNew.v220.item1' },
    ],
  },
  {
    version: '2.1.1',
    date: '2026-02-12',
    title: 'whatsNew.v211.title',
    items: [
      { emoji: '📱', text: 'whatsNew.v211.item1' },
      { emoji: '⌨️', text: 'whatsNew.v211.item2' },
      { emoji: '🎮', text: 'whatsNew.v211.item3' },
    ],
  },
  {
    version: '2.1.0',
    date: '2026-02-12',
    title: 'whatsNew.v210.title',
    items: [
      { emoji: '⚡', text: 'whatsNew.v210.item1' },
      { emoji: '⌨️', text: 'whatsNew.v210.item2' },
    ],
  },
  {
    version: '2.0.0',
    date: '2026-02-12',
    title: 'whatsNew.v200.title',
    items: [
      { emoji: '⚔️', text: 'whatsNew.v200.item1' },
      { emoji: '🌿', text: 'whatsNew.v200.item2' },
      { emoji: '🗺️', text: 'whatsNew.v200.item3' },
      { emoji: '💀', text: 'whatsNew.v200.item4' },
      { emoji: '🎬', text: 'whatsNew.v200.item5' },
      { emoji: '🎮', text: 'whatsNew.v200.item6' },
      { emoji: '📢', text: 'whatsNew.v200.item7' },
    ],
  },
];
