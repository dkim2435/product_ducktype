# Adventure Mode Roadmap

## Implementation Status

| Feature | Status | Version |
|---------|--------|---------|
| World 1 — Duck Village (8 stages + boss) | Done | v2.0.0 |
| World 2 — Venom Jungle (9 stages + boss, Poison debuff) | Done | v2.1.0 |
| Multi-world progress system | Done | v2.1.0 |
| Share link system (?world=N) | Done | v2.1.0 |
| Arcade mode (Duck Hunt, Duck Race) | Removed | v2.1.0 |
| Difficulty system (Beginner/Intermediate/Expert) | Done | v2.2.0 |
| Star-based world unlock (star requirements) | Done | v2.2.0 |
| Progressive difficulty unlock (per-stage) | Done | v2.2.0 |
| Mobile optimization (iOS zoom, keyboard, viewport) | Done | v2.2.0 |
| Cloud sync for adventure progress | Done | v2.2.0 |
| Login gate (per-world stage threshold) | Done | v2.2.0 |
| Boss death animation + cinematic ending | Done | v2.3.0 |
| World unlock requirement display (arrow badge) | Done | v2.3.0 |
| World unlock toast notification | Done | v2.3.0 |
| Auto-select highest unlocked difficulty | Done | v2.3.0 |
| Stage card corruption effect (by difficulty unlock) | Done | v2.3.0 |
| Default sound volume 50% | Done | v2.3.0 |
| World-themed map backgrounds | Done | v2.3.0 |
| Poison debuff rebalance (1→0.5 HP/s) | Done | v2.3.0 |
| Login gate delayed visibility | Done | v2.3.0 |
| Stage card pulse/offset bug fix | Done | v2.3.0 |
| Result screen login gate (Next Stage lock) | Done | v2.3.0 |
| Adventure share button (StageComplete) | Done | v2.3.0 |
| Replay XP reduction (1/3 for cleared difficulty) | Done | v2.3.0 |
| Result screen UI (Next Stage full-width, button layout) | Done | v2.3.0 |
| World 3 — Misty Harbor | Planned | — |
| World 4 — Glacier Peak | Planned | — |
| World 5 — Crypt of Shadows | Planned | — |
| World 6 — Sandstorm Citadel | Planned | — |
| World 7 — Volcanic Forge | Planned | — |
| World 8 — Thunder Peaks | Planned | — |
| World 9 — Abyssal Depths | Planned | — |
| World 10 — The Rift (Grand Finale) | Planned | — |

---

## Completed: World 1 — Duck Village (v2.0.0)
- 8 stages (7 normal + Shadow Wolf boss)
- Free for all users (no login required)
- Minion-based combat, boss shield mechanic
- No debuff (tutorial world)
- Shadow Wolf boss: 500 HP, 3 phases (100% → 60% → 25%)
- XP rewards: 10, 15, 20, 25, 30, 35, 40, 75(boss)

## Completed: World 2 — Venom Jungle (v2.1.0)
- 9 stages (8 normal + Giant Viper boss)
- **Debuff: Poison** — Player HP decreases by 0.5/sec during combat
- Free for all users, **login required from Stage 3+** (`loginGateStageId: 3`)
- Giant Viper boss: 750 HP, 3 phases (100% → 55% → 20%)
- XP rewards: 15, 20, 25, 30, 35, 40, 45, 50, 100(boss)
- Jungle-themed stage visuals (9 unique themes)

## Completed: v2.2.0 Systems

### Difficulty System
기존 정확도/HP/WPM 기반 별 시스템을 **난이도 선택 기반**으로 완전 교체.

| Difficulty | Mistype Damage | Stars | XP Multiplier | Color |
|------------|---------------|-------|---------------|-------|
| Beginner | 0 (no penalty) | 1 ★ | 0.5x | Green |
| Intermediate | 2 HP | 2 ★★ | 1.0x | Orange |
| Expert | 4 HP | 3 ★★★ | 1.5x | Red |

