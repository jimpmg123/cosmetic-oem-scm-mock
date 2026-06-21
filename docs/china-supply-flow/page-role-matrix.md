# 운영 구조 2 — 페이지별 역할·표시 기준

**작성일:** 2026-06-22
**목적:** `/operations-2` 화면을 만들 때, 페이지별로 어떤 역할이 무엇을 보고 어떤 액션을 할 수 있는지 고정한다.
**관련:** [`web-structure.md`](./web-structure.md) · [`executive-summary-spec.md`](./executive-summary-spec.md) · `src/lib/role-access.ts`

---

## 1. 기본 원칙

이 문서는 운영 구조 2의 화면 설계 기준이다. 새 페이지를 만들 때는 먼저 이 문서에 페이지 목적과 역할별 표시 범위를 정한 뒤 구현한다.

| 원칙 | 내용 |
|------|------|
| Executive는 실무 화면을 보지 않는다 | 경영진용 계정은 `/operations-2/executive`에서 경영 판단 지표만 본다. 제품·입고·발주 입력 화면은 보지 않는다. |
| Korea는 제조 기준 데이터의 소유자다 | 제품, BOM, 제조 요청, 콜마 생산·출고 자료는 APPLICELL Korea 책임이다. |
| China는 물리 입고와 재고 상태의 검증자다 | AP China 입고 이후 실제 수량, 차이, 보류, 판매 가능 전환은 China 책임이다. |
| Logistics는 현장 증빙 입력 중심이다 | China Logistics는 실제 수량, 사진, 차이 사유를 등록하지만 보류 확정·판매 가능 전환은 하지 않는다. |
| Kolmar는 내부 로그인 사용자가 아니다 | Kolmar China는 외부 제조처/발주 대상/자료 출처로 기록한다. |
| 거래처도 기본적으로 내부 사용자가 아니다 | 지사·총판·대리상은 후속 DMS에서 직접 입력 최소화. 필요 시 입고 확인 전용 제한 포털만 검토한다. |
| 판매 발생 기능은 만들지 않는다 | 주문·결제·스토어 UI는 OUT. 판매 결과 데이터 read-only ingest만 IN이다. |

---

## 2. 역할 정의

| 역할 | 시스템 목적 | 대표 권한 |
|------|-------------|-----------|
| Executive / 경영진용 | 전체 사업 상태와 치명 리스크 확인 | 경영 요약 조회 |
| APPLICELL Korea Super Admin | 운영2 최종 관리자 | 승인, 잠금, 예외 처리, 전체 감사 |
| APPLICELL Korea Manufacturing Admin | 한국 제조 운영 실무자 | 제품/BOM 입력, 제조 요청 작성, 콜마 자료 입력 |
| APPLICELL China Admin | 중국 운영 관리자 | 입고 차이 검토, 보류 확정, 판매 가능 전환 |
| APPLICELL China Logistics | 중국 물류 현장 실무자 | 입고 검수 수량 입력, 사진/증빙 업로드, 차이 등록 |

권한 표기:

| 표기 | 의미 |
|------|------|
| 없음 | 메뉴와 페이지 접근 없음 |
| 읽기 | 조회만 가능 |
| 제한 읽기 | 민감 정보 제외 후 조회 |
| 입력 | 신규 작성·수정 가능. 확정은 아님 |
| 제출 | 작성 내용을 승인 대기로 전환 |
| 확정 | 상태를 잠그거나 다음 단계로 넘기는 승인 |
| override | 예외 처리. 반드시 감사 로그 필요 |

---

## 3. 페이지별 역할 매트릭스

