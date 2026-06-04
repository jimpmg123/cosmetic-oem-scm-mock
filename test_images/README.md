# Catalog images

제품·라인 이미지(PNG)만 이 폴더에 둡니다. JSON·회사·성분 데이터는 `test_data/`에만 있습니다.

폴더 구조:

- `aevora/`, `lumiara/`, `verdena/`, `solenne/` — 제품 썸네일
- `brand_line images/` — 브랜드 라인 로고 (`*_brand.png`)

개발·빌드 시 `npm run sync:catalog-images`가 `public/catalog/`로 복사합니다.  
라인 로고는 `brand_line images/` → `public/catalog/brand-lines/` 로 sync 됩니다.
