import fs from "node:fs/promises";
import path from "node:path";
import { SpreadsheetFile, Workbook } from "@oai/artifact-tool";

const outDir = path.resolve("outputs/ice_cube_launch_pack");
await fs.mkdir(outDir, { recursive: true });

const wb = Workbook.create();

const dashboard = wb.worksheets.add("总控看板");
const compliance = wb.worksheets.add("标题合规");
const promo = wb.worksheets.add("优惠利润");
const replenishment = wb.worksheets.add("首批发货补货");
const ads = wb.worksheets.add("广告竞价");
const benchmark = wb.worksheets.add("类目对标");
const listing = wb.worksheets.add("Listing文案");
const images = wb.worksheets.add("图片Brief");
const kpi = wb.worksheets.add("30天KPI");
const guide = wb.worksheets.add("一页操作说明");

const sourceNote = "版本日期：2026-06-04；规则来源：2025.06.02启用-多站点新优惠券-LD-BD算法、2025亚马逊Listing新规标题自查表、CPC广告竞价计算器、补货建议模板。";

function header(range, fill = "#17324D") {
  range.format = {
    fill,
    font: { bold: true, color: "#FFFFFF" },
    wrapText: true,
    horizontalAlignment: "center",
    verticalAlignment: "center",
    borders: { preset: "all", style: "thin", color: "#CAD6E0" },
  };
}

function grid(range) {
  range.format = {
    wrapText: true,
    verticalAlignment: "top",
    borders: { preset: "all", style: "thin", color: "#CAD6E0" },
  };
}

function title(sheet, text, note, cols = "A1:H1") {
  sheet.showGridLines = false;
  sheet.getRange(cols).merge();
  sheet.getRange("A1").values = [[text]];
  sheet.getRange("A1").format = {
    fill: "#0F2437",
    font: { bold: true, color: "#FFFFFF", size: 18 },
    verticalAlignment: "center",
  };
  sheet.getRange(cols).format.rowHeightPx = 36;
  const endCol = cols.split(":")[1].replace("1", "2");
  sheet.getRange(`A2:${endCol}`).merge();
  sheet.getRange("A2").values = [[note]];
  sheet.getRange("A2").format = { fill: "#EAF2F7", wrapText: true, font: { color: "#243B53" } };
  sheet.getRange(`A2:${endCol}`).format.rowHeightPx = 34;
}

function setWidths(sheet, widths) {
  widths.forEach((w, i) => {
    sheet.getRangeByIndexes(0, i, 1, 1).format.columnWidthPx = w;
  });
}

function band(range, fill = "#F4F7FA") {
  range.format = { fill, font: { bold: true, color: "#17324D" }, wrapText: true };
}

title(dashboard, "Highland Cow Ice Cube Tray 30天起量总控", sourceNote, "A1:J1");
dashboard.getRange("A4:E4").values = [["阶段", "日期", "目标", "硬动作", "红线判断"]];
header(dashboard.getRange("A4:E4"));
dashboard.getRange("A5:E10").values = [
  ["D0-D2 准备", "2026-06-04 至 2026-06-06", "FBA可售、标题合规、优惠可开", "按标题合规页确认标题不超200字符且无词根重复>2；上传新主图和防洒副图；启动价$12.99+10% Coupon。", "未FBA可售、标题失败或毛利为负时不放量。"],
  ["D3-D7 启动", "2026-06-07 至 2026-06-11", "日销3-5，小类进#700", "Exact、Phrase、Auto、ASIN定向同时开；预算$80-$100/天；每日看点击、CVR、ACOS。", "7天0单且点击>15的词否定或降价。"],
  ["D8-D14 放量", "2026-06-12 至 2026-06-18", "日销7+，CVR 8%+", "保留转化词；加大B0GS1TGHG1、B0GS4YCK36定向；低效词降价。", "14天CVR低于5%先修Listing和图片，不加预算硬推。"],
  ["D15-D21 提价", "2026-06-19 至 2026-06-25", "日销10-15，小类#200-300", "评分8-10个后升至$13.99；Coupon降至8%；检查LD是否比Coupon更划算。", "毛利低于$3.50时不继续加Coupon。"],
  ["D22-D30 验证", "2026-06-26 至 2026-07-04", "日销20+，冲#150", "测试$14.99-$15.99；按补货模型触发二批；准备Deal素材。", "FBA覆盖天数低于14天立即补货或收广告。"],
  ["复盘", "2026-07-05", "确认是否进入常规补货", "按30天KPI页填实绩，更新动态日销、补货点和采购量。", "若自然单占比未提升，暂停更高Deal费。"],
];
grid(dashboard.getRange("A5:E10"));
dashboard.getRange("G4:J4").values = [["核心KPI", "2026-06-04基准", "30天目标", "动作阈值"]];
header(dashboard.getRange("G4:J4"), "#2A5D67");
dashboard.getRange("G5:J12").values = [
  ["标题合规", "待上传新版", "通过", "标题合规页出现失败即改标题。"],
  ["启动到手价", "$11.69", "$11.69-$14.24", "Coupon从10%逐步降到5%。"],
  ["单件毛利", "按成本输入", ">= $3.50", "低于阈值推2-pack或降Deal强度。"],
  ["目标竞价", "$0.78-$0.90", "随CVR提高", "公式来自CPC广告竞价计算器。"],
  ["首批FBA", "300件建议", "可覆盖45-60天", "低于14天覆盖触发补货。"],
  ["二批补货", "按日销动态", "建议采购量自动算", "日销低于0.3不建议补。"],
  ["LD/BD", "D15后再测", "只在毛利可承受时开", "LD/BD费摊入单件利润。"],
  ["数据来源缺口", "无实时MCP调用", "上线后补实时广告/库存", "工作簿保留输入格。"],
];
grid(dashboard.getRange("G5:J12"));
setWidths(dashboard, [110, 170, 190, 390, 270, 24, 120, 120, 130, 320]);
dashboard.freezePanes.freezeRows(4);

