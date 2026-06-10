import fs from "node:fs/promises";
import path from "node:path";
import { SpreadsheetFile, Workbook } from "@oai/artifact-tool";

const outDir = path.resolve("outputs/selection_execution_46_49");
await fs.mkdir(outDir, { recursive: true });

const wb = Workbook.create();
const dashboard = wb.worksheets.add("总控看板");
const matrix = wb.worksheets.add("20款决策矩阵");
const suppliers = wb.worksheets.add("供应商询价");
const profit = wb.worksheets.add("利润准入");
const tracker = wb.worksheets.add("30天测试记录");
const actions = wb.worksheets.add("7天行动计划");

const products = [
  ["Mini Pollinator Watering Station","立即测试","FBM","1","小型传粉昆虫饮水站","B0H1L7KK5X",19.99,1347,"参考ASIN月销亮眼但仅4个评分，必须小批量二次验证","陶瓷破损、外观专利","20-30件FBM；改为原创花型和防碎包装","https://www.amazon.com/dp/B0H1L7KK5X"],
  ["Hunting Memory Box","立即测试","FBM定制","2","狩猎纪念收纳盒","B0GSFCQNJF",null,null,"2026年5月精确词搜索量约1659，购买率约0.98%","图案版权、长尾需求","3种原创非版权图案，按单生产或低库存","https://www.amazon.com/dp/B0GSFCQNJF"],
  ["Easel Hand Rest","立即测试","FBA","3","画架手托","B0H3JXBML4",null,null,"功能型细分产品，适合从稳定性和舒适度改款","结构专利、适配性","100-150件FBA；强化稳定、握持、适配范围","https://www.amazon.com/dp/B0H3JXBML4"],
  ["Hummingbird Solar Garden Stake Light","条件测试","FBM/FBA","4","蜂鸟月亮太阳能花园插地灯","B0H372XMDF",null,null,"2026年5月搜索量约4256，购买率约0.54%","电子认证、耐候、专利","认证和专利通过后，20件FBM验证","https://www.amazon.com/dp/B0H372XMDF"],
  ["Vibrant LED Flow Fans for Dancing","条件测试","FBM","5","LED舞蹈扇","B0GYS36QSQ",null,null,"视觉差异化空间存在，但电子和演出用品售后风险较高","电池运输、电子认证、专利","仅在认证文件齐全后小批量测试","https://www.amazon.com/dp/B0GYS36QSQ"],
  ["Over-the-Door Hanger Organizer","条件测试","FBA","6","门后挂架收纳器","B0GV4BXZHY",null,null,"刚需收纳方向，但竞争和结构专利需复核","尺寸适配、承重、结构专利","先做承重和门缝适配测试","https://www.amazon.com/dp/B0GV4BXZHY"],
  ["Horse Catchall Bowl","低成本FBM","FBM","7","马造型杂物碗","B0H3JWXGF8",null,null,"礼品型长尾，可用原创造型测试","陶瓷破损、外观专利","不备大货；5-10件原创造型试单","https://www.amazon.com/dp/B0H3JWXGF8"],
  ["Dinosaur Head Squirrel Feeder","低成本FBM","FBM","8","恐龙头松鼠喂食器","B0H3TZZ2DW",null,null,"趣味礼品属性强，但造型侵权和季节性不确定","外观专利、耐候","原创非影视IP造型；小批量FBM","https://www.amazon.com/dp/B0H3TZZ2DW"],
  ["Conga Style Can Holder","低成本FBM","FBM","9","康加鼓造型易拉罐套","B0GY3Z77NY",null,null,"轻小但需求偏长尾，适合低成本试单","外观专利、低客单","原创图案，10-20件试单","https://www.amazon.com/dp/B0GY3Z77NY"],
  ["Ceramic Mushroom Bird Feeder","低成本FBM","FBM","10","陶瓷蘑菇喂鸟器","B0H195J2NT",null,null,"礼品和庭院装饰方向可测试，但参考链接疑似类目/用途不一致","破损、用途描述、外观专利","先核实真实使用场景，再做原创造型","https://www.amazon.com/dp/B0H195J2NT"],
  ["Floor Cleaning Tablets","暂不建议","不执行","11","多表面清洁片","B0H2VQ37HB",null,null,"化学品、标签及运输合规门槛高","化学品合规、危险品审核","不进入首轮测试","https://www.amazon.com/dp/B0H2VQ37HB"],
  ["Car Power Inverter Cup Holder","暂不建议","不执行","12","杯架式车载逆变器","B0GDTG2HKZ",null,null,"电气安全和售后风险高","电气认证、发热、退货","不进入首轮测试","https://www.amazon.com/dp/B0GDTG2HKZ"],
  ["Kenmiso Portable Knife Sharpener","暂不建议","不执行","13","便携磨刀器","B0H343NF4M",null,null,"品牌词、专利与人身安全风险较高","商标、专利、人身安全","不进入首轮测试","https://www.amazon.com/dp/B0H343NF4M"],
  ["USA 250th Vintage Plane Wind Spinner","暂不建议","不执行","14","美国250周年飞机风车","B0H1QWC425",null,null,"2026年季节窗口已短，库存风险高","季节性、政治图案、专利","不备货","https://www.amazon.com/dp/B0H1QWC425"],
  ["Lighted Rag American Flag Banner","暂不建议","不执行","15","灯光美国旗横幅","B0H1CK65V9",null,null,"2026年季节窗口已短，电子和图案风险叠加","季节性、电子认证","不备货","https://www.amazon.com/dp/B0H1CK65V9"],
  ["Blessing Birds Bracelet","暂不建议","不执行","16","祝福鸟手链","B0H2C7WCNR",null,null,"珠宝竞争拥挤，款式侵权风险较高","外观专利、材质声明","不进入首轮测试","https://www.amazon.com/dp/B0H2C7WCNR"],
  ["Dainty Handmade Beaded Necklace","暂不建议","不执行","17","手工串珠项链","B0H33HLB8J",null,null,"珠宝竞争拥挤且款式差异难建立","外观专利、材质声明","不进入首轮测试","https://www.amazon.com/dp/B0H33HLB8J"],
  ["Tea Bag Weights","暂不建议","不执行","18","茶包压重器","B0GTV32N1T",null,null,"需求数据不足，涉及食品接触材料","食品接触材料、低需求","不进入首轮测试","https://www.amazon.com/dp/B0GTV32N1T"],
  ["Foot Straw","暂不建议","不执行","19","脚造型吸管","B0GZV2WCQ4",null,null,"需求数据不足，涉及食品接触材料且造型接受度不确定","食品接触材料、外观专利","不进入首轮测试","https://www.amazon.com/dp/B0GZV2WCQ4"],
  ["30th Anniversary 3D Sculpted Vodka Bottle","暂不建议","不执行","20","30周年3D酒瓶摆件","B0H38MZZK4",null,null,"易碎、运输成本高且设计侵权风险较高","破损、外观专利、酒类暗示","不进入首轮测试","https://www.amazon.com/dp/B0H38MZZK4"],
];