- **bestStars**: 해당 스테이지에서 달성한 최고 난이도 기준 (1=Beginner, 2=Intermediate, 3=Expert)
- **난이도 선택 UI**: 전투 인트로 화면에서 3개 버튼 (잠긴 난이도는 🔒 표시)
- **자동 선택**: 해금된 최고 난이도가 기본 선택됨
- 정확도/WPM 통계는 결과 화면에서 계속 표시

#### 순차적 난이도 해금 (v2.3.0)
기존 스테이지별 독립 해금을 **순차적 해금**으로 변경. 월드를 한 난이도로 전부 클리어해야 다음 난이도가 열림.

**Beginner**: 항상 해금 (스테이지 해금만 필요)

**Intermediate 해금 조건** (스테이지 N):
1. 보스를 Beginner로 클리어 (`bossBestStars >= 1`) — 월드 1회차 완료
2. 첫 스테이지면 바로 해금
3. 이후 스테이지: 이전 스테이지(N-1)를 Intermediate로 클리어 (`prevStageBestStars >= 2`)

**Expert 해금 조건** (스테이지 N):
1. 보스를 Intermediate로 클리어 (`bossBestStars >= 2`) — 월드 2회차 완료
2. 첫 스테이지면 바로 해금
3. 이후 스테이지: 이전 스테이지(N-1)를 Expert로 클리어 (`prevStageBestStars >= 3`)

**진행 흐름 예시** (World 1, 8 스테이지):
```
Beginner:     Stage 1 → 2 → 3 → ... → 8(보스) ✅
Intermediate: Stage 1 → 2 → 3 → ... → 8(보스) ✅  (보스 Beginner 클리어 후 해금)
Expert:       Stage 1 → 2 → 3 → ... → 8(보스) ✅  (보스 Intermediate 클리어 후 해금)
```

**구현 위치**: `CombatScene.tsx`의 `isDiffUnlocked()` — `bossBestStars`, `prevStageBestStars` props 사용

### Star-Based World Unlock
- `WorldConfig.starsRequired`: 이전 월드에서 필요한 총 별 수
- World 1 → World 2: 보스 클리어 + **15 ★** 이상 (최대 24개 중)
- 별이 부족하면 WorldMap에 "Need X more ★ from World N" 메시지 표시

### Login Gate System
- `WorldConfig.loginGateStageId?: number`: 해당 스테이지 ID 이상은 로그인 필요
- World 2: Stage 3부터 로그인 필요 (`loginGateStageId: 3`)
- 비로그인 유저: Stage 1~2 플레이 가능, Stage 3+ 클릭 시 로그인 모달
- 시각적 표시: 🔐 아이콘 + "Login to play" + 파란색 테두리
- 이미 클리어한 스테이지는 게이트 무시 (로그아웃해도 클리어 표시 유지)

### Mobile Optimization
- iOS 자동 줌 방지: `maximum-scale=1, user-scalable=no` + textarea `fontSize: 16px`
- 가상 키보드 감지: `useKeyboardHeight()` hook (Visual Viewport API)
- 키보드 열리면 게임 필드 자동 축소 + 스크롤
- `touch-action: manipulation` (더블탭 줌 방지)

### Cloud Sync
- `adventure_progress` 컬럼 Supabase `user_data` 테이블에 추가 (jsonb)
- `useCloudSync.ts`의 `STORAGE_TO_DB`에 매핑 추가
- 로그인 유저는 기기 간 어드벤처 진행 상태 동기화

## Completed: v2.3.0 — Boss Death, Cinematic & Visual Polish

### Boss Death Animation
- 보스 HP 0 도달 시 즉시 Victory 대신 `'boss-death'` 페이즈 진입 (2.5초)
- 보스 이모지: 흔들림(shake) → 축소 → 페이드아웃 애니메이션
- "QUACK!!" 사망 텍스트: 빨간색, 위로 떠오르며 페이드
- 💥 폭발 이펙트 5개 (시간차 등장)
- CSS keyframes: `boss-shake`, `boss-death-text`, `boss-death-explosion`

