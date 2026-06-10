from __future__ import annotations

import math
from pathlib import Path

import pandas as pd
from openpyxl import Workbook
from openpyxl.chart import BarChart, LineChart, Reference
from openpyxl.styles import Alignment, Border, Font, PatternFill, Side
from openpyxl.utils import get_column_letter


TARGET_ASIN = "B0F2LQNTDF"
TARGET_ACOS = 0.25
OUTPUT_DIR = Path(r"E:\亚马逊Codex独立团\outputs\b0f2_ad_sales_analysis")
AD_PLACEMENT_PATH = Path(r"C:\Users\admin\Desktop\商品推广_广告位_报告.xlsx")
SEARCH_TERM_PATH = Path(r"C:\Users\admin\Desktop\商品推广_搜索词_报告.xlsx")
PROMOTED_PATH = Path(r"C:\Users\admin\Desktop\商品推广_推广的商品_报告.xlsx")
BACKEND_PATH = Path(r"C:\Users\admin\Downloads\商品分析V2_多站点_20260507-20260605.xlsx")


COMPETITORS = [
    {
        "ASIN": "B0F2LQNTDF",
        "角色": "我方主推",
        "品牌": "WAKSUN",
        "价格": 24.39,
        "评分": 4.6,
        "评价数": 493,
        "LQS": 100,
        "大类排名": 17787,
        "子类排名": 546,
        "变体数": 20,
        "卖家数": 1,
        "徽章": "Amazon's Choice, A+, Video",
        "2026-05父体销量": 621,
        "2026-06父体销量": 540,
        "核心观察": "评价量不弱，但评分、排名和库存承接弱于头部竞品；父体销量较旺季回落。",
    },
    {
        "ASIN": "B0DG96272J",
        "角色": "竞品",
        "品牌": "Kireidane",
        "价格": 22.23,
        "评分": 4.8,
        "评价数": 608,
        "LQS": 83,
        "大类排名": 14412,
        "子类排名": 414,
        "变体数": 9,
        "卖家数": 2,
        "徽章": "Amazon's Choice, A+, Video",
        "2026-05父体销量": 640,
        "2026-06父体销量": 600,
        "核心观察": "价格低约2.16美元，评分和评价数更强，是直接价格/口碑压力来源。",
    },
    {
        "ASIN": "B0FYPGN85T",
        "角色": "竞品",
        "品牌": "redaica",
        "价格": 24.99,
        "评分": 4.7,
        "评价数": 83,
        "LQS": 96,
        "大类排名": 7345,
        "子类排名": 158,
        "变体数": 2,
        "卖家数": 1,
        "徽章": "Amazon's Choice, A+, Video",
        "2026-05父体销量": 1382,
        "2026-06父体销量": 990,
        "核心观察": "评价少但排名强，说明近期流量/转化势能强，主图、价格或广告承接值得重点拆解。",
    },
    {
        "ASIN": "B0FSRQ698D",
        "角色": "竞品",
        "品牌": "TITQWOP",
        "价格": 29.99,
        "评分": 4.8,
        "评价数": 59,
        "LQS": 100,
        "大类排名": 14875,
        "子类排名": 432,
        "变体数": 3,
        "卖家数": 1,
        "徽章": "Amazon's Choice, A+, Video",
        "2026-05父体销量": 673,
        "2026-06父体销量": 660,
        "核心观察": "高价仍能维持排名，礼盒/不压缩包装可能提升礼品场景转化。",
    },
    {
        "ASIN": "B0FJ5VT79B",
        "角色": "竞品",
        "品牌": "TITQWOP",
        "价格": 24.99,
        "评分": 4.7,
        "评价数": 373,
        "LQS": 100,
        "大类排名": 7189,
        "子类排名": 150,
        "变体数": 8,
        "卖家数": 1,
        "徽章": "Amazon's Choice, A+, Video",
        "2026-05父体销量": 939,
        "2026-06父体销量": 1590,
        "核心观察": "6月增长最强，评分/排名/销量均领先，是主攻对标对象。",
    },
]