| 페이지 | 목적 | Executive | Korea Super | Korea Manufacturing Admin | China Admin | China Logistics |
|--------|------|-----------|-------------|----------------------------|-------------|-----------------|
| `/operations-2/executive` | 경영 요약 | 읽기 | 없음 | 없음 | 없음 | 없음 |
| `/operations-2` | 제조·공급 현황 | 없음 | 읽기 | 읽기 | 읽기 | 읽기 |
| `/operations-2/catalog` | Korea 제품 마스터 | 없음 | 읽기·확정 | 입력 | 없음 | 없음 |
| `/operations-2/catalog/inbound-view` | China 입고용 제품 제한 정보 | 없음 | 읽기 | 없음 | 제한 읽기 | 제한 읽기 |
| `/operations-2/bom` | BOM/배합 기준 | 없음 | 읽기·확정 | 입력 | 없음 | 없음 |
| `/operations-2/requests` | 제조 요청 목록 | 없음 | 읽기·확정 | 입력·제출 | 없음 | 없음 |
| `/operations-2/requests/new` | 새 제조 요청 작성 | 없음 | 입력·제출 | 입력·제출 | 없음 | 없음 |
| `/operations-2/requests/history` | 제조 요청 변경 이력 | 없음 | 읽기 | 읽기 | 없음 | 없음 |
| `/operations-2/kolmar/production` | 콜마 생산 결과 등록 | 없음 | 읽기·확정 | 입력 | 읽기 | 읽기 |
| `/operations-2/kolmar/lot-qc` | LOT/QC 자료 관리 | 없음 | 읽기·확정 | 입력 | 제한 읽기 | 제한 읽기 |
| `/operations-2/kolmar/shipments` | 콜마 완제품 출고 등록 | 없음 | 읽기·확정 | 입력 | 읽기 | 읽기 |
| `/operations-2/inbound/inspection` | AP China 입고 검수 | 없음 | 읽기/override | 읽기 | 확정 | 입력 |
| `/operations-2/inbound/holds` | 입고 차이·보류 | 없음 | 읽기/override | 읽기 | 확정 | 입력 |
| `/operations-2/inbound/available-stock` | 판매 가능 재고 전환 | 없음 | override | 없음 | 확정 | 없음 |
| `/operations-2/analytics/yield-e2e` | 수율/E2E 분석 | 없음 | 읽기 | 읽기 | 제한 읽기 | 없음 |
| `/operations-2/analytics/issues` | 제조·입고 이슈 | 없음 | 읽기·종료 | 입력·판정 | 입력 | 제한 입력 |
| `/operations-2/analytics/audit` | 감사 로그 | 없음 | 전체 읽기 | Korea 범위 읽기 | China 범위 읽기 | 없음 |
| `/operations-2/manufacturers/kolmar-china` | 외부 제조처 자료 관리 | 없음 | 읽기·확정 | 입력 | 없음 | 없음 |

현재 코드 접근 권한은 `src/lib/role-access.ts`가 1차 구현 수준으로 단순화되어 있다. 위 매트릭스는 최종 UI/업무 기준이며, 세부 액션 권한은 페이지 구현 시 이 표에 맞춰 분리한다.

---

## 4. 현재 구현 페이지 상세

### 4.1 제품 카탈로그 — `/operations-2/catalog`

**목적:** APPLICELL Korea가 관리하는 제품 마스터다. 제품명, SKU, 바코드, LOT 포맷, 포장 사양, 제조처 연결, 제조 요청 이력 파생값을 확인한다.

| 역할 | 보여줄 정보 | 가능 액션 | 숨길 정보 |
|------|-------------|-----------|-----------|
| Korea Super | 전체 제품 마스터, 발주 이력 파생값, 포장·QR·LOT 기준 | 승인·잠금, 예외 수정 | 없음 |
| Korea Manufacturing Admin | 전체 제품 마스터, 발주 이력 파생값, 포장·QR·LOT 기준 | 제품 등록·수정, 제조 요청 전 기준 확인 | 승인·잠금 |
| China Admin | 접근 없음. 대신 `/catalog/inbound-view` 사용 | 없음 | BOM, 배합, 제품 마스터 수정, 발주 승인 |
| China Logistics | 접근 없음. 대신 `/catalog/inbound-view` 사용 | 없음 | BOM, 배합, 제품 마스터 수정, 발주 승인 |
| Executive | 접근 없음 | 없음 | 전체 실무 데이터 |

제품 카탈로그의 발주 관련 날짜는 제품 마스터 수기 필드가 아니라 제조 요청 이력에서 파생한다.

| 값 | 기준 |
|----|------|
| 최초 요청일 | 해당 제품이 포함된 최초 제조 요청의 작성일 |
| 최초 확정 발주일 | 해당 제품이 포함된 최초 승인 제조 요청의 승인일 |
| 최근 요청일 | 해당 제품이 포함된 최신 제조 요청의 작성일 |
| 누적 확정 발주량 | 승인된 제조 요청 수량 합계 |
| 승인 전 수량 | 작성중/승인 대기 제조 요청 수량 합계 |

### 4.2 입고용 제품 정보 — `/operations-2/catalog/inbound-view`

**목적:** AP China가 실물 입고 검수 시 필요한 제품 식별 정보만 조회한다.

