# Production Tracking — 프로젝트 가이드

## 1. 목적

한국 A업체(발주·원자재) → 중국 B업체(생산) → C창고(입고) 간 화장품 위탁생산에서 **수율·수량을 3자가 맞춰 보는** private 웹 어드민.

- A: 원자재 출하·WO 발행 (예: 1200분 출하, 1100개 생산 지시)
- B: 생산 완료 수량 입력, 창고 발송
- C: 입고 수량 확인 (모바일 웹 + QR 스캔 UI)
- A 관리자: 출하 / B 생산 / C 입고 **한 WO에서 대사**

NetSuite Outsourced Manufacturing + Amazon FBA Inbound Reconciliation 개념을 **앱 내 ERP + Operations** 로 제공한다.

## 2. 현재 산출물 — UI Mockup

- 전체 어드민 화면 (~18–22)
- `lib/mock/` TypeScript 정적 데이터
- 역할 switcher로 demo (Super Admin / B Admin / B Staff / Warehouse)
- 클라이언트 yield·discrepancy 계산 (표시용)
- 로컬 `npm run dev` 로 stakeholder demo

비주얼 디자인(색·폰트·spacing)은 `docs/DESIGN.md` 또는 Stitch AI에서 별도 관리한다.

## 3. 역할

| 역할 | 소속 | 주요 행위 |
|------|------|-----------|
| Super/Hyper Admin | A | WO/PO, 자재출하, 대사 승인, B Admin 계정 |
| Admin | B | WO 확인, Staff 입력 검토, 창고 발송 |
| 일반업무 | B | WO별 생산 수량·스크랩 입력 |
| Warehouse | C | 입고 확인, QR 스캔, discrepancy 처리 |

## 4. 핵심 업무 흐름

1. **A** — WO 생성 → PO(위탁) → 원자재 Transfer 기록
2. **B** — WO 착수 확인(1클릭) → 생산 수량 입력 → Shipment to C
3. **C** — QR 스캔(mock) → Receiving 수량 입력
4. **A** — Reconciliation: Expected vs Located, Action Required

### 수율 지표 (표시)

| 지표 | 계산 |
|------|------|
| Production yield | B claimed / WO target |
| Inbound discrepancy | C received − B shipped |
| End-to-end yield | C received / WO target |
| Material yield | C received / A 출하 환산량 |

## 4.1 현재 mock vs 목표 도메인

### 지금 앱이 하는 일 (단일 사이클)

현재 mockup은 대략 **WO 1건 = 한 바퀴** 로 묶여 있다.

| 단계 | 앱에서의 표현 | 비고 |
|------|----------------|------|
| A 목표 + 환산 출하 | `WorkOrder.targetQty`, `materialShipQty` | “n개 만들 분” + 이론 환산 |
| B 생산 주장 | `bClaimedQty`, Production Entry | WO 단위 입력 |
| B → C 발송 | `bShippedQty`, Inbound Shipment | 출하 1건 중심 |
| C 입고 확인 | `cReceivedQty`, `/m/receiving/[id]` | 실제 개수 입력 |
| 대사 | Dashboard, Reconciliation | B 출하 vs C 입고, 수율 KPI |

**아직 없는 것:** 최대 사용 기한, “x월 x일까지 y개 C로” 같은 **기간별 지시를 여러 번** 내리는 흐름, **자재 소진까지 누적**한 **최종 수율 마감**, **여러 자재 묶음 동시 진행**.

### 목표 방향 (제품 로드맵)

- 수량 추적은 **② 완제품 개수 중심** + **A·B·C 3자 대사** (지금과 동일한 축).
- 여기에 다음만 **얹는** 그림으로 본다.
  - **Material Bundle (자재 묶음 / 캠페인)** — A가 B에 보낸 생산 가능 수량(Theoretical Output) 패키지 + 목표 + **최대 기한**
  - **Period Directive (기간별 생산·출하 지시)** — 마감일·목표 y·C 출하 요청·**comment** (명절·블프 등)
  - **자재 소진·묶음 마감** 시점의 **누적 최종 수율** (기간 지시 달성과 별도)

상세 엔티티·수식: [domain/material-bundles-and-flow.md](./domain/material-bundles-and-flow.md)

### 다음 모델링 시 핵심 엔티티 (4+1)

구현·DB 설계 시 최소 단위는 아래 네 가지 (+ 출하/입고 이벤트).

#### 1. Material Bundle — 자재 묶음 (Material grant)

A가 B에 **한 번 넘기는** 생산 단위. 여러 묶음이 **동시에 active** 일 수 있다.