NUM_COLS = [
    "展示量",
    "点击量",
    "点击率 (CTR)",
    "单次点击成本 (CPC)",
    "花费",
    "7天总销售额",
    "广告投入产出比 (ACOS) 总计",
    "总广告投资回报率 (ROAS)",
    "7天总订单数(#)",
    "7天总销售量(#)",
    "7天的转化率",
    "7天内广告SKU销售量(#)",
    "7天内其他SKU销售量(#)",
    "7天内广告SKU销售额",
    "7天内其他SKU销售额",
]


def read_xlsx(path: Path) -> pd.DataFrame:
    return pd.read_excel(path)


def to_num(series: pd.Series) -> pd.Series:
    return pd.to_numeric(series, errors="coerce").fillna(0)


def pct(value: float) -> str:
    if pd.isna(value) or value == "":
        return ""
    return f"{value:.1%}"


def money(value: float) -> str:
    if pd.isna(value) or value == "":
        return ""
    return f"${value:,.2f}"


def add_metrics(df: pd.DataFrame) -> pd.DataFrame:
    out = df.copy()
    for col in NUM_COLS:
        if col in out.columns:
            out[col] = to_num(out[col])
    if "展示量" in out and "点击量" in out:
        out["CTR_calc"] = out["点击量"] / out["展示量"].replace(0, pd.NA)
    if "点击量" in out and "花费" in out:
        out["CPC_calc"] = out["花费"] / out["点击量"].replace(0, pd.NA)
    if "点击量" in out and "7天总订单数(#)" in out:
        out["CVR_calc"] = out["7天总订单数(#)"] / out["点击量"].replace(0, pd.NA)
    if "花费" in out and "7天总销售额" in out:
        out["ACOS_calc"] = out["花费"] / out["7天总销售额"].replace(0, pd.NA)
        out["ROAS_calc"] = out["7天总销售额"] / out["花费"].replace(0, pd.NA)
    return out


def classify_keyword(row: pd.Series, avg_price: float, stock_days: float) -> tuple[str, str, str]:
    clicks = row["点击量"]
    spend = row["花费"]
    orders = row["7天总订单数(#)"]
    sales = row["7天总销售额"]
    acos = spend / sales if sales else math.inf
    cvr = orders / clicks if clicks else 0
    break_even_spend = avg_price * TARGET_ACOS

    if stock_days < 14 and orders > 0:
        stock_note = "库存不足，放量前先补货/控预算"
    elif stock_days < 14:
        stock_note = "库存不足，避免为低效词继续买量"
    else:
        stock_note = "库存约束正常"

    if orders >= 2 and acos <= TARGET_ACOS:
        return "精准放量", "+10%~20%竞价；加入精准活动；预算优先保障", stock_note
    if orders >= 1 and acos <= 0.40:
        return "保留观察", "保留投放；优化主图/价格/优惠后观察3-5天", stock_note
    if orders >= 1:
        return "降竞价", "降价15%~30%；保留长尾归因，避免继续高价抢量", stock_note
    if spend >= break_even_spend or clicks >= 8:
        return "否定/暂停", "无单且已超过可承受测试成本；加入否定或暂停投放", stock_note
    if clicks >= 3:
        return "继续小额测试", "低预算观察；累计到8次点击仍无单再否定", stock_note
    return "低优先级观察", "数据不足，不主动加价", stock_note


def write_df(ws, df: pd.DataFrame, start_row=1, start_col=1, max_rows=None):
    rows = df.head(max_rows) if max_rows else df
    for j, col in enumerate(rows.columns, start_col):
        cell = ws.cell(start_row, j, col)
        cell.font = Font(bold=True, color="FFFFFF")
        cell.fill = PatternFill("solid", fgColor="1F4E78")
        cell.alignment = Alignment(horizontal="center", vertical="center", wrap_text=True)
    for i, (_, row) in enumerate(rows.iterrows(), start_row + 1):
        for j, col in enumerate(rows.columns, start_col):
            val = row[col]
            if pd.isna(val):
                val = ""
            ws.cell(i, j, val)
    return start_row + len(rows) + 1


