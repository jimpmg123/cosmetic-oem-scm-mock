/**
 * Extracts ko from translations.ts, merges en/zh overrides, adds extra keys, writes locales/*.json
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const srcPath = path.join(root, "src/lib/i18n/translations.ts");
const src = fs.readFileSync(srcPath, "utf8");

function parseDictBlock(blockName) {
  const marker = `const ${blockName}: Dict = {`;
  const start = src.indexOf(marker);
  if (start < 0) throw new Error(`Missing ${blockName}`);
  const end = src.indexOf("\n};", start);
  const block = src.slice(start, end + 3);
  const dict = {};
  const entryRe = /"([^"]+)":\s*"((?:[^"\\]|\\.)*)"/g;
  let match;
  while ((match = entryRe.exec(block)) !== null) {
    dict[match[1]] = match[2].replace(/\\n/g, "\n");
  }
  return dict;
}

const ko = parseDictBlock("ko");
const enOverrides = parseDictBlock("en");
const zhOverrides = parseDictBlock("zh");

const EXTRA = {
  "timeline.created": { ko: "물량 생성", en: "Volume created", zh: "物量创建" },
  "timeline.shipped": { ko: "A 출하 완료", en: "A shipment completed", zh: "A 出货完成" },
  "timeline.ack": { ko: "B 착수", en: "B started", zh: "B 开工" },
  "timeline.ackPending": { ko: "B 착수 대기", en: "Awaiting B start", zh: "等待 B 开工" },
  "timeline.directive": { ko: "지시", en: "Directive", zh: "期间指令" },
  "timeline.depleted": { ko: "자재 소진", en: "Material depleted", zh: "原料耗尽" },
  "timeline.closed": { ko: "물량 마감", en: "Volume closed", zh: "物量结案" },
  "directive.status.draft": { ko: "초안", en: "Draft", zh: "草稿" },
  "directive.status.issued": { ko: "발행", en: "Issued", zh: "已发布" },
  "directive.status.in_progress": { ko: "진행중", en: "In progress", zh: "进行中" },
  "directive.status.met": { ko: "달성", en: "Met", zh: "达成" },
  "directive.status.missed": { ko: "미달", en: "Missed", zh: "未达成" },
  "directive.status.cancelled": { ko: "취소", en: "Cancelled", zh: "已取消" },
  "format.dday.overdue": { ko: "+{n}일 경과", en: "+{n}d overdue", zh: "逾期 {n} 天" },
  "format.dday.today": { ko: "D-day", en: "D-day", zh: "D-day" },
  "format.dday.until": { ko: "D-{n}", en: "D-{n}", zh: "D-{n}" },
  "common.loading": { ko: "로딩 중…", en: "Loading…", zh: "加载中…" },
  "common.units": { ko: "개", en: "units", zh: "个" },
  "common.editTitle": { ko: "편집", en: "Edit", zh: "编辑" },
  "admin.users.title": { ko: "사용자 및 권한", en: "Users & Roles", zh: "用户与权限" },
  "admin.companies.title": { ko: "회사", en: "Companies", zh: "公司" },
  "admin.settings.title": { ko: "설정", en: "Settings", zh: "设置" },
  "admin.audit.title": { ko: "감사 로그", en: "Audit Log", zh: "审计日志" },
  "erp.po.title": { ko: "구매 주문 (PO)", en: "Purchase Orders", zh: "采购订单 (PO)" },
  "erp.po.desc": { ko: "위탁 PO — B vendor", en: "Outsourced PO — vendor B", zh: "委外 PO — B 供应商" },
  "erp.bom.title": { ko: "자재 명세 (BOM)", en: "Bills of Materials", zh: "物料清单 (BOM)" },
  "erp.bom.desc": { ko: "Component Yield 포함 BOM", en: "BOM with component yield", zh: "含组件良率的 BOM" },
  "erp.inventory.title": { ko: "재고", en: "Inventory", zh: "库存" },
  "erp.inventory.desc": { ko: "KR / CN vendor / In-transit / WH", en: "KR / CN vendor / In-transit / WH", zh: "KR / CN 供应商 / 在途 / 仓库" },
  "erp.assembly.title": { ko: "조립 빌드", en: "Assembly Builds", zh: "装配构建" },
  "erp.assembly.desc": { ko: "Planned vs actual", en: "Planned vs actual", zh: "计划 vs 实际" },
  "placeholder.pageDesc": {
    ko: "화면 구조 placeholder — 다음 단계에서 테이블·폼 구현",
    en: "Screen placeholder — tables and forms coming next",
    zh: "页面占位 — 后续实现表格与表单",
  },
  "sidebar.brand": { ko: "생산·물량 추적", en: "Production Tracking", zh: "生产追踪" },
  "dashboard.alert.title": { ko: "조치 필요", en: "Action Required", zh: "需要处理" },
  "dashboard.alert.inbound": { ko: "입고", en: "inbound", zh: "入库" },
  "dashboard.alert.units": { ko: "단위", en: "units", zh: "单位" },
  "dashboard.alert.viewRecon": { ko: "대사 보기", en: "View Reconciliation", zh: "查看对账" },
  "dashboard.kpi.e2eSub": { ko: "end-to-end", en: "end-to-end", zh: "端到端" },
  "mobile.shipmentNotFound": { ko: "출하 건을 찾을 수 없습니다.", en: "Shipment not found.", zh: "未找到出货单。" },
};

/** Load hand-maintained full EN/ZH from sibling files if present */
function loadOptional(name) {
  const p = path.join(root, `scripts/i18n-${name}-overrides.json`);
  if (!fs.existsSync(p)) return {};
  return JSON.parse(fs.readFileSync(p, "utf8"));
}

