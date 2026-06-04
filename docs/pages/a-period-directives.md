# A — 기간별 생산·출하 지시 (Period Directives)

**역할:** Super Admin (A)  
**예정 경로:** `/operations/directives` · 생성 모달/페이지 · 묶음 상세 내 embedded  
**목적:** 자재 묶음별로 “x월 x일까지 y개 생산·C 출하” 지시 + **맥락 comment**.

---

## 1. 목록 화면

### 헤더

| 요소 | 내용 |
|------|------|
| 제목 | 생산·출하 지시 |
| 설명 | 기간별 목표와 현장 참고 메모 |
| 액션 | `+ 지시 발행` |

### 필터

| 필터 | 옵션 |
|------|------|
| 자재 묶음 | select (active 묶음만 기본) |
| 상태 | issued · in_progress · met · missed · cancelled |
| 마감일 | 이번 주 / 이번 달 / custom range |

### 테이블

| 컬럼 | 설명 |
|------|------|
| 지시 번호 | `DIR-2026-012` |
| 묶음 / SKU | 링크 |
| 마감일 | dueDate + D-day |
| 목표 y | targetQty |
| 기간 실적 | 생산 / **출하** / **입고** (3숫자) |
| 달성률 | **입고** 기준 % (`receivedInWindow / y`) |
| 분석 | 링크 → [a-directive-period-analytics.md](./a-directive-period-analytics.md) (A only) |
| Comment | **1줄 truncate** · hover/tooltip 전문 |
| 상태 | Badge |
| 발행일 | issuedAt |

**Comment 열 UX**

- 기본: 최대 40자 + `…`
- 행 expand 또는 사이드 패널에서 **전체 comment** (명절·블프 등 긴 설명)

---

## 2. 지시 발행 폼 (모달 또는 전용 페이지)

### 필드

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| 자재 묶음 | select | ✓ | active 목록만 |
| 마감일 | date | ✓ | “x월 x일까지” |
| 목표 y | number | ✓ | 완제품 개수 (**출하 또는 입고** 기준) |
| **달성 기준** | read-only (v1) | | **`received` (입고)** 고정 — 기간 내 C 입고 합 ≥ y |
| C 출하 요구 | checkbox | | 운영 메모용; **달성 판정은 입고** |
| **Comment** | **textarea** | 권장 | **A → B 전달 메모** (아래 예시) |
| (내부) 발행 메모 | textarea | | A 내부만 |

### Comment placeholder / 도움말

> B 생산·출하 담당자에게 보이는 설명입니다.  
> 예: 중국 춘절 전후 2주 라인 가동률 70% 예상 · 블랙프라이데이 대비 11월 출하 20% 증량 요청 · 원료 B LOT 변경으로 1주 생산 지연 가능

### Comment 표시 위치 (발행 후)

- B **생산 캘린더** 상단 “이번 주 지시” 카드
- B **묶음 상세** 지시 목록
- (선택) 이메일/알림 mock — v2

### 유효성

- y ≤ 묶음 잔여 목표 (target − 누적 produced 또는 shipped 정책 선택)
- dueDate ≤ 묶음 `useByDate` (경고만 또는 block)

### 발행 후

- 상태 `issued` → B Admin에게 “확인” 1클릭 (optional) → `in_progress`
- 마감일 자동: `met` / `missed` (배치 또는 일 단위 job — mock는 저장 시 계산)

---

## 3. 지시 상세 (읽기)

| 블록 | 내용 |
|------|------|
| 헤더 | 지시 번호 · 묶음 · SKU |
| 목표 vs 실적 | 표: 목표 y · 기간 생산 · 기간 C 출하 · 기간 C 입고 |
| **Comment (전문)** | 카드 — **강조 타이포**, B에게 보이는 배너 스타일 |
| 연결 출하 | 해당 기간 Shipment to C 목록 |
| Audit | issuedBy, issuedAt, 수정 이력 |

---

## 4. B 화면과의 연계

- B 생산 캘린더 **상단 접이 섹션 “A 지시”** 에 이번 주·다음 주 directive + comment 노출.
- Comment는 **읽기 전용** (B는 별도 `현장 회신` 필드 v2).

---

## 5. 다건 묶음 동시 지시

- 발행 폼에서 묶음 1건씩; 목록은 **전체 묶음 통합** 타임라인 뷰 (Gantt lite — v2).
- v1: 테이블 + 묶음 필터로 충분.

---

## 6. 예시 데이터 (mock)

| 지시 | 묶음 | due | y | comment |
|------|------|-----|---|---------|
| DIR-001 | MB Serum | 2026-06-10 | 300 | 618 대비 출고 피크 — 6/5까지 300개 C 출하 부탁 |
| DIR-002 | MB Serum | 2026-06-24 | 250 | 춘절 이후 정상화, 주 5일 풀가동 |
| DIR-003 | MB Toner | 2026-07-01 | 200 | 블프 물량 선생산 — comment만 길게 테스트 |
