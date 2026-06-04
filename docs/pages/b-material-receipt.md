# B — 원자재 입고 확인 (Material Receipt / Transit)

**역할:** B Admin (주), B Staff는 수량 확인 보조  
**예정 경로:** `/operations/material-receipt`  
**목적:** A 출하 수량 vs B **실수령** 대조 → **A→B transit loss** 기록. 일별 일지와 분리.

**워크숍:** [WORKSHOP-2026-06-03.md](./WORKSHOP-2026-06-03.md) — B7 v1 신규.

---

## 1. 레이아웃

```
┌─────────────────────────────────────────────────────────┐
│ 헤더: 원자재 입고 확인 · 묶음 select                        │
├─────────────────────────────────────────────────────────┤
│ A 출하 요약 (read-only): 출하일 · 환산/라인 요약 · SHP/MB 번호 │
├─────────────────────────────────────────────────────────┤
│ 확인 테이블 (v1: 3~5행 mock 또는 1총량)                     │
│  [ 전량 일치 ]  [ 차이 있음 → 사유 ]                        │
├─────────────────────────────────────────────────────────┤
│ 상태: pending · matched · disputed                         │
└─────────────────────────────────────────────────────────┘
```

---

## 2. 필드

| 필드 | 타입 | 필수 |
|------|------|------|
| bundleId | select | ✓ |
| A 출하 참조 | read-only | 출하일, materialShipQty 또는 lines |
| B 확인 수량 | number (총량 v1) | ✓ |
| 차이 사유 | select + 메모 | 차이 시 |
| 첨부 | file (v1.1) | 선택 |

**v2:** BOM 라인별 수량, LOT, 스캔.

---

## 3. 규칙

### 3.1 생산 일지 vs 입고 확인 (at_risk)

- **입고 확인(B7) 전에도 B2 일별 일지 제출 가능.**  
  막으면 → 원자재 **실물 카운트 전에 생산이 끝나는** 날에 Staff가 **작성 불가** (종이/엑셀만 남음).
- 확인 **전**: B1/B2에 `원자재 미확인` 배너 — **at_risk** (오류 아님).
- 확인 **후**: `transitGap = A_shipped − B_confirmed` → A3b 이송 탭·A6 · at_risk 해제.

### 3.2 입력 시점 · 수정

| 규칙 | 설명 |
|------|------|
| **최초 입력** | 묶음 도착 직후가 아니어도 됨 — **이후 언제든** B Admin이 확정 수량 입력 가능 |
| **수정** | **언제든** 수량·사유 변경 가능 (closed 묶음 제외 — v2 정책) |
| **수정 시 comment** | **필수** — 왜 바꿨는지 (오입력, 재계량, A 출하 정정 반영 등) |
| **Audit log** | 모든 create / update마다 **이력 행** 남김 (아래 §4) |

최초 저장도 “첫 확정”이므로 comment **권장**; **수정은 comment block** (빈 값 저장 불가).

### 3.3 B8

손실 상세·다중 사진은 v1.1 (v1은 인라인 사유 + audit).

---

## 4. A 화면 연계

- A3b 탭 **이송**: 동일 숫자 read-only, dispute 시 A13(v2) 링크.

---

## 4. Audit log (필수)

**엔티티:** `MaterialReceiptAudit` (mock 배열)

| 필드 | 설명 |
|------|------|
| `id` | |
| `bundleId` | |
| `action` | `created` · `updated` |
| `previousQty` | 수정 전 B 확인 수량 (create 시 null) |
| `newQty` | 수정 후 |
| `previousStatus` | `pending` · `matched` · `disputed` |
| `newStatus` | |
| `comment` | **필수** (update; create도 v1 권장) |
| `changedBy` | B Admin user id / 이름 |
| `changedAt` | ISO timestamp |

**UI**

- 폼 하단 **「변경 이력」** 접기 패널: 시간순 테이블 (누가 · 언제 · 이전→이후 · comment).
- A3b 이송 탭: 동일 이력 **read-only** (A 감사).
- Admin audit (`/admin/audit`) v2에서 cross-link 가능.

**수정 UX**

1. 「수정」 클릭 → 수량·상태 편집 모드  
2. **comment textarea** (필수, min 10자 권장)  
3. 「저장」 → audit row append + `confirmedQty` 갱신 + transitGap 재계산  

---

## 5. MVP

- 목록 1건 + 폼 1건 mock
- `전량 일치` 원클릭 (comment 자동: "전량 일치 확인")
- 수정 1회 + 이력 2행 표시 demo
