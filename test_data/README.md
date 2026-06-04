# Test data (JSON only)

- `cosmetic_ingredients_json/` — 라인별 제품·BOM (`manufacturerId` 포함)
  - `aevora.json`, `lumiara.json`, `verdena.json`, `solenne_atelier.json`
- `cosmetic_manufacturers_json/` — B 위탁 생산사 3곳 및 담당 라인

이미지(PNG)는 **`test_images/`** 에만 두고, `npm run sync:catalog-images`로 `public/catalog/`에 반영합니다.

## 라인 ↔ 제조사 매핑

| 라인 | 제조사 |
|------|--------|
| Aevora, Lumiara | Yunhua BioLab (`mfr-yunhua`) |
| Verdena, Solenne Atelier | Lianxi DermaWorks (`mfr-lianxi`) |
| (없음) | Qinglan CosmeTech (`mfr-qinglan`) |

라인명은 JSON `line` 필드와 `cosmetic_manufacturers.json`의 `lines` 배열이 **정확히 일치**해야 합니다.
