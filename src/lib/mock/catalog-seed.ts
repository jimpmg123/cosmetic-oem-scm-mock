import aevoraJson from "../../../test_data/cosmetic_ingredients_json/aevora.json";
import lumiaraJson from "../../../test_data/cosmetic_ingredients_json/lumiara.json";
import solenneJson from "../../../test_data/cosmetic_ingredients_json/solenne_atelier.json";
import verdenaJson from "../../../test_data/cosmetic_ingredients_json/verdena.json";
import {
  INITIAL_MANUFACTURERS,
  resolveManufacturerIdForLine,
  type ManufacturingCompany,
} from "@/lib/mock/manufacturer-seed";
import type {
  BrandLine,
  CatalogProduct,
  CosmeticType,
  ProductBomLine,
  VolumeAmount,
} from "@/lib/mock/product-catalog";

/** product-catalog와 순환 import 방지 — 코드 접두사만 로컬 정의 */
const TYPE_CODE_SHORT: Record<CosmeticType, string> = {
  lotion: "LOT",
  toner: "TON",
  serum: "SER",
  ampoule: "AMP",
  cream: "CRM",
  lipstick: "LIP",
  mascara: "MSC",
  cleanser: "CLN",
  other: "ETC",
};

type IngredientRow = {
  name: string;
  percent: number;
  amount: VolumeAmount;
};

type IngredientEntry = {
  line: string;
  manufacturerId?: string;
  type: string;
  name: string;
  productVolume: VolumeAmount;
  ingredients: IngredientRow[];
};

const LINE_META: Record<
  string,
  { id: string; code: string; description: string; imageFolder: string }
> = {
  Aevora: {
    id: "line-aevora",
    code: "AEVO",
    description: "Aevora — marine hydration skincare",
    imageFolder: "aevora",
  },
  Lumiara: {
    id: "line-lumiara",
    code: "LUMI",
    description: "Lumiara — radiance skincare",
    imageFolder: "lumiara",
  },
  Verdena: {
    id: "line-verdena",
    code: "VERD",
    description: "Verdena — cica biome care",
    imageFolder: "verdena",
  },
  "Solenne Atelier": {
    id: "line-solenne-atelier",
    code: "SOLN",
    description: "Solenne Atelier — rose quartz luxury care",
    imageFolder: "solenne",
  },
};

/** test_images/brand_line images → public/catalog/brand-lines */
const LINE_LOGO_DIR = "brand-lines";

const LINE_LOGO_FILE: Record<string, string> = {
  Aevora: "Aevora_brand.png",
  Lumiara: "Lumiara_brand.png",
  Verdena: "Verdena_brand.png",
  "Solenne Atelier": "Solenne_atelier_brand.png",
};

const IMAGE_FILE: Record<string, Record<string, string>> = {
  Aevora: {
    Serum: "Aevora_serum_30.png",
    Toner: "Aevora_toner_150.png",
    Ampoule: "Aevora_ampoule_15.png",
    Lotion: "Aevora_lotion_150.png",
  },
  Lumiara: {
    Serum: "Lumi_serum_30.png",
    Toner: "Lumi_toner_150.png",
    Ampoule: "Lumi_ampoule_15.png",
    Lotion: "Lumi_lotion_150.png",
  },
  Verdena: {
    Serum: "Verd_serum_30.png",
    Toner: "Verd_toner_150.png",
    Ampoule: "Verd_ampoule_15.png",
    Lotion: "Verd_lotion_150.png",
  },
  "Solenne Atelier": {
    Serum: "Sol_serum_40.png",
    Toner: "Sol_toner_180.png",
    Ampoule: "Sol_ampoule_20.png",
    Cream: "Sol_cream_50.png",
  },
};

function mapCosmeticType(type: string): CosmeticType {
  const key = type.toLowerCase();
  if (key === "serum") return "serum";
  if (key === "toner") return "toner";
  if (key === "lotion") return "lotion";
  if (key === "ampoule") return "ampoule";
  if (key === "cream") return "cream";
  return "other";
}

