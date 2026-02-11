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
    version: '2.5.0',
    date: '2026-02-11',
    title: 'whatsNew.v250.title',
    items: [
      { emoji: '💾', text: 'whatsNew.v250.item1' },
      { emoji: '🔥', text: 'whatsNew.v250.item2' },
      { emoji: '🖱️', text: 'whatsNew.v250.item3' },
      { emoji: '🐛', text: 'whatsNew.v250.item4' },
    ],
  },
  {
    version: '2.4.0',
    date: '2026-02-11',
    title: 'whatsNew.v240.title',
    items: [
      { emoji: '🕹️', text: 'whatsNew.v240.item1' },
      { emoji: '🔒', text: 'whatsNew.v240.item2' },
      { emoji: '📖', text: 'whatsNew.v240.item3' },
    ],
  },
  {
    version: '2.2.0',
    date: '2026-02-11',
    title: 'whatsNew.v220.title',
    items: [
      { emoji: '\uD83C\uDFC1', text: 'whatsNew.v220.item1' },
      { emoji: '\uD83D\uDCCB', text: 'whatsNew.v220.item2' },
    ],
  },
];
