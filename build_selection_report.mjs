import fs from "node:fs/promises";
import path from "node:path";
import { SpreadsheetFile, Workbook } from "@oai/artifact-tool";

const outDir = path.resolve("outputs/product_selection_analysis");
await fs.mkdir(outDir, { recursive: true });

const wb = Workbook.create();

const summary = wb.worksheets.add("结论看板");
const detail = wb.worksheets.add("评分明细");
const actions = wb.worksheets.add("改款验证");
const source = wb.worksheets.add("原表摘录");

const candidates = [
  {
    product: "Highland Cow Ice Cube Mold",
    tier: "主推",
    demand: 5,
    gap: 4.5,
    diff: 5,
    risk: 4,
    execution: 4,
    decision: "可做，优先打样",
    reason: "Keepa持续增长，周排名/搜索量上升，小类新品榜排位靠前；关键词下暂无新品，且竞品差评集中在拿不稳、洒水、异味、半面冰块，属于可通过结构和材质改善的问题。",
    concept: "做“高地牛完整立体冰模”：加宽防洒注水口、底部稳固托盘、双面成型、铂金硅胶低异味、毛发和牛角细节重做，包装突出礼品属性。",
    validation: "先做3D渲染和手板，测注水/脱模/成冰完整率；用3套视觉方案测主图点击，再小批量验证差评点是否被消除。",
  },
  {
    product: "ninja creami containers",
    tier: "主推",
    demand: 5,
    gap: 4,
    diff: 4,
    risk: 3,
    execution: 4,
    decision: "可做，但要控品牌/IP表述",
    reason: "20名销量416，半年内上品14；Keepa上升；最新类似产品上架91天月销586、评分39，证明新品仍能起量。属于机器配件复购场景。",
    concept: "做多型号兼容套装：明确NC300/NC500等型号，颜色区分、可书写日期标签、防漏盖、刻度线、耐低温抗裂；页面避免品牌侵权式表达。",
    validation: "先确认官方型号尺寸和兼容差异，做冻融/洗碗机/跌落测试；小批量按型号拆Listing，避免一个Listing覆盖过多型号导致差评。",
  },
  {
    product: "toilet tank tablet holder",
    tier: "小批测试",
    demand: 3.5,
    gap: 5,
    diff: 3.5,
    risk: 4.5,
    execution: 4,
    decision: "可小批量测试",
    reason: "亚马逊在卖商家仅一家，词条多为老品；Keepa上涨，有相似新品上架83天月销50+。竞争低，但需求体量可能偏小。",
    concept: "做可调节挂架/吸盘双用款，适配不同水箱高度，防片剂直接腐蚀零件；用“延长清洁片释放、减少水箱接触”做卖点。",
    validation: "先用低模具成本结构测试；确认目标客单价、FBA费和评论关键词，若30天广告转化不足则停止放量。",
  },
  {
    product: "stainless steel baby plates with suction + toddler spoons and forks",
    tier: "条件可做",
    demand: 4,
    gap: 3.5,
    diff: 4,
    risk: 2.8,
    execution: 3.5,
    decision: "可做套装，不建议单卖",
    reason: "婴幼儿餐具搜索趋势有上涨，首页多老品；不锈钢吸盘餐盘可与刀叉搭配卖，存在套装化空间。主要风险在儿童产品合规和材质测试。",
    concept: "做分龄套装：不锈钢内胆+强吸盘硅胶底+双耳防烫，搭配圆角叉勺；强调可拆洗、防摔、防滑、无味食品级硅胶。",
    validation: "先核CPC/ASTM/CPSIA/FDA食物接触测试成本；页面定位以套装差异化，避免和低价硅胶盘正面打。",
  },
  {
    product: "dog lick bowl",
    tier: "条件可做",
    demand: 3.8,
    gap: 2.5,
    diff: 4.5,
    risk: 3.5,
    execution: 4,
    decision: "只做防掀翻改款",
    reason: "20名销量1133但Keepa下降，半年内上品58，竞争明显；核心差评集中在中大型犬容易掀翻洒一地，改结构才有机会。",
    concept: "做重心下沉防翻款：宽底盘、强吸盘/防滑圈、边缘防溢、慢食纹路；直接定位中大型犬，避开普通舔碗同质化。",
    validation: "用中大型犬实测视频做卖点验证；若结构不能显著防掀翻，则不建议开模。",
  },
  {
    product: "reusable water balloons",
    tier: "季节机会",
    demand: 5,
    gap: 2,
    diff: 4,
    risk: 1.5,
    execution: 3,
    decision: "谨慎做，只适合季节快反",
    reason: "夏季销量强，20名销量1113，最新14天上架月销265，27天上架销量2237；但半年内上品41、集中度约80%，低价且磁性/儿童合规风险高。",
    concept: "如做，必须以安全合规为第一卖点：隐藏磁体、防误吞结构、无邻苯/无味硅胶、收纳袋材料合规，配水枪/收纳桶做套装差异。",
    validation: "只在合规资料齐全时试水；上架窗口要赶在夏季前，旺季后不追货。",
  },
  {
    product: "silicone lunch box",
    tier: "观察",
    demand: 3,
    gap: 3.5,
    diff: 3.5,
    risk: 4,
    execution: 3.5,
    decision: "暂不主推",
    reason: "20名销量420，半年内上品10，暂未找到同款竞品；但搜索量涨幅不大，需求爆发性不足。",
    concept: "若做，需要从密封、防漏、折叠收纳或便当分隔上形成清晰差异。",
    validation: "先复核客单价和FBA体积费，若不能做出高客单套装则不投入。",
  },
  {
    product: "toddler spoons and forks",
    tier: "观察",
    demand: 3.5,
    gap: 3,
    diff: 2.5,
    risk: 2.5,
    execution: 3.5,
    decision: "不建议单独做",
    reason: "搜索趋势上涨但首页基本为老品；单品同质化强，且属于儿童/食物接触产品，合规成本会稀释利润。",
    concept: "只作为婴儿餐盘套装配件，提升组合客单价。",
    validation: "与餐盘联动测试，不单独开独立Listing。",
  },
  {
    product: "stainless snack container",
    tier: "放弃",
    demand: 3,
    gap: 2,
    diff: 2,
    risk: 3.5,
    execution: 3,
    decision: "不建议做",
    reason: "搜索量上升但150-300天产品较多，缺少新颖改款空间；与同类不锈钢零食容器市场情况接近。",
    concept: "除非有明显防漏/分隔/儿童学校场景优势，否则不投入。",
    validation: "无需优先验证。",
  },
  {
    product: "stainless snack containers with lids",
    tier: "放弃",
    demand: 2.5,
    gap: 2,
    diff: 2.5,
    risk: 3.5,
    execution: 3,
    decision: "不建议做",
    reason: "Keepa近期下滑，首页已有第一和第四位同款；90天内新品较少并不等于机会，反而可能说明新品难突破。",
    concept: "若做只能走套装和材质升级，但不作为当前优先项。",
    validation: "无需优先验证。",
  },
  {
    product: "Silicone Air Fryer Baking Tray",
    tier: "放弃",
    demand: 2,
    gap: 1.5,
    diff: 2.5,
    risk: 4,
    execution: 3.5,
    decision: "不建议做",
    reason: "相似产品很多，词条市场已饱和，首页为上架较久老品；即使完全同款未找到，也难形成强差异。",
    concept: "若要做，必须避开通用内衬，转向特定机型配件或高温安全背书。",
    validation: "除非供应链已有极低成本优势，否则不测。",
  },
  {
    product: "magnetic fidget balls",
    tier: "放弃",
    demand: 2,
    gap: 1,
    diff: 1.5,
    risk: 0.5,
    execution: 2,
    decision: "坚决不建议做",
    reason: "20名销量2249但Keepa下降，低价内卷，新品评价已到800+且疑似翻新；同时磁性玩具吞食风险和合规压力极高。",
    concept: "不建议立项。",
    validation: "无需验证，直接淘汰。",
  },
];