const theme = {
  navy: "#183B56", blue: "#2F75B5", teal: "#1F7A8C", green: "#2E7D32",
  amber: "#D9822B", red: "#B42318", light: "#F3F7FA", border: "#D8E1E8",
  input: "#FFF2CC", white: "#FFFFFF", text: "#23313D",
};

function widths(sheet, values) {
  values.forEach((v, i) => { sheet.getRangeByIndexes(0, i, 1, 1).format.columnWidthPx = v; });
}
function title(sheet, range, text, subtitle) {
  sheet.showGridLines = false;
  sheet.getRange(range).merge();
  const cell = range.split(":")[0];
  sheet.getRange(cell).values = [[text]];
  sheet.getRange(cell).format = { fill: theme.navy, font: { bold: true, color: theme.white, size: 18 }, horizontalAlignment: "center", verticalAlignment: "center" };
  sheet.getRange(range).format.rowHeightPx = 38;
  if (subtitle) {
    const row = Number(cell.match(/\d+/)[0]) + 1;
    const startCol = cell.match(/[A-Z]+/)[0];
    const endCol = range.split(":")[1].match(/[A-Z]+/)[0];
    sheet.getRange(`${startCol}${row}:${endCol}${row}`).merge();
    sheet.getRange(`${startCol}${row}`).values = [[subtitle]];
    sheet.getRange(`${startCol}${row}`).format = { fill: "#E8F1F5", font: { color: theme.text }, wrapText: true, verticalAlignment: "center" };
    sheet.getRange(`${startCol}${row}:${endCol}${row}`).format.rowHeightPx = 34;
  }
}
function header(range, fill = theme.blue) {
  range.format = { fill, font: { bold: true, color: theme.white }, borders: { preset: "all", style: "thin", color: theme.border }, wrapText: true, horizontalAlignment: "center", verticalAlignment: "center" };
}
function body(range) {
  range.format = { borders: { preset: "all", style: "thin", color: theme.border }, wrapText: true, verticalAlignment: "center" };
}