| 개념 | 설명 |
|------|------|
| 생산 가능 수량 (`theoreticalQty`) | Theoretical Output — BOM 기준 이 자재로 만들 수 있는 완제품 수 (EN: Theo. Output · ZH: 可生产数量) |
| 목표 (`targetQty`) | A가 기대하는 완제품 수 (≤ n) |
| 최대 기한 (`useByDate`) | 이 기간 안에 자재 사용·생산을 마칠 것 |
| A 출하 | 묶음 생성·Transfer·`shippedAt` (v2: 원자재 라인) |
| 누적 | `producedTotal`, `shippedToCTotal`, `receivedAtCTotal` — **소진/마감 때 최종 수율** |

**화면:** [pages/a-material-bundles.md](./pages/a-material-bundles.md)

#### 2. Period Directive — 기간별 생산·출하 지시

**한 묶음**에 대해 A가 반복 발행: “**x월 x일까지 y개** 생산·(필요 시) C로 출하”.

| 개념 | 설명 |
|------|------|
| `dueDate` | 마감일 |
| `targetQty` (y) | 해당 기간 목표 개수 |
| C 출하 요구 | 생산만 vs 마감까지 C 발송 완료 |
| `comment` | B·A 공유 맥락 (춘절, 블프, 라인 가동 등) — **UI 필수** |
| 달성 | 기간 내 B 생산/출하 vs y → met / missed |

**화면:** [pages/a-period-directives.md](./pages/a-period-directives.md)

#### 3. B production & shipment claim

B가 **실제로 했다**고 시스템에 남기는 주장. WO 1건이 아니라 **묶음 + 날짜/출하**에 쌓인다.

| 하위 | 설명 |
|------|------|
| **Daily production** | 일별 생산 개수·스크랩 (캘린더·주간 그래프 입력) |
| **Shipment claim** | C로 보낸 수량·출하 번호 (기존 Inbound Shipment 확장) |
| Directive 연계 | (선택) 어느 지시 기간에 포함되는지 |

**화면:** [pages/b-production-calendar.md](./pages/b-production-calendar.md) · 출하는 기존 shipment 플로우 확장

#### 4. C receiving

C가 **받은 개수**를 확인. B 출하 주장과 **대사**한다.

| 개념 | 설명 |
|------|------|
| `receivedQty` | 실제 입고 수량 (모바일 입력) |
| Discrepancy | `received − shipped` (B↔C) |
| Rollup | 묶음의 `receivedAtCTotal` 갱신 → **E2E / Material yield** |

**화면:** [pages/c-mobile-receiving.md](./pages/c-mobile-receiving.md) (기존 `/m/*`)

#### (+) Reconciliation & 최종 수율

- **기간:** Directive y vs 기간 실적.
- **출하:** B shipped vs C received.
- **묶음 마감:** target/theoretical vs **누적 C 입고** (자재 소진 후 최종).

**화면:** [pages/reconciliation-yield.md](./pages/reconciliation-yield.md)

### WO와의 관계 (마이그레이션)

| 옵션 | 설명 |
|------|------|
| A | `WorkOrder` = `MaterialBundle` 1:1 로 이름만 확장 |
| B | WO는 ERP 문서, Bundle은 Operations 추적 단위 (권장 중장기) |

현재 코드의 `WorkOrder` 필드는 목표 도표의 Bundle·Directive가 채워 나갈 **임시 단일 사이클** 표현이다.

## 5. UI 구조

### Desktop Admin — `(app)/`

A Super Admin, B Admin, ERP. 사이드바 + **표·필터·상세 패널** 중심.

**Operations**

- Dashboard
- Production Orders (WO 요약)
- Material Shipments (A 기록, B read-only + 착수 확인)
- Production Entry
- Inbound Receiving (데스크톱 조회)
- Reconciliation / Discrepancies

**ERP (NetSuite형)**

- Work Orders / Purchase Orders
- Bills of Materials / Item Master
- Inventory / Assembly Builds
- Transfers

**Administration**

- Users & Roles
- Companies
- Settings / Audit log

### Mobile Web — `/m/`

C Warehouse 전용. 큰 터치 타겟, 단순 플로우.

| 경로 | 화면 |
|------|------|
| `/m` | Inbound Shipment 목록 |
| `/m/receiving/scan` | QR 스캔 UI (mock tap → Shipment 매칭) |
| `/m/receiving/[id]` | 입고 수량 확인 |
| `/m/discrepancy/[id]` | 차이 처리 |

## 6. 화면 목록 (mockup)

### A — Super Admin

Executive Dashboard · WO List/Detail · PO List/Detail · Material Transfer · Reconciliation · Investigation Case · Users · Settings

### B — Admin / Staff

B Dashboard · WO 착수 확인 · Production Review · Shipment Create · Production Entry · Entry History

### C — Mobile

