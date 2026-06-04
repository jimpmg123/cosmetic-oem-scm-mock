# A/B Admin · B Staff — 화면·입력 가시성 (2026-06-04)

**전제:** UI mock · C(warehouse)는 본 문서 범위 밖.

---

## 1. 역할 정의

| 역할 | 코드 | 한 줄 |
|------|------|--------|
| **A Admin** | `super_admin` | 묶음·지시·대사·실적 분석 (조회·발행) |
| **B Admin** | `b_admin` | 담당 묶음 보드·대사·입고 확인·출하·일지 **검토** |
| **B Staff** | `b_staff` | **일별 생산 일지** 현장 입력 |

---

## 2. A ↔ B Admin **공유** (입력 폼 없음)

| 화면 | 경로 | UI |
|------|------|-----|
| 대시보드 | `/dashboard` | 상단 **도넛 2** (E2E · Production) + 대표 묶음 |
| 대사·수율 | `/operations/reconciliation` | 상단 도넛 + 탭 테이블 |
| B 묶음 보드 (A도 조회) | `/operations/bundles` | 도넛 + 카드·목록 (CTA: 캘린더·검토) |
| A 묶음 (A 전용 편집) | `/operations/material-bundles` | A only |
| 생산 캘린더 | `/operations/production-calendar` | **조회만** (일지 작성 CTA 없음) |

**숫자·도넛:** [a-material-bundles.md](./a-material-bundles.md) §3.2 — E2E · Production 좌우 도넛.

---

## 3. B Staff **전용 입력**

| 화면 | 경로 |
|------|------|
| 일별 생산 일지 | `/operations/daily-log` |

→ B Admin · A Admin 메뉴·URL **차단** (`RoleRouteGuard`).

---

## 4. B Admin **전용 입력** (Staff 일지 폼 아님)

| 화면 | 경로 |
|------|------|
| 원자재 입고 확인 B7 | `/operations/material-receipt` |
| C 출하 B5 | `/operations/shipments` |
| 일지 검토 B4 | `/operations/daily-log/history` |

---

## 5. A Admin에 **숨김**

- `/operations/daily-log` (Staff 폼)
- `/operations/material-receipt`
- `/operations/shipments`
- `/operations/production` (구 WO 입력)
- B Admin 전용 ERP 메뉴 (v1 MVP)

---

## 6. B Admin에 **숨김**

- `/operations/daily-log` (Staff 입력란)
- `/operations/material-bundles` (A 발행·마감)
- `/operations/directive-analytics` (A 전용)

대신 **일지 검토·캘린더·카드 KPI**로 Staff 결과 확인.

---

## 7. 구현

- `src/lib/role-access.ts` — 경로 규칙
- `src/lib/navigation.ts` — 사이드바 `roles`
- `src/app/(desktop)/operations/layout.tsx` — `RoleRouteGuard`

---

## 8. 생산 캘린더 (B3)

- 캘린더 그리드 **max-width ~280px**, 셀 **h-8**
- in-month 셀 **가운데 생산 개수** 표시 (0이면 숫자 생략)
- Staff만 셀 클릭 → 일지, Admin은 조회 + 「일지 검토」 CTA

참고: [b-production-calendar.md](./b-production-calendar.md)
