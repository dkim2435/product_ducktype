# DuckType — Unlock System & Monetization Reference

> Internal dev reference. Last updated: 2026-02-13

---

## Level-Based Unlock Table

All items unlock at specific player levels. Admin (userId `d9496186-...`) bypasses all level checks (effective level = 100).

### Themes

| Lv | Theme |
|----|-------|
| 1 | DuckType Dark |
| 1 | DuckType Light |
| 1 | Duck Pond |
| 3 | Rubber Duck |
| 6 | Monokai |
| 10 | Dracula |
| 14 | Nord |
| 18 | Solarized Dark |
| 22 | Gruvbox Dark |
| 27 | Tokyo Night |
| 32 | Catppuccin Mocha |
| 37 | One Dark |
| 42 | Rose Pine |
| 47 | Ayu Dark |
| 52 | Material |
| 55 | Ocean |
| 58 | Midnight |
| 62 | Sakura |
| 65 | Forest |

### Caret Styles

| Lv | Style |
|----|-------|
| 1 | line |
| 5 | block |
| 12 | underline |
| 22 | outline |

### Fonts

| Lv | Font |
|----|------|
| 1 | Default |
| 1 | Monospace |
| 8 | Roboto Mono |
| 20 | Fira Code |
| 35 | Source Code Pro |

### Sound Themes

| Lv | Sound |
|----|-------|
| 1 | Default |
| 3 | Typewriter |
| 7 | Mechanical |
| 12 | Bubble |
| 18 | Laser |
| 25 | Piano |
| 35 | Retro |
| 50 | Crystal |

### Profile Frames

| Lv | Frame | Visual |
|----|-------|--------|
| 1 | None | — |
| 5 | Basic | 2px solid border |
| 15 | Bronze | Bronze border + glow |
| 30 | Silver | Silver border + glow |
| 50 | Gold | Gold border + pulse animation |
| 70 | Diamond | Prism border + sparkle animation |

### Typing Particles

| Lv | Tier | Count | Colors |
|----|------|-------|--------|
| 1 | None | 0 | — |
| 8 | Basic Sparks | 2 | Gray/silver |
| 20 | Colorful | 3 | Theme accent color |
| 40 | Gold | 4 | Gold tones + glow |
| 60 | Rainbow | 6 | 7-color rainbow + glow |

### Adventure Mode

| Lv | Unlock |
|----|--------|
| 15 | Expert difficulty (requires stars AND Lv.15) |

---

## Premium / Monetization (COMING SOON)

5 Neon sets, each containing **theme + profile frame + typing particles**. Currently locked for all users (admin only). Tagged with `premium: true` and `premiumSet` identifier in code.

### Neon Cyber Set
- **Set ID**: `neon-cyber`
- **Accent**: Hot pink `#ff2d95` + electric blue `#00d4ff`
- **Theme**: Dark blue-black bg, hot pink main, ice blue caret
- **Frame**: Pink neon border + pulse glow animation
- **Particles**: 5 count, pink/blue mix, glow enabled

### Neon Synthwave Set
- **Set ID**: `neon-synthwave`
- **Accent**: Electric orange `#ff6e27` + vivid purple `#a83cff`
- **Theme**: Deep purple bg, orange main, purple caret
- **Frame**: Orange neon border + pulse glow animation
- **Particles**: 5 count, orange/purple mix, glow enabled

### Neon Toxic Set
- **Set ID**: `neon-toxic`
- **Accent**: Neon green `#39ff14`
- **Theme**: Near-black bg, neon green main/caret
- **Frame**: Green neon border + flicker animation
- **Particles**: 5 count, green tones, glow enabled

### Neon Aurora Set
- **Set ID**: `neon-aurora`
- **Accent**: Bright cyan `#00fff5`
- **Theme**: Dark ocean bg, cyan main, blue-cyan caret
- **Frame**: Cyan neon border + pulse glow animation
- **Particles**: 5 count, cyan/teal mix, glow enabled

### Neon Sunset Set
- **Set ID**: `neon-sunset`
- **Accent**: Neon pink `#ff4f81` + amber `#ffaa00`
- **Theme**: Dark burgundy bg, neon pink main, amber caret
- **Frame**: Pink neon border + pulse glow animation
- **Particles**: 5 count, pink/amber mix, glow enabled

### Premium Implementation Details

- **Lock check**: `isAdminUser(userId)` — not level-based
- **UI**: Neon glow text-shadow on names, "COMING SOON" / "SOON" badge, 75% opacity when locked
- **Validation**: `settingsValidation.ts` resets premium items to defaults for non-admin users
- **Sections**: Premium items shown in separate "Premium" / "Premium Sets" subsections in settings

### Monetization TODO

- [ ] Payment integration (Stripe / etc.)
- [ ] User purchase state storage (Supabase)
- [ ] Replace `isAdminUser` check with `hasPurchasedSet(userId, setId)`
- [ ] Set bundle purchase UI
- [ ] Individual item vs full set pricing
- [ ] Receipt / unlock confirmation flow

---

## Code Locations

| What | File |
|------|------|
| Caret/font unlock maps | `src/constants/defaults.ts` |
| Theme definitions + levels | `src/constants/themes.ts` |
| Sound theme definitions | `src/constants/sounds.ts` |
| Profile frame definitions | `src/constants/profileFrames.ts` |
| Particle tier definitions | `src/constants/particles.ts` |
| Settings types (ProfileFrame, ParticleTier) | `src/types/settings.ts` |
| Theme type (premium fields) | `src/types/theme.ts` |
| Admin check / effective level | `src/utils/admin.ts` |
| Settings validation + fallback | `src/utils/settingsValidation.ts` |
| Theme picker UI | `src/components/settings/ThemePicker.tsx` |
| Settings modal UI | `src/components/settings/SettingsModal.tsx` |
| Frame rendering | `src/components/pages/Profile.tsx` |
| Particle rendering | `src/components/test/TypingParticles.tsx` |
| Frame CSS animations | `src/styles/index.css` |
| Expert difficulty gate | `src/components/adventure/CombatScene.tsx` |