title(compliance, "标题合规自查", "规则按新规标题自查表：标题长度控制在200字符内，同一词根/单复数统一后重复不超过2次；同时排查未证实的安全、认证绝对化表达。", "A1:H1");
compliance.getRange("A4:B11").values = [
  ["待检查标题", "Highland Cow Ice Cube Tray, 3D Silicone Cow Ice Mold with Built-In Funnel Lid, 6-Cavity Spill-Resistant Animal Ice Cube Mold for Whiskey, Cocktails, Coffee, Parties, Farmhouse Cow Lover Gifts"],
  ["字符数", null],
  ["长度结果", null],
  ["重复词结果", null],
  ["禁用/高风险表达", null],
  ["最终结论", null],
  ["可上传标题", null],
  ["备注", "如后续加入 food-grade / BPA-free / FDA compliant 等证据型词，必须先确认测试报告或合规证据。"],
];
grid(compliance.getRange("A4:B11"));
band(compliance.getRange("A4:A11"));
compliance.getRange("B5").formulas = [["=LEN(B4)"]];
compliance.getRange("B6").formulas = [["=IF(B5<=200,\"通过\",\"失败：超过200字符\")"]];
compliance.getRange("B7").formulas = [["=IF(MAX(D15:D34)<=2,\"通过\",\"失败：有词根重复超过2次\")"]];
compliance.getRange("B8").formulas = [["=IF(SUM(H15:H24)=0,\"通过\",\"失败：含高风险表达\")"]];
compliance.getRange("B9").formulas = [["=IF(AND(B6=\"通过\",B7=\"通过\",B8=\"通过\"),\"通过，可上传\",\"失败，先改标题\")"]];
compliance.getRange("B10").formulas = [["=B4"]];
compliance.getRange("D14:H14").values = [["词根", "原词/映射", "计数", "阈值", "风险"]];
header(compliance.getRange("D14:H14"), "#4C6B4F");
const titleTerms = [
  ["highland", "highland", null, 2, null],
  ["cow", "cow", null, 2, null],
  ["ice", "ice", null, 2, null],
  ["cube", "cube", null, 2, null],
  ["tray", "tray/trays", null, 2, null],
  ["mold", "mold/molds", null, 2, null],
  ["silicone", "silicone", null, 2, null],
  ["funnel", "funnel", null, 2, null],
  ["lid", "lid", null, 2, null],
  ["cavity", "cavity/cavities", null, 2, null],
  ["whiskey", "whiskey", null, 2, null],
  ["cocktail", "cocktail/cocktails", null, 2, null],
  ["coffee", "coffee", null, 2, null],
  ["party", "party/parties", null, 2, null],
  ["farmhouse", "farmhouse", null, 2, null],
  ["lover", "lover/lovers", null, 2, null],
  ["gift", "gift/gifts", null, 2, null],
  ["3d", "3d", null, 2, null],
  ["spill", "spill/spill-resistant", null, 2, null],
  ["animal", "animal", null, 2, null],
];
compliance.getRange("D15:H34").values = titleTerms;
for (let r = 15; r <= 34; r++) {
  compliance.getRange(`F${r}`).formulas = [[`=(LEN(" "&LOWER(SUBSTITUTE(SUBSTITUTE(SUBSTITUTE($B$4,",",""),"-"," "),"/"," "))&" ")-LEN(SUBSTITUTE(" "&LOWER(SUBSTITUTE(SUBSTITUTE(SUBSTITUTE($B$4,",",""),"-"," "),"/"," "))&" "," "&LOWER(D${r})&" ","")))/LEN(" "&LOWER(D${r})&" ")`]];
  compliance.getRange(`H${r}`).formulas = [[`=IF(F${r}>G${r},"重复超限","")`]];
}
compliance.getRange("J14:K14").values = [["高风险词", "命中"]];
header(compliance.getRange("J14:K14"), "#7A4B33");
compliance.getRange("J15:K24").values = [
  ["food-grade", null],
  ["bpa-free", null],
  ["non-toxic", null],
  ["FDA", null],
  ["100% spill proof", null],
  ["guaranteed", null],
  ["best", null],
  ["free returns", null],
  ["official", null],
  ["patented", null],
];
for (let r = 15; r <= 24; r++) {
  compliance.getRange(`K${r}`).formulas = [[`=IF(ISNUMBER(SEARCH(J${r},$B$4)),1,0)`]];
  compliance.getRange(`H${r}`).formulas = [[`=IF(OR(F${r}>G${r},K${r}=1),"需处理","")`]];
}
compliance.getRange("B5").format.numberFormat = "0";
grid(compliance.getRange("D15:H34"));
grid(compliance.getRange("J15:K24"));
setWidths(compliance, [150, 780, 24, 100, 140, 70, 70, 100, 24, 150, 70]);