const sourceRows = [
  ["Highland Cow Ice Cube Mold", "Keepa持续增长，周排名周搜索量上升趋势，小类新品榜排位第三，关键词条下暂无新品，同类竞品差评点集中在放水后拿不稳/洒水/有异味/仅半面冰块。"],
  ["toilet tank tablet holder", "在卖此品的亚马逊商家仅一家，词条下多为老品，Keepa曲线上涨，有外形相似新品，上架83天，月销50+。"],
  ["Silicone Air Fryer Baking Tray", "相似产品很多，词条下市场已经饱和，首页为上架时间较长的老品。"],
  ["stainless snack containers with lids", "Keepa最近下滑，首页第一位和第四位与本品相同，90天内新品较少。"],
  ["toddler spoons and forks", "词条多和婴幼儿相关，搜索趋势有上涨，首页基本为老品。"],
  ["stainless steel baby plates with suction", "带吸盘不锈钢婴儿餐盘，老款最多，同类竞品上架区间约200天，可与婴幼儿刀叉搭配卖。"],
  ["stainless snack container", "搜索量上升，但词条下多为150-300天产品，没有明显新颖款式改动。"],
  ["silicone lunch box", "20名销量420，半年内上品10，一年内上架商品最多，暂未找到同款竞品，搜索量涨幅不大。"],
  ["magnetic fidget balls", "20名销量2249，半年内上品15，Keepa下降，客单价低，卷低价，新品评价800+，差异化不好做。"],
  ["ninja creami containers", "20名销量416，半年内上品14，Keepa上升，最新类似产品上架91天，月销586，评分数39。"],
  ["reusable water balloons", "夏季产品，20名销量1113，半年内上品41，集中度约80%，最新14天上架月销265，另有27天上架销量2237。"],
  ["dog lick bowl", "20名销量1133，半年内上品58，Keepa下降，差评集中在中大型犬使用时容易被掀翻洒出。"],
];