title(dashboard, "A1:H1", "选品推荐46-49：执行总控看板", "美国站｜单品首测预算 1万-3万元｜优先低库存验证｜黄色单元格为待填写输入");
dashboard.getRange("A4:B4").values = [["关键指标","当前值"]];
header(dashboard.getRange("A4:B4"));
dashboard.getRange("A5:A10").values = [["候选产品总数"],["立即测试"],["条件测试"],["低成本FBM"],["暂不建议"],["首轮重点产品"]];
dashboard.getRange("B5:B9").formulas = [["=COUNTA('20款决策矩阵'!A5:A24)"],["=COUNTIF('20款决策矩阵'!B5:B24,\"立即测试\")"],["=COUNTIF('20款决策矩阵'!B5:B24,\"条件测试\")"],["=COUNTIF('20款决策矩阵'!B5:B24,\"低成本FBM\")"],["=COUNTIF('20款决策矩阵'!B5:B24,\"暂不建议\")"]];
dashboard.getRange("B10").values = [["Pollinator / Memory Box / Easel Hand Rest"]];
body(dashboard.getRange("A5:B10"));
dashboard.getRange("D4:H4").values = [["优先级","产品","履约","首批数量","下一步"]];
header(dashboard.getRange("D4:H4"), theme.teal);
dashboard.getRange("D5:H8").values = [
  [1,"Mini Pollinator Watering Station","FBM","20-30件","找3家供应商、打样、防碎测试"],
  [2,"Hunting Memory Box","FBM定制","每图案5-10件","完成3种原创图案、按单生产验证"],
  [3,"Easel Hand Rest","FBA","100-150件","结构打样、适配测试、专利初筛"],
  [4,"Hummingbird Solar Garden Stake Light","条件测试","20件","认证与专利通过后再测试"],
];
body(dashboard.getRange("D5:H8"));
dashboard.getRange("A13:H13").values = [["阶段","准入/淘汰规则","执行要求","负责人","计划日期","状态","证明材料","备注"]];
header(dashboard.getRange("A13:H13"), theme.green);
dashboard.getRange("A14:H19").values = [
  ["供应链准入","到岸成本 ≤ 售价30%","每个前三产品询价3家","采购","","未开始","报价单/样品",""],
  ["利润准入","广告前贡献毛利率 ≥35%","费用全部填入利润准入表","运营","","未开始","利润核算",""],
  ["CTR淘汰","CTR <0.3%，优化主图后仍低则停止","至少完成一次主图优化","运营","","未开始","广告报表",""],
  ["转化淘汰","转化率 <8%，两轮优化无改善则停止","记录两轮优化结果","运营","","未开始","业务报告",""],
  ["售后淘汰","退货或破损率 >5% 暂停补货","区分破损与其他退货","客服/采购","","未开始","退货报告",""],
  ["放量","连续2周稳定、广告后利润为正、退货率<4%","达标后才增加变体","负责人","","未开始","周报",""],
];
body(dashboard.getRange("A14:H19"));
dashboard.getRange("F14:F19").format.fill = theme.input;
dashboard.getRange("E14:E19").format.fill = theme.input;
widths(dashboard, [120,280,270,100,100,100,190,180]);
dashboard.freezePanes.freezeRows(3);