title(promo, "优惠、秒杀、BD与毛利重算", "US站点公式：Coupon费=5+售价×数量×2.5%；LD费=70+MIN(2000,售价×数量×1%)；BD费=70×天数+MIN(2000,售价×数量×1%)。", "A1:L1");
promo.getRange("A4:L4").values = [["阶段", "预计销量/件", "售价", "Coupon率", "Coupon费/件", "LD天数", "LD费/件", "BD天数", "BD费/件", "产品+头程", "FBA+佣金", "单件毛利"]];
header(promo.getRange("A4:L4"));
promo.getRange("A5:L10").values = [
  ["启动 D0-D14", 120, 12.99, 0.10, null, 0, null, 0, null, 4.20, 5.10, null],
  ["稳定 D15-D21", 100, 13.99, 0.08, null, 0, null, 0, null, 4.20, 5.25, null],
  ["提价 D22-D30", 180, 14.99, 0.05, null, 1, null, 0, null, 4.20, 5.40, null],
  ["利润价", 240, 15.99, 0.05, null, 1, null, 7, null, 4.20, 5.55, null],
  ["2-pack备选", 120, 22.99, 0.08, null, 1, null, 7, null, 7.80, 7.20, null],
  ["保守清仓", 80, 11.99, 0.05, null, 0, null, 0, null, 4.20, 5.00, null],
];
for (let r = 5; r <= 10; r++) {
  promo.getRange(`E${r}`).formulas = [[`=IF(B${r}>0,(5+C${r}*B${r}*2.5%)/B${r},0)`]];
  promo.getRange(`G${r}`).formulas = [[`=IF(AND(B${r}>0,F${r}>0),(70+MIN(2000,C${r}*B${r}*1%))/B${r},0)`]];
  promo.getRange(`I${r}`).formulas = [[`=IF(AND(B${r}>0,H${r}>0),(70*H${r}+MIN(2000,C${r}*B${r}*1%))/B${r},0)`]];
  promo.getRange(`L${r}`).formulas = [[`=C${r}*(1-D${r})-E${r}-G${r}-I${r}-J${r}-K${r}`]];
}
promo.getRange("C5:L10").format.numberFormat = "$0.00";
promo.getRange("D5:D10").format.numberFormat = "0%";
grid(promo.getRange("A5:L10"));
promo.getRange("A13:F13").values = [["决策项", "公式/口径", "当前结论", "建议动作", "来源", "缺失字段"]];
header(promo.getRange("A13:F13"), "#6A5A2B");
promo.getRange("A14:F18").values = [
  ["Coupon", "费用摊入单件毛利", "启动10%可用", "D15后降到8%，D22后降到5%。", "新优惠券算法US站点", "需上线后填实际销量。"],
  ["LD秒杀", "只在销量预估足以摊薄$70固定费时开", "D22后可测试1天", "毛利低于$3.50不开。", "LD算法US站点", "是否获得Deal资格。"],
  ["BD", "按天数计固定费，适合更高销量", "7天BD先不建议", "等自然单稳定后再排。", "BD算法US站点", "BD排期和资格。"],
  ["毛利", "售价×(1-Coupon)-优惠费-Deal费-成本-FBA佣金", "成本默认$4.20+$5.10", "黄色输入格上线后替换真实成本。", "本包模型", "真实采购、头程、FBA费。"],
  ["2-pack", "提升客单价摊薄Deal费", "毛利不足时启用", "低于$3.50即准备2-pack图和变体。", "本包模型", "套装包装成本。"],
];
grid(promo.getRange("A14:F18"));
setWidths(promo, [130, 100, 80, 80, 100, 70, 90, 70, 90, 100, 100, 110]);