const sources = [
  ["外部复核项", "影响"],
  ["Amazon公开说明：玩具等产品需要符合适用法律法规并提交安全文件", "儿童/玩具/磁性产品要把合规作为前置条件，而不是上架后补救。"],
  ["CPSC儿童产品证书说明：12岁及以下儿童产品通常需要第三方测试和CPC", "婴幼儿餐具、儿童水球等会增加测试成本和上架审核风险。"],
  ["CPSC 2026年可重复水球召回：收纳袋邻苯风险，产品本身含小磁体", "reusable water balloons虽有销量，但必须严控材料、磁体和包装附件。"],
  ["Ninja官方配件页列明CREAMi pint仅兼容特定型号", "ninja creami containers机会成立，但必须精准标注型号并规避品牌/IP风险。"],
];

function setWidths(sheet, widths) {
  widths.forEach((width, i) => {
    sheet.getRangeByIndexes(0, i, 1, 1).format.columnWidthPx = width;
  });
}

function styleHeader(range, fill = "#1F4E5F") {
  range.format = {
    fill,
    font: { bold: true, color: "#FFFFFF" },
    wrapText: true,
  };
}

function styleBlock(range, fill = "#F6F8FA") {
  range.format = {
    fill,
    borders: { preset: "all", style: "thin", color: "#D9E2E7" },
    wrapText: true,
  };
}

summary.showGridLines = false;
summary.getRange("A1:H1").merge();
summary.getRange("A1").values = [["硅胶类产品选品深度分析结论"]];
summary.getRange("A1").format = {
  fill: "#0B1F2A",
  font: { bold: true, color: "#FFFFFF", size: 18 },
};
summary.getRange("A1:H1").format.rowHeightPx = 34;
summary.getRange("A2:H2").merge();
summary.getRange("A2").values = [[
  "评分依据：需求信号30% + 竞争缺口25% + 差评/改款空间20% + 风险可控15% + 落地/利润10%。结论基于原表信息，并加入儿童/磁性/食物接触/品牌兼容类风险复核。",
]];
summary.getRange("A2").format = { fill: "#E7F0F3", wrapText: true };
summary.getRange("A2:H2").format.rowHeightPx = 32;

summary.getRange("A4:D4").values = [["优先级", "产品", "结论", "核心理由"]];
styleHeader(summary.getRange("A4:D4"));
summary.getRange("A5:D10").values = [
  ["1", "Highland Cow Ice Cube Mold", "主推，可优先打样", "需求上涨、关键词下暂无新品，差评点集中且可通过结构/材质解决。"],
  ["2", "ninja creami containers", "主推，但控品牌/IP", "机器配件复购场景，新品仍能起量；关键是型号兼容和品牌表述。"],
  ["3", "toilet tank tablet holder", "小批量测试", "竞争极低、Keepa上涨，但需求体量未证实，适合低成本试水。"],
  ["4", "婴儿吸盘餐盘+叉勺套装", "条件可做", "单品一般，套装化能提升客单和差异；合规成本需前置核算。"],
  ["5", "dog lick bowl", "只做防掀翻改款", "普通款竞争大且趋势下滑，只有中大型犬防掀翻结构值得测。"],
  ["6", "reusable water balloons", "季节快反，谨慎", "旺季销量强，但新品多、低价、磁性儿童合规风险高。"],
];
styleBlock(summary.getRange("A5:D10"));

summary.getRange("F4:H4").values = [["淘汰", "原因", "处理建议"]];
styleHeader(summary.getRange("F4:H4"), "#6B3F2A");
summary.getRange("F5:H8").values = [
  ["magnetic fidget balls", "安全合规高风险、低价内卷、趋势下降", "直接淘汰"],
  ["Silicone Air Fryer Baking Tray", "市场饱和，相似老品多", "除非有机型专配优势，否则不做"],
  ["stainless snack containers", "同款已在首页，趋势或创新不足", "不优先"],
  ["toddler spoons and forks", "单品同质化，儿童合规成本高", "只作为套装配件"],
];
styleBlock(summary.getRange("F5:H8"));
setWidths(summary, [70, 230, 160, 430, 30, 230, 310, 180]);