title(matrix, "A1:L1", "20款产品决策矩阵", "结论基于原始表格与卖家精灵MCP；缺失市场/成本字段必须在测试前补齐");
const matrixHeaders = ["产品","决策分层","建议模式","优先级","中文说明","参考ASIN","参考售价USD","参考月销","判断依据","主要风险","首轮动作","来源链接"];
matrix.getRange("A4:L4").values = [matrixHeaders];
header(matrix.getRange("A4:L4"));
matrix.getRangeByIndexes(4, 0, products.length, matrixHeaders.length).values = products;
body(matrix.getRange("A5:L24"));
matrix.getRange("G5:H24").format.numberFormat = "0.00";
widths(matrix, [230,100,100,70,180,105,100,100,360,230,330,300]);
matrix.freezePanes.freezeRows(4);

title(suppliers, "A1:Q1", "前三产品：供应商询价与打样验证", "每个产品至少录入3家供应商；黄色字段由采购填写，自动计算到岸成本率并给出准入判断");
const supplierHeaders = ["产品","供应商","联系方式/链接","样品价CNY","100件单价CNY","300件单价CNY","定制费CNY","单件包装CNY","单件头程CNY","汇率CNY/USD","目标售价USD","到岸成本USD","成本率","MOQ","生产周期天","样品结论","成本准入"];
suppliers.getRange("A4:Q4").values = [supplierHeaders];
header(suppliers.getRange("A4:Q4"));
const supplierRows = [];
for (const p of products.slice(0,3)) for (let i=1;i<=3;i++) supplierRows.push([p[0],`供应商${i}`,"",null,null,null,null,null,null,7.2,p[6] ?? null,null,null,null,null,"待打样",null]);
suppliers.getRangeByIndexes(4,0,supplierRows.length,supplierHeaders.length).values = supplierRows;
for (let r=5;r<=13;r++) {
  suppliers.getRange(`L${r}`).formulas = [[`=IF(E${r}="","",(E${r}+G${r}/100+H${r}+I${r})/J${r})`]];
  suppliers.getRange(`M${r}`).formulas = [[`=IF(OR(L${r}="",K${r}=""),"",L${r}/K${r})`]];
  suppliers.getRange(`Q${r}`).formulas = [[`=IF(M${r}="","待填写",IF(M${r}<=30%,"通过","不通过"))`]];
}
body(suppliers.getRange("A5:Q13"));
suppliers.getRange("C5:K13").format.fill = theme.input;
suppliers.getRange("N5:P13").format.fill = theme.input;
suppliers.getRange("K5:L13").format.numberFormat = "$0.00";
suppliers.getRange("M5:M13").format.numberFormat = "0.0%";
widths(suppliers, [230,100,250,90,100,100,90,100,100,90,100,100,90,80,100,120,100]);
suppliers.freezePanes.freezeRows(4);

