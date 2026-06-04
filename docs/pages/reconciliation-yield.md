# A — 대사 · 수율 (Reconciliation & Yield)

**역할:** Super Admin, B Admin (read)  
**예정 경로:** `/operations/reconciliation` (확장)  
**목적:** **B 주장 vs C 입고** + **자재 묶음 최종 수율** (소진·마감 시).

---

## 1. 화면 구조 (탭)

| 탭 | 내용 |
|----|------|
| B ↔ C 입고 | 기존 Expected vs Located (출하 단위) |
| 묶음 최종 수율 | Material Bundle 단위 누적 |
| 기간 지시 달성 | Directive met/missed |

---

## 2. 탭: B ↔ C 입고

### 테이블 (Shipment 단위)

| 컬럼 | 설명 |
|------|------|
| 출하 번호 | |
| 묶음 / SKU | |
| B 발송 | shippedQty |
| C 입고 | receivedQty |
| 차이 | discrepancy |
| Action | Required / OK |

### 필터

- 묶음 · 기간 · discrepancy ≠ 0

---

## 3. 탭: 묶음 최종 수율

### 테이블 (Bundle 단위)

| 컬럼 | 설명 |
|------|------|
| 묶음 | |
| 생산 가능 수량 | `theoreticalQty` |
| A 목표 | targetQty |
| B 누적 생산 | producedTotal |
| B → C 발송 | shippedToCTotal |
| **C 입고** | receivedAtCTotal |
| A 발송 기준 (grant) | `grantQty` (로스 포함) |
| **마감 수율** | `producedTotal / grantQty` — 마감 후만 |
| **E2E yield** | `receivedAtCTotal / targetQty` — 마감 후만 |
| Material yield (BOM) | `receivedAtCTotal / theoreticalQty` |
| 상태 | active / depleted / closed |

### 상세 드릴다운

- 일별 생산 sparkline (B calendar 데이터)
- Directive 달성 이력
- 타임라인: 출하 → 지시들 → 입고들

### 마감 조건 (depleted)

- A가 “자재 소진” 표시 또는 produced + scrap이 theoretical 도달
- `closed` 시 수율 **스냅샷** 고정 (이후 수정은 audit)

---

## 4. 탭: 기간 지시 달성

| 컬럼 | 설명 |
|------|------|
| 지시 | DIR-* · 링크 **기간 분석** (A only) |
| 마감일 | |
| 목표 y | |
| metric | **received** (입고) |
| 생산 / 출하 / 입고 | 기간 내 3합 |
| 달성 | **입고** vs y — met / missed |
| QC 누적 | ΣqcSample · QC율 |
| Comment | 전문 |

**A 전용 그래프:** [a-directive-period-analytics.md](./a-directive-period-analytics.md) — 이 탭과 **동일 집계**.

---

## 5. 액션 (A)

- Investigation case 생성 (v2)
- B/C에 코멘트 요청 (v2)
- 묶음 마감 승인

---

## 6. 지표 정의 (화면 툴팁)

| 지표 | 식 |
|------|-----|
| **마감 수율** | `producedTotal / grantQty` (예: 1000/1100) |
| **로스율** | `(grantQty - producedTotal) / grantQty` |
| **QC yield** | `qcSampleTotal / (producedTotal + qcSampleTotal)` |
| Inbound discrepancy | `receivedAtCTotal - shippedToCTotal` (출하 합 기준) |
| End-to-end yield | `receivedAtCTotal / targetQty` (마감 후) |
| Material yield (BOM) | `receivedAtCTotal / theoreticalQty` |
| Directive 달성 | 기간 내 생산 또는 입고 vs `y` — **수율 아님** |

상세: [yield-and-progress.md](../domain/yield-and-progress.md)
