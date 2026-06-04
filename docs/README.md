# docs — 문서 안내

## 파일 맵

```
docs/
├── PROJECT.md          ← 제품·역할·현재 mock vs 목표·엔티티 요약 (먼저 읽기)
├── README.md           ← 이 파일 (폴더 규칙)
├── domain/             ← 비즈니스 개념 (화면에 안 묶인 것)
│   └── material-bundles-and-flow.md
└── pages/              ← 화면(라우트)별 UI 스펙
    ├── README.md       ← 인덱스
    ├── a-material-bundles.md
    ├── a-period-directives.md
    ├── b-production-calendar.md
    ├── bundle-operations-overview.md
    ├── reconciliation-yield.md
    └── c-mobile-receiving.md
```

## Documentation layout

### 언제 `pages/`에 쓸까

- 구현자·디자이너가 **한 창**을 만들 때
- 포함할 것: 헤더, 필터, **표 컬럼**, **그래프 타입**, **입력 필드**, 접기(Notion형), 빈 상태, 권한
- 파일명: `{역할}-{화면이름}.md` 또는 라우트와 맞춤 (`b-production-calendar.md`)

### 언제 `domain/`에 쓸까

- **여러 페이지**에서 같은 단어·규칙을 쓸 때 (Material Bundle, Directive, 수율 식)
- 엔티티 관계, 동시 active 묶음, B↔C vs 최종 수율
- 새 화면을 추가해도 도메인 문서는 **가끔만** 수정

### 기능별 md는 언제?

| 상황 | 추천 |
|------|------|
| “comment 기능”이 A 지시 + B 캘린더 2곳 | `domain` 1줄 + 각 `pages/*.md`에 UI 절 — **별도 feature md 불필요** |
| 인증·알림·결제처럼 횡단 인프라 | `domain/` 또는 `features/notifications.md` (나중에) |
| 화면이 10개 넘는 하나의 위저드 | `pages/wizard-step-*.md` 또는 한 md에 Step 절 |

**결론:** 지금 단계에서는 **`pages/` 페이지별 + `domain/` 개념** 이면 충분. 기능별 파일은 화면이 늘고 같은 기능이 4곳 이상 흩어질 때 추가.

## PROJECT.md와의 역할 분담

| PROJECT.md | pages/*.md |
|------------|------------|
| 왜 만드는지, 누가 쓰는지 | 이 화면에 **무엇을 그린다** |
| 현재 WO mock vs 목표 Bundle | 버튼·차트·색상 규칙 |
| 엔티티 4종 **한 줄 정의** | 필드·테이블·와이어 |

엔티티 상세 표·다이어그램은 `domain/material-bundles-and-flow.md`에 두고, PROJECT §4.1에서 링크한다.

## UI 스펙 캡처 (채팅 → md)

**현재 목표는 UI mockup만** — 백엔드·DB 구현은 스펙 문서에만 남기고 코드는 나중.

대화에서 창·화면을 설명하면:

1. **해당 라우트/역할**에 맞는 `pages/*.md`를 찾거나 없으면 새로 만든다.
2. **같은 화면**이면 기존 md에 섹션 추가·수정 (덮어쓰지 않고 누적).
3. **여러 화면에 걸치는 규칙** (수율, 묶음 정의)만 `domain/`에 반영.
4. `pages/README.md` 인덱스에 새 파일이 있으면 한 줄 추가.

저장할 내용 예: 레이아웃 위→아래, 표 컬럼, 그래프 종류, 입력 필드, 접기 UX, 색/그라데이션, 빈 상태, (선택) 예정 경로.

구현 코드는 요청할 때까지 건드리지 않는다 — **문서만** 최신화.
