/**
 * zh-overrides-d.json: keys still Korean in merged zh → English from en.json
 * Run: node scripts/merge-locales.mjs && node scripts/build-zh-overrides-d.mjs && node scripts/merge-locales.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const dir = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "src/lib/i18n/locales");
const load = (n) => JSON.parse(fs.readFileSync(path.join(dir, n), "utf8"));

const ko = load("ko.json");
const en = load("en.json");
const zh = load("zh.json");
const hangul = /[\uac00-\ud7a3]/;

const out = {};
for (const k of Object.keys(ko)) {
  const zhVal = zh[k];
  if (!zhVal || !hangul.test(zhVal)) continue;
  const enVal = en[k];
  if (enVal && !hangul.test(enVal)) out[k] = enVal;
}

fs.writeFileSync(path.join(dir, "zh-overrides-d.json"), JSON.stringify(out, null, 2) + "\n");
console.log("zh-overrides-d keys:", Object.keys(out).length);