title(replenishment, "首批发货与补货模型", "继承补货建议模板口径：动态日销低于0.3不建议补货；美国仓到仓60天、安全天数5天、库存低于提前14天覆盖触发补货。", "A1:L1");
replenishment.getRange("A4:B13").values = [
  ["今日日期", "2026-06-04"],
  ["首批FBA建议量", 300],
  ["可售库存", 300],
  ["在途库存", 0],
  ["动态日销", 7],
  ["美国仓到仓天数", 60],
  ["采购生产天数", 20],
  ["安全天数", 5],
  ["触发提前天数", 14],
  ["下单预计维持天数", 60],
];
grid(replenishment.getRange("A4:B13"));
band(replenishment.getRange("A4:A13"));
replenishment.getRange("D4:G4").values = [["项目", "公式", "结果", "动作"]];
header(replenishment.getRange("D4:G4"));
replenishment.getRange("D5:G12").values = [
  ["库存覆盖天数", "可售库存/动态日销", null, "低于14天触发补货"],
  ["预计断货日", "今日+库存覆盖天数", null, "早于到货日需收广告"],
  ["建议交货日", "今日+采购生产天数", null, "供应商交货节点"],
  ["建议到货日", "交货日+美国仓到仓天数", null, "FBA补货到仓节点"],
  ["补货触发", "动态日销>0.3且覆盖天数<14", null, "是则下单"],
  ["建议采购量", "(下单维持天数+安全天数)×动态日销-在途", null, "向上取整"],
  ["首批覆盖", "首批FBA/启动期日销", null, "首批是否够跑30天"],
  ["二批建议", "按D15-D30目标日销20件重算", null, "提前排产"],
];
for (let r = 5; r <= 12; r++) grid(replenishment.getRange(`D${r}:G${r}`));
replenishment.getRange("F5").formulas = [["=IF(B8>0,B6/B8,\"\")"]];
replenishment.getRange("F6").formulas = [["=DATE(2026,6,4)+F5"]];
replenishment.getRange("F7").formulas = [["=DATE(2026,6,4)+B10"]];
replenishment.getRange("F8").formulas = [["=F7+B9"]];
replenishment.getRange("F9").formulas = [["=IF(B8<=0.3,\"不建议补货\",IF(F5<B12,\"是\",\"否\"))"]];
replenishment.getRange("F10").formulas = [["=IF(F9=\"是\",ROUNDUP((B13+B11)*B8-B7,0),0)"]];
replenishment.getRange("F11").formulas = [["=IF(B8>0,B5/B8,\"\")"]];
replenishment.getRange("F12").formulas = [["=ROUNDUP((B13+B11)*20-B7,0)"]];
replenishment.getRange("F6:F8").format.numberFormat = "yyyy-mm-dd";
replenishment.getRange("F5:F12").format.numberFormat = "0";
replenishment.getRange("I4:L4").values = [["首批发货动作", "数量", "最晚完成", "备注"]];
header(replenishment.getRange("I4:L4"), "#2F5D50");
replenishment.getRange("I5:L10").values = [
  ["国内质检留样", 10, "2026-06-05", "核对漏水、脱模、尺寸、英文包装。"],
  ["首批FBA发货", 300, "2026-06-06", "建议先走美国FBA，避免FBM低转化拖累。"],
  ["摄影/视频样品", 6, "2026-06-06", "用于主图、副图、A+和短视频。"],
  ["售后备件/换新", 20, "2026-06-06", "处理早期破损、漏水、体验问题。"],
  ["二批备货预留", 1300, "2026-06-20", "按日销20件、65天覆盖预估。"],
  ["停止补货线", 0, "D14复盘", "CVR<5%或评分风险集中时暂停。"],
];
grid(replenishment.getRange("I5:L10"));
setWidths(replenishment, [150, 110, 24, 130, 260, 120, 260, 24, 150, 80, 110, 320]);

