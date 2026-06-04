# A/B 워크숍 — 원자재·발주·입고 구조 (2026)

**목적:** 현실적으로 가능한 UI/데이터 구조 합의 (Agent A · Agent B 시뮬레이션)

---

## 1. 현실에서 누가 무엇을 하나

| 행위 | 현실 | mock v1 |
|------|------|---------|
| **완제품 목표·기간 지시** | A | Period Directive |
| **원자재 **보낼** 양 기록** | A (ERP 출하) | A **원자재 출하 등록** (라인) |
| **원자재 **부족분 발주**** | **B → A** (또는 A가 push) | B **보충 요청** (stub) — B7과 분리 |
| **도착·실측** | B 창고 | **B7 입고 확인** |
| **매일 생산** | B Staff | **B2 일지** |
| **완제품 출하** | B | B5 |
| **C 입고** | C | C3 |

**결론:** “발주 넣는 쪽”은 계약마다 다르지만 위탁 화장품에서는 **B가 부족 알림 → A가 추가 출하**가 흔함. v1은 **A 출하 = 묶음 단위 grant**, B 보충 = 별도 건(부분 도착).

---

## 2. 동시 도착 vs 부분 도착

- **묶음(Material Bundle)** = “이 SKU 라인을 위해 A가 넘기는 **캠페인 단위**” (목표·기한·theoretical).
- **출하 건(Shipment)** = 1회 차량/통관 단위. **여러 건**이 한 묶음에 붙을 수 있음.
- **입고 확인(B7)** = 출하 건별 또는 **누적 확정** (v1: 묶음 총량, v2: 건별+부분).

부분만 오면: B **보충 요청** → A **추가 출하 건** → B7에서 **추가 확정** (기존 묶음 유지).

---

## 3. 로션 / 토너 / 중복 원료

- **제품 라인** = SKU family (LOTION-250, TONER-200 …).
- **묶음** = 한 라인에 대한 **한 번의 grant** (기한·목표).
- **출하 라인** = 그 묶음에 실린 **원료 품목·수량** (로션용 BOM 세트).
- **중복 원료**(예: 공통 용기): v1은 **묶음별 라인 중복 허용**, v2 **공장 재고 풀**에서 차감.

---

## 4. A Admin 첫 화면 (Command Center)

**한 화면에서:**

1. **제품 라인(SKU)** 선택  
2. **자재 묶음** 선택  
3. **기간 지시(케이스)** 선택  
4. 해당 케이스까지 **작업량** (입고 기준 달성, 생산·출하 참고)

→ 경로: `/operations/command-center`

---

## 5. 화면 ↔ ID 매핑 (navbar)

| ID | 경로 | 역할 |
|----|------|------|
| A0 | `/operations/command-center` | A 첫 화면 |
| A2 | `/operations/material-bundles` | 묶음 목록 |
| A2a | `/operations/material-shipment` | **원자재 출하 라인 입력** |
| A9 | `/operations/transit-reconciliation` | A→B 이송 대조 |
| A4 | `/operations/directives` | 지시 목록 |
| A10 | `/operations/directive-analytics` | 지시 실적 |
| A13 | `/operations/exceptions` | 예외 큐 |
| B7 | `/operations/material-receipt` | B 입고 확인 |
| B-sup | `/operations/material-requests` | B 보충 요청 (stub) |
| B2 | `/operations/daily-log` | 일지 |

---

## 6. 미해결 (v2)

- ERP/API 출하 sync  
- 라인별 LOT·부분 입고 건별  
- 공통 원료 재고 풀  