### Cinematic Victory (Boss Only)
- 보스 스테이지 Victory 시 시네마틱 엔딩 화면
- 검정 배경 → 월드 이모지 → 스토리 텍스트 → Victory 배지 (순차 fade-in)
- `WORLD_VICTORY_CINEMATICS`: 월드별 title/subtitle 메시지
  - W1: "Peace has returned to Duck Village." / "The Shadow Wolf is no more..."
  - W2: "The jungle breathes freely once more." / "The Giant Viper has fallen..."
- 일반 스테이지 Victory는 기존 간단한 화면 유지

### World Unlock Requirements Display
- 월드 맵 오른쪽 화살표 위에 `★ current/required` pill 배지 (잠긴 월드만)
- 다음 월드 잠금 해제 시: 화살표 `main-color`로 밝게 + `pulse` 애니메이션

### World Unlock Toast
- 스테이지 클리어 후 다음 월드가 새로 해금되면 토스트 알림
- `"🗺️ {WorldName} Unlocked! — A new world awaits you!"`

### Auto-Select Highest Difficulty
- 스테이지 인트로 진입 시 해금된 최고 난이도 자동 선택
- Beginner 클리어 → Intermediate 기본, Intermediate 클리어 → Expert 기본

### Stage Card Corruption Effect
월드 맵 스테이지 카드에 **해금된 최고 난이도**에 따른 시각적 "오염" 이펙트:

| Corruption Tier | 조건 | Effect |
|----------------|------|--------|
| Tier 0 | Beginner만 해금 | 없음 (기본 카드) |
| Tier 1 | Intermediate 해금 | 은은한 보라색 radial gradient + 균열 SVG + 보라 테두리 |
| Tier 2 | Expert 해금 | 강한 보라색 다중 gradient + 대형 균열 SVG + inset glow + 보라 외곽 발광 |

- 기준: `bestStars`가 아닌 **난이도 unlock 여부** (`getCorruptionTier()` in `WorldMap.tsx`)
- CombatScene의 `isDiffUnlocked()`과 동일한 로직 (bossBestStars + prevStageBestStars)
- 이펙트가 제일 강한 시점 = Expert가 해금된 스테이지 (실제 Expert 클리어 불필요)
- 보라색 계열 (`rgba(128-180, 0, 255)`) 사용 — 난이도/위험을 시각적으로 표현

### Default Sound Volume
- 기본 볼륨 `0.25` (25%) → `0.5` (50%)로 변경
- 기존 유저: 이미 저장된 설정 사용 (영향 없음)
- 신규 유저: 50%로 시작 — 이전 25%는 소리가 너무 작았음
- 설정 위치: `src/constants/defaults.ts` → `DEFAULT_SETTINGS.soundVolume`

### World-Themed Map Backgrounds
월드 맵 페이지 배경에 월드별 테마 그라데이션 오버레이 적용 — 몰입감 강화.

| World | 배경 스타일 | 색감 |
|-------|-----------|------|
| 1 Duck Village | Sunny, warm glow | 노란/주황 radial gradient (햇살 마을) |
| 2 Venom Jungle | Dark jungle mist | 어두운 초록 radial gradient (정글 습기) |
| Coming Soon | Construction stripes | 대각선 줄무늬 + 어두운 노란 glow (공사중) |

- 구현: `WORLD_BG` record in `WorldMap.tsx` → `position: fixed` overlay div
- 새 월드 추가 시 `WORLD_BG`에 해당 월드 ID + gradient 추가
- Coming Soon 월드는 자동으로 공사중 배경 적용 (별도 설정 불필요)

### Login Gate Delayed Visibility
- 로그인 게이트(`loginGateStageId`) 직전 스테이지를 클리어해야 "Login to play" 표시
- 클리어 전: 게이트 이후 스테이지는 일반 잠금(🔒)으로 표시
- 목적: 아직 거기까지 안 간 유저에게 불필요한 로그인 요구를 보여주지 않음

