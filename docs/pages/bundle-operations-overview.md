# A/B — 다건 자재 묶음 진행 요약 (Operations Overview)

**역할:** A Super Admin (확장 Dashboard) · B Admin (담당 묶음)  
**예정 경로:** `/dashboard` (A) · `/operations/bundles` (B)  
**목적:** **여러 자재 묶음을 동시에** 한 화면에서 진행·지시·입고 상태 파악.

---

## 1. A — Executive / Dashboard 확장

### KPI (4~6)

| KPI | 설명 |
|-----|------|
| Active 묶음 | N건 |
| 이번 주 Directive 마감 | D-3 이내 건수 |
| B↔C 미해결 차이 | discrepancy > 0 |
| 평균 주간 생산 | B 일별 합 / active 묶음 |
| (선택) 전체 E2E yield | weighted |

### 차트 (선택, v2)

- Stacked bar: 묶음별 **주간 C 입고**
- Line: 누적 received / target

### 메인 테이블 — Active 묶음만

| 컬럼 | 설명 |
|------|------|
| 묶음 | 번호 + SKU |
| 목표 / 입고 | `targetQty` / `receivedAtCTotal` |
| 진행 % | progress bar |
| 다음 마감 | 가장 가까운 Directive dueDate + y |
| 최근 comment | directive 1줄 |
| 상태 | active / at risk (기한 <7일 & 진행 <50%) |

**행 액션:** 상세 · 지시 발행 · 대사

### 위젯 — “지시 comment 주의”

comment 키워드 또는 `priority` 플래그 있는 directive 목록 (명절·블프).

---

## 2. B — 담당 묶음 보드

### 카드 그리드 (active 묶음당 1카드)

| 카드 필드 | 내용 |
|-----------|------|
| SKU · 묶음 번호 | |
| A 목표 / 내 누적 생산 | |
| use-by | D-day |
| **다음 지시** | dueDate, y, **comment 2줄** |
| C 출하 잔여 | directive 기준 |
| CTA | `일지 작성` → [daily-log](./b-daily-production-log.md) · `출하 등록` → [shipments](./b-shipment-to-c.md) · `상세` → `/operations/bundles/[id]` |

### 하단 링크

- `생산 캘린더` (전체 통합 보기)
- `지시 전체` (read-only)

---

## 3. 동시 처리 UX 원칙

- **한 WO에 묶이지 않음** — 목록은 항상 **묶음 ID** 기준.
- 필터: SKU, 상태, vendor — **여러 active 동시 표시**가 기본.
- 알림 센터 (v2): directive 마감 D-1, B↔C mismatch.

---

## 4. 현재 mock `dashboard` 와 매핑

| 현재 | 목표 |
|------|------|
| `workOrders[0]` 단일 KPI | active **bundles[]** 집계 |
| WO 테이블 | Material Bundle 테이블 |
| pending receiving | 묶음별 shipment 합 |
