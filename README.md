# APPLICELL China Supply Flow Mock

APPLICELL 중국 사업 운영 구조를 검증하기 위한 **Next.js ERP/Operations UI 목업**입니다.

현재 메인 스코프는 기존 `A -> B -> C` 위탁생산 모델이 아니라, 아래 실제 사업 흐름입니다.

```text
APPLICELL Korea
  -> Kolmar China
  -> APPLICELL China
  -> 공식 유통 채널
  -> 소비자
```

이 저장소는 백엔드, DB, 인증 없이 `src/lib/mock/`의 정적 데이터와 클라이언트 계산으로 동작하는 프로토타입입니다. 기존 A/B/C 운영 화면은 레거시 모델로 보존하고, 신규 구조는 `/operations-2` 아래에서 별도로 실험합니다.

---

## 현재 구현 범위

### Scope 경계

이 앱은 **통합 LOT/serial 원장·관제 ERP**입니다. 소비자 판매를 발생시키는 플랫폼은 아닙니다.

| 구분 | 범위 |
|------|------|
| OUT | 소비자 스토어 UI, 장바구니/결제 UX, 라이브커머스·마케팅·프로모션, 리뷰/커뮤니티, 주문·결제 발생 기능 |
| IN | 판매 결과 데이터의 read-only ingest: 주문 원장 조회, 배송·수령 상태, 반품·취소, 정산 확정 여부, 정품인증/serial 스캔 |

별도 물류 플랫폼은 만들지 않고, AP China 이후의 공식 채널 물류 추적은 이 앱의 후속 모듈로 둡니다. 단, 2차 이후 기능을 만들기 전에 판매 플랫폼이 `serial`, 배송, 수령, 정품인증, 반품 데이터를 제공할 수 있는지 0차로 확인해야 합니다.

### 1차 범위

현재 구현은 제조·공급 관리까지만 다룹니다.

```text
APPLICELL Korea
  -> 제조 요청 / 제품·BOM 기준 관리

Kolmar China
  -> 외부 제조처
  -> 생산 결과, LOT/QC, 완제품 출고 자료의 기록 대상

APPLICELL China
  -> 입고 검수
  -> 입고 차이 / 보류
  -> 판매 가능 재고 전환
```

### 2차 이후 범위

아래는 아직 실제 데이터 모델이 연결되지 않은 다음 단계입니다.

- 공식 채널 DMS: AP China에서 지사·총판·대리상으로 나가는 출고와 거래처 입고 확인
- AP China WMS 확장: 보류, 판매 가능 전환, 출고, 채널별 재고
- Traceability: QR / serial 기반 정품 확인, 이동 경로, 중복 스캔, 지역 이탈 검증
- 판매 플랫폼 결과 데이터 연동: 주문, 배송완료, 수령확인, 반품, 정산 확정 여부, 정품인증 데이터 ingest
- 검증 판매율(sell-through), 채널 재고 적체, 채널 이탈, 정산 보류, 클로백 분석

---

## 핵심 설계 원칙

### Kolmar China는 로그인 역할이 아니다

Kolmar China는 내부 사용자가 아니라 **외부 제조처 / 발주 대상 / 생산 결과 기록 대상**입니다.

1차 구조에서는 APPLICELL Korea 운영자가 콜마로부터 받은 생산·출고 자료를 입력하고, APPLICELL China가 실제 입고 수량과 상태를 검수합니다.

### 한국과 중국의 책임을 분리한다

- APPLICELL Korea: 제품, BOM, 제조 요청, 콜마 생산·출고 자료 관리
- APPLICELL China: 실제 입고 검수, 입고 차이 처리, 판매 가능 재고 전환
- China Logistics: 현장 검수와 증빙 등록 중심
- China Admin: 보류 확정과 판매 가능 재고 전환

### 용어는 공식 유통 관리 기준으로 쓴다

중국 사업 구조에서는 위험한 용어를 피하고, 시스템에는 아래 표현을 사용합니다.