Inbound Queue · QR Scan · Receiving · Discrepancy

### ERP

Item Master · BOM · Inventory · Assembly Build · Audit Log

## 7. Demo 시나리오 (고정 데이터)

| 항목 | 값 |
|------|-----|
| WO | #2026-001 |
| SKU | Hydrating Serum 50ml |
| 목표 | 1,100 |
| A 원자재 출하(환산) | 1,200 |
| B 생산 (claimed) | 1,095 |
| B → C 발송 | 1,095 |
| C 입고 (received) | 1,088 |
| 입고 차이 | −7 |
| End-to-end yield | 98.9% |

## 8. 기술 스택

- Next.js (App Router) + TypeScript + Tailwind + shadcn/ui
- Mock: `lib/mock/*.ts`
- Desktop: `app/(desktop)/`
- Mobile: `app/m/`

## 9. 문서 구조 (`docs/`)

**읽는 순서:** `PROJECT.md` (본문) → `domain/` (용어·흐름) → `pages/` (화면별 UI).

| 폴더 | 용도 | 예 |
|------|------|-----|
| `PROJECT.md` | 제품 목적·역할·**현재 vs 목표**·엔티티 요약 | 본 문서 §4.1 |
| `domain/` | 기능이 아닌 **비즈니스 개념** — 여러 화면에 걸침 | material-bundles-and-flow.md |
| `pages/` | **화면(창) 단위** — 표·그래프·입력·접기 UX | b-production-calendar.md |

**페이지별 vs 기능별?**

- **화면 구현·Figma·라우트** 작업 → **`pages/` (페이지별)** 가 낫다. “이 URL에 뭐 넣지?”를 나중에 그대로 열 수 있다.
- **한 기능이 여러 화면**에 나뉘면 (예: Period Directive = A 발행 폼 + B 캘린더 상단 카드) → **`domain/`에 개념 정의**, `pages/`에서는 링크만.
- **기능별 단일 md** (예: `comment-feature.md`)는 도메인이 한 화면에만 있을 때만 쓰고, 지금 규모에서는 `pages/a-period-directives.md`에 comment 섹션으로 두는 편이 중복이 적다.

정리: **도메인 = `domain/`, 창 UI = `pages/`** 하이브리드. 자세한 규칙: [README.md](./README.md#documentation-layout).

### 화면 스펙 인덱스

| 문서 | 내용 |
|------|------|
| [pages/SCREEN-INVENTORY.md](./pages/SCREEN-INVENTORY.md) | **전체 창 목록** (A/B/C) |
| [pages/README.md](./pages/README.md) | 화면별 스펙 인덱스 |
| [pages/WORKSHOP-2026-06-03.md](./pages/WORKSHOP-2026-06-03.md) | **A/B/C 워크숍 합의** (화면·입력 v1) |
| [pages/b-daily-production-log.md](./pages/b-daily-production-log.md) | B 일별 일지 (핵심 입력) |
| [domain/material-bundles-and-flow.md](./domain/material-bundles-and-flow.md) | 엔티티·동시 처리·수율 |
| [pages/b-production-calendar.md](./pages/b-production-calendar.md) | B 캘린더·그래프·일별 입력 |
| [pages/a-period-directives.md](./pages/a-period-directives.md) | A 지시 + comment |
| [pages/a-directive-period-analytics.md](./pages/a-directive-period-analytics.md) | A 전용 기간 실적 그래프 |

**PO 확정 (지표):** 지시 달성 = **기간 내 C 입고 ≥ y** · QC율 = **QC / (생산 + QC)**

## 10. 작업 순서

1. `docs/PROJECT.md` (본 문서)
2. Next.js scaffold + shadcn
3. App shell — Desktop sidebar + Mobile bottom nav
4. 역할 switcher + mock data (`WO#2026-001`)
5. Operations 테이블 화면
6. ERP 테이블 화면
7. C 모바일 QR·입고 플로우
8. README (실행 방법)

### 11. Mock Store (인터랙티브 demo)

DB/API 없이 **React Context** (`MockStoreProvider`)로 세션 동안 추가·삭제·저장이 반영됩니다.

- `/erp/work-orders` — WO 추가·삭제
- `/operations/production` — 생산 기록 추가·삭제 → WO claimed qty 갱신
- `/m/receiving/[id]` — 입고 저장 → WO received qty 갱신

### 12. i18n & 용어 tooltip

- 우측 상단 **언어**: 한국어 / 中文 / English
- **WO, SKU** 등 용어에 마우스 올리면 설명 표시 (`TermLabel`)

### 13. Stitch (선택)

C 모바일·QR 화면 시각안은 Stitch MOBILE 프로젝트로 생성 후 코드 반영.
