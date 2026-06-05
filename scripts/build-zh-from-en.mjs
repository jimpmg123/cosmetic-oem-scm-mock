/**
 * Build zh-overrides-c.json: keys still Korean in zh use Chinese from en-overrides-* where available,
 * else copy en.json (English) only as last resort — prefer manual zh in overrides files.
 * Run after: node scripts/merge-locales.mjs (with en-d)
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const dir = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "src/lib/i18n/locales");
const load = (n) => JSON.parse(fs.readFileSync(path.join(dir, n), "utf8"));

const ko = load("ko.json");
const en = load("en.json");
const zhDone = {
  ...load("zh-overrides.json"),
  ...load("zh-overrides-b.json"),
};
const hangul = /[\uac00-\ud7a3]/;

/** en key → zh UI (batch for keys missing from zh-overrides a/b) */
const ZH = {
  "role.switch": "切换角色",
  "nav.group.erp": "ERP（演示）",
  "bundle.col.yieldE2eFinal": "E2E（已结案）",
  "bundle.col.e2eFinal": "E2E（已结案）",
  "bundle.kpi.activeCount": "进行中捆",
  "bundle.kpi.shippedMonth": "本月出货",
  "bundle.kpi.pendingInbound": "待入库出货",
  "bundle.kpi.avgInboundAchievement": "平均达成率（C入库）",
  "bundle.kpi.avgE2e": "平均达成率（C入库）",
  "bundle.kpi.target": "目标",
  "bundle.kpi.produced": "累计生产",
  "bundle.kpi.shippedToC": "B→C 出货",
  "bundle.kpi.receivedAtC": "C 入库",
  "bundle.filter.search": "捆号、WO/PO 搜索",
  "bundle.chip.active": "进行中",
  "bundle.chip.atRisk": "临期",
  "bundle.action.issueDirective": "发布指令",
  "bundle.action.detail": "详情",
  "bundle.action.markShipped": "出货完成",
  "bundle.action.deplete": "原料耗尽",
  "bundle.action.close": "捆结案",
  "bundle.confirm.ship": "向 B 公开并标记出货完成？",
  "bundle.confirm.deplete": "标记为耗尽？",
  "bundle.confirm.close": "结案此原料捆？",
  "bundle.section.summary": "摘要",
  "bundle.section.basic": "基本信息",
  "bundle.section.shipment": "原料出货",
  "bundle.section.timeline": "时间线",
  "bundle.section.detail": "详情",
  "bundle.donut.e2e": "C入库 ÷ 目标",
  "bundle.donut.e2eHint": "C入库 ÷ A目标（结案）",
  "bundle.donut.inboundAchievement": "整体达成率（C入库）",
  "bundle.donut.inboundAchievementTitle": "整体达成率",
  "bundle.donut.productionTitle": "整体达成率（生产）",
  "bundle.donut.production": "B申报生产 ÷ 目标",
  "bundle.donut.yield": "良率（C入库 ÷ 发货基准）",
  "bundle.donut.yieldTitle": "良率",
  "bundle.donut.materialYield": "良率（C入库 ÷ 发货基准）",
  "bundle.donut.materialYieldTitle": "良率",
  "bundle.donut.received": "C 入库",
  "bundle.donut.producedLabel": "累计生产",
  "bundle.donut.remaining": "目标余量",
  "bundle.card.filters": "筛选",
  "bundle.card.list": "原料捆列表",
  "bundle.card.listCount": "条",
  "bundle.nextDirective": "下条指令",
  "bundle.until": "截止",
  "bundle.notShipped": "未出货",
  "bundle.events": "条",
  "bundle.timeline.expand": "全部记录",
  "bundle.timeline.collapse": "收起",
  "bundle.tab.reconciliation": "对账",
  "bundle.tab.directives": "期间指令",
  "bundle.tab.daily": "每日生产",
  "bundle.tab.shipments": "出货 → C",
  "bundle.empty.tab": "暂无信息",
  "bundle.empty.dailyLink": "在每日生产日志中填写",
  "bundle.empty.shipLink": "登记出货",
  "bundle.recon.yield": "良率（C入库÷发货基准）",
  "bundle.recon.production": "良率（C入库÷发货基准）",
  "bundle.recon.e2e": "E2E（C入库÷目标）",
  "bundle.recon.material": "相对 BOM 入库率",
  "bundle.recon.bProduced": "B 申报生产",
  "bundle.recon.bcDiff": "B↔C 差异",
  "bundle.recon.fullLink": "全部对账",
  "bundle.directive.title": "发布期间指令",
  "bundle.directive.startDate": "开始日",
  "bundle.directive.dueDate": "截止日",
  "bundle.directive.dailyPaceHint": "日目标（y÷天数）：",
  "bundle.directive.period": "期间",
  "bundle.directive.targetQty": "目标数量",
  "bundle.directive.comment": "备注",
  "bundle.directive.commentPlaceholder": "节假日、大促、需求变动等",
  "bundle.directive.issue": "发布",
  "bundle.daily.date": "日期",
  "bundle.daily.produced": "生产",
  "bundle.daily.defect": "不良",
  "bundle.shipment.number": "出货单号",
  "bundle.shipment.shipped": "B 发货",
  "bundle.shipment.received": "C 入库",
  "bundle.form.vendor": "B 工厂",
  "bundle.form.theoretical": "可生产数量",
  "bundle.form.target": "目标",
  "bundle.form.useFrom": "使用开始日",
  "bundle.form.useBy": "最迟使用日",
  "bundle.form.period": "使用期间",
  "bundle.form.poWo": "PO / WO 参考",
  "bundle.form.note": "备注（内部）",
  "bundle.form.materialShipQty": "换算出货量",
  "bundle.form.shippedAt": "出货日",
  "bundle.form.errorTarget": "目标不得超过可生产数量",
  "bundle.form.errorDates": "开始日须早于截止日",
  "bundle.form.errorShipDate": "出货完成须填写出货日",
  "bundle.form.errorUseBy": "请填写最迟使用日",
  "bundle.form.cancelConfirm": "取消编辑并返回列表？",
  "bundle.new.title": "新建原料捆",
  "bundle.new.desc": "保存后自动分配 MB-YYYY-NNN 编号",
  "bundle.new.saveAndShip": "保存并出货完成 → active",
  "bundle.bList.title": "原料捆",
  "bundle.bList.desc": "进行中捆（只读）",
  "bundle.bList.allTable": "全部列表",
  "bundle.bCta.log": "填写日志",
  "bundle.bCta.ship": "登记出货",
  "bundle.bCta.receipt": "确认入库",
  "bundle.daily.qc": "QC 抽样",
  "bundle.atRiskReceipt": "原料入库未确认 — 生产记录为临时数据",
  "format.dday.overdue": "逾期 {n} 天",
  "yieldOverview.company.desc": "达成率=进行中 · E2E=已结案捆",
  "yieldOverview.company.inboundAchievement": "整体达成率（C入库）",
  "yieldOverview.company.yieldE2eFinal": "E2E（结案）",
  "yieldOverview.company.e2eFinal": "E2E（结案）",
  "yieldOverview.company.e2e": "E2E（结案）",
  "yieldOverview.company.achievement": "整体达成率（C入库）",
  "yieldOverview.company.bShipped": "B→C 出货",
  "yieldOverview.company.cReceived": "C 入库",
};

const out = { ...ZH };
for (const k of Object.keys(ko)) {
  if (zhDone[k] && !hangul.test(zhDone[k])) continue;
  if (out[k]) continue;
  const enVal = en[k];
  if (enVal && !hangul.test(enVal)) {
    // Skip: prefer explicit ZH map only for this pass
    continue;
  }
}

// Second pass: map remaining from en where no ZH yet
for (const k of Object.keys(ko)) {
  if (zhDone[k] && !hangul.test(zhDone[k])) continue;
  if (out[k]) continue;
  const enVal = en[k];
  if (enVal && !hangul.test(enVal)) out[k] = enVal;
}

fs.writeFileSync(path.join(dir, "zh-overrides-c.json"), JSON.stringify(out, null, 2) + "\n");
console.log("zh-overrides-c keys:", Object.keys(out).length);
