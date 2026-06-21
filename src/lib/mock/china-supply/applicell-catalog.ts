/**
 * 운영 구조 2 (China Supply) — APPLICELL 제품 카탈로그 · BOM 기준 시드 (mock)
 *
 * 출처: 「APPLICELL 중국사업계획(2026.06).pdf」 Initial 제품 구성 / 비즈니스 구조.
 *
 * 설계 메모
 * - ops-1 데모 라인(Aevora/Lumiara/…)과 **분리**된 ops-2 전용 카탈로그다.
 * - 향후 자체 플랫폼에 다른 한국 브랜드사 제품을 올릴 수 있도록
 *   `brandOwner(브랜드 공급사) → brandLine → product` + `manufacturer(제조처)`를
 *   1급 엔티티로 분리해 둔다. 지금은 APPLICELL 1개사 / Kolmar China 1개사뿐.
 * - 제조처(Kolmar China)는 로그인 사용자가 아니라 외부 제조처 기록 대상이다.
 * - BOM 배합 %는 PDF에 없으므로 합 100%가 되도록 생성한 mock 값이다(현지 처방 확정 전).
 */

import type { ManufacturingCompany } from "@/lib/mock/manufacturer-seed";
import type {
  BrandLine,
  CatalogProduct,
  CosmeticType,
  ProductBomLine,
} from "@/lib/mock/product-catalog";

/** 브랜드 공급사(판매원 / 品牌持有人). 향후 다른 한국 브랜드사 입점 시 여기에 추가 */
export type BrandOwner = {
  id: string;
  name: string;
  /** 화면 표기용 한글/한자 병기 */
  displayName: string;
  /** 운영 구조 2에서의 역할 설명 */
  role: string;
};

/** ops-2 브랜드 라인 — 어느 공급사 소속인지(brandOwnerId)를 명시 */
export type ChinaBrandLine = BrandLine & { brandOwnerId: string };

/** 입수(포장) 계층 — 입고 검수 차이/빼돌리기 통제의 수량 기준 */
export type PackagingSpec = {
  /** 내박스 1개당 단위 수량 */
  unitsPerInner: number;
  /** 카톤 1개당 내박스 수량 */
  innersPerCarton: number;
  /** 팔레트 1개당 카톤 수량 */
  cartonsPerPallet: number;
  /** 단위 순중량(g) */
  unitNetWeightG: number;
};

/** 시리얼/QR 부착 정책 — 정품 확인·채널 이탈 감지 연계 */
export type SerialPolicy = "unit_qr" | "carton_qr" | "none";

/** 제품별 공급 통제 기준(BOM 기준의 운영·물류 층). CatalogProduct와 분리해 ops-2 전용 */
export type ChinaProductSupplySpec = {
  productId: string;
  /** 상품 바코드(EAN/상품코드) — 물류 대조용 */
  barcode: string;
  packaging: PackagingSpec;
  serialPolicy: SerialPolicy;
  /** 제조번호(LOT) 포맷 예시 */
  lotFormat: string;
  /** 유통기한: 제조일 + N개월 */
  shelfLifeMonths: number;
  /** 기능성화장품 고시 표시(없으면 일반 화장품) */
  functionalClaim?: string;
  /** 중국 NMPA 등록 구분: 일반(普通) / 특수(特殊)用途 */
  nmpaType: "general" | "special";
  /** 표준 로스 여유(%) — 제조 요청 grant 산출 기준 (수율 아님) */
  lossAllowancePct: number;
};

export type ChinaSupplyCatalog = {
  brandOwners: BrandOwner[];
  manufacturers: ManufacturingCompany[];
  brandLines: ChinaBrandLine[];
  products: CatalogProduct[];
  supplySpecs: ChinaProductSupplySpec[];
};

// ──────────────────────────────────────────────────────────────────────────
// 공급사 / 제조처
// ──────────────────────────────────────────────────────────────────────────

export const APPLICELL_KOREA: BrandOwner = {
  id: "owner-applicell",
  name: "APPLICELL Korea",
  displayName: "APPLICELL Korea (애플리셀 · 品牌持有人)",
  role: "브랜드/IP 보유 · 제품기획 · 제조 요청 · 제조 통제 (판매원)",
};