function itemCodeFromName(name: string): string {
  const slug = name
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 28);
  return `RM-${slug}`;
}

function productId(line: string, type: string): string {
  const lineSlug = line.toLowerCase().replace(/\s+/g, "-");
  return `prod-${lineSlug}-${type.toLowerCase()}`;
}

function buildProductCode(lineCode: string, cosmeticType: CosmeticType, index: number): string {
  const short = TYPE_CODE_SHORT[cosmeticType] ?? "ETC";
  return `${lineCode}-${short}-${String(index).padStart(2, "0")}`;
}

export function buildCatalogSeedFromTestData(manufacturers: ManufacturingCompany[]): {
  brandLines: BrandLine[];
  products: CatalogProduct[];
} {
  const entries = [
    ...(aevoraJson as IngredientEntry[]),
    ...(lumiaraJson as IngredientEntry[]),
    ...(verdenaJson as IngredientEntry[]),
    ...(solenneJson as IngredientEntry[]),
  ];
  const brandLines: BrandLine[] = [];
  const lineSeen = new Set<string>();

  for (const entry of entries) {
    if (lineSeen.has(entry.line)) continue;
    lineSeen.add(entry.line);
    const meta = LINE_META[entry.line];
    if (!meta) continue;
    const manufacturerId = resolveManufacturerIdForLine(
      manufacturers,
      entry.line,
      entry.manufacturerId,
    );
    if (!manufacturerId) {
      throw new Error(`No manufacturer for line: ${entry.line}`);
    }
    brandLines.push({
      id: meta.id,
      code: meta.code,
      name: entry.line,
      description: meta.description,
      imageUrl: LINE_LOGO_FILE[entry.line]
        ? `/catalog/${LINE_LOGO_DIR}/${LINE_LOGO_FILE[entry.line]}`
        : undefined,
      placedAt: "2026-06-05T00:00:00Z",
      manufacturerId,
    });
  }

  const codeCount: Record<string, number> = {};
  const products: CatalogProduct[] = entries.map((entry) => {
    const meta = LINE_META[entry.line];
    if (!meta) {
      throw new Error(`Unknown line in cosmetic_ingredients_json: ${entry.line}`);
    }
    const cosmeticType = mapCosmeticType(entry.type);
    const countKey = `${meta.code}-${cosmeticType}`;
    codeCount[countKey] = (codeCount[countKey] ?? 0) + 1;
    const code = buildProductCode(meta.code, cosmeticType, codeCount[countKey]);

    const imageFile = IMAGE_FILE[entry.line]?.[entry.type];
    const imageUrl = imageFile
      ? `/catalog/${meta.imageFolder}/${imageFile}`
      : undefined;

    const bom: ProductBomLine[] = entry.ingredients.map((ing, i) => ({
      id: `bom-${productId(entry.line, entry.type)}-${i}`,
      itemCode: itemCodeFromName(ing.name),
      itemName: ing.name,
      qtyPerUnit: ing.amount.value,
      unit: ing.amount.unit,
      percent: ing.percent,
    }));

    const manufacturerId = resolveManufacturerIdForLine(
      manufacturers,
      entry.line,
      entry.manufacturerId,
    );

    const now = "2026-06-05T00:00:00Z";
    return {
      id: productId(entry.line, entry.type),
      lineId: meta.id,
      name: entry.name,
      code,
      cosmeticType,
      devDate: "2026-06-01",
      imageUrl,
      productVolume: entry.productVolume,
      manufacturerId,
      bom,
      createdAt: now,
      updatedAt: now,
    };
  });

  return { brandLines, products };
}

const _catalogSeed = buildCatalogSeedFromTestData(INITIAL_MANUFACTURERS);
export const INITIAL_CATALOG_FROM_SEED = _catalogSeed;