| 역할 | 보여줄 정보 | 가능 액션 | 숨길 정보 |
|------|-------------|-----------|-----------|
| Korea Super | 입고 검수용 제품 정보 | 읽기 | 없음 |
| China Admin | SKU, 제품명, 용량, 포장 단위, 바코드, QR, LOT, 유통기한 | 읽기 | BOM, 배합, 원가성 정보 |
| China Logistics | SKU, 제품명, 용량, 포장 단위, 바코드, QR, LOT, 유통기한 | 읽기 | BOM, 배합, 원가성 정보 |
| Korea Manufacturing Admin | 기본적으로 접근 불필요 | 없음 | 없음 |
| Executive | 접근 없음 | 없음 | 전체 실무 데이터 |

### 4.3 BOM 기준 — `/operations-2/bom`

**목적:** 제품별 배합, 원료, 전성분·품질 기준을 관리한다. IP 성격이 있으므로 Korea 전용이다.

| 역할 | 보여줄 정보 | 가능 액션 | 숨길 정보 |
|------|-------------|-----------|-----------|
| Korea Super | BOM 전체, 원료, 배합 %, 함량 | 승인·잠금 | 없음 |
| Korea Manufacturing Admin | BOM 전체, 원료, 배합 %, 함량 | 작성·수정 | 승인·잠금 |
| China Admin | 접근 없음 | 없음 | BOM 전체 |
| China Logistics | 접근 없음 | 없음 | BOM 전체 |
| Executive | 접근 없음 | 없음 | 전체 실무 데이터 |

### 4.4 제조 요청 목록 — `/operations-2/requests`

**목적:** 콜마에 요청할 완제품 발주(PO)를 작성, 제출, 확정한다.

| 역할 | 보여줄 정보 | 가능 액션 | 숨길 정보 |
|------|-------------|-----------|-----------|
| Korea Super | 전체 제조 요청, 상태, 수량, 납기, 이력 | 확정, 취소, 예외 처리 | 없음 |
| Korea Manufacturing Admin | 전체 제조 요청, 상태, 수량, 납기, 이력 | 작성, 제출, 취소 | 확정 |
| China Admin | 1차 구현에서는 접근 없음. 향후 출고/입고 대조용 읽기 가능 | 없음 | 제조 요청 작성·확정 |
| China Logistics | 접근 없음 | 없음 | 제조 요청 작성·확정 |
| Executive | 접근 없음 | 없음 | 전체 실무 데이터 |

제조 요청은 원료 지급 요청이 아니라 완제품 수량 기준 발주다. 콜마가 원료 구매와 제조를 수행하고, APPLICELL은 완제품 목표 수량과 납기를 관리한다.

### 4.5 새 제조 요청 — `/operations-2/requests/new`

**목적:** 제품별 완제품 목표 수량, 납기, 제조처, 메모를 입력해 제조 요청을 생성한다.

| 역할 | 보여줄 정보 | 가능 액션 | 숨길 정보 |
|------|-------------|-----------|-----------|
| Korea Super | 제품 목록, 목표 수량, 납기, 제조처 | 임시저장, 제출 | 없음 |
| Korea Manufacturing Admin | 제품 목록, 목표 수량, 납기, 제조처 | 임시저장, 제출 | 확정 |
| China Admin | 접근 없음 | 없음 | 제조 요청 작성 화면 |
| China Logistics | 접근 없음 | 없음 | 제조 요청 작성 화면 |
| Executive | 접근 없음 | 없음 | 전체 실무 데이터 |

### 4.6 요청 변경 이력 — `/operations-2/requests/history`

**목적:** 제조 요청의 작성, 제출, 확정, 취소 이벤트를 append-only 로그로 조회한다.

| 역할 | 보여줄 정보 | 가능 액션 | 숨길 정보 |
|------|-------------|-----------|-----------|
| Korea Super | 전체 변경 이력 | 읽기 | 없음 |
| Korea Manufacturing Admin | 전체 변경 이력 | 읽기 | 삭제·수정 |
| China Admin | 1차 구현에서는 접근 없음 | 없음 | Korea 제조 요청 변경 이력 |
| China Logistics | 접근 없음 | 없음 | 전체 이력 |
| Executive | 접근 없음 | 없음 | 전체 실무 데이터 |

---

## 5. 후속 페이지 작성 규칙

새 페이지를 만들 때는 아래 항목을 먼저 문서에 추가한다.

```text
페이지:
목적:
주요 사용자:
역할별 표시 정보:
역할별 가능 액션:
숨겨야 할 정보:
상태 전이:
감사 로그 필요 여부:
후속 단계 확장:
```

특히 `입력`과 `확정`은 같은 역할에 몰아주지 않는다. 물리 입고, 보류 확정, 판매 가능 전환은 중국 측 검증 흐름을 우회하지 않도록 설계한다.
