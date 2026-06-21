# Production Tracking

화장품 **위탁생산(A → B → C)** 구간에서 물량·달성도·수율·대사를 한 화면에서 보는 **웹 어드민 UI 목업**입니다.  
NetSuite 위탁생산 + FBA 입고 대사 개념을 사내 ERP/Operations 형태로 시연하기 위한 프로토타입이며, **백엔드·DB 없이** `src/lib/mock/` 정적 데이터와 클라이언트 계산으로 동작합니다.

---

## GitHub 저장소 설정 (복사용)

| 항목 | 권장 내용 |
|------|-----------|
| **Repository name** | `production-tracking` |
| **Description (EN)** | Next.js UI mock for cosmetic OEM flow (Brand A → Manufacturer B → Warehouse C): material bundles, C-verified yield vs grant, E2E, reconciliation. |
| **Description (KO)** | 화장품 위탁생산 A→B→C 물량 추적·수율(C검증)·E2E·대사 UI 목업 (Next.js, TypeScript) |

대안 이름: `cosmetic-oem-scm-mock`, `ab-material-flow-tracking`

**Topics (선택):** `nextjs`, `typescript`, `scm`, `mockup`, `cosmetics`, `supply-chain`, `dashboard`

---

## 무엇을 다루나

| 역할 | 소속 | 하는 일 |
|------|------|---------|
| Super / Hyper Admin | A (브랜드) | 자재 묶음·기간 지시·원자재 출하·대사·마감 |
| B Admin / Staff | B (위탁 생산) | 생산 일지·완제품 출하·입고 확인 |
| Warehouse | C (창고) | 모바일 입고·QR 스캔(mock) |

### 핵심 도메인

- **Material Bundle (자재 묶음)** — A가 B에 보낸 생산 가능 분량, 목표, grant(발송 기준), 사용 기한
- **Period Directive (기간 지시)** — “~일까지 y개” 식의 기간별 목표·코멘트
- **제품 카탈로그** — 브랜드 라인·제품·BOM·위탁사(B) 필터
- **재료 요청** — A 통지 출하, B 생산 배치, B 단품 보충

### 지표 용어 (앱·문서 통일)

| 용어 | 의미 | 계산 (요약) |
|------|------|-------------|
| **수율** | A 발송(grant) 대비 **C가 검증한 입고** — B 주장 생산 아님 | `C입고 ÷ grant` (마감 후) |
| **E2E** | A **목표** 대비 C 입고 (End-to-End) — **수율이라 부르지 않음** | `C입고 ÷ 목표` (마감 후) |
| **달성도** | 진행 중 “얼마나 왔나” | 예: `C입고 ÷ 목표`, `생산 ÷ 목표` |
| **로스 여유** | 출하·BOM 산출 시 grant 여유 % | 수율과 별개 |

상세: [`docs/domain/yield-and-progress.md`](docs/domain/yield-and-progress.md) · 에이전트용: [`docs/agent/agent-context.md`](docs/agent/agent-context.md)

---

## 주요 화면

- 대시보드 · **생산·입고 현황** · 자재 묶음 · 생산 캘린더 · 일별 생산 일지
- **대사** (B↔C 입고, 기간 지시 달성, 묶음 수율·E2E)
- **카탈로그** (라인·제품·위탁사) · A 통지 출하 · B 재료 요청
- C 모바일: 입고 목록 · QR 스캔(mock) · 입고 확인

상단 **역할 스위처**로 메뉴·권한을 전환해 데모합니다.

---

## 기술 스택

- **Next.js 15** (App Router) · **React 19** · **TypeScript**
- **Tailwind CSS 4** · Radix UI · Material Symbols
- Mock 데이터: `src/lib/mock/` · i18n: `src/lib/i18n/`

---

## 시작하기

### 요구 사항

- Node.js 20+
- npm

### 설치 및 실행

```bash
git clone https://github.com/jimpmg123/cosmetic-oem-scm-mock.git
cd production-tracking
npm install
npm run dev
```

브라우저: **http://localhost:3000**

`Internal Server Error (500)` 이 나오면 dev 서버를 모두 종료한 뒤:

```bash
npm run dev:clean
```

### 주요 URL

| URL | 설명 |
|-----|------|
| `/dashboard` | 대시보드 |
| `/operations/yield-overview` | 생산·입고 현황 |
| `/operations/material-bundles` | 자재 묶음 |
| `/operations/production-calendar` | 생산 캘린더 (B 회사 필터) |
| `/operations/catalog` | 통합 카탈로그 |
| `/operations/reconciliation` | 대사 |
| `/m` | C 창고 모바일 UI |

### 스크립트

| 명령 | 설명 |
|------|------|
| `npm run dev` | 개발 서버 (카탈로그 이미지 sync 포함) |
| `npm run build` | 프로덕션 빌드 |
| `npm run lint` | ESLint |
| `npm run sync:catalog-images` | `test_images/` → `public/catalog/` 복사 |

---

## 프로젝트 구조

```
production-tracking/
├── docs/                    # 기획·화면·도메인 문서
│   ├── PROJECT.md           # 프로젝트 개요
│   └── domain/              # 수율·묶음·흐름 정의
├── src/
│   ├── app/
│   │   ├── (desktop)/       # A/B Admin + ERP (사이드바)
│   │   └── m/               # C Warehouse 모바일
│   ├── components/          # UI·묶음·카탈로그 컴포넌트
│   └── lib/
│       ├── mock/            # Mock 데이터·수율/E2E 계산
│       └── i18n/            # ko / en / zh
├── test_data/               # 시드 JSON (제품·위탁사 등)
├── test_images/             # 카탈로그 이미지 원본
└── scripts/                 # 이미지 sync 등
```

---

## Mock 데이터

- 위탁사 3곳: `test_data/cosmetic_manufacturers_json/`
- 브랜드·제품·BOM: `test_data/cosmetic_ingredients_json/` (Lumiara, Verdena, Aevora 등)
- 자재 묶음·지시·일지: `src/lib/mock/material-bundles.ts` 등

예시 묶음 `MB-2026-001`: 목표 1,000 · grant 1,100 · Yunhua BioLab

---

## 문서

| 문서 | 내용 |
|------|------|
| [`docs/PROJECT.md`](docs/PROJECT.md) | 목적·역할·로드맵 |
| [`docs/domain/yield-and-progress.md`](docs/domain/yield-and-progress.md) | 수율 · E2E · 달성도 |
| [`docs/pages/`](docs/pages/) | 화면별 스펙 |
| [`docs/README.md`](docs/README.md) | 문서 인덱스 |

---

## 현재 상태

- UI·플로우 **목업 / PoC** 단계
- 인증·실 DB·API·NetSuite 연동 **미구현**
- 수치·회사명은 데모용이며 실제 생산 데이터가 아님

---

## 라이선스

Private / 내부용 프로젝트로 공개 시 조직 정책에 맞는 라이선스를 추가하세요. (현재 저장소에 LICENSE 파일 없음)
