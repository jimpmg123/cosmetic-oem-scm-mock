import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const src = fs.readFileSync(path.join(root, "src/lib/i18n/translations.ts"), "utf8");
const start = src.indexOf('const ko: Dict = {');
const end = src.indexOf("};", start) + 2;
const koBlock = src.slice(start, end);

const dict = {};
const entryRe = /"([^"]+)":\s*"((?:[^"\\]|\\.)*)"/g;
let match;
while ((match = entryRe.exec(koBlock)) !== null) {
  dict[match[1]] = match[2];
}

const outDir = path.join(root, "src/lib/i18n/locales");
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, "ko.json"), JSON.stringify(dict, null, 2), "utf8");
console.log("keys:", Object.keys(dict).length);