title(ads, "CPC广告竞价与结构", "公式来自CPC广告竞价计算器：目标竞价=目标ACoS×产品售价×CVR×(1+调整比例)。", "A1:K1");
ads.getRange("A4:E8").values = [
  ["基础参数", "数值", "说明", "公式来源", "上线后替换"],
  ["目标ACoS", 0.25, "启动期可接受目标", "CPC广告竞价计算器C5", "按真实毛利调整"],
  ["产品售价", 12.99, "启动售价", "CPC广告竞价计算器C6", "按优惠利润页阶段"],
  ["转化率", 0.08, "启动目标CVR", "CPC广告竞价计算器C7", "按广告报表"],
  ["调整比例", 0.50, "竞价放大系数", "CPC广告竞价计算器C8", "按排名需求"],
];
header(ads.getRange("A4:E4"));
grid(ads.getRange("A5:E8"));
ads.getRange("B5").format.numberFormat = "0%";
ads.getRange("B6").format.numberFormat = "$0.00";
ads.getRange("B7:B8").format.numberFormat = "0%";
ads.getRange("G4:K4").values = [["计算项", "公式", "结果", "动作", "备注"]];
header(ads.getRange("G4:K4"), "#5B4D7A");
ads.getRange("G5:K8").values = [
  ["期望投入产生1单", "目标ACoS×售价", null, "预算口径", ""],
  ["点击产生1单", "1/CVR", null, "CVR越低越不能高Bid", ""],
  ["单次点击收入", "售价×CVR", null, "用于SPC对比", ""],
  ["目标竞价", "ACoS×售价×CVR×(1+调整)", null, "作为Exact核心词上限", ""],
];
ads.getRange("I5").formulas = [["=B5*B6"]];
ads.getRange("I6").formulas = [["=1/B7"]];
ads.getRange("I7").formulas = [["=B6*B7"]];
ads.getRange("I8").formulas = [["=B5*B6*B7*(1+B8)"]];
ads.getRange("I5:I8").format.numberFormat = "$0.00";
ads.getRange("I6").format.numberFormat = "0.0";
grid(ads.getRange("G5:K8"));
ads.getRange("A11:K11").values = [["Campaign", "类型", "目标", "关键词/ASIN", "匹配", "日预算", "建议Bid", "7天优化", "否定规则", "备注", "优先级"]];
header(ads.getRange("A11:K11"));
const adRows = [
  ["SP-Exact-Core", "SP关键词", "抢核心排名", "highland cow ice cube tray", "Exact", 25, null, "有单保留；CVR>8%加预算", "7天0单且点击>15否定", "第一核心词", "P0"],
  ["SP-Exact-Core", "SP关键词", "抢核心排名", "highland cow ice cube mold", "Exact", 20, null, "CVR>8%保留", "7天0单且点击>15否定", "第一核心词", "P0"],
  ["SP-Exact-Core", "SP关键词", "抢造型词", "cow ice cube mold", "Exact", 15, null, "低ACOS加价", "7天0单且点击>20否定", "造型词", "P0"],
  ["SP-Phrase-Discovery", "SP关键词", "拓词", "cow ice cube tray", "Phrase", 10, null, "转化词拉Exact", "无关动物/普通冰盒否定", "拓词", "P1"],
  ["SP-Phrase-Discovery", "SP关键词", "拓词", "animal ice cube mold", "Phrase", 8, null, "只留礼品/酒饮相关词", "泛流量高花费否定", "次优先", "P1"],
  ["SP-Phrase-Discovery", "SP关键词", "场景词", "whiskey ice cube mold", "Phrase", 10, null, "只保留转化词", "large cube/sphere无转化否定", "场景词", "P1"],
  ["SP-Auto-LowBid", "SP自动", "捡漏", "Close/Loose/Substitutes/Complements", "Auto", 12, 0.30, "每3天拉搜索词", "无关词加入否定精准", "低价跑", "P1"],
  ["SP-PAT-Competitors", "SP商品投放", "竞品截流", "B0GS1TGHG1", "ASIN", 12, 0.65, "转化好单独加预算", "7天0单降50%", "第一追赶", "P0"],
  ["SP-PAT-Competitors", "SP商品投放", "竞品截流", "B0GS4YCK36", "ASIN", 12, 0.65, "转化好单独加预算", "7天0单降50%", "标杆竞品", "P0"],
  ["SP-PAT-Competitors", "SP商品投放", "竞品截流", "B0GSK5YT8V", "ASIN", 8, 0.45, "有单保留", "7天0单降50%", "阶段目标", "P1"],
];
ads.getRange("A12:K21").values = adRows;
for (let r = 12; r <= 17; r++) ads.getRange(`G${r}`).formulas = [["=$I$8"]];
ads.getRange("F12:G21").format.numberFormat = "$0.00";
grid(ads.getRange("A12:K21"));
setWidths(ads, [170, 95, 120, 250, 80, 80, 80, 220, 220, 140, 70]);

