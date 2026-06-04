# 도메인: 자재 묶음 · 기간 지시 · 3자 대사

구현 전 공통 용어. 화면별 UI는 `docs/pages/` 참고.

## 1. 핵심 엔티티

### Material Bundle (자재 묶음)

A가 B에 **한 번 보내는** 원자재 패키지. 동시에 여러 묶음이 **진행 중**일 수 있음.

| 필드 (개념) | 설명 |
|-------------|------|
| `id` / 번호 | 예: `MB-2026-003` |
| `sku` / 완제품 | 이 묶음으로 만드는 SKU |
| `theoreticalQty` | **생산 가능 수량** (Theoretical Output / 可生产数量) — BOM 기준 이 자재로 만들 수 있는 완제품 수 |
| `targetQty` | A가 기대하는 목표 완제품 개수 (≤ `theoreticalQty`) |
| `useByDate` | **최대 사용·생산 기한** (자재 소진·마감 목표) |
| `status` | `planned` · `active` · `depleted` · `closed` |
| `shippedAt` | A → B 출하 완료 시점 |
| `materialLines` | (선택) 출하 원자재 라인 — 감사용, v2 |

**누적 실적** (시스템 계산):

- `producedTotal` — B가 기록한 생산 합계
- `shippedToCTotal` — B가 C로 발송 주장 합계
- `receivedAtCTotal` — C 입고 확인 합계

### Period Directive (기간별 생산·출하 지시)

A가 **특정 자재 묶음**에 대해 내리는 “이 기간까지 y개 만들고 C로 보내라” 지시. 한 묶음에 **여러 지시**가 시간순으로 쌓임.

| 필드 | 설명 |
|------|------|
| `bundleId` | 대상 자재 묶음 |
| `dueDate` | 마감일 (x월 x일) |
| `targetQty` | 해당 기간 목표 개수 (y) — **출하 또는 입고** 기준 |
| `achievementMetric` | v1: **`received` (입고) 고정** — 기간 내 C 입고 ≥ y. `shipped`·`produced`는 참고 KPI |
| `comment` | **자유 텍스트** — 명절·블프·수요 변동 등 맥락 |
| `status` | `draft` · `issued` · `in_progress` · `met` · `missed` · `cancelled` |
| `issuedAt` / `issuedBy` | A 발행 메타 |

### Daily Production Log (B 일별 생산 일지)

B Staff/Admin이 **날짜 × 자재 묶음** 단위로 **매일** 제출. 상세 UI: [pages/b-daily-production-log.md](../pages/b-daily-production-log.md).

| 필드 | 설명 |
|------|------|
| `date` | 작업일 (기본 오늘) |
| `bundleId` | 귀속 자재 묶음 (A 사용 기간 내) |
| `producedQty` | 오늘 **완제품 생산** (QC 샘플 **미포함**) |
| `defectQty` | 오늘 불량 수량 |
| `qcSampleQty` | 오늘 QC 샘플 — **생산과 분리** · 출하 상한 **미포함** · 수율·QC율 **표시용** |
| `materialUsage[]` | 오늘 사용 원재료 (품목·수량·단위·LOT) |
| `note` | 비고 |
| `attachments[]` | 사진/파일 (mock: 메타만) |
| `status` | draft · submitted · approved |

**조회 전용:** 캘린더 히트맵·주간 그래프는 `producedQty` 등을 집계 — [pages/b-production-calendar.md](../pages/b-production-calendar.md).

### Material Receipt (B 원자재 입고 확인)

B Admin이 A 출하 대비 **실수령 수량**을 확정. 생산 일지와 **분리**.

| 규칙 | 설명 |
|------|------|
| 타이밍 | 도착 직후가 아니어도 됨 — **이후 입력** |
| 수정 | **언제든** 가능 · **수정 시 comment 필수** |
| Audit | `MaterialReceiptAudit` — create/update 이력 |
| vs B2 | 입고 확인 **전**에도 일지 허용 → **at_risk** |

상세: [pages/b-material-receipt.md](../pages/b-material-receipt.md).