title(profit, "A1:R1", "前三产品：利润准入核算", "黄色为输入；广告前贡献毛利率≥35%且到岸成本率≤30%才建议进入首轮测试");
const profitHeaders = ["产品","模式","目标售价USD","到岸成本USD","亚马逊佣金率","FBA/配送费USD","仓储/包装USD","优惠折扣率","广告费率","退款损失率","佣金USD","折扣USD","广告前贡献利润USD","广告前贡献毛利率","广告后贡献利润USD","广告后贡献毛利率","首轮预算CNY","准入判断"];
profit.getRange("A4:R4").values = [profitHeaders];
header(profit.getRange("A4:R4"));
profit.getRange("A5:R7").values = [
  ["Mini Pollinator Watering Station","FBM",19.99,null,0.15,null,null,0.05,0.20,0.04,null,null,null,null,null,null,12000,null],
  ["Hunting Memory Box","FBM定制",29.99,null,0.15,null,null,0.05,0.20,0.04,null,null,null,null,null,null,10000,null],
  ["Easel Hand Rest","FBA",24.99,null,0.15,null,null,0.05,0.20,0.04,null,null,null,null,null,null,15000,null],
];
for (let r=5;r<=7;r++) {
  profit.getRange(`K${r}`).formulas = [[`=IF(C${r}="","",C${r}*E${r})`]];
  profit.getRange(`L${r}`).formulas = [[`=IF(C${r}="","",C${r}*H${r})`]];
  profit.getRange(`M${r}`).formulas = [[`=IF(C${r}="","",C${r}-D${r}-K${r}-F${r}-G${r}-L${r}-C${r}*J${r})`]];
  profit.getRange(`N${r}`).formulas = [[`=IF(C${r}="","",M${r}/C${r})`]];
  profit.getRange(`O${r}`).formulas = [[`=IF(C${r}="","",M${r}-C${r}*I${r})`]];
  profit.getRange(`P${r}`).formulas = [[`=IF(C${r}="","",O${r}/C${r})`]];
  profit.getRange(`R${r}`).formulas = [[`=IF(D${r}="","待填写",IF(AND(D${r}/C${r}<=30%,N${r}>=35%),"通过","不通过"))`]];
}
body(profit.getRange("A5:R7"));
profit.getRange("C5:J7").format.fill = theme.input;
profit.getRange("Q5:Q7").format.fill = theme.input;
profit.getRange("C5:D7").format.numberFormat = "$0.00";
profit.getRange("F5:G7").format.numberFormat = "$0.00";
profit.getRange("K5:P7").format.numberFormat = "$0.00";
profit.getRange("E5:E7").format.numberFormat = "0%";
profit.getRange("H5:J7").format.numberFormat = "0%";
profit.getRange("N5:N7").format.numberFormat = "0.0%";
profit.getRange("P5:P7").format.numberFormat = "0.0%";
profit.getRange("A10:F10").values = [["准入规则","阈值","淘汰规则","阈值","放量规则","阈值"]];
header(profit.getRange("A10:F10"), theme.green);
profit.getRange("A11:F13").values = [
  ["到岸成本率","≤30%","CTR","<0.3%且优化无效","退货率","<4%"],
  ["广告前贡献毛利率","≥35%","转化率","<8%且两轮优化无效","广告后利润",">0"],
  ["预算保留","≥30%用于广告/改款","退货或破损率",">5%暂停补货","销量稳定","连续2周"],
];
body(profit.getRange("A11:F13"));
widths(profit, [230,100,100,100,100,110,110,100,90,100,100,100,120,120,120,120,110,100]);
profit.freezePanes.freezeRows(4);

title(tracker, "A1:P1", "30天测试记录与自动判定", "每日按产品录入曝光、点击、订单、广告费、销售额、退货和破损；表格自动计算核心指标与信号");
const trackerHeaders = ["日期","产品","曝光","点击","订单","广告费USD","销售额USD","退货数","破损数","CTR","转化率","退货率","破损率","广告后贡献利润USD","当日信号","动作记录"];
tracker.getRange("A4:P4").values = [trackerHeaders];
header(tracker.getRange("A4:P4"));
const rows = [];
for (let i=0;i<90;i++) rows.push([null,products[i%3][0],null,null,null,null,null,null,null,null,null,null,null,null,null,""]);
tracker.getRangeByIndexes(4,0,rows.length,trackerHeaders.length).values = rows;
for (let r=5;r<=94;r++) {
  tracker.getRange(`J${r}`).formulas = [[`=IF(C${r}="","",D${r}/C${r})`]];
  tracker.getRange(`K${r}`).formulas = [[`=IF(D${r}="","",E${r}/D${r})`]];
  tracker.getRange(`L${r}`).formulas = [[`=IF(E${r}="","",H${r}/E${r})`]];
  tracker.getRange(`M${r}`).formulas = [[`=IF(E${r}="","",I${r}/E${r})`]];
  tracker.getRange(`N${r}`).formulas = [[`=IF(G${r}="","",G${r}-F${r})`]];
  tracker.getRange(`O${r}`).formulas = [[`=IF(C${r}="","待填写",IF(OR(L${r}>5%,M${r}>5%),"暂停补货",IF(OR(J${r}<0.3%,K${r}<8%,N${r}<0),"需优化","健康")))`]];
}
body(tracker.getRange("A5:P94"));
tracker.getRange("A5:I94").format.fill = theme.input;
tracker.getRange("P5:P94").format.fill = theme.input;
tracker.getRange("J5:M94").format.numberFormat = "0.0%";
tracker.getRange("F5:G94").format.numberFormat = "$0.00";
tracker.getRange("N5:N94").format.numberFormat = "$0.00";
widths(tracker, [100,230,90,80,80,100,100,80,80,80,90,90,90,120,100,260]);
tracker.freezePanes.freezeRows(4);