| 피해야 할 표현 | 시스템 표현 |
|----------------|-------------|
| 상위 / 하위 | APPLICELL Korea / APPLICELL China / 거래처 / 공식 채널 |
| 모집 / 추천 | 거래처 등록 / 채널 확장 |
| 추천수당 / 조직 보상 | 정산 / 판매 인센티브 |
| 하위 실적 | 검증 판매 / 공식 채널 판매 실적 |
| 조직 | 채널 / 거래처 / 운영 법인 |

---

## 역할 구조

운영 구조 2(`/operations-2`)에서는 다음 역할을 사용합니다.

| 역할 | 목적 | 접근 범위 |
|------|------|-----------|
| Executive / 경영진용 | 경영진 overview | 경영 요약 |
| APPLICELL Korea Super Admin | 전체 운영 관리 | 운영2 실무 전체, 예외 처리 |
| APPLICELL Korea Manufacturing Admin | 한국 제조 운영 실무 | 제품·BOM, 제조 요청, 콜마 자료, 수율/E2E |
| APPLICELL China Admin | 중국 운영 관리자 | 입고 검수, 보류 확정, 판매 가능 재고 전환 |
| APPLICELL China Logistics | 중국 물류 실무 | 입고 검수, 증빙 업로드, 입고 차이 등록 |

레거시 화면에는 기존 `A Super Admin`, `A Admin`, `B Admin`, `B Staff`, `Warehouse (C)` 역할이 남아 있습니다.

---

## 주요 화면

| URL | 설명 |
|-----|------|
| `/operations-2/executive` | Executive / 경영진용 경영 요약 |
| `/operations-2` | 중국 제조·공급 현황 |
| `/operations-2/catalog` | 제품 카탈로그 |
| `/operations-2/bom` | BOM 기준 |
| `/operations-2/requests` | 제조 요청 목록 |
| `/operations-2/kolmar/production` | 콜마 생산 결과 등록 |
| `/operations-2/kolmar/lot-qc` | LOT / QC 자료 |
| `/operations-2/kolmar/shipments` | 완제품 출고 등록 |
| `/operations-2/inbound/inspection` | AP China 입고 검수 |
| `/operations-2/inbound/holds` | 입고 차이 / 보류 |
| `/operations-2/inbound/available-stock` | 판매 가능 재고 전환 |
| `/operations-2/analytics/yield-e2e` | 수율 / E2E |
| `/operations-2/analytics/issues` | 제조 이슈 |
| `/operations-2/analytics/audit` | 감사 로그 |
| `/operations-2/manufacturers/kolmar-china` | 제조처 자료 관리 |

아직 상세 도메인이 확정되지 않은 화면은 mockup placeholder로 연결되어 있습니다.

---

## Executive / 경영진용 Overview

`/operations-2/executive`는 실무 입력 화면이 아니라 경영 판단용 요약 화면입니다.

현재 화면은 다음 5개 블록으로 구성됩니다.

| 블록 | 목적 |
|------|------|
| 재무 결과 | 계획 대비 매출, 영업이익, 배당 가능액, 자금 흐름 |
| 성장 궤적 | 월 판매 세트 계획, 거래처·지역 확장, 재구매율 |
| 공급 건전성 | 제조 진행, 콜마 출고, AP China 입고, 입고 보류 |
| 채널 무결성 / 리스크 | 검증 판매율, 채널 재고 적체, QR 지역 이탈, 정산 보류 |
| 컴플라이언스 신호 | 검증 판매 기반 정산, 미해결 분쟁, 단일 제조처 의존 |

현재 mock 데이터로 산출 가능한 값은 공급 건전성 중심입니다. 주문·결제·정산·검증 판매 데이터는 2차 모델에서 연결합니다.

---

## 레거시 모델

기존 A/B/C 위탁생산 화면은 삭제하지 않고 보존합니다.

| URL | 설명 |
|-----|------|
| `/operations/yield-overview` | 레거시 생산·입고 현황 |
| `/operations/material-bundles` | 자재 물량 |
| `/operations/production-calendar` | 생산 캘린더 |
| `/operations/catalog` | 레거시 제품 카탈로그 |
| `/operations/reconciliation` | 레거시 대사 |
| `/m` | 창고 모바일 mock |

좌상단 `운영` 옆 전환 버튼으로 기존 구조와 운영 구조 2를 오갈 수 있습니다.

