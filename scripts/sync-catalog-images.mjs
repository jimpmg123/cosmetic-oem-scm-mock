/**
 * test_images/ → public/catalog/ (Next.js 정적 제공)
 * JSON은 test_data에만 두고, 이미지는 test_images만 소스로 사용합니다.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const srcRoot = path.join(root, "test_images");
const destRoot = path.join(root, "public", "catalog");
const brandLineSrc = path.join(srcRoot, "brand_line images");
const brandLineDest = path.join(destRoot, "brand-lines");

/** 제품 PNG 폴더가 아닌 항목 (별도 sync) */
const NON_PRODUCT_DIRS = new Set(["brand_line images"]);

if (!fs.existsSync(srcRoot)) {
  console.warn("[sync-catalog-images] test_images/ 없음 — 스킵");
  process.exit(0);
}

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const name of fs.readdirSync(src)) {
    const s = path.join(src, name);
    const d = path.join(dest, name);
    if (fs.statSync(s).isDirectory()) {
      copyDir(s, d);
    } else {
      fs.copyFileSync(s, d);
    }
  }
}

fs.mkdirSync(destRoot, { recursive: true });
for (const folder of fs.readdirSync(srcRoot)) {
  if (NON_PRODUCT_DIRS.has(folder)) continue;
  const src = path.join(srcRoot, folder);
  if (!fs.statSync(src).isDirectory()) continue;
  copyDir(src, path.join(destRoot, folder));
  console.log(`[sync-catalog-images] ${folder} → public/catalog/${folder}`);
}

if (fs.existsSync(brandLineSrc)) {
  copyDir(brandLineSrc, brandLineDest);
  console.log("[sync-catalog-images] brand_line images → public/catalog/brand-lines");
}