title(benchmark, "类目对标与排名目标", "沿用原启动包竞品池；上线后应按卖家精灵MCP刷新小类排名、BSR、价格和Review字段。", "A1:M1");
benchmark.getRange("A4:I4").values = [["ASIN", "角色", "小类排名", "Kitchen BSR", "估计日销", "估计月销", "价格", "履约", "评分/Review"]];
header(benchmark.getRange("A4:I4"));
benchmark.getRange("A5:I11").values = [
  ["B0GTZ1CGTD", "你的ASIN", 1146, 149942, 1, 31, 18.99, "FBM", "5.0 / 1"],
  ["B0GS4YCK36", "标杆竞品", 116, 11704, 26, 793, 9.99, "FBA", "3.5 / 3"],
  ["B0GS1TGHG1", "第一追赶目标", 197, 21849, 14, 412, 12.99, "FBA", "4.5 / 14"],
  ["B0GSK5YT8V", "阶段目标", 331, 37027, 7, 217, 12.99, "FBA", "3.8 / 3"],
  ["B0GSDHBDK9", "低量竞品", 488, 58638, 4, 124, 13.99, "FBA", "5.0 / 1"],
  ["B0GWHQW2Y9", "弱竞品", 1654, 219518, 0, 0, 9.99, "FBA", "2.0 / 2"],
  ["B0GS55YR1M", "同父变体竞品", 116, 11704, 26, 793, 11.99, "FBM", "3.5 / 3"],
];
grid(benchmark.getRange("A5:I11"));
benchmark.getRange("K4:M4").values = [["排名台阶", "对应销量", "运营含义"]];
header(benchmark.getRange("K4:M4"), "#355E3B");
benchmark.getRange("K5:M9").values = [
  ["小类#500内", "日销4+", "证明类目有基础转化，继续投精准词。"],
  ["小类#300内", "日销7+", "进入可放量区间，保留高CVR词和ASIN定向。"],
  ["小类#200内", "日销14+", "开始提价到$13.99，控制ACOS。"],
  ["小类#120附近", "日销25-30", "季节性小爆品成立，准备补货。"],
  ["小类#1500外", "低于日销1", "说明Listing/履约/价格至少一项没打穿。"],
];
grid(benchmark.getRange("K5:M9"));
benchmark.getRange("G5:G11").format.numberFormat = "$0.00";
setWidths(benchmark, [130, 150, 90, 100, 90, 90, 80, 80, 110, 24, 150, 130, 430]);

title(listing, "Listing文案实施", "已按标题合规页同步新版标题；避免无证据的食品安全、BPA、FDA、100%防漏等表达。", "A1:B1");
listing.getRange("A4:B13").values = [
  ["模块", "内容"],
  ["Title", "Highland Cow Ice Cube Tray, 3D Silicone Cow Ice Mold with Built-In Funnel Lid, 6-Cavity Spill-Resistant Animal Ice Cube Mold for Whiskey, Cocktails, Coffee, Parties, Farmhouse Cow Lover Gifts"],
  ["Bullet 1", "Built-In Funnel Lid: fill each cavity through the funnel-style cover to help reduce spills when moving the tray to the freezer."],
  ["Bullet 2", "Full 3D Highland Cow Shape: creates detailed cow-shaped ice for whiskey, cocktails, coffee, mocktails, and party drinks."],
  ["Bullet 3", "Easy Release Silicone: flexible tray helps release shaped ice without cracking the cow details."],
  ["Bullet 4", "Stable 6-Cavity Design: upgraded tray structure helps reduce wobbling compared with flimsy open molds."],
  ["Bullet 5", "Giftable Farmhouse Style: suitable for cow lovers, western parties, bar carts, birthdays, summer drinks, and holiday gifting."],
  ["Search Terms", "highland cow ice cube tray highland cow ice cube mold cow shaped ice cube tray animal ice cube mold cute ice cube mold whiskey cocktail ice mold farmhouse gift bar cart western party"],
  ["Avoid", "不要写未经证明的 food-grade / BPA-free / non-toxic / FDA compliant；不要写100% spill proof；修正 integrated 拼写。"],
  ["Positioning", "不是普通硅胶冰格，而是高地牛造型礼品款 + 防洒漏斗盖 + 立体成冰体验。"],
];
header(listing.getRange("A4:B4"));
grid(listing.getRange("A5:B13"));
setWidths(listing, [140, 930]);

