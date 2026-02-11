import type { GhostDef } from '../types/duckRace';

export const GHOST_DUCKS: GhostDef[] = [
  { id: 'waddles',    name: 'Waddles',      emoji: '\uD83D\uDC25', personality: 'Slow and steady',    baseWpm: 40  },
  { id: 'puddles',    name: 'Puddles',      emoji: '\uD83E\uDD86', personality: 'Casual cruiser',     baseWpm: 60  },
  { id: 'prof-quack', name: 'Prof. Quack',  emoji: '\uD83E\uDDA9', personality: 'The analyst',        baseWpm: 70  },
  { id: 'quacker',    name: 'Quacker',      emoji: '\uD83D\uDC24', personality: 'Focused competitor', baseWpm: 80  },
  { id: 'zippy',      name: 'Zippy',        emoji: '\u26A1',       personality: 'Burst typist',       baseWpm: 90  },
  { id: 'feathers',   name: 'Feathers',     emoji: '\uD83E\uDDA2', personality: 'Speed demon',        baseWpm: 100 },
  { id: 'turbo',      name: 'Turbo',        emoji: '\uD83D\uDC26', personality: 'Elite racer',        baseWpm: 120 },
  { id: 'blitz',      name: 'Blitz',        emoji: '\uD83E\uDD85', personality: 'The legend',         baseWpm: 140 },
];