### Result Screen Login Gate (Next Stage Button)
- 게이트 직전 스테이지 클리어 후 결과 화면의 "Next Stage" 버튼도 로그인 게이트 반영
- 비로그인 유저: "🔒 Next Stage" (반투명, opacity 0.5) + 호버 시 "Login to play" 툴팁
- 클릭 시 로그인 모달 열림 (`onLoginClick`)
- Props: `isNextLoginGated`, `onLoginClick` (StageComplete 컴포넌트)

### Stage Card Pulse/Offset Bug Fix
- `pulse` CSS 애니메이션의 `transform: scale()`이 인라인 `transform: translateX()`를 덮어쓰는 버그
- 다음 플레이 스테이지(isNext)가 중앙으로 밀려나는 현상 발생
- 수정: `translateX` offset을 wrapper div로 분리, `pulse`는 내부 button에만 적용

### Adventure Share Button
- 스테이지 클리어 시 결과 화면에 Share 버튼 추가
- SNS: X(Twitter), KakaoTalk, WhatsApp, Facebook, Reddit + 링크 복사 + Web Share API
- 공유 텍스트 (어드벤처 전용):
  - 일반: `"I cleared {StageName} ({Difficulty}) with {WPM} WPM / {Acc}% accuracy on DuckType Adventure!"`
  - 보스: `"I defeated {BossName} ({Difficulty}) with {WPM} WPM / {Acc}% accuracy on DuckType Adventure! Can you beat it?"`
- 공유 링크: `https://ducktype.xyz/#adventure?world={worldId}`
- **XP 보너스**: 기존 `awardShareBonus()` 사용 — 하루 1회 +35 XP (일반 타이핑 테스트와 공유)
- 미수령 시 Share 버튼 옆에 `+35 XP` 라벨 표시, 공유 후 사라짐

### Replay XP Reduction
- 이미 해당 난이도로 클리어한 스테이지를 다시 깨면 XP가 **1/3**로 감소
- 판정 기준: `stageBestStars >= diffConfig.maxStars` (해당 난이도의 별을 이미 획득)
- 예시 (xpReward=30, Beginner 0.5x):
  - 첫 클리어: `30 × 0.5 = 15 XP`
  - 리플레이: `floor(15 / 3) = 5 XP`
- 목적: XP 파밍 방지, 새로운 난이도/스테이지 도전에 인센티브 부여
- 구현: `useCombat.ts` — `isReplay` 체크 후 `Math.floor(baseXp / 3)`

### Result Screen UI Improvements
- **Next Stage 버튼**: 풀 너비(`width: 100%`), 더 큰 패딩/폰트로 primary CTA 강조
- **버튼 레이아웃**: Next Stage (위, 크게) → [World Map | Retry | Share +XP] (아래, 작게)
- World Map 버튼: Retry와 동일한 스타일 (text-color + sub-color 테두리) 통일

---

## Future: World 3+ Design

### Core Concept: World Debuffs
Each world has a unique debuff (modifier) that applies to ALL stages in that world.
Players must adapt their typing strategy to overcome the debuff.
Debuff is tied to world theme for immersion.

---

### World 3 — Misty Harbor (안개 항구)
- **Debuff: Fog** — Words are partially hidden (random letters replaced with `_`)
- **Theme:** 짙은 안개가 낀 항구/습지
- **Palette:** 회색, 청회색, 탁한 흰색
- **Decorations:** 등대, 갈매기, 닻, 부두, 낡은 배, 안개 오버레이
- **Enemies:** 해적, 바다뱀, 해파리, 보스: Kraken
- **Strategy:** 어휘력 + 추론력 필요, 보이는 글자로 단어 유추

