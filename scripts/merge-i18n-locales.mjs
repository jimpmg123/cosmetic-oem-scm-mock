import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const locales = path.join(root, "src/lib/i18n/locales");

function load(name) {
  return JSON.parse(fs.readFileSync(path.join(locales, name), "utf8"));
}

const ko = load("ko.json");
const en = { ...ko, ...load("en-overrides.json"), ...load("en-overrides-b.json"), ...load("en-overrides-c.json") };
const zh = { ...ko, ...load("zh-overrides.json"), ...load("zh-overrides-b.json") };

const hasHangul = (s) => /[\u3131-\uD79D]/.test(s);

fs.writeFileSync(path.join(locales, "en.json"), `${JSON.stringify(en, null, 2)}\n`);
fs.writeFileSync(path.join(locales, "zh.json"), `${JSON.stringify(zh, null, 2)}\n`);

const koKeys = Object.keys(ko).length;
const enKeys = Object.keys(en).length;
const zhKeys = Object.keys(zh).length;
const enHangul = Object.entries(en).filter(([, v]) => hasHangul(v)).length;
const zhHangul = Object.entries(zh).filter(([, v]) => hasHangul(v)).length;

console.log(JSON.stringify({ koKeys, enKeys, zhKeys, enHangul, zhHangul }, null, 2));