title(images, "图片重做Brief", "优先解决转化：主图合规白底，副图讲清防洒、完整3D成冰和易脱模。", "A1:F1");
images.getRange("A4:F4").values = [["序号", "图片类型", "画面要求", "核心文案", "注意事项", "优先级"]];
header(images.getRange("A4:F4"));
images.getRange("A5:F11").values = [
  [1, "主图", "白底；模具本体、盖子、完整牛形冰块；产品占画面85%左右。", "无文字", "主图不加场景、文字、徽章；突出完整结构。", "P0"],
  [2, "防洒卖点图", "保留注水动作，镜头聚焦漏斗口。", "Built-In Funnel Lid / Helps Reduce Spills", "修正Integrated拼写；不要写100% spill proof。", "P0"],
  [3, "竞品对比图", "左：普通开口款易洒；右：漏斗盖注水。", "Open Tray Spills Easily / Funnel Lid Helps Control Filling", "用示意，不展示真实竞品侵权图。", "P0"],
  [4, "成品冰块图", "威士忌杯+正反面牛形冰块，展示毛发细节。", "Full 3D Highland Cow Ice", "冰块要清晰，避免太透明看不出造型。", "P0"],
  [5, "脱模图", "手指轻推底部，冰块完整弹出。", "Flexible Silicone, Easy Release", "需真实拍摄，避免夸张。", "P1"],
  [6, "尺寸图", "整盘尺寸、单个牛冰块尺寸、适用杯型。", "6-Cavity Tray / Fits Most Freezer Shelves", "尺寸必须与实物一致。", "P1"],
  [7, "场景图", "夏季派对、bar cart、cow lover gift场景。", "For Whiskey, Cocktails & Cow Lover Gifts", "避免过度杂乱，突出产品。", "P2"],
];
grid(images.getRange("A5:F11"));
setWidths(images, [60, 130, 360, 280, 340, 80]);

title(kpi, "30天KPI追踪表", "每日记录销量、广告、排名和库存覆盖；红线触发时按总控看板处理。", "A1:N1");
kpi.getRange("A4:N4").values = [["Day", "日期", "售价", "Coupon", "销量", "小类排名", "Kitchen BSR", "广告花费", "广告订单", "CVR", "ACOS", "FBA库存", "覆盖天数", "动作/判断"]];
header(kpi.getRange("A4:N4"));
const kpiRows = [];
for (let day = 1; day <= 30; day++) {
  let target = "";
  if (day <= 2) target = "FBA/Listing准备";
  else if (day <= 7) target = "目标日销3-5，小类#700内";
  else if (day <= 14) target = "目标日销7+，CVR 8%+";
  else if (day <= 21) target = "目标日销10-15，小类#200-300";
  else target = "目标日销20+，冲#150并触发补货";
  kpiRows.push([day, null, 12.99, 0.10, null, null, null, null, null, null, null, null, null, target]);
}
kpi.getRangeByIndexes(4, 0, kpiRows.length, 14).values = kpiRows;
for (let r = 5; r <= 34; r++) {
  kpi.getRange(`B${r}`).formulas = [[`=DATE(2026,6,4)+A${r}-1`]];
  kpi.getRange(`K${r}`).formulas = [[`=IFERROR(H${r}/(I${r}*C${r}),"")`]];
  kpi.getRange(`M${r}`).formulas = [[`=IFERROR(L${r}/AVERAGE(E${Math.max(5, r - 6)}:E${r}),"")`]];
}
kpi.getRange("B5:B34").format.numberFormat = "yyyy-mm-dd";
kpi.getRange("C5:C34").format.numberFormat = "$0.00";
kpi.getRange("D5:D34").format.numberFormat = "0%";
kpi.getRange("H5:H34").format.numberFormat = "$0.00";
kpi.getRange("J5:K34").format.numberFormat = "0%";
kpi.getRange("M5:M34").format.numberFormat = "0";
grid(kpi.getRange("A5:N34"));
setWidths(kpi, [55, 100, 75, 70, 60, 90, 100, 85, 80, 70, 70, 80, 80, 300]);
kpi.freezePanes.freezeRows(4);