def style_sheet(ws, freeze="A2"):
    ws.freeze_panes = freeze
    thin = Side(style="thin", color="D9E2F3")
    for row in ws.iter_rows():
        for cell in row:
            cell.border = Border(bottom=thin)
            cell.alignment = Alignment(vertical="top", wrap_text=True)
    for col in ws.columns:
        max_len = 0
        letter = get_column_letter(col[0].column)
        for cell in col[:80]:
            max_len = max(max_len, len(str(cell.value or "")))
        ws.column_dimensions[letter].width = min(max(max_len + 2, 10), 38)
    ws.auto_filter.ref = ws.dimensions


def add_kpi(ws, row: int, col: int, title: str, value: str, fill: str = "D9EAD3"):
    ws.cell(row, col, title)
    ws.cell(row, col).font = Font(bold=True, color="404040")
    ws.cell(row + 1, col, value)
    ws.cell(row + 1, col).font = Font(bold=True, size=16, color="203864")
    ws.cell(row, col).fill = PatternFill("solid", fgColor=fill)
    ws.cell(row + 1, col).fill = PatternFill("solid", fgColor=fill)
    ws.cell(row, col).alignment = Alignment(horizontal="center")
    ws.cell(row + 1, col).alignment = Alignment(horizontal="center")


def main():
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    placement = add_metrics(read_xlsx(AD_PLACEMENT_PATH))
    search = add_metrics(read_xlsx(SEARCH_TERM_PATH))
    promoted = add_metrics(read_xlsx(PROMOTED_PATH))
    backend = read_xlsx(BACKEND_PATH)

    text_cols = {"ASIN", "SKU", "店铺", "父ASIN", "产品标题", "图片链接", "币种", "大类目名称", "子类目名称", "第二子类目名称"}
    for col in backend.columns:
        if col not in text_cols:
            converted = pd.to_numeric(backend[col], errors="coerce")
            if converted.notna().any():
                backend[col] = converted

    target_backend = backend[backend["ASIN"].astype(str).str.upper() == TARGET_ASIN].iloc[0]
    target_promoted = promoted[promoted["广告ASIN"].astype(str).str.upper() == TARGET_ASIN].copy()
    target_campaigns = sorted(target_promoted["广告活动名称"].dropna().unique().tolist())
    target_search = search[search["广告活动名称"].isin(target_campaigns)].copy()
    target_placement = placement[placement["广告活动名称"].isin(target_campaigns)].copy()

    avg_price = float(target_backend["平均单价"])
    stock_days = float(target_backend["可售天数"])

    target_ad_totals = {
        "曝光": target_promoted["展示量"].sum(),
        "点击": target_promoted["点击量"].sum(),
        "花费": target_promoted["花费"].sum(),
        "广告销售额": target_promoted["7天总销售额"].sum(),
        "订单": target_promoted["7天总订单数(#)"].sum(),
    }
    target_ad_totals["CTR"] = target_ad_totals["点击"] / target_ad_totals["曝光"]
    target_ad_totals["CPC"] = target_ad_totals["花费"] / target_ad_totals["点击"]
    target_ad_totals["CVR"] = target_ad_totals["订单"] / target_ad_totals["点击"]
    target_ad_totals["ACOS"] = target_ad_totals["花费"] / target_ad_totals["广告销售额"]
    target_ad_totals["ROAS"] = target_ad_totals["广告销售额"] / target_ad_totals["花费"]

    keyword = (
        target_search.groupby(["客户搜索词", "投放", "匹配类型"], dropna=False)
        .agg(
            展示量=("展示量", "sum"),
            点击量=("点击量", "sum"),
            花费=("花费", "sum"),
            销售额=("7天总销售额", "sum"),
            订单=("7天总订单数(#)", "sum"),
            销量=("7天总销售量(#)", "sum"),
        )
        .reset_index()
    )
    keyword["CTR"] = keyword["点击量"] / keyword["展示量"].replace(0, pd.NA)
    keyword["CPC"] = keyword["花费"] / keyword["点击量"].replace(0, pd.NA)
    keyword["CVR"] = keyword["订单"] / keyword["点击量"].replace(0, pd.NA)
    keyword["ACOS"] = keyword["花费"] / keyword["销售额"].replace(0, pd.NA)
    keyword["ROAS"] = keyword["销售额"] / keyword["花费"].replace(0, pd.NA)
    classes = keyword.apply(lambda r: classify_keyword(pd.Series({
        "点击量": r["点击量"],
        "花费": r["花费"],
        "7天总订单数(#)": r["订单"],
        "7天总销售额": r["销售额"],
    }), avg_price, stock_days), axis=1)
    keyword["动作"] = [c[0] for c in classes]
    keyword["建议"] = [c[1] for c in classes]
    keyword["库存约束"] = [c[2] for c in classes]
    keyword = keyword.sort_values(["花费", "订单"], ascending=[False, False])

    campaign = (
        target_search.groupby(["广告活动名称", "广告组名称"], dropna=False)
        .agg(展示量=("展示量", "sum"), 点击量=("点击量", "sum"), 花费=("花费", "sum"), 销售额=("7天总销售额", "sum"), 订单=("7天总订单数(#)", "sum"))
        .reset_index()
    )
    campaign["CTR"] = campaign["点击量"] / campaign["展示量"].replace(0, pd.NA)
    campaign["CPC"] = campaign["花费"] / campaign["点击量"].replace(0, pd.NA)
    campaign["CVR"] = campaign["订单"] / campaign["点击量"].replace(0, pd.NA)
    campaign["ACOS"] = campaign["花费"] / campaign["销售额"].replace(0, pd.NA)
    campaign["建议"] = campaign.apply(
        lambda r: "控量保排名，库存<14天，先避免继续强放量"
        if stock_days < 14 and r["订单"] > 0
        else ("降低预算/竞价" if (r["销售额"] == 0 or r["花费"] / max(r["销售额"], 0.01) > 0.4) else "保留或轻微放量"),
        axis=1,
    )
    campaign = campaign.sort_values("花费", ascending=False)

    placement_summary = (
        target_placement.groupby(["放置"], dropna=False)
        .agg(展示量=("展示量", "sum"), 点击量=("点击量", "sum"), 花费=("花费", "sum"), 销售额=("7天总销售额", "sum"), 订单=("7天总订单数(#)", "sum"))
        .reset_index()
    )
    placement_summary["CTR"] = placement_summary["点击量"] / placement_summary["展示量"].replace(0, pd.NA)
    placement_summary["CPC"] = placement_summary["花费"] / placement_summary["点击量"].replace(0, pd.NA)
    placement_summary["CVR"] = placement_summary["订单"] / placement_summary["点击量"].replace(0, pd.NA)
    placement_summary["ACOS"] = placement_summary["花费"] / placement_summary["销售额"].replace(0, pd.NA)
    placement_summary["建议"] = placement_summary.apply(
        lambda r: "有单但库存低，保守保位" if r["订单"] > 0 and stock_days < 14 else ("降溢价/暂停测试" if r["订单"] == 0 and r["花费"] > avg_price * TARGET_ACOS else "继续观察"),
        axis=1,
    )

    same_parent = backend[backend["父ASIN"].astype(str) == str(target_backend["父ASIN"])].copy()
    same_parent = same_parent.sort_values("销售额", ascending=False)

    competitor_df = pd.DataFrame(COMPETITORS)

    action_plan = pd.DataFrame(
        [
            ["第1-3天", "库存", "B0F2可售仅约7-8天，先确认补货/入仓节奏；若无法7天内补货，广告预算先不激进放量。", "避免断货导致排名和广告学习重置"],
            ["第1-3天", "广告止损", "对无单且花费超过约$5.81或点击≥8的搜索词执行否定/暂停；高ACOS有单词先降竞价15%-30%。", "降低无效花费，保护毛利"],
            ["第1-3天", "精准承接", "将ACOS≤25%且订单≥2的搜索词单独建精准/词组承接，预算来自低效广泛词。", "提高预算命中率"],
            ["第4-7天", "广告位", "商品页面和搜索顶部分开看ACOS；低效广告位降溢价，能出单广告位小幅保位。", "减少低质量流量"],
            ["第4-7天", "Listing", "对标B0FJ5VT79B和B0FYPGN85T：主图突出10件套/可换装/礼品场景；增加礼品和课堂奖励关键词。", "提升CTR与访问转化率"],
            ["第2周", "价格/优惠", "在不压垮毛利的前提下测试$1-$2 coupon或短期价格钩子，优先用于精准高意图词。", "对冲竞品低价和高评分优势"],
            ["第2周", "变体预算", "同父体中B0DHJK7NNF广告花费高且毛利为负，应收缩亏损变体预算，向B0F2和高毛利低ACoAS变体迁移。", "提升父体整体利润"],
            ["第3-4周", "放量", "库存恢复到21天以上后，对盈利词和高CVR活动逐步+10%-20%预算，冲子类排名进入300以内。", "放大有效流量"],
            ["第3-4周", "复盘", "按搜索词动作表复盘：新增精准词ACOS、否词节省花费、自然点击/自然转化是否提升。", "形成下一轮优化闭环"],
        ],
        columns=["阶段", "模块", "动作", "目标"],
    )

    wb = Workbook()
    ws = wb.active
    ws.title = "Dashboard"
    ws["A1"] = "B0F2LQNTDF 广告 + 后台销售综合诊断"
    ws["A1"].font = Font(bold=True, size=18, color="1F4E78")
    ws["A2"] = "数据来源：30天商品推广广告位/搜索词/推广商品报告；后台商品分析V2 2026-05-07至2026-06-05；竞品来源：卖家精灵 MCP，查询日 2026-06-05。"
    ws["A2"].alignment = Alignment(wrap_text=True)
    ws.merge_cells("A1:H1")
    ws.merge_cells("A2:H2")

    add_kpi(ws, 4, 1, "后台销售额", money(float(target_backend["销售额"])))
    add_kpi(ws, 4, 2, "毛利润", money(float(target_backend["毛利润"])), "E2F0D9")
    add_kpi(ws, 4, 3, "毛利率", pct(float(target_backend["毛利率"])), "FCE4D6")
    add_kpi(ws, 4, 4, "后台ACoAS", pct(float(target_backend["ACoAS"])), "DDEBF7")
    add_kpi(ws, 4, 5, "广告报表ACOS", pct(target_ad_totals["ACOS"]), "FFF2CC")
    add_kpi(ws, 4, 6, "访问转化率", pct(float(target_backend["访问转化率"])), "E2F0D9")
    add_kpi(ws, 4, 7, "自然点击量", f"{int(target_backend['自然点击量']):,}", "D9EAD3")
    add_kpi(ws, 4, 8, "可售天数", f"{float(target_backend['可售天数']):.0f}天", "F4CCCC")

    diagnostics = pd.DataFrame(
        [
            ["库存", "高", f"目标ASIN可售{float(target_backend['可售天数']):.0f}天，总可售{float(target_backend['总可售天数']):.0f}天", "先控量防断货；库存恢复前不做激进放量"],
            ["广告效率", "中高", f"后台ACoS {pct(float(target_backend['ACoS']))}，高于25%目标；但ACoAS {pct(float(target_backend['ACoAS']))}可控", "低效词止损，盈利词精准承接"],
            ["利润", "中", f"毛利率{pct(float(target_backend['毛利率']))}，低于广告目标ACOS 25%", "广告动作不能只看ACOS，要用毛利率约束"],
            ["自然承接", "中", f"自然点击{int(target_backend['自然点击量'])}，自然转化率{pct(float(target_backend['自然转化率']))}", "优化主图、价格/优惠和礼品场景卖点，提高自然转化"],
            ["竞品压力", "高", "B0FJ5VT79B、B0FYPGN85T子类排名约150-158，明显强于我方546", "对标其排名/价格/评分，集中打高意图词"],
        ],
        columns=["维度", "风险等级", "证据", "建议"],
    )
    write_df(ws, diagnostics, 8, 1)

    chart_data = pd.DataFrame(
        [
            ["销售额", float(target_backend["销售额"])],
            ["广告销售额", float(target_backend["广告销售额"])],
            ["毛利润", float(target_backend["毛利润"])],
            ["广告花费", float(target_backend["广告花费"])],
        ],
        columns=["指标", "金额"],
    )
    start = 16
    write_df(ws, chart_data, start, 1)
    chart = BarChart()
    chart.title = "B0F2经营结果"
    chart.y_axis.title = "USD"
    data = Reference(ws, min_col=2, min_row=start, max_row=start + len(chart_data))
    cats = Reference(ws, min_col=1, min_row=start + 1, max_row=start + len(chart_data))
    chart.add_data(data, titles_from_data=True)
    chart.set_categories(cats)
    chart.height = 7
    chart.width = 13
    ws.add_chart(chart, "D16")

    sheets = [
        ("B0F2专项诊断", pd.concat([
            pd.DataFrame([{
                "数据口径": "推广商品报告-目标ASIN",
                "曝光": target_ad_totals["曝光"],
                "点击": target_ad_totals["点击"],
                "CTR": target_ad_totals["CTR"],
                "CPC": target_ad_totals["CPC"],
                "花费": target_ad_totals["花费"],
                "广告销售额": target_ad_totals["广告销售额"],
                "订单": target_ad_totals["订单"],
                "CVR": target_ad_totals["CVR"],
                "ACOS": target_ad_totals["ACOS"],
                "ROAS": target_ad_totals["ROAS"],
            }]),
            pd.DataFrame([{
                "数据口径": "后台销售-目标ASIN",
                "曝光": float(target_backend["广告曝光量"]),
                "点击": float(target_backend["广告点击量"]),
                "CTR": float(target_backend["广告点击率"]),
                "CPC": float(target_backend["CPC"]),
                "花费": float(target_backend["广告花费"]),
                "广告销售额": float(target_backend["广告销售额"]),
                "订单": float(target_backend["广告订单量"]),
                "CVR": float(target_backend["CVR"]),
                "ACOS": float(target_backend["ACoS"]),
                "ROAS": float(target_backend["广告销售额"]) / float(target_backend["广告花费"]),
            }]),
        ], ignore_index=True)),
        ("搜索词动作表", keyword),
        ("广告位&活动优化", pd.concat([
            pd.DataFrame([["广告位汇总", "", "", "", "", "", "", "", "", ""]], columns=["类型", "名称", "展示量", "点击量", "花费", "销售额", "订单", "CTR", "ACOS", "建议"]),
            placement_summary.rename(columns={"放置": "名称"}).assign(类型="广告位")[["类型", "名称", "展示量", "点击量", "花费", "销售额", "订单", "CTR", "ACOS", "建议"]],
            campaign.rename(columns={"广告活动名称": "名称"}).assign(类型="活动")[["类型", "名称", "展示量", "点击量", "花费", "销售额", "订单", "CTR", "ACOS", "建议"]],
        ], ignore_index=True)),
        ("后台销售对比", same_parent[[
            "ASIN", "父ASIN", "销售额", "广告销售额", "销量", "订单量", "广告订单量", "广告订单占比", "可售", "30日销量", "日均销量", "可售天数", "退款量", "退货率", "广告花费", "毛利润", "毛利率", "ACoAS", "ACoS", "广告曝光量", "广告点击量", "广告点击率", "CPC", "CVR", "访问次数", "访问转化率", "自然点击量", "自然转化率", "子类排名"
        ]]),
        ("竞品对比", competitor_df),
        ("30天行动计划", action_plan),
    ]
    for title, df in sheets:
        ws2 = wb.create_sheet(title)
        write_df(ws2, df)
        style_sheet(ws2)

    for title, df in [
        ("原始_广告位", placement),
        ("原始_搜索词", search),
        ("原始_推广商品", promoted),
        ("原始_后台销售", backend),
    ]:
        ws_raw = wb.create_sheet(title)
        write_df(ws_raw, df)
        style_sheet(ws_raw)

    style_sheet(ws, freeze="A8")
    ws.column_dimensions["A"].width = 18
    ws.column_dimensions["B"].width = 16
    ws.column_dimensions["C"].width = 46
    ws.column_dimensions["D"].width = 34
    ws.row_dimensions[2].height = 36

    comp_ws = wb["竞品对比"]
    line_start = comp_ws.max_row + 3
    trends = pd.DataFrame({
        "月份": ["2026-05", "2026-06"],
        "我方B0F2父体销量": [621, 540],
        "B0DG96272J": [640, 600],
        "B0FYPGN85T": [1382, 990],
        "B0FSRQ698D": [673, 660],
        "B0FJ5VT79B": [939, 1590],
    })
    write_df(comp_ws, trends, line_start, 1)
    line = LineChart()
    line.title = "近两月父体销量趋势（卖家精灵）"
    line.y_axis.title = "销量"
    line_data = Reference(comp_ws, min_col=2, max_col=6, min_row=line_start, max_row=line_start + len(trends))
    line_cats = Reference(comp_ws, min_col=1, min_row=line_start + 1, max_row=line_start + len(trends))
    line.add_data(line_data, titles_from_data=True)
    line.set_categories(line_cats)
    line.height = 8
    line.width = 16
    comp_ws.add_chart(line, f"H{line_start}")

    output_xlsx = OUTPUT_DIR / "B0F2LQNTDF_广告后台销售综合诊断.xlsx"
    wb.save(output_xlsx)

    top_waste = keyword[(keyword["订单"] == 0)].sort_values("花费", ascending=False).head(10)
    top_scale = keyword[(keyword["订单"] >= 1)].sort_values(["订单", "ACOS"], ascending=[False, True]).head(10)
    report = f"""# B0F2LQNTDF 广告 + 后台销售综合诊断

## 1. 一句话结论
B0F2LQNTDF 不是完全亏损品：后台口径销售额 {money(float(target_backend['销售额']))}、毛利润 {money(float(target_backend['毛利润']))}、ACoAS {pct(float(target_backend['ACoAS']))}，经营结果还能接受；但广告ACoS约 {pct(float(target_backend['ACoS']))}，已经高于目标ACOS 25%，且可售天数只有约 {float(target_backend['可售天数']):.0f}-{float(target_backend['总可售天数']):.0f} 天，当前第一优先级是“控低效、保利润、防断货”，不是盲目冲量。

## 2. 核心短板
- 库存短板：可售仅 {float(target_backend['可售天数']):.0f} 天，广告如果继续强放量，很容易断货后丢排名。
- 广告效率短板：后台ACoS {pct(float(target_backend['ACoS']))}，推广商品报告中目标ASIN ACOS {pct(target_ad_totals['ACOS'])}，都高于25%目标线。
- 利润约束短板：毛利率只有 {pct(float(target_backend['毛利率']))}，低于默认目标ACOS 25%，所以广告判断要看ACoAS和毛利，而不是只看广告销售额。
- 竞品压力：B0FJ5VT79B、B0FYPGN85T 子类排名约150-158，我方为546；我方评分4.6，也低于多个竞品4.7-4.8。
- 变体预算错配：同父体 B0DHJK7NNF 销售额接近，但广告花费 {money(1466.04)}、毛利润为 {money(-495.44)}，明显拖累父体利润。

## 3. 立即动作
- 对搜索词动作表中“否定/暂停”的词，优先处理无单且花费超过约 {money(avg_price * TARGET_ACOS)} 或点击≥8的词。
- 对“精准放量”的词单独建精准承接，但库存恢复到21天前只做小幅加价，不做激进扩量。
- 将 B0DHJK7NNF 等亏损变体预算收缩，转向 B0F2LQNTDF 和高毛利、低ACoAS变体。
- Listing 对标 B0FJ5VT79B / B0FYPGN85T：强化10件套、换装、礼品、课堂奖励、生日礼物场景；测试$1-$2 coupon。

## 4. 可直接复盘的表
- `搜索词动作表`：每个搜索词的花费、订单、ACOS、动作和库存约束。
- `广告位&活动优化`：广告位和活动层面的调价/控量建议。
- `后台销售对比`：同父体变体利润、库存、广告依赖对比。
- `竞品对比`：价格、评分、评价、排名、销量趋势差距。

数据口径说明：广告报告是广告归因口径，后台商品分析是ASIN经营口径，两者日期也不完全一致，因此不强行要求销售额/订单完全相等。
"""
    output_md = OUTPUT_DIR / "B0F2LQNTDF_综合诊断报告.md"
    output_md.write_text(report, encoding="utf-8-sig")

    print(f"XLSX={output_xlsx}")
    print(f"MD={output_md}")
    print(f"target_campaigns={target_campaigns}")
    print(f"keyword_rows={len(keyword)}")
    print(f"target_promoted_spend={target_ad_totals['花费']:.2f}")
    print(f"target_promoted_sales={target_ad_totals['广告销售额']:.2f}")


if __name__ == "__main__":
    main()