### World 4 — Glacier Peak (빙하 설산)
- **Debuff: Freeze** — After mistyping, input is frozen for 1.5-2 seconds (can't type)
- **Theme:** 빙하/설산/얼음 동굴
- **Palette:** 하늘색, 청백색, 짙은 파랑
- **Decorations:** 얼음 결정, 눈보라, 고드름, 펭귄, 눈덮인 나무
- **Enemies:** 얼음 골렘, 설인, 북극곰, 보스: Frost Dragon
- **Strategy:** 정확도가 핵심, 한 번 실수 = 2초 낭비 = 큰 리스크

### World 5 — Crypt of Shadows (어둠의 지하묘지)
- **Debuff: Darkness** — Words flash visible for a few seconds, then disappear
- **Theme:** 지하 묘지/폐허/카타콤
- **Palette:** 거의 검정, 짙은 회색, 촛불 주황
- **Decorations:** 촛불, 유령, 거미줄, 관, 금이 간 벽, 해골
- **Enemies:** 유령, 스켈레톤, 좀비, 보스: Lich King
- **Strategy:** 기억력 + 속도, 단어가 보일 때 빠르게 외워서 사라진 후 타이핑

### World 6 — Sandstorm Citadel (사막 성채) 🏜️
- **Debuff: Mirage** — Words visually shift/wobble on screen (CSS transform jitter)
- **Theme:** 사막/모래폭풍/고대 성채
- **Palette:** 황금, 주황, 갈색, 모래빛
- **Decorations:** 🏜️🐫🦂🌵☀️🏛️ 모래폭풍 파티클, 열기 왜곡
- **Enemies:** Sand Scorpion, Dust Wraith, Mirage Djinn, 보스: Sandstorm Titan
- **Strategy:** 흔들리는 단어를 정확히 읽어내는 집중력 필요

### World 7 — Volcanic Forge (화산 대장간) 🌋
- **Debuff: Burn** — Timer accelerates over time (words expire faster as combat progresses)
- **Theme:** 용암/화산/대장간
- **Palette:** 붉은 주황, 짙은 빨강, 검정, 용암 노랑
- **Decorations:** 🌋🔥⚒️🪨💎🐉 용암 흐름 애니메이션
- **Enemies:** Lava Golem, Flame Imp, Magma Serpent, 보스: Inferno Dragon
- **Strategy:** 초반에 빠르게 처리하지 않으면 후반 타이머가 극악, 속도가 핵심

### World 8 — Thunder Peaks (번개 산맥) ⚡
- **Debuff: Storm** — Periodic lightning flashes briefly white-out the screen (0.3s every 8-12s)
- **Theme:** 산맥/뇌운/번개
- **Palette:** 어두운 남색, 번개 노랑, 회색 구름
- **Decorations:** ⚡🌩️🦅⛰️🌧️☁️ 번개 플래시 이펙트
- **Enemies:** Storm Hawk, Thunder Elemental, Cloud Giant, 보스: Storm Lord
- **Strategy:** 번개 타이밍을 예측하고 그 사이에 집중 타이핑

### World 9 — Abyssal Depths (심해) 🌊
- **Debuff: Pressure** — Poison + Fog combined (HP drain + partial word hiding)
- **Theme:** 심해/해저/어둠
- **Palette:** 짙은 남색, 검정, 바이올렛, 생물 발광 시안
- **Decorations:** 🌊🐙🦑🫧🐚💀 수압 비네팅 + 거품 파티클
- **Enemies:** Abyssal Angler, Deep Kraken, Pressure Wraith, 보스: Leviathan
- **Strategy:** 두 가지 디버프를 동시에 극복 — 극한의 실력 테스트

### World 10 — The Rift (차원의 틈) 🌀 — Grand Finale
- **Debuff: Reverse** — Words must be typed backwards (e.g., "forest" → "tserof")
- **Theme:** 멀티버스/차원문/뒤틀린 공간 — 모든 월드의 요소가 뒤섞인 최종 결전
- **Palette:** 보라, 네온 핑크, 시안, 글리치 이펙트
- **Decorations:** 🌀🔮⭐💫🕳️✨ 포탈, 뒤틀린 시계, 부유하는 바위, 차원 균열
- **Enemies:** 이전 월드 보스들의 변형체 + 새 적, 보스: **Void Walker** (최종 보스)
- **Strategy:** 두뇌 풀가동, 단어를 역순으로 파싱 — 게임 전체 최종 도전
- **Special:** 최종 보스 클리어 시 특별 엔딩 + "Rift Conqueror" 칭호

---

## Debuff Balancing Guide

디버프 설계 시 반드시 아래 시나리오를 검증할 것:

### 핵심 원칙
> **오타를 하나도 안 내도 디버프만으로 죽으면 안 된다** (특히 Beginner 난이도)

### 검증 체크리스트 (새 월드/디버프 구현 시)
1. **Beginner (오타 데미지 0)**: 디버프만으로 HP가 0이 되는 시간 계산
   - 가장 긴 스테이지 클리어 예상 시간보다 충분히 길어야 함
   - 최소 2배 이상의 여유 권장
2. **Intermediate (오타 데미지 2)**: 오타 10회 + 디버프로 생존 가능한지
3. **Expert (오타 데미지 4)**: 오타 10회 + 디버프로 아슬아슬하지만 가능한지
4. **보스 스테이지**: 보스전은 일반 스테이지보다 길므로 별도 검증

### 사례: World 2 Poison 밸런스 조정
- **기존**: `-1 HP/s` → 100초 만에 독사. Beginner도 느리면 죽음, Intermediate 오타 5회면 사망
- **변경**: `-0.5 HP/s` → 200초 만에 독사. 충분한 여유, 긴장감은 유지

90초 스테이지 기준 밸런스:

| 난이도 | 독 데미지 | 오타 10회 | 합계 | 남은 HP |
|--------|----------|----------|------|---------|
| Beginner | 45 | 0 | 45 | 55 HP |
| Intermediate | 45 | 20 | 65 | 35 HP |
| Expert | 45 | 40 | 85 | 15 HP |

### 월드별 디버프 검증 메모

| World | Debuff | HP 영향 | 검증 포인트 |
|-------|--------|---------|------------|
| 2 Venom Jungle | Poison -0.5/s | 지속 HP 감소 | 200초 이내 클리어 가능한지 |
| 3 Misty Harbor | Fog | 없음 (시각적) | HP 직접 영향 없으나 오타 유발 가능 → 간접 HP 손실 고려 |
| 4 Glacier Peak | Freeze (1.5~2초 입력 불가) | 간접 (timeout 데미지 증가) | 프리즈 중 minion timeout으로 연쇄 사망 방지 |
| 5 Crypt of Shadows | Darkness (단어 사라짐) | 없음 (시각적) | 기억 실패 → 오타/timeout 유발. 사라지기 전 충분한 표시 시간 |
| 6 Sandstorm Citadel | Mirage (글자 흔들림) | 없음 (시각적) | 흔들림이 오타 유발. 난독증 수준이면 안 됨 |
| 7 Volcanic Forge | Burn (타이머 가속) | 간접 (timeout 빨라짐) | 후반 가속이 너무 빠르면 클리어 불가. 상한선 설정 |
| 8 Thunder Peaks | Storm (화면 번쩍임) | 없음 (시각적) | 광과민성 주의 (접근성), 번쩍임 빈도 제한 |
| 9 Abyssal Depths | Pressure (Poison+Fog) | HP 감소 + 시각 | 복합이므로 각각 약하게 (예: Poison 0.3/s + Fog 30%) |
| 10 The Rift | Reverse (역순 타이핑) | 없음 (인지적) | 오타 대폭 증가 예상 → Expert 오타 데미지와 시너지 주의 |

---

## Visual Theme per World (Combat Scene)

| World | Background Style | Ground | Ambient FX |
|-------|-----------------|--------|------------|
| 1 Duck Village | 밝은 숲/마을 | 풀밭 | 없음 |
| 2 Venom Jungle | 어두운 정글 | 늪지 | 초록 반투명 오버레이 |
| 3 Misty Harbor | 회색 항구 | 부두/나무판 | 안개 오버레이 |
| 4 Glacier Peak | 얼음 동굴/설산 | 눈/얼음 | 눈 내리는 파티클 |
| 5 Crypt of Shadows | 지하 묘지 | 돌바닥 | 촛불 깜빡임 |
| 6 Sandstorm Citadel | 사막/성채 | 모래 | 모래폭풍 + 열기 왜곡 |
| 7 Volcanic Forge | 용암/화산 | 암반/용암 | 용암 흐름 + 열기 파티클 |
| 8 Thunder Peaks | 뇌운/산맥 | 바위/절벽 | 번개 플래시 |
| 9 Abyssal Depths | 심해/어둠 | 해저 | 수압 비네팅 + 거품 |
| 10 The Rift | 보라빛 차원 | 부유 플랫폼 | 글리치/네온 + 포탈 |

---

## Stage Count per World

| World | Stages | 보스 | 구성 |
|-------|--------|------|------|
| 1 Duck Village | 8 | final 1 | 7 + **FB** |
| 2 Venom Jungle | 9 | final 1 | 8 + **FB** |
| 3 Misty Harbor | 10 | mid 1 + final 1 | 4 + **MB** + 4 + **FB** |
| 4 Glacier Peak | 11 | mid 1 + final 1 | 5 + **MB** + 4 + **FB** |
| 5 Crypt of Shadows | 12 | mid 2 + final 1 | 3 + **MB** + 3 + **MB** + 2 + **FB** |
| 6 Sandstorm Citadel | 12 | mid 1 + final 1 | 5 + **MB** + 5 + **FB** |
| 7 Volcanic Forge | 13 | mid 2 + final 1 | 4 + **MB** + 3 + **MB** + 2 + **FB** |
| 8 Thunder Peaks | 13 | mid 2 + final 1 | 4 + **MB** + 3 + **MB** + 2 + **FB** |
| 9 Abyssal Depths | 14 | mid 2 + final 1 | 4 + **MB** + 4 + **MB** + 2 + **FB** |
| 10 The Rift | 15 | mid 3 + final 1 | 3 + **MB** + 3 + **MB** + 3 + **MB** + 2 + **FB** |

> MB = Mid-Boss, FB = Final Boss

---

## Progression & Unlock
- World 1: 누구나 플레이 가능 (비로그인 OK)
- World 2: 무료, World 1 보스 클리어 + 15 ★ 이상, **Stage 3부터 로그인 필요**
- World 3: 무료, 타이핑 60초 + 로그인 + 공유링크 + World 2 보스 클리어
- World 4~10: 유료 (이전 월드 보스 클리어 시 순차 해금)
- 각 월드는 **반드시 순서대로** 진행 (월드 건너뛰기 불가)
- 난이도도 순차 해금: Beginner 클리어 → Intermediate, Intermediate 클리어 → Expert (스테이지별)

---

## Monetization (수익화 전략)

### 월드별 접근 구조

| World | 가격 | 조건 |
|-------|------|------|
| 1 Duck Village | **무료** | 없음 |
| 2 Venom Jungle | **무료** | World 1 보스 클리어 + 15★, Stage 3+ 로그인 필요 |
| 3 Misty Harbor | **무료** | 타이핑 60초 + 로그인 + 공유링크 + World 2 보스 클리어 |
| 4 Glacier Peak | **$1.99** | 로그인 + World 3 클리어 + 결제 |
| 5 Crypt of Shadows | **$1.99** | 로그인 + World 4 클리어 + 결제 |
| 6 Sandstorm Citadel | **$1.99** | 로그인 + World 5 클리어 + 결제 |
| 7 Volcanic Forge | **$1.99** | 로그인 + World 6 클리어 + 결제 |
| 8 Thunder Peaks | **$1.99** | 로그인 + World 7 클리어 + 결제 |
| 9 Abyssal Depths | **$1.99** | 로그인 + World 8 클리어 + 결제 |
| 10 The Rift | **$1.99** | 로그인 + World 9 클리어 + 결제 |

### 결제 옵션

1. **개별 월드 구매: $1.99/월드** (World 4~10)
   - 순차 해금만 가능 (다음 월드만 구매 가능, 건너뛰기 불가)

2. **Adventure Pass: $9.99 (일괄 구매)**
   - World 4~10 전체 해금 (7개 월드, 개별 구매 대비 $3.94 절약)
   - 진행은 여전히 순차적 (구매 즉시 전부 플레이 불가, 클리어해야 다음 월드 진입)

### 기술 구현 (추후)

- **결제**: Stripe Checkout (one-time payment, no subscription)
- **해금 상태**: Supabase `user_purchases` 테이블
  - `user_id`, `product_id` ('world-4' ~ 'world-10', 'adventure-pass'), `purchased_at`
- **월드 잠금 UI**: 잠긴 월드 클릭 시 해금 조건 + 가격 표시 모달

---

## Priority Order
1. ~~World 2 (Venom Jungle)~~ — Done
2. World 3 (Misty Harbor) — Fog debuff, 흥미로운 UX, 신중한 디자인 필요
3. World 4 (Glacier Peak) — Freeze debuff, 정확도 중심
4. World 5 (Crypt of Shadows) — Darkness debuff, 기억력 테스트
5. World 6 (Sandstorm Citadel) — Mirage debuff, 집중력 테스트
6. World 7 (Volcanic Forge) — Burn debuff, 가속 타이머
7. World 8 (Thunder Peaks) — Storm debuff, 번개 플래시
8. World 9 (Abyssal Depths) — Pressure debuff (Poison+Fog), 복합 난이도
9. World 10 (The Rift) — Reverse debuff, 최종 보스, 그랜드 피날레

> World 3 이후는 유저 피드백 + 리텐션 데이터 기반으로 개발 우선순위 조정

---

## Key Files Reference

| File | Role |
|------|------|
| `src/types/adventure.ts` | 타입 정의 (DifficultyLevel, WorldConfig, CombatState, StageResult 등) |
| `src/constants/adventure.ts` | 월드/스테이지/적/보스/난이도 상수, 데미지 공식, WORLDS 배열 |
| `src/hooks/useAdventure.ts` | 멀티월드 진행 상태, 스테이지 해금, 월드 해금, localStorage 마이그레이션 |
| `src/hooks/useCombat.ts` | 전투 게임 루프 (requestAnimationFrame), 난이도별 오타 데미지, Poison tick |
| `src/hooks/useVisualViewport.ts` | 모바일 가상 키보드 높이 감지 (Visual Viewport API) |
| `src/hooks/useCloudSync.ts` | Supabase 클라우드 동기화 (adventure_progress 포함) |
| `src/components/adventure/AdventurePage.tsx` | 어드벤처 메인 페이지 (map/combat/result 뷰 전환) |
| `src/components/adventure/WorldMap.tsx` | 월드 맵 UI (스테이지 카드, 월드 네비, 공유, 로그인 게이트) |
| `src/components/adventure/CombatScene.tsx` | 전투 UI (인트로/난이도선택/전투/승리/패배, 월드별 테마) |
| `src/components/adventure/StageComplete.tsx` | 스테이지 결과 화면 (별/난이도/통계 표시) |

### DB Schema (Supabase)

```sql
-- user_data 테이블에 adventure_progress 컬럼
ALTER TABLE user_data ADD COLUMN adventure_progress jsonb DEFAULT '{}';
```

`adventure_progress` 구조:
```json
{
  "worlds": {
    "1": {
      "stages": {
        "1": { "stageId": 1, "bestStars": 2, "bestWpm": 45, "bestAccuracy": 92, "clearedAt": 1700000000, "attempts": 3 }
      },
      "totalXpEarned": 150
    }
  }
}
