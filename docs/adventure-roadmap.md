# Adventure Mode Roadmap

## Implementation Status

| Feature | Status | Version |
|---------|--------|---------|
| World 1 — Duck Village (8 stages + boss) | Done | v2.0.0 |
| World 2 — Venom Jungle (9 stages + boss, Poison debuff) | Done | v2.1.0 |
| Multi-world progress system | Done | v2.1.0 |
| Share link system (?world=N) | Done | v2.1.0 |
| Arcade mode (Duck Hunt, Duck Race) | Removed | v2.1.0 |
| World 3 — Misty Harbor | Planned | — |
| World 4~6 | Planned | — |

---

## Completed: World 1 — Duck Village (v2.0.0)
- 8 stages (7 normal + Shadow Wolf boss)
- Free for all users (no login required)
- Minion-based combat, boss shield mechanic
- No debuff (tutorial world)

## Completed: World 2 — Venom Jungle (v2.1.0)
- 9 stages (8 normal + Giant Viper boss)
- **Debuff: Poison** — Player HP decreases by 1/sec during combat
- Free for all users
- Giant Viper boss: 750 HP, 3 phases
- Jungle-themed stage visuals (9 unique themes)

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

### World 6 — The Rift (차원의 틈)
- **Debuff: Reverse** — Words must be typed backwards (e.g., "forest" → "tserof")
- **Theme:** 멀티버스/차원문/뒤틀린 공간
- **Palette:** 보라, 네온 핑크, 시안, 글리치 이펙트
- **Decorations:** 포탈, 뒤틀린 시계, 부유하는 바위, 차원 균열, 별
- **Enemies:** 차원체, 미러 고스트, 글리치 슬라임, 보스: Void Walker
- **Strategy:** 두뇌 풀가동, 단어를 역순으로 파싱하는 연습

---

## Visual Theme per World (Combat Scene)

| World | Background Style | Ground | Ambient FX |
|-------|-----------------|--------|------------|
| 1 Duck Village | 밝은 숲/마을 | 풀밭 | 없음 |
| 2 Venom Jungle | 어두운 정글 | 늪지 | 초록 반투명 오버레이 |
| 3 Misty Harbor | 회색 항구 | 부두/나무판 | 안개 오버레이 |
| 4 Glacier Peak | 얼음 동굴/설산 | 눈/얼음 | 눈 내리는 파티클 |
| 5 Crypt of Shadows | 지하 묘지 | 돌바닥 | 촛불 깜빡임 |
| 6 The Rift | 보라빛 차원 | 부유 플랫폼 | 글리치/네온 깜빡 |

---

## Stage Count per World

| World | Stages | 보스 | 구성 |
|-------|--------|------|------|
| 1 Duck Village | 8 | final 1 | 7 + **FB** |
| 2 Venom Jungle | 9 | final 1 | 8 + **FB** |
| 3 Misty Harbor | 10 | mid 1 + final 1 | 4 + **MB** + 4 + **FB** |
| 4 Glacier Peak | 11 | mid 1 + final 1 | 5 + **MB** + 4 + **FB** |
| 5 Crypt of Shadows | 12 | mid 2 + final 1 | 3 + **MB** + 3 + **MB** + 2 + **FB** |
| 6 The Rift | 13 | mid 2 + final 1 | 4 + **MB** + 3 + **MB** + 2 + **FB** |

> MB = Mid-Boss, FB = Final Boss

---

## Progression & Unlock
- World 1: 누구나 플레이 가능 (비로그인 OK)
- World 2: 무료, 로그인 + World 1 보스 클리어
- World 3: 무료, 타이핑 60초 + 로그인 + 공유링크 + World 2 보스 클리어
- World 4~6: 유료 (이전 월드 보스 클리어 시 순차 해금)
- 각 월드는 **반드시 순서대로** 진행 (월드 건너뛰기 불가)

---

## Monetization (수익화 전략)

### 월드별 접근 구조

| World | 가격 | 조건 |
|-------|------|------|
| 1 Duck Village | **무료** | 없음 |
| 2 Venom Jungle | **무료** | 로그인 + World 1 보스 클리어 |
| 3 Misty Harbor | **무료** | 타이핑 60초 + 로그인 + 공유링크 + World 2 보스 클리어 |
| 4 Glacier Peak | **$1.99** | 로그인 + World 3 클리어 + 결제 |
| 5 Crypt of Shadows | **$1.99** | 로그인 + World 4 클리어 + 결제 |
| 6 The Rift | **$1.99** | 로그인 + World 5 클리어 + 결제 |

### 결제 옵션

1. **개별 월드 구매: $1.99/월드** (World 4~6)
   - 순차 해금만 가능 (다음 월드만 구매 가능, 건너뛰기 불가)

2. **Adventure Pass: $4.99 (일괄 구매)**
   - World 4~6 전체 해금 (개별 구매 대비 $0.98 절약)
   - 진행은 여전히 순차적 (구매 즉시 전부 플레이 불가, 클리어해야 다음 월드 진입)

### 기술 구현 (추후)

- **결제**: Stripe Checkout (one-time payment, no subscription)
- **해금 상태**: Supabase `user_purchases` 테이블
  - `user_id`, `product_id` ('world-4', 'world-5', 'world-6', 'adventure-pass'), `purchased_at`
- **월드 잠금 UI**: 잠긴 월드 클릭 시 해금 조건 + 가격 표시 모달

---

## Priority Order
1. ~~World 2 (Venom Jungle)~~ — Done
2. World 3 (Misty Harbor) — 흥미로운 UX, 신중한 디자인 필요
3. World 4+ — 유저 피드백 기반으로 결정
