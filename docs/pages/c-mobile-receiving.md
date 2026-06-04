# C — 모바일 입고 (기존 + 묶음 연계)

**역할:** Warehouse (C)  
**경로:** `/m/*` (구현됨)  
**목적:** B 출하 수량 vs **실제 입고 개수** 확인. 자재 묶음·지시와 **연결만** 명시 (UI 대변경 최소).

---

## 1. 기존 화면 (유지)

| 경로 | 내용 | 문서 |
|------|------|------|
| `/m` | 입고 목록 | expected · received · 상태 |
| `/m/receiving/scan` | QR mock | |
| `/m/receiving/[id]` | **실제 입고 수량 입력** | |
| `/m/discrepancy/[id]` | 차이 처리 | |

구현 참고: `src/app/m/`

---

## 2. 묶음·지시 연계 (확장)

### 목록 카드 추가 필드 (read-only)

| 필드 | 설명 |
|------|------|
| 묶음 번호 | `MB-*` (작은 글씨) |
| (선택) Directive 마감 | B가 해당 출하의 지시 참조 |

### 입고 확인 화면

- 기존: WO, SKU, Expected, **실제 입고 수량**
- 추가: 묶음 번호 1줄 (C는 comment 불필요, optional “박스 메모”)

### 저장 시

- `receivedQty` → shipment + **bundle `receivedAtCTotal` rollup**
- discrepancy → reconciliation 탭

---

## 3. 다건 동시

- 목록은 **모든 open shipment** (여러 묶음·SKU 섞임 OK)
- 필터 (v2): SKU · 묶음

---

## 4. 3자 대사 체인

```
A Directive (y, comment)
    → B daily production (calendar)
    → B shipment (claimed)
        → C receiving (actual)  ← 이 화면
            → A reconciliation
```

C는 **개수 확인만** — comment·캘린더·그래프 없음.