### Shipment to C / C Receiving

기존 mock의 `InboundShipment`와 동일 계열. **지시(directive)** 와 연결 가능.

- B: 발송 수량 주장
- C: 실제 입고 수량 확인 → **B↔C discrepancy**

## 2. 동시 처리 (여러 자재 묶음)

- A/B/C 화면 모두 **활성 묶음 목록**을 기본 컨텍스트로 둠 (필터·탭·사이드 패널).
- 각 묶음은 **독립 ledger**: 지시·일별 생산·출하·입고가 묶음 ID로 묶임.
- 대시보드 KPI는 **전체 합** + **묶음별 드릴다운**.

```
A ──출하──► MB-001 (Serum, target 1100, use-by 2026-09-30)  ─┐
A ──출하──► MB-002 (Toner,  target 800,  use-by 2026-08-15)  ├── 동시 active
A ──출하──► MB-003 (Cream,  target 500,  use-by 2026-12-01)  ─┘
         │
         ├── Directive: ~6/10까지 300개 + comment "블프 대비"
         ├── Directive: ~7/01까지 200개 + comment "명절 전후 라인 조정"
         └── …
B ──일별 생산──► calendar / graph (묶음별 또는 통합 보기)
B ──출하──► C ──입고 확인──► Reconciliation
```

## 3. 수율·대사 (두 축)

| 축 | 비교 | 시점 |
|----|------|------|
| **기간 달성** | Directive `targetQty` vs 기간 내 **`shipped` 또는 `received`** (지시 `achievementMetric`) · 생산은 참고 | 지시 마감마다 |
| **B ↔ C** | B 출하 주장 vs C `received` | 출하·입고마다 |
| **최종 (묶음)** | `theoreticalQty` 또는 `targetQty` vs `receivedAtCTotal` (또는 `producedTotal`) | `depleted` / `closed` |

**Material yield (최종):**  
`receivedAtCTotal / theoreticalQty` (또는 A가 정한 `targetQty` 기준 variant).

**QC yield (표시):**  
`qcSampleTotal / (producedTotal + qcSampleTotal)` — QC는 생산 수에서 분리, 출하 상한에는 미포함.

## 4. 역할별 주요 화면 (인덱스)

**전체 목록:** [pages/SCREEN-INVENTORY.md](../pages/SCREEN-INVENTORY.md)

| 경로 (예정) | 문서 |
|-------------|------|
| A — 자재 묶음 목록·상세 | [a-material-bundles.md](../pages/a-material-bundles.md) |
| A — 기간별 지시 발행 | [a-period-directives.md](../pages/a-period-directives.md) |
| A — **기간 지시 실적 그래프** (A only) | [a-directive-period-analytics.md](../pages/a-directive-period-analytics.md) |
| B — **일별 생산 일지** | [b-daily-production-log.md](../pages/b-daily-production-log.md) |
| B — 생산 캘린더·그래프 (조회) | [b-production-calendar.md](../pages/b-production-calendar.md) |
| B — C 출하 | [b-shipment-to-c.md](../pages/b-shipment-to-c.md) |
| A/B — 묶음 진행 요약 | [bundle-operations-overview.md](../pages/bundle-operations-overview.md) |
| A — 최종 수율·대사 | [reconciliation-yield.md](../pages/reconciliation-yield.md) |
| C — 입고 (기존 모바일) | [c-mobile-receiving.md](../pages/c-mobile-receiving.md) |

## 5. 현재 mockup과의 차이

| 현재 | 목표 |
|------|------|
| WO 1건 중심 | **Material Bundle** 다건·동시 active |
| 단일 생산 Entry 폼 | **일별 일지** + 캘린더·그래프 조회 |
| 지시·comment 없음 | **Period Directive + comment** |
| Material ship 환산 1줄 | 묶음별 theoretical / target / use-by |

마이그레이션 시 `WorkOrder`를 `MaterialBundle`의 별칭으로 두거나, WO = Bundle 1:1로 매핑해도 됨.