export const KOLMAR_CHINA: ManufacturingCompany = {
  id: "mfr-kolmar-china",
  name: "Kolmar (China) Co., Ltd.",
  chineseName: "科玛(中国)",
  concept: "글로벌 1위 ODM 한국콜마 중국공장 — 외부 제조처(로그인 사용자 아님)",
  lineNames: ["APPLICELL"],
};

// ──────────────────────────────────────────────────────────────────────────
// 원료 마스터 (한글 → INCI). 같은 원료는 같은 itemCode를 공유한다.
// ──────────────────────────────────────────────────────────────────────────

type IngredientMaster = { ko: string; inci: string; code: string };

const ING = {
  water: { ko: "정제수", inci: "Purified Water", code: "RM-AQUA" },
  glycerin: { ko: "글리세린", inci: "Glycerin", code: "RM-GLYCERIN" },
  butyleneGlycol: { ko: "부틸렌글라이콜", inci: "Butylene Glycol", code: "RM-BG" },
  propanediol: { ko: "프로판다이올", inci: "Propanediol", code: "RM-PROPANEDIOL" },
  betaine: { ko: "베타인", inci: "Betaine", code: "RM-BETAINE" },
  trehalose: { ko: "트레할로스", inci: "Trehalose", code: "RM-TREHALOSE" },
  macadamia: {
    ko: "마카다미아씨오일",
    inci: "Macadamia Ternifolia Seed Oil",
    code: "RM-MACADAMIA",
  },
  coix: {
    ko: "의이인추출물",
    inci: "Coix Lacryma-Jobi Ma-Yuen Seed Extract",
    code: "RM-COIX",
  },
  collagen: { ko: "콜라겐", inci: "Hydrolyzed Collagen", code: "RM-COLLAGEN" },
  collagenPeptide: {
    ko: "콜라겐 펩타이드",
    inci: "Collagen Amino Acids",
    code: "RM-COLLAGEN-PEP",
  },
  keratin: { ko: "케라틴", inci: "Hydrolyzed Keratin", code: "RM-KERATIN" },
  elastin: { ko: "엘라스틴", inci: "Hydrolyzed Elastin", code: "RM-ELASTIN" },
  ceramide: { ko: "세라마이드", inci: "Ceramide NP", code: "RM-CERAMIDE" },
  stemCell: {
    ko: "스템셀 배양액(엑소좀)",
    inci: "Stem Cell Culture Extract",
    code: "RM-EXOSOME",
  },
  /** PDF 주성분 */
  poongran: {
    ko: "풍란캘러스 배양액 추출물",
    inci: "Neofinetia Falcata Callus Culture Extract",
    code: "RM-POONGRAN",
  },
  /** PDF 주성분 · 주름개선 기능성 고시 */
  adenosine: { ko: "아데노신", inci: "Adenosine", code: "RM-ADENOSINE" },
  cct: {
    ko: "카프릴릭/카프릭트라이글리세라이드",
    inci: "Caprylic/Capric Triglyceride",
    code: "RM-CCT",
  },
  cetearyl: { ko: "세테아릴알코올", inci: "Cetearyl Alcohol", code: "RM-CETEARYL" },
  shea: { ko: "시어버터", inci: "Butyrospermum Parkii Butter", code: "RM-SHEA" },
  glycerylStearate: {
    ko: "글리세릴스테아레이트",
    inci: "Glyceryl Stearate",
    code: "RM-GLY-STEARATE",
  },
  carbomer: { ko: "카보머", inci: "Carbomer", code: "RM-CARBOMER" },
  preservative: {
    ko: "보존제 블렌드",
    inci: "Preservative Blend",
    code: "RM-PRESERVATIVE",
  },
} satisfies Record<string, IngredientMaster>;

/** 한 줄 입력: [원료, 배합%]. 정제수는 100% 잔량으로 자동 계산 */
type ActiveRow = [IngredientMaster, number];

function round3(n: number): number {
  return Math.round(n * 1000) / 1000;
}

