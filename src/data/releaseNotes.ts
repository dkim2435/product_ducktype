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
