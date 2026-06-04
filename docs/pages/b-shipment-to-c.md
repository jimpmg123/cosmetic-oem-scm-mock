# B — C 창고 출하 등록

**역할:** B Admin (주), B Staff (제한)  
**예정 경로:** `/operations/shipments` (기존 mock 확장)  
**목적:** 생산한 완제품을 C로 보냈다고 **수량·출하 건**으로 기록 → C 입고·A 대사와 연결.

---

## 1. 목록

| 컬럼 | 설명 |
|------|------|
| 출하 번호 | SHP-* |
| 자재 묶음 / SKU | |
| 출하일 | |
| 수량 | |
| 연결 지시 | DIR-* (optional) |
| C 입고 | received / pending |
| 차이 | discrepancy badge |
| 상태 | in_transit · receiving · closed |

**필터:** 묶음 · 기간 · 미입고만

**액션:** `+ 출하 등록`

---

## 2. 출하 등록 폼

| 필드 | 타입 | 필수 |
|------|------|------|
| 자재 묶음 | select | ✓ |
| 출하일 | date | ✓ |
| 수량 | number | ✓ |
| (연결) 기간 지시 | select optional | |
| 메모 | textarea | |
| (v2) 박스/팔레트 수 | number | |

**검증 (출하 상한):**

`누적 shipped + 본건 ≤ 누적 (produced − defect)` — **qcSample은 상한에서 제외** (PO 확정).

초과 시 경고; Admin override + comment (v2).

**저장 후:** C 모바일 inbound 목록에 `receiving` 상태로 노출.

---

## 3. 상세 (read)

- 출하 정보
- C receiving 링크
- B 일별 일지 (해당 기간) 링크 — 출하 근거 추적

---

## 4. 연계

- [c-mobile-receiving.md](./c-mobile-receiving.md) — C 입고
- [reconciliation-yield.md](./reconciliation-yield.md) — B↔C