/** actives(정제수 제외)로 BOM 생성. 정제수 = 100 - Σactives, 함량 = % × 용량 */
function buildBom(
  productId: string,
  volumeMl: number,
  actives: ActiveRow[],
): ProductBomLine[] {
  const activeTotal = actives.reduce((sum, [, pct]) => sum + pct, 0);
  const waterPct = Math.round((100 - activeTotal) * 100) / 100;
  const rows: ActiveRow[] = [[ING.water, waterPct], ...actives];
  return rows.map(([ing, percent], i) => ({
    id: `bom-${productId}-${i}`,
    itemCode: ing.code,
    itemName: ing.inci,
    qtyPerUnit: round3((percent / 100) * volumeMl),
    unit: "ml",
    percent,
  }));
}

// ──────────────────────────────────────────────────────────────────────────
// 브랜드 라인 · 제품 (PDF Initial 4종)
// ──────────────────────────────────────────────────────────────────────────

const NOW = "2026-06-05T00:00:00Z";

export const APPLICELL_BRAND_LINE: ChinaBrandLine = {
  id: "line-applicell",
  code: "APCL",
  name: "APPLICELL",
  description: "APPLICELL — 엑소좀 성장인자 기반 프리미엄 기능성 기초화장품",
  imageUrl: "/brand/applicell-logo.png",
  placedAt: NOW,
  manufacturerId: KOLMAR_CHINA.id,
  brandOwnerId: APPLICELL_KOREA.id,
};

function product(
  idSuffix: string,
  name: string,
  code: string,
  cosmeticType: CosmeticType,
  volumeMl: number,
  actives: ActiveRow[],
): CatalogProduct {
  const id = `prod-applicell-${idSuffix}`;
  return {
    id,
    lineId: APPLICELL_BRAND_LINE.id,
    name,
    code,
    cosmeticType,
    devDate: "2026-06-01",
    productVolume: { value: volumeMl, unit: "ml" },
    manufacturerId: KOLMAR_CHINA.id,
    bom: buildBom(id, volumeMl, actives),
    createdAt: NOW,
    updatedAt: NOW,
  };
}

export const APPLICELL_PRODUCTS: CatalogProduct[] = [
  // ① Lotion 130ml — 콜라겐·케라틴·엘라스틴·아데노신·베타인·트레할로스·마카다미아·의이인·스템셀
  product("lotion", "APPLICELL Lotion", "APCL-LOT-01", "lotion", 130, [
    [ING.glycerin, 8],
    [ING.butyleneGlycol, 5],
    [ING.propanediol, 5],
    [ING.macadamia, 4],
    [ING.betaine, 3],
    [ING.trehalose, 2],
    [ING.coix, 2],
    [ING.collagen, 2],
    [ING.keratin, 1.5],
    [ING.elastin, 1.5],
    [ING.stemCell, 1],
    [ING.poongran, 1],
    [ING.adenosine, 0.04],
    [ING.carbomer, 0.3],
    [ING.preservative, 0.8],
  ]),
  // ③ Intensive Serum 45ml — +콜라겐펩타이드
  product("serum", "APPLICELL Intensive Serum", "APCL-SER-01", "serum", 45, [
    [ING.glycerin, 10],
    [ING.butyleneGlycol, 6],
    [ING.propanediol, 6],
    [ING.betaine, 4],
    [ING.trehalose, 3],
    [ING.collagenPeptide, 3],
    [ING.keratin, 2],
    [ING.elastin, 2],
    [ING.coix, 2],
    [ING.macadamia, 2],
    [ING.stemCell, 2],
    [ING.poongran, 1.5],
    [ING.adenosine, 0.04],
    [ING.carbomer, 0.4],
    [ING.preservative, 1],
  ]),
  // ④ Miracle Cream 50ml — +세라마이드·콜라겐펩타이드
  product("cream", "APPLICELL Miracle Cream", "APCL-CRM-01", "cream", 50, [
    [ING.glycerin, 8],
    [ING.cct, 8],
    [ING.cetearyl, 5],
    [ING.shea, 4],
    [ING.macadamia, 4],
    [ING.butyleneGlycol, 4],
    [ING.betaine, 3],
    [ING.glycerylStearate, 2],
    [ING.trehalose, 2],
    [ING.collagenPeptide, 2],
    [ING.stemCell, 1.5],
    [ING.keratin, 1.5],
    [ING.elastin, 1.5],
    [ING.coix, 1.5],
    [ING.ceramide, 1],
    [ING.poongran, 1],
    [ING.adenosine, 0.04],
    [ING.preservative, 1],
  ]),
  // ⑤ Eye Cream 30ml — 아데노신·마카다미아·세라마이드·콜라겐펩타이드·스템셀
  product("eye-cream", "APPLICELL Eye Cream", "APCL-CRM-02", "cream", 30, [
    [ING.glycerin, 8],
    [ING.cct, 6],
    [ING.cetearyl, 5],
    [ING.macadamia, 4],
    [ING.butyleneGlycol, 4],
    [ING.shea, 3],
    [ING.betaine, 2],
    [ING.glycerylStearate, 2],
    [ING.collagenPeptide, 2],
    [ING.ceramide, 1.5],
    [ING.stemCell, 1.5],
    [ING.poongran, 1],
    [ING.adenosine, 0.04],
    [ING.preservative, 1],
  ]),
];

