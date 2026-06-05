import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const dir = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "src/lib/i18n/locales");

function loadOptional(name) {
  const p = path.join(dir, name);
  if (!fs.existsSync(p)) return {};
  return JSON.parse(fs.readFileSync(p, "utf8"));
}

const ko = JSON.parse(fs.readFileSync(path.join(dir, "ko.json"), "utf8"));

const en = {
  ...ko,
  ...loadOptional("en-overrides.json"),
  ...loadOptional("en-overrides-b.json"),
  ...loadOptional("en-overrides-c.json"),
  ...loadOptional("en-overrides-d.json"),
};
const zh = {
  ...ko,
  ...loadOptional("zh-overrides.json"),
  ...loadOptional("zh-overrides-b.json"),
  ...loadOptional("zh-overrides-c.json"),
  ...loadOptional("zh-overrides-d.json"),
};

fs.writeFileSync(path.join(dir, "en.json"), JSON.stringify(en, null, 2) + "\n");
fs.writeFileSync(path.join(dir, "zh.json"), JSON.stringify(zh, null, 2) + "\n");
console.log("merged", Object.keys(ko).length, "keys");
