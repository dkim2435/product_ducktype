# CLAUDE.md — DuckType 프로젝트 자동화 규칙

## 사용자 소통 규칙 (최우선)

- **한국어로 답변**: 사용자와의 대화는 항상 한국어로 한다.
- **친구처럼 편하게**: 반말 섞어서 친근하게 대화한다. 딱딱한 존댓말 금지.
- **쉽게 설명**: 사용자는 코딩/IT 용어를 잘 모른다. 전문 용어 쓸 때는 꼭 쉬운 말로 풀어서 설명해준다. 단계별로 차근차근.
- **브리핑 필수**: 작업 시작 전에 "이런 걸 할 거야" 간단 브리핑, 작업 끝나면 "이런 걸 했어" 결과 브리핑을 항상 해준다.
- **사이트 설정은 영어**: 사용자가 쓰는 사이트/서비스 설정은 전부 영어로 되어있다. 코드, 커밋, 설정값 등은 영어 기준으로 작업한다.

## 프로젝트 개요
- **DuckType**: 타이핑 속도 테스트 웹앱 (React + TypeScript + Vite)
- **URL**: https://ducktype.xyz
- **현재 버전**: package.json의 `version` 필드 참조
- **호스팅**: Vercel

## 빌드 & 검증
```bash
npm run build    # tsc -b && vite build
npm run lint     # eslint
```

## 커밋 전 자동 체크리스트

코드 변경 후 커밋하기 전에 아래 항목을 자동으로 확인한다. 사용자가 별도로 요청하지 않아도 매번 수행할 것.

### 1. 빌드 검증
- [ ] `npm run build` 성공 확인

### 2. 버전 & 릴리즈 노트 (기능 추가/변경 시)
- [ ] `package.json` → version 범프 (patch: 버그픽스, minor: 기능추가)
- [ ] `src/data/releaseNotes.ts` → 새 버전 항목 추가
- [ ] `src/i18n/en.json` → 릴리즈 노트 번역키 추가
- [ ] `src/i18n/ko.json` → 한국어 번역 추가
- [ ] `src/i18n/zh.json` → 중국어 번역 추가
- [ ] `src/i18n/ja.json` → 일본어 번역 추가

### 3. SEO/GEO 동기화 (사이트 콘텐츠 변경 시)
- [ ] `index.html` → structured data (Schema.org) 최신 상태 확인
- [ ] `index.html` → FAQPage 스키마와 noscript FAQ 섹션 일치 확인
- [ ] `index.html` → WebApplication 스키마의 version이 package.json과 일치 확인
- [ ] `public/sitemap.xml` → 새 페이지 추가 시 URL 추가, lastmod 날짜 업데이트
- [ ] `public/llms.txt` → 주요 기능 변경 시 내용 업데이트
- [ ] `public/robots.txt` → 새 경로 차단/허용 필요 시 업데이트

### 4. Vercel 설정 (새 정적 파일 추가 시)
- [ ] `vercel.json` → rewrite 규칙 추가 (SPA catch-all 위에)
- [ ] `vercel.json` → Content-Type 헤더 추가

### 5. 모바일 호환성 (UI 변경 시)
- [ ] 모바일 조건부 스타일이 데스크톱에 영향 없는지 확인
- [ ] `isMobile` 분기가 있는 컴포넌트에서 두 경로 모두 동작 확인

## 프로젝트 구조 (주요 파일)

```
index.html              # 메인 HTML, Schema.org 구조화 데이터, 메타태그
package.json            # 버전, 의존성
vercel.json             # 라우팅, 헤더, 리다이렉트
public/
  sitemap.xml           # 사이트맵
  robots.txt            # 크롤러 규칙
  llms.txt              # AI 크롤러용 사이트 요약
src/
  App.tsx               # 메인 앱 컴포넌트, 라우팅, 폰트 로딩
  styles/index.css      # 글로벌 스타일
  data/releaseNotes.ts  # 릴리즈 노트 데이터
  i18n/                 # 다국어 번역 (en, ko, zh, ja)
  components/
    adventure/          # 어드벤처 모드 (CombatScene, AdventurePage 등)
    results/            # 결과 화면 (ResultsScreen, WpmChart)
```

## 코딩 규칙
- 한국어 커밋 메시지 OK, 단 커밋 본문은 영어
- 모바일 변경은 반드시 `isMobile` 조건부로 — 데스크톱 영향 금지
- 폰트는 lazy-load: 기본 Roboto Mono만 즉시 로드, 나머지는 선택 시 동적 로드
- chart.js는 React.lazy로 코드 스플릿 유지
- i18n 키 추가 시 4개 언어 모두 동시 업데이트