const EN_FULL = loadOptional("en");
const ZH_FULL = loadOptional("zh");

function hasHangul(s) {
  return /[\u3131-\uD79D]/.test(s);
}

function buildEn(key, koVal) {
  if (EXTRA[key]) return EXTRA[key].en;
  if (EN_FULL[key]) return EN_FULL[key];
  if (enOverrides[key] && enOverrides[key] !== koVal) return enOverrides[key];
  if (!hasHangul(koVal)) return koVal;
  return koVal;
}

function buildZh(key, koVal, enVal) {
  if (EXTRA[key]) return EXTRA[key].zh;
  if (ZH_FULL[key]) return ZH_FULL[key];
  if (zhOverrides[key] && zhOverrides[key] !== enVal && zhOverrides[key] !== koVal) return zhOverrides[key];
  if (!hasHangul(koVal) && zhOverrides[key]) return zhOverrides[key];
  if (!hasHangul(enVal)) return enVal;
  return enVal;
}

const allKeys = new Set([...Object.keys(ko), ...Object.keys(EXTRA)]);
const koOut = {};
const enOut = {};
const zhOut = {};

for (const key of [...allKeys].sort()) {
  const koVal = EXTRA[key]?.ko ?? ko[key] ?? "";
  koOut[key] = koVal;
  enOut[key] = buildEn(key, koVal);
  zhOut[key] = buildZh(key, koVal, enOut[key]);
}

const outDir = path.join(root, "src/lib/i18n/locales");
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, "ko.json"), JSON.stringify(koOut, null, 2) + "\n");
fs.writeFileSync(path.join(outDir, "en.json"), JSON.stringify(enOut, null, 2) + "\n");
fs.writeFileSync(path.join(outDir, "zh.json"), JSON.stringify(zhOut, null, 2) + "\n");

console.log("ko:", Object.keys(koOut).length);
console.log("en:", Object.keys(enOut).length);
console.log("zh:", Object.keys(zhOut).length);
console.log("en still hangul:", Object.values(enOut).filter(hasHangul).length);
console.log("zh still hangul:", Object.values(zhOut).filter(hasHangul).length);