detail.showGridLines = false;
const detailHeaders = ["产品", "推荐等级", "需求信号", "竞争缺口", "差评/改款空间", "风险可控", "落地/利润", "综合分", "结论", "依据"];
detail.getRange("A1:J1").values = [detailHeaders];
styleHeader(detail.getRange("A1:J1"));
const detailRows = candidates.map((c) => [c.product, c.tier, c.demand, c.gap, c.diff, c.risk, c.execution, null, c.decision, c.reason]);
detail.getRangeByIndexes(1, 0, detailRows.length, detailHeaders.length).values = detailRows;
for (let i = 0; i < candidates.length; i++) {
  const row = i + 2;
  detail.getRange(`H${row}`).formulas = [[`=C${row}*0.3+D${row}*0.25+E${row}*0.2+F${row}*0.15+G${row}*0.1`]];
}
detail.getRange(`C2:H${candidates.length + 1}`).format.numberFormat = "0.00";
detail.getRange(`A2:J${candidates.length + 1}`).format = {
  borders: { preset: "all", style: "thin", color: "#D9E2E7" },
  wrapText: true,
};
setWidths(detail, [260, 90, 80, 80, 110, 80, 80, 80, 150, 560]);
detail.freezePanes.freezeRows(1);

actions.showGridLines = false;
actions.getRange("A1:E1").values = [["产品", "推荐等级", "改款方向", "验证动作", "首轮结论"]];
styleHeader(actions.getRange("A1:E1"));
const actionRows = candidates
  .filter((c) => ["主推", "小批测试", "条件可做", "季节机会"].includes(c.tier))
  .map((c) => [c.product, c.tier, c.concept, c.validation, c.decision]);
actions.getRangeByIndexes(1, 0, actionRows.length, 5).values = actionRows;
actions.getRange(`A2:E${actionRows.length + 1}`).format = {
  borders: { preset: "all", style: "thin", color: "#D9E2E7" },
  wrapText: true,
};
setWidths(actions, [260, 90, 500, 500, 170]);
actions.freezePanes.freezeRows(1);

source.showGridLines = false;
source.getRange("A1:B1").values = [["产品", "原表调研摘要"]];
styleHeader(source.getRange("A1:B1"));
source.getRangeByIndexes(1, 0, sourceRows.length, 2).values = sourceRows;
source.getRange(`A2:B${sourceRows.length + 1}`).format = {
  borders: { preset: "all", style: "thin", color: "#D9E2E7" },
  wrapText: true,
};
source.getRange("D1:E1").values = [sources[0]];
styleHeader(source.getRange("D1:E1"), "#355E3B");
source.getRangeByIndexes(1, 3, sources.length - 1, 2).values = sources.slice(1);
source.getRange(`D2:E${sources.length}`).format = {
  borders: { preset: "all", style: "thin", color: "#D9E2E7" },
  wrapText: true,
};
setWidths(source, [280, 760, 30, 340, 620]);
source.freezePanes.freezeRows(1);

const chartData = candidates.slice(0, 8).map((c) => [
  c.product,
  c.demand * 0.3 + c.gap * 0.25 + c.diff * 0.2 + c.risk * 0.15 + c.execution * 0.1,
]);
summary.getRange("J4:K4").values = [["产品", "综合分"]];
summary.getRangeByIndexes(4, 9, chartData.length, 2).values = chartData;
summary.getRange(`J4:K${4 + chartData.length}`).format = {
  fill: "#FFFFFF",
  font: { color: "#FFFFFF" },
};
summary.getRange("J1:K1").format.columnWidthPx = 1;
const chart = summary.charts.add("bar", summary.getRange(`J4:K${4 + chartData.length}`));
chart.title = "候选产品综合分 Top 8";
chart.hasLegend = false;
chart.xAxis = { axisType: "textAxis" };
chart.yAxis = { numberFormatCode: "0.00" };
chart.setPosition("A12", "H28");

const check = await wb.inspect({
  kind: "table",
  range: "评分明细!A1:J13",
  include: "values,formulas",
  tableMaxRows: 14,
  tableMaxCols: 10,
  maxChars: 6000,
});
console.log(check.ndjson);

const errors = await wb.inspect({
  kind: "match",
  searchTerm: "#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A",
  options: { useRegex: true, maxResults: 50 },
  summary: "final formula error scan",
});
console.log(errors.ndjson);

const preview = await wb.render({ sheetName: "结论看板", autoCrop: "all", scale: 1, format: "png" });
await fs.writeFile(path.join(outDir, "selection_dashboard_preview.png"), new Uint8Array(await preview.arrayBuffer()));

const file = await SpreadsheetFile.exportXlsx(wb);
const outputPath = path.join(outDir, "硅胶类产品选品深度分析报告.xlsx");
await file.save(outputPath);
console.log(outputPath);
