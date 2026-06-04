# 화면 스펙 인덱스



구현 시 **창(페이지)별** 어떤 정보·그래프·표·입력칸이 들어가는지 정의.



- **전체 창 목록:** [SCREEN-INVENTORY.md](./SCREEN-INVENTORY.md)
- **A/B/C 워크숍 합의:** [WORKSHOP-2026-06-03.md](./WORKSHOP-2026-06-03.md) ← 먼저 읽기
- **A/B Admin 가시성:** [role-visibility-ab.md](./role-visibility-ab.md)

- 도메인: [../domain/material-bundles-and-flow.md](../domain/material-bundles-and-flow.md)

- 프로젝트: [../PROJECT.md](../PROJECT.md)



---



## A업체 (Desktop)



| 문서 | 화면 | 예정 경로 |

|------|------|-----------|

| [a-material-bundles.md](./a-material-bundles.md) | 자재 묶음 (다건·사용 기간) | `/operations/material-bundles` |

| [a-period-directives.md](./a-period-directives.md) | 기간 지시 + **comment** · 달성=출하/입고 | `/operations/directives` |
| [a-directive-period-analytics.md](./a-directive-period-analytics.md) | **A only** 기간별 생산·출하·입고 그래프 | `/operations/directive-analytics` |

| [bundle-operations-overview.md](./bundle-operations-overview.md) | 대시보드·묶음 요약 | `/dashboard` |

| [reconciliation-yield.md](./reconciliation-yield.md) | 대사·수율 | `/operations/reconciliation` |



---



## B업체 (Desktop)



| 문서 | 화면 | 예정 경로 |

|------|------|-----------|

| **[b-daily-production-log.md](./b-daily-production-log.md)** | **일별 일지** (생산·불량·원재료·QC·비고·첨부) | `/operations/daily-log` |

| [b-production-calendar.md](./b-production-calendar.md) | 캘린더·주간 그래프 (조회) | `/operations/production-calendar` |

| [b-shipment-to-c.md](./b-shipment-to-c.md) | C 출하 등록 | `/operations/shipments` |
| [b-material-receipt.md](./b-material-receipt.md) | 원자재 입고 확인 (transit loss) | `/operations/material-receipt` |

| [bundle-operations-overview.md](./bundle-operations-overview.md) | B 대시·지시 확인 | `/operations/bundles` |



---



## C창고 (Mobile)



| 문서 | 화면 | 경로 |

|------|------|------|

| [c-mobile-receiving.md](./c-mobile-receiving.md) | 입고·스캔·수량 | `/m/*` |



---



## 구현 우선순위 (UI)



[SCREEN-INVENTORY.md §구현 우선순위](./SCREEN-INVENTORY.md#구현-우선순위-ui-mock)



1. A 묶음 + A 지시  

2. **B 일별 일지**  

3. B 캘린더  

4. B 출하 · C 입고 · A 대사  


