# Legacy UI backup

Material Bundles UI 작업 전 스냅샷입니다. 새 UI를 되돌리려면 아래 파일을 원래 경로로 복사하세요.

## 복원 방법

```powershell
# 네비게이션 (자재 묶음 메뉴 제거 시)
Copy-Item src/_legacy-ui/lib/navigation.ts src/lib/navigation.ts -Force

# Production Orders 목록 (기존 WO 뷰)
Copy-Item src/_legacy-ui/operations/orders/page.tsx "src/app/(desktop)/operations/orders/page.tsx" -Force
```

## 백업 시점

- `lib/navigation.ts` — Material Bundles nav 항목 추가 전
- `operations/orders/page.tsx` — WO 기반 Production Orders 페이지

## 새로 추가된 경로 (제거 시)

- `src/app/(desktop)/operations/material-bundles/`
- `src/app/(desktop)/operations/bundles/`
- `src/components/material-bundles/`
- `src/lib/mock/material-bundles.ts`
