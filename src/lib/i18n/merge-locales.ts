/**
 * Build-time helper: run `npx tsx src/lib/i18n/merge-locales.ts` to regenerate en.json / zh.json from ko + overrides.
 */
import fs from "fs";
import path from "path";
import ko from "./locales/ko.json";
import enA from "./locales/en-overrides.json";
import enB from "./locales/en-overrides-b.json";
import enC from "./locales/en-overrides-c.json";
import zhA from "./locales/zh-overrides.json";
import zhB from "./locales/zh-overrides-b.json";

const dir = path.join(__dirname, "locales");
const en = { ...ko, ...enA, ...enB, ...enC };
const zh = { ...ko, ...zhA, ...zhB };

fs.writeFileSync(path.join(dir, "en.json"), `${JSON.stringify(en, null, 2)}\n`);
fs.writeFileSync(path.join(dir, "zh.json"), `${JSON.stringify(zh, null, 2)}\n`);

console.log("ko", Object.keys(ko).length);
console.log("en", Object.keys(en).length);
console.log("zh", Object.keys(zh).length);