// ──────────────────────────────────────────────────────────────────────────
// 제품별 공급 통제 기준 (BOM 기준의 물류·인증 층)
// ──────────────────────────────────────────────────────────────────────────

export const APPLICELL_SUPPLY_SPECS: ChinaProductSupplySpec[] = [
  {
    productId: "prod-applicell-lotion",
    barcode: "8809-APCL-0001",
    packaging: { unitsPerInner: 10, innersPerCarton: 6, cartonsPerPallet: 48, unitNetWeightG: 165 },
    serialPolicy: "unit_qr",
    lotFormat: "APCL-LOT-YYMMDD-###",
    shelfLifeMonths: 30,
    functionalClaim: "주름개선 기능성(아데노신)",
    nmpaType: "general",
    lossAllowancePct: 5,
  },
  {
    productId: "prod-applicell-serum",
    barcode: "8809-APCL-0002",
    packaging: { unitsPerInner: 12, innersPerCarton: 8, cartonsPerPallet: 60, unitNetWeightG: 78 },
    serialPolicy: "unit_qr",
    lotFormat: "APCL-SER-YYMMDD-###",
    shelfLifeMonths: 30,
    functionalClaim: "주름개선 기능성(아데노신)",
    nmpaType: "general",
    lossAllowancePct: 5,
  },
  {
    productId: "prod-applicell-cream",
    barcode: "8809-APCL-0003",
    packaging: { unitsPerInner: 12, innersPerCarton: 6, cartonsPerPallet: 60, unitNetWeightG: 92 },
    serialPolicy: "unit_qr",
    lotFormat: "APCL-CRM-YYMMDD-###",
    shelfLifeMonths: 30,
    functionalClaim: "주름개선 기능성(아데노신)",
    nmpaType: "general",
    lossAllowancePct: 5,
  },
  {
    productId: "prod-applicell-eye-cream",
    barcode: "8809-APCL-0004",
    packaging: { unitsPerInner: 20, innersPerCarton: 8, cartonsPerPallet: 72, unitNetWeightG: 56 },
    serialPolicy: "unit_qr",
    lotFormat: "APCL-EYE-YYMMDD-###",
    shelfLifeMonths: 30,
    functionalClaim: "주름개선 기능성(아데노신)",
    nmpaType: "general",
    lossAllowancePct: 5,
  },
];

// ──────────────────────────────────────────────────────────────────────────
// 집계 export
// ──────────────────────────────────────────────────────────────────────────

export const CHINA_SUPPLY_CATALOG: ChinaSupplyCatalog = {
  brandOwners: [APPLICELL_KOREA],
  manufacturers: [KOLMAR_CHINA],
  brandLines: [APPLICELL_BRAND_LINE],
  products: APPLICELL_PRODUCTS,
  supplySpecs: APPLICELL_SUPPLY_SPECS,
};

export function getSupplySpec(productId: string): ChinaProductSupplySpec | undefined {
  return APPLICELL_SUPPLY_SPECS.find((s) => s.productId === productId);
}