title(actions, "A1:J1", "7天供应链验证行动计划", "按顺序执行；专利、商标和合规只做初筛，必要时由专业机构确认");
const actionHeaders = ["天数","任务","产品","负责人","截止日期","状态","输出物","验收标准","阻塞项","备注"];
actions.getRange("A4:J4").values = [actionHeaders];
header(actions.getRange("A4:J4"));
actions.getRange("A5:J16").values = [
  ["Day 1","建立供应商长名单","前三产品","采购","","未开始","每款≥6家候选","记录链接、主营年限、MOQ","",""],
  ["Day 1","商标与专利初筛","全部进入测试产品","合规","","未开始","初筛记录","无明显商标/外观/实用专利冲突","",""],
  ["Day 2","发送统一询价表","前三产品","采购","","未开始","报价信息","每款至少3家完整报价","",""],
  ["Day 2","确认合规文件","太阳能灯/LED扇/门后挂架","合规","","未开始","文件清单","电子产品认证齐全后才测试","",""],
  ["Day 3","筛选供应商并下样","前三产品","采购","","未开始","样品订单","每款至少2家样品","",""],
  ["Day 4","原创差异化方案","前三产品","产品/设计","","未开始","产品规格稿","不复制参考链接设计","",""],
  ["Day 5","样品功能与包装测试","前三产品","采购/运营","","未开始","测试记录","Pollinator重点测试破损；Easel重点测试稳定适配","",""],
  ["Day 6","完成利润准入核算","前三产品","运营","","未开始","利润准入表","成本率≤30%，广告前贡献毛利率≥35%","",""],
  ["Day 6","建立首轮Listing方案","通过准入产品","运营","","未开始","主图/标题/卖点草案","清晰表达差异化和使用场景","",""],
  ["Day 7","负责人评审","前三产品","负责人","","未开始","立项决策","仅通过准入的产品进入测试","",""],
  ["Day 7","制定30天测试节奏","通过准入产品","运营","","未开始","日记录和周复盘安排","明确CTR、CVR、退货、利润阈值","",""],
  ["Day 7","建立停止损失机制","通过准入产品","负责人","","未开始","清库存预案","30天广告后无法正利润则停止追加","",""],
];
body(actions.getRange("A5:J16"));
actions.getRange("D5:F16").format.fill = theme.input;
actions.getRange("I5:J16").format.fill = theme.input;
widths(actions, [80,210,230,110,100,100,200,340,220,220]);
actions.freezePanes.freezeRows(4);

const chartData = products.slice(0,10).map((p) => [p[0], 11 - Number(p[3])]);
dashboard.getRange("J4:K4").values = [["产品","优先指数"]];
dashboard.getRangeByIndexes(4,9,chartData.length,2).values = chartData;
dashboard.getRange("J4:K14").format = { font: { color: theme.white }, fill: theme.white };
const chart = dashboard.charts.add("bar", dashboard.getRange("J4:K14"));
chart.title = "候选产品优先指数 Top 10";
chart.hasLegend = false;
chart.xAxis = { axisType: "textAxis" };
chart.yAxis = { numberFormatCode: "0" };
chart.setPosition("A22", "H39");

const checks = [
  ["总控看板","A1:H19"],
  ["20款决策矩阵","A1:L24"],
  ["供应商询价","A1:Q13"],
  ["利润准入","A1:R13"],
  ["30天测试记录","A1:P20"],
  ["7天行动计划","A1:J16"],
];
for (const [sheetName, range] of checks) {
  const preview = await wb.render({ sheetName, range, autoCrop: "all", scale: 1, format: "png" });
  await fs.writeFile(path.join(outDir, `${sheetName}.png`), new Uint8Array(await preview.arrayBuffer()));
}

const inspect = await wb.inspect({ kind: "table", range: "利润准入!A4:R7", include: "values,formulas", tableMaxRows: 10, tableMaxCols: 20, maxChars: 5000 });
console.log(inspect.ndjson);
const errors = await wb.inspect({ kind: "match", searchTerm: "#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A", options: { useRegex: true, maxResults: 100 }, summary: "final formula error scan" });
console.log(errors.ndjson);

const output = await SpreadsheetFile.exportXlsx(wb);
const outputPath = path.join(outDir, "选品推荐46-49_执行工作簿.xlsx");
await output.save(outputPath);
console.log(outputPath);