title(guide, "一页中文操作说明", "给运营直接执行：先改黄色输入格，再按日期推进；不要把未验证的安全/认证表达写进Listing。", "A1:H1");
guide.getRange("A4:H4").values = [["步骤", "今天要做", "操作位置", "判断标准", "通过后动作", "不通过动作", "负责人", "截止"]];
header(guide.getRange("A4:H4"));
guide.getRange("A5:H12").values = [
  ["1", "确认标题合规", "标题合规!B4:B9", "字符<=200；重复词根<=2；高风险词=0", "复制Listing文案标题上传", "删减Ice/Cow/Mold重复或去掉高风险词", "Listing", "2026-06-04"],
  ["2", "输入真实成本", "优惠利润!J:K", "单件毛利>=3.50", "开$12.99+10% Coupon", "降Coupon或准备2-pack", "运营/财务", "2026-06-04"],
  ["3", "首批发FBA", "首批发货补货!A4:L10", "首批300件；覆盖45天左右", "建货件并发样拍图", "先少量FBA，不重投广告", "供应链", "2026-06-06"],
  ["4", "开广告", "广告竞价!A4:K21", "核心Exact按目标Bid；总预算$80-$100/天", "每日否词、调Bid", "7天0单点击>15否定", "广告", "2026-06-07"],
  ["5", "D14复盘", "30天KPI!A5:N34", "CVR>=8%；日销>=7；毛利不负", "进入提价和LD测试", "修图、降价、收预算", "运营", "2026-06-18"],
  ["6", "提价/Deal", "优惠利润!A5:L10", "LD/BD摊费后毛利>=3.50", "D22后测1天LD", "暂不开BD，保留Coupon", "运营", "2026-06-26"],
  ["7", "补货", "首批发货补货!F5:F12", "覆盖天数<14且动态日销>0.3", "按建议采购量下单", "日销不足先不补", "供应链", "每日"],
  ["8", "合规复查", "Listing文案/图片Brief", "不写无证据认证、绝对化和100%防漏", "上传A+和视频素材", "退回文案/图片", "Listing", "上线前"],
];
grid(guide.getRange("A5:H12"));
setWidths(guide, [55, 150, 170, 260, 220, 250, 90, 100]);

for (const sheet of [dashboard, compliance, promo, replenishment, ads, benchmark, listing, images, kpi, guide]) {
  sheet.getUsedRange()?.format && (sheet.getRange("A1:A1").format.font = { bold: true });
}

const checks = [
  ["标题合规", "A1:K24"],
  ["优惠利润", "A1:L18"],
  ["首批发货补货", "A1:L13"],
  ["广告竞价", "A1:K21"],
  ["一页操作说明", "A1:H12"],
];

for (const [sheetName, range] of checks) {
  await wb.render({ sheetName, range, autoCrop: "all", scale: 1, format: "png" });
}

const inspect = await wb.inspect({
  kind: "table",
  range: "总控看板!A1:J12",
  include: "values,formulas",
  tableMaxRows: 12,
  tableMaxCols: 10,
  maxChars: 5000,
});
console.log(inspect.ndjson);

const errors = await wb.inspect({
  kind: "match",
  searchTerm: "#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A",
  options: { useRegex: true, maxResults: 100 },
  summary: "formula error scan",
});
console.log(errors.ndjson);

const preview = await wb.render({ sheetName: "总控看板", range: "A1:J12", autoCrop: "all", scale: 1, format: "png" });
await fs.writeFile(path.join(outDir, "dashboard_preview.png"), new Uint8Array(await preview.arrayBuffer()));

const file = await SpreadsheetFile.exportXlsx(wb);
const outputPath = path.join(outDir, "Highland_Cow_Ice_Cube_Tray_2026-06-04可执行版.xlsx");
await file.save(outputPath);

const guideMd = `# 高地牛冰块模具 2026-06-04 启动操作说明

1. 先打开工作簿的「标题合规」页，确认字符数不超过200、重复词根不超过2次，且没有 food-grade、BPA-free、FDA、100% spill proof 等未证实或绝对化表达。
2. 在「优惠利润」页把产品+头程、FBA+佣金替换成真实成本；只有单件毛利不低于 $3.50 时，才执行 Coupon、LD 或 BD。
3. 今天按「首批发货补货」页推进首批300件FBA、拍摄样品和售后备件；动态日销低于0.3不建议补货，覆盖天数低于14天才触发二批。
4. D3开始按「广告竞价」页开 Exact、Phrase、Auto、ASIN 定向；目标竞价使用 CPC 公式自动计算，7天0单且点击超阈值的词及时否定。
5. 每天填写「30天KPI」页；D14看CVR是否达到8%、日销是否达到7单，未达标先修图和Listing，不靠加预算硬推。
6. D22后才测试1天LD；BD固定费更重，等自然单稳定、毛利可承受后再排期。
`;
await fs.writeFile(path.join(outDir, "Highland_Cow_Ice_Cube_Tray_2026-06-04操作说明.md"), guideMd, "utf8");

console.log(outputPath);
