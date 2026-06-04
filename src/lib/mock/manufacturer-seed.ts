import manufacturersJson from "../../../test_data/cosmetic_manufacturers_json/cosmetic_manufacturers.json";

export type ManufacturingCompany = {
  id: string;
  name: string;
  chineseName: string;
  concept?: string;
  /** 담당 브랜드 라인명 (카탈로그 line name) */
  lineNames: string[];
};

type ManufacturerRow = {
  id: string;
  manufacturerName: string;
  chineseName: string;
  concept?: string;
  lines: string[];
};

export function buildManufacturersFromTestData(): ManufacturingCompany[] {
  return (manufacturersJson as ManufacturerRow[]).map((row) => ({
    id: row.id,
    name: row.manufacturerName,
    chineseName: row.chineseName,
    concept: row.concept,
    lineNames: row.lines ?? [],
  }));
}

export function resolveManufacturerIdForLine(
  manufacturers: ManufacturingCompany[],
  lineName: string,
  explicitId?: string,
): string | undefined {
  if (explicitId) return explicitId;
  return manufacturers.find((m) => m.lineNames.includes(lineName))?.id;
}

export function getManufacturerById(
  manufacturers: ManufacturingCompany[],
  id: string | undefined,
): ManufacturingCompany | undefined {
  if (!id) return undefined;
  return manufacturers.find((m) => m.id === id);
}

export function formatManufacturerLabel(m: ManufacturingCompany): string {
  return `${m.name} (${m.chineseName})`;
}

export const INITIAL_MANUFACTURERS = buildManufacturersFromTestData();