---

## 기술 스택

- Next.js 15 App Router
- React 19
- TypeScript
- Tailwind CSS 4
- Radix UI
- Material Symbols
- Mock 데이터: `src/lib/mock/`
- i18n: `src/lib/i18n/`

---

## 실행 방법

### 요구 사항

- Node.js 20+
- npm

### 설치

```bash
git clone https://github.com/jimpmg123/cosmetic-oem-scm-mock.git
cd cosmetic-oem-scm-mock
npm install
```

### 개발 서버

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 엽니다.

개발 서버 캐시 문제나 500 오류가 있으면:

```bash
npm run dev:clean
```

---

## 스크립트

| 명령 | 설명 |
|------|------|
| `npm run dev` | 개발 서버 실행 |
| `npm run dev:clean` | `.next` 삭제 후 개발 서버 실행 |
| `npm run build` | 프로덕션 빌드 |
| `npm run lint` | ESLint |
| `npm run sync:catalog-images` | `test_images/`의 카탈로그 이미지를 `public/catalog/`로 동기화 |
| `npm run i18n:emit` | locale JSON에서 dictionary 생성 |

---

## 프로젝트 구조

```text
Production_Tracking/
├── docs/
│   └── china-supply-flow/
│       ├── web-structure.md
│       └── executive-summary-spec.md
├── public/
│   ├── brand/
│   │   └── applicell-logo.png
│   └── catalog/
├── src/
│   ├── app/
│   │   ├── (desktop)/
│   │   │   ├── operations/
│   │   │   └── operations-2/
│   │   └── m/
│   ├── components/
│   │   ├── layout/
│   │   ├── operations/
│   │   └── ui/
│   └── lib/
│       ├── mock/
│       ├── i18n/
│       ├── navigation.ts
│       └── role-access.ts
├── scripts/
├── test_data/
└── test_images/
```

---

## 주요 코드 위치

| 파일 | 역할 |
|------|------|
| `src/app/(desktop)/operations-2/page.tsx` | 운영 구조 2 제조·공급 현황 |
| `src/app/(desktop)/operations-2/executive/page.tsx` | Executive Overview |
| `src/app/(desktop)/operations-2/[...slug]/page.tsx` | 운영2 하위 메뉴 placeholder |
| `src/components/layout/desktop-sidebar.tsx` | 사이드바, 운영 구조 전환, 운영2 로고 |
| `src/components/layout/role-menu.tsx` | 역할 전환 메뉴 |
| `src/components/operations/role-route-guard.tsx` | 역할별 라우트 가드 |
| `src/lib/navigation.ts` | 레거시 / 운영2 메뉴 트리 |
| `src/lib/role-access.ts` | 역할별 라우트 접근 규칙 |
| `src/lib/mock/material-bundles.ts` | mock 제조·공급 데이터 |
| `src/lib/mock/yield-metrics.ts` | 수율 / E2E 계산 |

---

## 현재 상태

- UI 목업 / PoC 단계
- 실 인증, DB, API, 결제, 주문, 정산, QR 검증 연동 없음
- 수치와 회사명 일부는 mock 데이터
- Kolmar China는 로그인 사용자가 아니라 외부 제조처 기록 대상으로 표현
- APPLICELL China 이후 유통 추적·판매 결과 연동·정산 대사는 2차 이후 범위
- 소비자 판매 발생 UI와 결제 UX는 범위에서 제외

---

## 참고 문서

| 문서 | 내용 |
|------|------|
| `docs/china-supply-flow/web-structure.md` | 운영 구조 2의 공급 흐름과 메뉴 초안 |
| `docs/china-supply-flow/page-role-matrix.md` | 운영 구조 2의 페이지별 역할·표시·액션 기준 |
| `docs/china-supply-flow/executive-summary-spec.md` | Executive / 경영진용 overview 화면 설계 |
| `docs/pages/` | 레거시 화면별 스펙 |
| `docs/domain/` | 레거시 수율, E2E, 물량 개념 |

---

## 라이선스

Private / 내부용 프로젝트입니다. 공개 또는 외부 공유 시 조직 정책에 맞는 라이선스를 별도로 추가해야 합니다.
