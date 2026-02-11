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
    version: '2.3.0',
    date: '2026-02-11',
    title: 'whatsNew.v230.title',
    items: [
      { emoji: '🔒', text: 'whatsNew.v230.item1' },
      { emoji: '📖', text: 'whatsNew.v230.item2' },
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
